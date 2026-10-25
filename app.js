(() => {
  "use strict";

  const cfg = window.WOUT_CONFIG;
  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);

  const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const DAY_NAMES = {
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
    fri: "Friday", sat: "Saturday", sun: "Sunday",
  };
  // JEFIT's muscle groups, in JEFIT's order. The only choices offered when editing.
  const MUSCLES = [
    "Abs", "Back", "Biceps", "Cardio", "Chest", "Forearms",
    "Glutes", "Shoulders", "Triceps", "Upper Legs", "Lower Legs", "Other/Misc",
  ];
  const TODAY = DAYS[(new Date().getDay() + 6) % 7];

  const state = {
    versions: [],            // [{id, note, author_email, created_at}], newest first
    cache: new Map(),        // version id -> routine data
    viewId: null,            // version shown
    day: TODAY,
    showChanges: false,
    session: null,
    isMember: false,
    editing: false,
    draft: null,             // routine data being edited
    draftBaseId: null,       // version the draft started from
    draftNote: "",
    conflictOk: false,
    confirmDelete: null,     // version id awaiting delete confirmation in the drawer
    renaming: null,          // version id whose name is being edited in the drawer
    noteFix: null,           // {id, day, i, msg}: exercise note being fixed in place
    drawerMsg: "",
  };

  const $ = (id) => document.getElementById(id);

  // Small DOM helper; text always goes through textContent, never innerHTML.
  function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, "");
      else node.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "ico");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#i-${name}`);
    svg.append(use);
    return svg;
  }

  // ---------- routine helpers ----------

  function normalize(data) {
    const byDay = new Map((data?.days || []).map((d) => [d.day, d]));
    return {
      ...data,
      days: DAYS.map((day) => ({
        day,
        title: byDay.get(day)?.title || "",
        exercises: (byDay.get(day)?.exercises || []).map((x) => ({ ...x })),
      })),
    };
  }

  const isCardio = (x) => x.muscle === "Cardio" || x.duration_min != null;
  const dayOf = (data, day) => data.days.find((d) => d.day === day);

  function stageNumbers(data) {
    const nums = {};
    let n = 0;
    for (const d of data.days) nums[d.day] = d.exercises.length ? ++n : null;
    return nums;
  }

  const pad = (n) => String(n).padStart(2, "0");

  function stageTitle(d) {
    if (d.title) return d.title;
    if (!d.exercises.length) return "Rest day";
    if (d.exercises.every(isCardio)) return d.exercises.map((x) => x.name).join(" + ");
    // Most-trained muscles first; core work only names the day when it's all there is.
    const counts = new Map();
    for (const x of d.exercises) if (!isCardio(x) && x.muscle) counts.set(x.muscle, (counts.get(x.muscle) || 0) + 1);
    let ranked = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
    if (ranked.some((m) => m !== "Abs")) ranked = ranked.filter((m) => m !== "Abs");
    const muscles = ranked.slice(0, 3);
    if (muscles.length < 2) return muscles[0] || "Strength";
    return `${muscles.slice(0, -1).join(", ")} & ${muscles.at(-1)}`;
  }

  function dose(x) {
    if (isCardio(x)) return x.duration_min ? `${x.duration_min} min` : "—";
    const sets = x.sets || (x.reps ? x.reps.length : 0);
    if (!x.reps || !x.reps.length) return sets ? `${sets} sets` : "—";
    const same = x.reps.every((r) => r === x.reps[0]);
    return same ? `${sets} × ${x.reps[0]}` : x.reps.join(" · ");
  }

  const doseKey = (x) => JSON.stringify([x.sets ?? null, x.reps ?? null, x.rest_sec ?? null, x.duration_min ?? null]);

  function daySummary(d) {
    if (!d.exercises.length) return "Rest";
    if (d.exercises.every(isCardio)) {
      const mins = d.exercises.reduce((t, x) => t + (x.duration_min || 0), 0);
      return `${d.exercises.length === 1 ? "Ride" : "Cardio"} · ${mins} min`;
    }
    return `Strength · ${d.exercises.length}`;
  }

  // The rest time every strength exercise shares, if they all share one.
  function sharedRest(d) {
    const rests = new Set(d.exercises.filter((x) => !isCardio(x)).map((x) => x.rest_sec ?? null));
    return rests.size === 1 ? [...rests][0] : null;
  }

  function stageMeta(d) {
    if (!d.exercises.length) return "No training scheduled";
    if (d.exercises.every(isCardio)) {
      const mins = d.exercises.reduce((t, x) => t + (x.duration_min || 0), 0);
      return `${d.exercises.length === 1 ? "1 activity" : `${d.exercises.length} activities`} · ${mins} min`;
    }
    const strength = d.exercises.filter((x) => !isCardio(x));
    const sets = strength.map((x) => x.sets).filter(Boolean);
    const lo = Math.min(...sets), hi = Math.max(...sets);
    const parts = [`${d.exercises.length} exercises`];
    if (sets.length) parts.push(lo === hi ? `${lo} sets each` : `${lo}–${hi} sets`);
    const rest = sharedRest(d);
    if (rest) parts.push(`${rest} sec rest`);
    return parts.join(" · ");
  }

  // Compare one day of a version with the version before it.
  function diffDay(prev, cur, day) {
    if (!prev) return { marks: new Map(), removed: [] };
    const prevDay = dayOf(prev, day).exercises;
    const prevAll = new Map();
    for (const d of prev.days) for (const x of d.exercises) if (!prevAll.has(x.name)) prevAll.set(x.name, d.day);
    const marks = new Map();
    const curDay = dayOf(cur, day).exercises;
    curDay.forEach((x, i) => {
      const before = prevDay.find((p) => p.name === x.name);
      if (before) {
        if (doseKey(before) !== doseKey(x)) marks.set(i, "Changed");
        else if ((before.note || "") !== (x.note || "")) marks.set(i, "Note");
        else if (prevDay.indexOf(before) !== i) marks.set(i, "Reordered");
      } else if (prevAll.has(x.name)) {
        marks.set(i, `From ${DAY_NAMES[prevAll.get(x.name)].slice(0, 3)}`);
      } else {
        marks.set(i, "New");
      }
    });
    const removed = prevDay.filter((p) => !curDay.some((x) => x.name === p.name)).map((p) => p.name);
    return { marks, removed };
  }

  // ---------- data ----------

  async function loadVersions() {
    const { data, error } = await db
      .from("routine_versions")
      .select("id, note, author_email, created_at")
      .eq("routine", cfg.routine)
      .order("id", { ascending: false })
      .limit(200);
    if (error) throw error;
    state.versions = data;
  }

  async function getData(id) {
    if (state.cache.has(id)) return state.cache.get(id);
    const { data, error } = await db.from("routine_versions").select("data").eq("id", id).single();
    if (error) throw error;
    const norm = normalize(data.data);
    state.cache.set(id, norm);
    return norm;
  }

  const latestId = () => state.versions[0]?.id ?? null;
  const versionNumber = (id) => state.versions.length - state.versions.findIndex((v) => v.id === id);
  const prevVersionId = (id) => state.versions[state.versions.findIndex((v) => v.id === id) + 1]?.id ?? null;
  const meta = (id) => state.versions.find((v) => v.id === id);

  function who(email) {
    if (!email) return "JEFIT import";
    if (state.session?.user?.email === email) return "you";
    return email.split("@")[0];
  }

  function when(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // ---------- rendering ----------

  let viewData = null;
  let prevData = null;

  async function show(id, { keepDay = true } = {}) {
    state.viewId = id;
    viewData = await getData(id);
    const prevId = prevVersionId(id);
    prevData = prevId ? await getData(prevId) : null;
    state.showChanges = id !== latestId() && !!prevData;
    if (!keepDay) state.day = TODAY;
    const url = new URL(location.href);
    if (id === latestId()) url.searchParams.delete("v");
    else url.searchParams.set("v", versionNumber(id));
    history.replaceState(null, "", url);
    render();
  }

  function current() {
    return state.editing ? state.draft : viewData;
  }

  function render() {
    const data = current();
    if (!data) return;
    document.body.classList.toggle("is-editing", state.editing);
    renderStamp();
    renderBanner();
    renderBib(data);
    renderList(data);
    renderWeek(data);
    renderHistory();
    $("edit-btn").hidden = !state.isMember || state.editing;
  }

  function renderStamp() {
    const m = meta(state.viewId);
    const t = $("stamp-text");
    t.replaceChildren();
    if (!m) return;
    const n = versionNumber(m.id);
    t.append(el("b", { text: `Version ${n}` }), ` · ${when(m.created_at)} · ${who(m.author_email)}`);
    if (m.id !== latestId()) t.append(" · not latest");
  }

  function renderBanner() {
    const b = $("banner");
    b.className = "banner";
    b.replaceChildren();
    if (state.editing) {
      b.hidden = false;
      b.append(
        el("span", {}, "Editing the whole week: switch days with the strip at the top; a red corner marks days you’ve changed. Drag rows or use the arrows; drop a row on a day to move it there. One save creates ",
          el("b", { text: `version ${state.versions.length + 1}` }), " with every day's changes."),
      );
      return;
    }
    if (state.viewId && state.viewId !== latestId()) {
      const m = meta(state.viewId);
      b.hidden = false;
      b.append(
        el("span", {}, `You're looking at version ${versionNumber(state.viewId)}`,
          m.note ? ` (“${m.note}”)` : "", ". Marks show what changed from the version before."),
        el("button", { class: "btn", type: "button", text: "Back to latest", onclick: () => show(latestId()) }),
        state.isMember && el("button", {
          class: "btn btn-primary", type: "button", text: "Restore this version",
          onclick: () => startEdit(`Restored version ${versionNumber(state.viewId)}`),
        }),
      );
      return;
    }
    b.hidden = true;
  }

  let lastBibKey = "";
  function renderBib(data) {
    const d = dayOf(data, state.day);
    const num = stageNumbers(data)[state.day];
    const bib = $("bib");
    bib.classList.toggle("is-rest", !num);
    $("bib-num").textContent = num ? pad(num) : "Rest";
    $("bib-day").textContent = DAY_NAMES[state.day];
    $("bib-band").classList.toggle("is-other", state.day !== TODAY);
    $("bib-stage").textContent = num ? `Stage ${pad(num)}` : nextStageText(data);
    const key = `${state.day}|${num}`;
    if (lastBibKey && key !== lastBibKey) {
      bib.classList.remove("repin");
      void bib.offsetWidth;
      bib.classList.add("repin");
    }
    lastBibKey = key;
    $("stage-title").textContent = stageTitle(d);
    $("stage-meta").textContent = state.day === TODAY ? `Today · ${stageMeta(d)}` : stageMeta(d);
    $("stage-meta").hidden = !d.exercises.length && state.day !== TODAY;
  }

  function nextDay(data) {
    const i = DAYS.indexOf(state.day);
    for (let k = 1; k < 7; k++) {
      const d = dayOf(data, DAYS[(i + k) % 7]);
      if (d.exercises.length) return d;
    }
    return null;
  }

  function nextStageText(data) {
    const next = nextDay(data);
    return next ? `Next: ${DAY_NAMES[next.day].slice(0, 3)}` : "";
  }

  function renderList(data) {
    const d = dayOf(data, state.day);
    const list = $("rows");
    list.replaceChildren();
    list.classList.toggle("is-editing", state.editing);
    $("title-edit").hidden = !state.editing;
    $("add-btn").hidden = !state.editing;
    if (state.editing) $("title-input").value = d.title || "";

    const { marks, removed } = state.showChanges && !state.editing
      ? diffDay(prevData, data, state.day)
      : { marks: new Map(), removed: [] };

    if (!d.exercises.length) {
      const next = nextDay(data);
      list.append(el("li", { class: "row-empty" }, state.editing
        ? "Nothing scheduled. Add an exercise, or drag one here from another day."
        : next
          ? [el("p", {}, "Recovery. The next stage is ", el("b", { text: `${DAY_NAMES[next.day]}: ${stageTitle(next)}` }), "."),
             el("button", { class: "btn", type: "button", text: `See ${DAY_NAMES[next.day]}`, onclick: () => selectDay(next.day) })]
          : "Nothing scheduled this week."));
    }

    // Column headers for the edit grid; phones label each field instead. Inputs carry their own aria-labels.
    list.classList.toggle("all-cardio", d.exercises.length > 0 && d.exercises.every(isCardio));
    if (state.editing && d.exercises.length) {
      list.append(el("li", { class: "row row-head", "aria-hidden": "true" },
        el("span"), el("span", { text: "#" }), el("span", { text: "Exercise" }), el("span", { text: "Muscle" }),
        d.exercises.every(isCardio)
          ? el("span", { class: "num span-3", text: "Minutes" })
          : [el("span", { class: "num", text: "Sets" }), el("span", { class: "num", text: "Reps" }),
             el("span", { class: "num", text: "Rest (s)" })],
        el("span", { class: "row-head-tools", text: "Order / day" }),
      ));
    }

    const shared = !state.editing && (sharedRest(d) != null || d.exercises.every(isCardio));
    list.classList.toggle("same-rest", shared);
    d.exercises.forEach((x, i) => {
      list.append(state.editing ? editRow(d, x, i) : viewRow(x, i, marks.get(i), shared));
    });

    const rm = $("removed");
    rm.hidden = !removed.length;
    rm.replaceChildren();
    if (removed.length) {
      rm.append("Removed from this day: ");
      removed.forEach((name, i) => rm.append(i ? ", " : "", el("s", { text: name })));
    }
  }

  function viewRow(x, i, mark, sharedRestShown) {
    return el("li", { class: `row${mark === "Changed" ? " is-changed" : ""}` },
      el("span", { class: "row-n", text: pad(i + 1) }),
      el("span", { class: "row-name" }, x.name, mark && el("span", { class: "row-tag", text: mark }),
        noteView(x, i)),
      el("span", { class: "row-muscle", text: x.muscle || "" }),
      el("span", { class: "row-dose", text: dose(x) }),
      !sharedRestShown && el("span", { class: "row-rest", text: isCardio(x) ? "" : x.rest_sec ? `${x.rest_sec} sec rest` : "" }),
    );
  }

  // Members can fix an exercise's note on the version shown, in place, without saving a new version.
  function noteView(x, i) {
    const canFix = state.isMember && !state.editing;
    const f = state.noteFix;
    if (canFix && f && f.id === state.viewId && f.day === state.day && f.i === i) {
      const close = () => { state.noteFix = null; render(); };
      return el("form", {
        class: "note-fix",
        onsubmit: (e) => { e.preventDefault(); fixNote(i, $("note-fix-input").value); },
      },
        el("label", { class: "sr-only", for: "note-fix-input", text: `Note for ${x.name}` }),
        el("input", {
          id: "note-fix-input", type: "text", maxlength: "200", value: x.note || "",
          placeholder: "Note (optional): form cue, tempo, weight…",
          onkeydown: (e) => { if (e.key === "Escape") close(); },
        }),
        el("button", { class: "btn btn-primary", type: "submit", text: "Save note" }),
        el("button", { class: "btn btn-quiet", type: "button", text: "Cancel", onclick: close }),
        f.msg && el("p", { class: "note-fix-msg", role: "alert", text: f.msg }),
      );
    }
    const edit = canFix && el("button", {
      class: x.note ? "note-fix-btn" : "note-fix-btn is-add", type: "button",
      "aria-label": x.note ? `Fix the note on ${x.name}` : `Add a note to ${x.name}`,
      onclick: () => {
        state.noteFix = { id: state.viewId, day: state.day, i, msg: "" };
        render();
        $("note-fix-input").focus();
        $("note-fix-input").select();
      },
    }, x.note ? icon("pencil") : "Add note");
    if (!x.note && !edit) return null;
    return el("span", { class: "row-note" }, x.note || "", x.note && edit ? " " : "", edit);
  }

  async function fixNote(i, text) {
    const { viewId: id, day } = state;
    const note = text.trim();
    try {
      // Change only this note in the week exactly as stored; the database refuses any other change.
      const { data: row, error } = await db.from("routine_versions").select("data").eq("id", id).single();
      if (error) throw error;
      const raw = row.data;
      const x = raw.days?.find((d) => d.day === day)?.exercises?.[i];
      if (!x) throw new Error("this exercise isn't in the saved version any more");
      if (note) x.note = note; else delete x.note;
      const { data: done, error: upErr } = await db.from("routine_versions").update({ data: raw }).eq("id", id).select("id");
      if (upErr) throw upErr;
      if (!done.length) throw new Error("this sign-in can't edit notes");
      state.cache.set(id, normalize(raw));
      state.noteFix = null;
      await show(id);
      if (id === latestId()) toast(`Note saved on version ${versionNumber(id)}. No new version was created.`);
    } catch (err) {
      state.noteFix = { id, day, i, msg: `Couldn't save the note: ${err.message || "network error"}. Try again.` };
      render();
    }
  }

  function field(cap, input, cls = "") {
    return el("label", { class: `field ${cls}` }, el("span", { class: "field-cap", text: cap }), input);
  }

  function editRow(d, x, i) {
    const n = d.exercises.length;
    const update = (fn) => {
      fn();
      markDirty();
      $("stage-meta").textContent = state.day === TODAY ? `Today · ${stageMeta(d)}` : stageMeta(d);
    };

    const name = el("input", {
      type: "text", value: x.name, "aria-label": `Exercise ${i + 1} name`, maxlength: 80,
      list: "exercise-list",
      oninput: (e) => update(() => { x.name = e.target.value; }),
      onchange: (e) => update(() => {
        // Picking a known exercise reuses its spelling and, on an empty row, its muscle.
        const known = knownExercises().get(e.target.value.trim().toLowerCase());
        refreshExerciseList();
        if (!known) return;
        x.name = e.target.value = known.name;
        if (!x.muscle && MUSCLES.includes(known.muscle)) { x.muscle = known.muscle; render(); }
      }),
    });
    // A value saved before the list was fixed stays visible until someone picks a group.
    const legacy = x.muscle && !MUSCLES.includes(x.muscle) ? x.muscle : null;
    const muscle = el("select", {
      "aria-label": `Exercise ${i + 1} muscle`,
      onchange: (e) => update(() => {
        x.muscle = e.target.value;
        if (x.muscle === "Cardio" && x.duration_min == null) {
          x.duration_min = 30; delete x.sets; delete x.reps; delete x.rest_sec;
        } else if (x.muscle !== "Cardio" && x.duration_min != null) {
          delete x.duration_min; x.sets = 3; x.reps = [10, 10, 10]; x.rest_sec = 60;
        }
        render();
      }),
    },
      !x.muscle && el("option", { value: "", text: "Choose…", disabled: true, selected: true }),
      legacy && el("option", { value: legacy, text: `${legacy} (old)`, title: "Not a JEFIT group. Pick one to replace it.", selected: true }),
      MUSCLES.map((m) => el("option", { value: m, text: m, selected: m === x.muscle })),
    );

    const fields = [];
    if (isCardio(x)) {
      fields.push(field("Minutes", el("input", {
        class: "num-in", type: "number", min: 1, max: 600, value: x.duration_min ?? "",
        "aria-label": `Exercise ${i + 1} minutes`,
        oninput: (e) => update(() => { x.duration_min = toInt(e.target.value); }),
      }), "span-3 dose-in"));
    } else {
      const reps = el("input", {
        class: "num-in", type: "text", inputmode: "numeric", value: repsText(x.reps),
        placeholder: "e.g. 10", "aria-label": `Exercise ${i + 1} reps per set`,
        onchange: (e) => update(() => { x.reps = parseReps(e.target.value, x.sets); e.target.value = repsText(x.reps); }),
      });
      fields.push(
        field("Sets", el("input", {
          class: "num-in", type: "number", min: 1, max: 20, value: x.sets ?? "",
          "aria-label": `Exercise ${i + 1} sets`,
          onchange: (e) => update(() => {
            x.sets = toInt(e.target.value);
            if (x.reps?.length && x.sets) {
              x.reps = Array.from({ length: x.sets }, (_, k) => x.reps[Math.min(k, x.reps.length - 1)]);
              reps.value = repsText(x.reps);
            }
          }),
        }), "dose-in dose-sets"),
        field("Reps", reps, "dose-in dose-reps"),
        field("Rest (s)", el("input", {
          class: "num-in", type: "number", min: 0, max: 900, step: 5, value: x.rest_sec ?? "",
          "aria-label": `Exercise ${i + 1} rest in seconds`,
          oninput: (e) => update(() => { x.rest_sec = toInt(e.target.value); }),
        }), "dose-in dose-rest"),
      );
    }

    const move = el("select", {
      class: "move", "aria-label": `Move exercise ${i + 1} to another day`,
      onchange: (e) => { moveTo(i, e.target.value); },
    },
      el("option", { value: "", text: "Move…" }),
      DAYS.filter((day) => day !== d.day).map((day) => el("option", { value: day, text: DAY_NAMES[day] })),
    );

    const li = el("li", { class: "row", draggable: "true", "data-i": i },
      el("span", { class: "row-grip", title: "Drag to reorder or onto a day", "aria-hidden": "true" }, icon("grip")),
      el("span", { class: "row-n", text: pad(i + 1) }),
      field("Exercise", name, "name-in"),
      field("Muscle", muscle, "muscle-in"),
      ...fields,
      el("span", { class: "row-tools" },
        el("button", { class: "icon-btn", type: "button", "aria-label": `Move exercise ${i + 1} up`, disabled: i === 0,
          onclick: () => reorder(i, i - 1) }, icon("up")),
        el("button", { class: "icon-btn", type: "button", "aria-label": `Move exercise ${i + 1} down`, disabled: i === n - 1,
          onclick: () => reorder(i, i + 1) }, icon("down")),
        move,
        el("button", { class: "icon-btn", type: "button", "aria-label": `Remove ${x.name || "exercise"}`,
          onclick: () => { d.exercises.splice(i, 1); markDirty(); render(); } }, icon("x")),
      ),
      field("Note", el("input", {
        type: "text", value: x.note || "", maxlength: 200, placeholder: "Note (optional): form cue, tempo, weight…",
        "aria-label": `Exercise ${i + 1} note`,
        oninput: (e) => update(() => { x.note = e.target.value; }),
      }), "note-in"),
    );

    // Only start a drag from the grip, so text inputs stay selectable.
    let fromGrip = false;
    li.addEventListener("pointerdown", (e) => { fromGrip = !!e.target.closest(".row-grip"); });
    li.addEventListener("dragstart", (e) => {
      if (!fromGrip) { e.preventDefault(); return; }
      drag = { day: d.day, i };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", x.name);
      li.classList.add("is-dragging");
    });
    li.addEventListener("dragend", () => { drag = null; clearDropMarks(); li.classList.remove("is-dragging"); });
    li.addEventListener("dragover", (e) => {
      if (!drag || drag.day !== d.day) return;
      e.preventDefault();
      clearDropMarks();
      li.classList.add("drop-before");
    });
    li.addEventListener("drop", (e) => {
      if (!drag || drag.day !== d.day) return;
      e.preventDefault();
      const to = drag.i < i ? i - 1 : i;
      reorder(drag.i, to);
    });
    return li;
  }

  let drag = null;
  function clearDropMarks() {
    document.querySelectorAll(".drop-before, .drop-target").forEach((n) => n.classList.remove("drop-before", "drop-target"));
  }

  // "10" when every set matches (it expands to all sets on save), otherwise the full list.
  const repsText = (reps) => !reps?.length ? "" : reps.every((r) => r === reps[0]) ? String(reps[0]) : reps.join(", ");

  const toInt = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : null; };

  function parseReps(text, sets) {
    const nums = text.split(/[\s,·x×]+/).map((t) => parseInt(t, 10)).filter((n) => n > 0);
    if (!nums.length) return null;
    if (nums.length === 1 && sets > 1) return Array(sets).fill(nums[0]);
    return nums;
  }

  function reorder(from, to) {
    const list = dayOf(state.draft, state.day).exercises;
    if (to < 0 || to >= list.length || from === to) { render(); return; }
    const [x] = list.splice(from, 1);
    list.splice(to, 0, x);
    markDirty();
    render();
  }

  function moveTo(i, day, from = state.day) {
    if (!day || day === from) return;
    const [x] = dayOf(state.draft, from).exercises.splice(i, 1);
    dayOf(state.draft, day).exercises.push(x);
    markDirty();
    flashSave(`Moved ${x.name} to ${DAY_NAMES[day]}.`);
    render();
  }

  function renderWeek(data) {
    const week = $("week");
    const nums = stageNumbers(data);
    week.replaceChildren();
    for (const d of data.days) {
      const num = nums[d.day];
      const ride = !!num && d.exercises.every(isCardio);
      // While editing, flag days whose draft differs from the version being edited.
      const changed = state.editing && JSON.stringify(d) !== JSON.stringify(dayOf(viewData, d.day));
      const btn = el("button", {
        type: "button",
        class: `week-bib${num ? "" : " is-rest"}${ride ? " is-ride" : ""}${d.day === TODAY ? " is-today" : ""}${changed ? " is-changed" : ""}`,
        "aria-current": d.day === state.day ? "true" : null,
        "aria-label": `${DAY_NAMES[d.day]}${d.day === TODAY ? " (today)" : ""}: ${stageTitle(d)}, ${daySummary(d)}${changed ? " (unsaved changes)" : ""}`,
        onclick: () => selectDay(d.day),
      },
        el("span", { class: "pin pin-tl", "aria-hidden": "true" }),
        el("span", { class: "pin pin-tr", "aria-hidden": "true" }),
        el("span", { class: "week-day" }, DAY_NAMES[d.day].slice(0, 3),
          d.day === TODAY && el("span", { class: "week-today", text: " · Today" })),
        el("span", { class: "week-n", text: num ? pad(num) : "—" }),
        ride && trailProfile(),
        el("span", { class: "week-sum", text: daySummary(d) }),
      );
      if (state.editing) {
        btn.addEventListener("dragover", (e) => {
          if (!drag || drag.day === d.day) return;
          e.preventDefault();
          clearDropMarks();
          btn.classList.add("drop-target");
        });
        btn.addEventListener("dragleave", () => btn.classList.remove("drop-target"));
        btn.addEventListener("drop", (e) => {
          if (!drag || drag.day === d.day) return;
          e.preventDefault();
          const { day, i } = drag;
          drag = null;
          moveTo(i, d.day, day);
        });
      }
      week.append(el("li", {}, btn));
    }
    // On the scrolling phone strip, keep the selected day in view.
    const sel = week.querySelector('[aria-current="true"]');
    if (sel && week.scrollWidth > week.clientWidth) {
      week.scrollLeft = Math.max(0, sel.parentElement.offsetLeft - week.clientWidth / 2 + sel.offsetWidth / 2);
    }
  }

  // A drawn trail line marks ride stages in the strip. It's a symbol, not elevation data.
  function trailProfile() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "week-profile");
    svg.setAttribute("viewBox", "0 0 100 22");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M0 19 L14 15 L24 17 L36 7 L46 11 L58 3 L68 10 L80 6 L90 13 L100 11");
    svg.append(path);
    return svg;
  }

  function selectDay(day) {
    state.day = day;
    render();
    // Bring the day's list into view: always on phones, and while editing, where the strip stays pinned on top.
    if (state.editing || matchMedia("(max-width: 860px)").matches) {
      $("stage").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }

  function renderHistory() {
    const list = $("history-list");
    list.replaceChildren();
    const canRename = state.isMember && !state.editing;
    const canDelete = canRename && state.versions.length > 1;
    const msg = () => state.drawerMsg && el("p", { class: "history-action-msg", role: "alert", text: state.drawerMsg });
    state.versions.forEach((v) => {
      const n = versionNumber(v.id);
      if (canDelete && state.confirmDelete === v.id) {
        list.append(el("li", { class: "history-action is-danger" },
          el("p", {}, el("b", { text: `Delete version ${n}?` }),
            " It's removed for everyone and can't be undone. Newer versions move down one number."),
          el("button", { class: "btn btn-danger", type: "button", text: "Delete", onclick: () => deleteVersion(v.id) }),
          el("button", { class: "btn", type: "button", text: "Cancel", id: "history-cancel", onclick: cancelDrawerAction }),
          msg(),
        ));
        return;
      }
      if (canRename && state.renaming === v.id) {
        list.append(el("li", {},
          el("form", {
            class: "history-action",
            onsubmit: (e) => { e.preventDefault(); renameVersion(v.id, $("rename-input").value); },
          },
            el("label", { for: "rename-input", text: `Name for version ${n}` }),
            el("input", {
              id: "rename-input", type: "text", maxlength: "500", value: v.note || "", placeholder: "No note",
              onkeydown: (e) => { if (e.key === "Escape") { e.stopPropagation(); cancelDrawerAction(); } },
            }),
            el("button", { class: "btn btn-primary", type: "submit", text: "Save name" }),
            el("button", { class: "btn", type: "button", text: "Cancel", onclick: cancelDrawerAction }),
            msg(),
          ),
        ));
        return;
      }
      list.append(el("li", { class: v.id === state.viewId ? "history-row is-current" : "history-row" },
        el("button", {
          class: "history-item", type: "button",
          "aria-current": v.id === state.viewId ? "true" : null,
          onclick: () => { if (state.editing) return; show(v.id); },
          disabled: state.editing,
        },
          el("span", { class: "history-v", text: pad(n) }),
          el("span", { class: "history-note", text: v.note || "No note" }),
          el("span", { class: "history-meta" },
            `${when(v.created_at)} · ${who(v.author_email)}`,
            v.id === latestId() && el("span", { class: "history-latest", text: " · Latest" })),
        ),
        canRename && el("button", {
          class: "icon-btn history-tool", type: "button", "aria-label": `Rename version ${n}`,
          onclick: () => {
            Object.assign(state, { renaming: v.id, confirmDelete: null, drawerMsg: "" });
            renderHistory();
            const input = $("rename-input");
            input.focus();
            input.select();
          },
        }, icon("pencil")),
        canDelete && el("button", {
          class: "icon-btn history-tool history-del", type: "button", "aria-label": `Delete version ${n}`,
          onclick: () => {
            Object.assign(state, { confirmDelete: v.id, renaming: null, drawerMsg: "" });
            renderHistory();
            $("history-cancel")?.focus();
          },
        }, icon("trash")),
      ));
    });
    list.append(el("li", { class: "history-tail", text: state.versions.length === 1
      ? "Every save adds a version here. Pick any one to see it, or restore it as the newest."
      : "Pick any version to see it and what changed from the one before." }));
  }

  function cancelDrawerAction() {
    Object.assign(state, { confirmDelete: null, renaming: null, drawerMsg: "" });
    renderHistory();
  }

  async function renameVersion(id, text) {
    const note = text.trim() || null;
    const { data, error } = await db.from("routine_versions").update({ note }).eq("id", id).select("id");
    if (error || !data.length) {
      // RLS refusals come back as zero rows changed, not an error.
      state.drawerMsg = error
        ? `Couldn't rename: ${error.message || "network error"}. Try again.`
        : "Couldn't rename it. It may have been deleted, or your sign-in can't edit. Reload to check.";
      renderHistory();
      return;
    }
    meta(id).note = note;
    Object.assign(state, { renaming: null, drawerMsg: "" });
    render();
  }

  async function deleteVersion(id) {
    const n = versionNumber(id);
    const { data, error } = await db.from("routine_versions").delete().eq("id", id).select("id");
    if (error || !data.length) {
      state.drawerMsg = error
        ? `Couldn't delete: ${error.message || "network error"}. Try again.`
        : "Couldn't delete it. It may already be gone, or it's the only version left. Reload to check.";
      renderHistory();
      return;
    }
    Object.assign(state, { confirmDelete: null, drawerMsg: "" });
    state.cache.delete(id);
    savedExercises = null;
    await loadVersions();
    await show(id === state.viewId ? latestId() : state.viewId);
    toast(`Deleted version ${n}.`);
  }

  function toggleHistory(open = $("history").hidden) {
    $("history").hidden = !open;
    $("stamp").setAttribute("aria-expanded", String(open));
    if (open) $("history-close").focus();
  }

  // ---------- editing ----------

  // Exercise-name suggestions: every exercise ever saved in any version, remembering the
  // muscle group it was last saved with. Names from a deleted version drop out after a reload.
  let savedExercises = null; // lowercased name -> { name, muscle }

  async function loadSavedExercises() {
    if (savedExercises) return;
    const { data, error } = await db.from("routine_versions").select("data").eq("routine", cfg.routine).order("id");
    if (error) return; // suggestions are optional
    savedExercises = new Map();
    for (const row of data) rememberNames(row.data);
  }

  function rememberNames(data) {
    for (const d of data?.days || []) {
      for (const x of d.exercises || []) {
        if (x.name?.trim()) savedExercises?.set(x.name.trim().toLowerCase(), { name: x.name.trim(), muscle: x.muscle?.trim() || "" });
      }
    }
  }

  function knownExercises() {
    const byKey = new Map(savedExercises || []);
    state.draft?.days.forEach((d) => d.exercises.forEach((x) => {
      const k = x.name.trim().toLowerCase();
      if (k && !byKey.has(k)) byKey.set(k, { name: x.name.trim(), muscle: x.muscle || "" });
    }));
    return byKey;
  }

  function refreshExerciseList() {
    const exercises = [...knownExercises().values()].sort((a, b) => a.name.localeCompare(b.name));
    $("exercise-list").replaceChildren(...exercises.map((x) => el("option", { value: x.name, label: x.muscle || null })));
  }

  function startEdit(note = "") {
    loadSavedExercises().then(refreshExerciseList);
    state.editing = true;
    state.draft = structuredClone(viewData);
    state.draftBaseId = latestId();
    state.conflictOk = false;
    $("note-input").value = note;
    $("save-btn").disabled = !note; // a restore is a change even before any edit
    $("save-msg").textContent = "";
    $("savebar").hidden = false;
    toggleHistory(false);
    render();
  }

  function markDirty() {
    $("save-btn").disabled = false;
    $("save-msg").classList.remove("is-error");
    if (!$("save-msg").querySelector("button")) $("save-msg").textContent = "Unsaved changes.";
    renderWeek(state.draft); // keep the changed-day marks current while typing
  }

  function flashSave(text) {
    $("save-msg").textContent = text;
  }

  function stopEdit() {
    state.editing = false;
    state.draft = null;
    $("savebar").hidden = true;
    render();
  }

  function cleanDraft(data) {
    return {
      ...data,
      days: data.days.map((d) => {
        const day = {
          day: d.day,
          exercises: d.exercises.filter((x) => x.name.trim()).map((x) => {
            const out = { ...x, name: x.name.trim() };
            if (x.note?.trim()) out.note = x.note.trim(); else delete out.note;
            return out;
          }),
        };
        if (d.title?.trim()) day.title = d.title.trim();
        return day;
      }),
    };
  }

  async function save() {
    const btn = $("save-btn");
    const msg = $("save-msg");
    msg.classList.remove("is-error");
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
      // Someone else may have saved while this draft was open.
      if (!state.conflictOk) {
        const { data: top, error } = await db.from("routine_versions")
          .select("id, author_email").eq("routine", cfg.routine).order("id", { ascending: false }).limit(1).single();
        if (error) throw error;
        if (top.id !== state.draftBaseId) {
          await loadVersions();
          msg.replaceChildren(
            `${who(top.author_email)} saved version ${state.versions.length} while you were editing. Yours would become the latest; theirs stays in history.`,
            el("button", { class: "btn", type: "button", text: "Save mine anyway",
              onclick: () => { state.conflictOk = true; save(); } }),
          );
          btn.disabled = false;
          return;
        }
      }
      const { data: row, error } = await db.from("routine_versions")
        .insert({ routine: cfg.routine, data: cleanDraft(state.draft), note: $("note-input").value.trim() || null })
        .select("id").single();
      if (error) throw error;
      await loadVersions();
      rememberNames(state.draft);
      stopEdit();
      await show(row.id);
      toast(`Saved as version ${versionNumber(row.id)}.`);
    } catch (err) {
      msg.classList.add("is-error");
      msg.textContent = saveError(err);
      btn.disabled = false;
    } finally {
      btn.textContent = "Save version";
    }
  }

  function saveError(err) {
    if (err?.code === "42501") return "This email isn't allowed to save. Ask Hermann to add it to the members list.";
    if (/JWT|session/i.test(err?.message || "")) return "Your sign-in expired. Sign in again; your edits are still here.";
    return `Couldn't save: ${err?.message || "network error"}. Your edits are still here; try again.`;
  }

  function toast(text) {
    const b = $("banner");
    b.className = "banner";
    b.hidden = false;
    b.replaceChildren(el("span", { text }));
    setTimeout(() => { if (!state.editing && state.viewId === latestId()) b.hidden = true; }, 4000);
  }

  // ---------- auth ----------

  async function refreshAuth(session) {
    state.session = session;
    state.isMember = false;
    if (session) {
      const { data } = await db.from("members").select("email").maybeSingle();
      state.isMember = !!data;
    }
    const btn = $("auth-btn");
    btn.textContent = session ? "Account" : "Sign in";
    $("signin-form").hidden = !!session;
    $("signin-status").hidden = !session;
    $("signin-who").textContent = session
      ? state.isMember
        ? `Signed in as ${session.user.email}. You can edit the week.`
        : `Signed in as ${session.user.email}, but this email can't save changes yet. Ask Hermann to add it.`
      : "";
    if (!session && state.editing) stopEdit();
    render();
  }

  async function sendLink(e) {
    e.preventDefault();
    const email = $("signin-email").value.trim();
    const msg = $("signin-msg");
    msg.classList.remove("is-error");
    msg.textContent = "Sending…";
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname },
    });
    if (error) {
      msg.classList.add("is-error");
      msg.textContent = /rate|seconds/i.test(error.message)
        ? "Too many links requested. Wait a minute, then try again."
        : `Couldn't send the link: ${error.message}`;
      return;
    }
    msg.textContent = `Check ${email} for a sign-in link. Open it on this device.`;
  }

  function toggleSignin(open = $("signin").hidden) {
    $("signin").hidden = !open;
    $("auth-btn").setAttribute("aria-expanded", String(open));
    if (open && !state.session) $("signin-email").focus();
  }

  // ---------- boot ----------

  function wire() {
    $("stamp").addEventListener("click", () => toggleHistory());
    $("history-close").addEventListener("click", () => { toggleHistory(false); $("stamp").focus(); });
    $("auth-btn").addEventListener("click", () => toggleSignin());
    $("signin-form").addEventListener("submit", sendLink);
    $("signout-btn").addEventListener("click", async () => { await db.auth.signOut(); $("signin-msg").textContent = "Signed out."; });
    $("edit-btn").addEventListener("click", () => startEdit());
    $("discard-btn").addEventListener("click", stopEdit);
    $("save-btn").addEventListener("click", save);
    $("title-input").addEventListener("input", (e) => {
      dayOf(state.draft, state.day).title = e.target.value;
      markDirty();
      $("stage-title").textContent = stageTitle(dayOf(state.draft, state.day));
      renderWeek(state.draft);
    });
    $("add-btn").addEventListener("click", () => {
      dayOf(state.draft, state.day).exercises.push({ name: "", muscle: "", sets: 3, reps: [10, 10, 10], rest_sec: 60 });
      markDirty();
      render();
      const inputs = $("rows").querySelectorAll(".name-in input");
      inputs[inputs.length - 1]?.focus();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("history").hidden) { toggleHistory(false); $("stamp").focus(); }
    });
    window.addEventListener("beforeunload", (e) => {
      if (state.editing && !$("save-btn").disabled) e.preventDefault();
    });
    document.body.append(
      el("datalist", { id: "exercise-list" }),
    );
  }

  async function boot() {
    wire();
    try {
      await loadVersions();
      if (!state.versions.length) throw new Error("No versions found.");
      const params = new URL(location.href).searchParams;
      if (DAYS.includes(params.get("day"))) state.day = params.get("day");
      const want = parseInt(params.get("v"), 10);
      const target = state.versions[state.versions.length - want]?.id ?? latestId();
      const { data: { session } } = await db.auth.getSession();
      await refreshAuth(session);
      await show(target, { keepDay: true });
    } catch (err) {
      const b = $("banner");
      b.className = "banner is-error";
      b.hidden = false;
      b.replaceChildren(
        el("span", { text: `Couldn't load the routine (${err.message || "network error"}).` }),
        el("button", { class: "btn", type: "button", text: "Try again", onclick: () => location.reload() }),
      );
      $("stage-title").textContent = "Routine unavailable";
    }
    db.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token !== state.session?.access_token) refreshAuth(session);
    });
  }

  boot();
})();
