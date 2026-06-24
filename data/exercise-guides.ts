import { Bike, Dumbbell, Flame, Footprints, RotateCcw, Scale, Trophy } from "lucide-react";

export const exerciseGuides = [
  {
    title: "Bike intervals",
    focus: "Cardio base",
    load: "20-45 min",
    icon: Bike,
    cues: ["Settle breathing first", "Add resistance after 5 minutes", "Finish with 2 controlled hard pushes"],
  },
  {
    title: "Jacob's Ladder",
    focus: "Conditioning",
    load: "3-5 rounds",
    icon: Flame,
    cues: ["Stay tall through the hips", "Count clean continuous time", "Rest before form falls apart"],
  },
  {
    title: "Push-ups",
    focus: "Bodyweight strength",
    load: "3-5 sets",
    icon: Trophy,
    cues: ["Hands under shoulders", "Ribs down", "Stop one rep before ugly reps"],
  },
  {
    title: "Dumbbell curls",
    focus: "Arm strength",
    load: "8-15 reps each arm",
    icon: Dumbbell,
    cues: ["Elbow stays close", "No back swing", "Control the lowering"],
  },
  {
    title: "Kettlebell rotations",
    focus: "Core and shoulders",
    load: "50-200 reps",
    icon: RotateCcw,
    cues: ["Brace abs", "Move around the body, not through the spine", "Switch directions evenly"],
  },
  {
    title: "Farmer carries",
    focus: "Grip and posture",
    load: "4-6 rounds",
    icon: Footprints,
    cues: ["Stand tall", "Crush the handles", "Walk slower than ego wants"],
  },
  {
    title: "Goblet squats",
    focus: "Legs",
    load: "3 x 8-15",
    icon: Scale,
    cues: ["Weight close to chest", "Knees track over toes", "Own the bottom position"],
  },
  {
    title: "Barbell bench",
    focus: "Upper body strength",
    load: "3-5 sets",
    icon: Dumbbell,
    cues: ["Shoulders packed", "Feet planted", "Add weight only after clean reps"],
  },
];
