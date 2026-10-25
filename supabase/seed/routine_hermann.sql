-- Transcribed from source/Printable Workout Routine _ JEFIT ... .pdf (JEFIT routine 75366781).
-- "rest_sec" is JEFIT's per-exercise timer. reps is null where JEFIT lists none.
-- Version 1, written by hand rather than from the page, so it has no author.
insert into public.routine_versions (routine, note, author_id, author_email, data) values ('hermann', 'Imported from JEFIT', null, null, $json$
{
  "name": "Hermann",
  "frequency": "6 days / week",
  "type": "Sport Specific",
  "difficulty": "Intermediate",
  "days": [
    {"day": "mon", "exercises": [
      {"name": "Dumbbell Reverse Bicep Curl", "muscle": "Biceps", "sets": 3, "reps": [8, 8, 8], "rest_sec": 60},
      {"name": "Dumbbell Romanian Deadlift", "muscle": "Upper Legs", "sets": 3, "reps": [8, 8, 8], "rest_sec": 60},
      {"name": "Dumbbell Bench Press", "muscle": "Chest", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell One-Arm Row", "muscle": "Back", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Decline Bench Press", "muscle": "Chest", "sets": 3, "reps": [8, 8, 8], "rest_sec": 60},
      {"name": "Dumbbell Lateral Raise", "muscle": "Shoulders", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell One-Arm Preacher Curl", "muscle": "Biceps", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Side Bend", "muscle": "Abs", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60}
    ]},
    {"day": "tue", "exercises": [
      {"name": "Mountain Biking", "muscle": "Cardio", "duration_min": 60}
    ]},
    {"day": "wed", "exercises": [
      {"name": "Bird Dog", "muscle": "Abs", "sets": 3, "reps": null, "rest_sec": 60},
      {"name": "Dumbbell Incline Bench Press", "muscle": "Chest", "sets": 3, "reps": [8, 8, 8], "rest_sec": 60},
      {"name": "Dumbbell Incline Bench Row", "muscle": "Back", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Seated Shoulder Press", "muscle": "Shoulders", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Fly", "muscle": "Chest", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Tricep Extension", "muscle": "Triceps", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Wrist Curl (Palms Down)", "muscle": "Forearms", "sets": 3, "reps": [8, 8, 8], "rest_sec": 60},
      {"name": "Plank with Alternating Knee Drive", "muscle": "Abs", "sets": 3, "reps": null, "rest_sec": 60}
    ]},
    {"day": "thu", "exercises": [
      {"name": "Mountain Biking", "muscle": "Cardio", "duration_min": 60}
    ]},
    {"day": "fri", "exercises": [
      {"name": "Dumbbell One-Arm Row", "muscle": "Back", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Hammer Curl", "muscle": "Forearms", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Reverse Fly", "muscle": "Shoulders", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Shoulder Shrug", "muscle": "Back", "sets": 3, "reps": [12, 12, 12], "rest_sec": 60},
      {"name": "Air Bike", "muscle": "Abs", "sets": 3, "reps": [30, 30, 30], "rest_sec": 60},
      {"name": "Dumbbell Farmers Carry", "muscle": "Upper Legs", "sets": 3, "reps": [6, 6, 6], "rest_sec": 60},
      {"name": "Elevated Push-Up", "muscle": "Chest", "sets": 3, "reps": [10, 10, 10], "rest_sec": 60},
      {"name": "Dumbbell Seated Bicep Curl", "muscle": "Biceps", "sets": 3, "reps": [8, 8, 8], "rest_sec": 60}
    ]},
    {"day": "sat", "exercises": [
      {"name": "Mountain Biking", "muscle": "Cardio", "duration_min": 60}
    ]},
    {"day": "sun", "exercises": []}
  ]
}
$json$::jsonb);
