import type { LogKind } from "@/types/rebuild";

export type StudioClassDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export type StudioClassCategory = "cardio" | "dance" | "mobility" | "senior" | "strength" | "therapy";

export type StudioClass = {
  category: StudioClassCategory;
  day: StudioClassDay;
  end: string;
  id: string;
  image: string;
  instructor: string;
  logDraft?: Record<string, string>;
  logKind: LogKind;
  note?: string;
  start: string;
  title: string;
};

export const studioClassDays: StudioClassDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const totalFitnessClassSchedule: StudioClass[] = [
  classItem("monday-silversneakers-circuit", "Monday", "Silversneakers Circuit", "8:00 AM", "8:50 AM", "Joe", "senior", "machine", "/rebuild-class-silver.jpg"),
  classItem("monday-pilates-plus", "Monday", "Pilates Plus", "9:00 AM", "9:50 AM", "Shelly", "mobility", "yoga", "/rebuild-yoga-light.jpg"),
  classItem("monday-yoga-fit", "Monday", "Yoga Fit", "10:00 AM", "10:50 AM", "Shelly", "mobility", "yoga", "/rebuild-yoga-light.jpg"),
  classItem("monday-bolly-x", "Monday", "Bolly X", "5:00 PM", "5:50 PM", "Cindy", "dance", "machine", "/rebuild-class-dance.jpg"),
  classItem("monday-body-shred", "Monday", "Body Shred", "6:00 PM", "6:50 PM", "Cindy", "strength", "strength", "/rebuild-class-metcon.jpg"),

  classItem("tuesday-silversneakers-core-kettlebell", "Tuesday", "Silversneakers Core / Kettle Bell", "8:00 AM", "8:50 AM", "Joe", "senior", "kettlebell", "/rebuild-class-silver.jpg"),
  classItem("tuesday-zumba-am", "Tuesday", "Zumba", "9:00 AM", "9:50 AM", "Linda", "dance", "machine", "/rebuild-class-dance.jpg"),
  classItem("tuesday-silver-sneakers-yoga-enerchi", "Tuesday", "Silver Sneakers Yoga / Enerchi", "10:00 AM", "10:50 AM", "Linda", "senior", "yoga", "/rebuild-yoga-light.jpg"),
  classItem("tuesday-glutes-core", "Tuesday", "Glutes and Core", "5:00 PM", "5:50 PM", "Cindy", "strength", "strength", "/rebuild-class-studio.jpg"),
  classItem("tuesday-zumba-pm", "Tuesday", "Zumba", "6:00 PM", "6:50 PM", "Cindy", "dance", "machine", "/rebuild-class-dance.jpg"),
  classItem("tuesday-spin", "Tuesday", "Spin", "7:00 PM", "7:50 PM", "Laura", "cardio", "bike", "/rebuild-air-bike.jpg", "Cancelled 6/2."),

  classItem("wednesday-super-circuit", "Wednesday", "Super Circuit", "8:00 AM", "8:50 AM", "Shelly", "strength", "machine", "/rebuild-class-metcon.jpg"),
  classItem("wednesday-pilates-plus", "Wednesday", "Pilates Plus", "9:00 AM", "9:50 AM", "Shelly", "mobility", "yoga", "/rebuild-yoga-light.jpg"),
  classItem("wednesday-rollology", "Wednesday", "ROLLology 2.0 Core, Abs & Glutes", "10:00 AM", "10:50 AM", "Shelly", "mobility", "yoga", "/rebuild-class-studio.jpg"),
  classItem("wednesday-physical-therapy", "Wednesday", "Physical Therapy Development", "11:00 AM", "11:50 AM", "Joe", "therapy", "yoga", "/rebuild-class-silver.jpg"),
  classItem("wednesday-boot-camp", "Wednesday", "Gunny D's Boot Camp", "5:00 PM", "5:50 PM", "Joel", "strength", "strength", "/rebuild-class-metcon.jpg"),
  classItem("wednesday-dance-fusion", "Wednesday", "Dance Fusion", "6:00 PM", "6:50 PM", "Joel", "dance", "machine", "/rebuild-class-dance.jpg"),

  classItem("thursday-silversneakers-circuit", "Thursday", "Silversneakers Circuit", "8:00 AM", "8:50 AM", "Joe", "senior", "machine", "/rebuild-class-silver.jpg"),
  classItem("thursday-yoga-fit-am", "Thursday", "Yoga Fit", "9:00 AM", "9:50 AM", "Shelly", "mobility", "yoga", "/rebuild-yoga-light.jpg"),
  classItem("thursday-physical-therapy", "Thursday", "Physical Therapy Development", "10:00 AM", "10:50 AM", "Joe", "therapy", "yoga", "/rebuild-class-silver.jpg"),
  classItem("thursday-zumba", "Thursday", "Zumba", "5:00 PM", "5:50 PM", "Cindy", "dance", "machine", "/rebuild-class-dance.jpg"),
  classItem("thursday-yoga-fit-pm", "Thursday", "Yoga Fit", "6:00 PM", "6:50 PM", "Shelly", "mobility", "yoga", "/rebuild-yoga-light.jpg"),
  classItem("thursday-spin", "Thursday", "Spin", "7:00 PM", "7:50 PM", "Laura", "cardio", "bike", "/rebuild-air-bike.jpg", "Cancelled 6/4."),

  classItem("friday-metcon", "Friday", "METCON", "7:00 AM", "7:50 AM", "Shelly", "strength", "strength", "/rebuild-class-metcon.jpg", "Metabolic conditioning."),
  classItem("friday-silversneakers-legs", "Friday", "Silversneakers Legs Day", "8:00 AM", "8:50 AM", "Joe", "senior", "machine", "/rebuild-class-silver.jpg"),
  classItem("friday-zumba", "Friday", "Zumba", "9:00 AM", "9:50 AM", "Linda", "dance", "machine", "/rebuild-class-dance.jpg"),
  classItem("friday-physical-therapy", "Friday", "Physical Therapy Development", "10:00 AM", "10:50 AM", "Joe", "therapy", "yoga", "/rebuild-class-silver.jpg"),

  classItem("saturday-tone-stretch", "Saturday", "Tone & Stretch", "9:00 AM", "9:50 AM", "Linda", "mobility", "yoga", "/rebuild-yoga-light.jpg"),
  classItem("saturday-body-shred", "Saturday", "Body Shred", "10:00 AM", "10:50 AM", "Cindy", "strength", "strength", "/rebuild-class-metcon.jpg"),

  classItem("sunday-boot-camp", "Sunday", "Gunny D's Boot Camp", "3:00 PM", "3:50 PM", "Joel", "strength", "strength", "/rebuild-class-metcon.jpg"),
  classItem("sunday-dance-fusion", "Sunday", "Dance Fusion", "4:00 PM", "4:50 PM", "Joel", "dance", "machine", "/rebuild-class-dance.jpg"),
];

export const totalFitnessScheduleNotes = {
  access: "Gym members have 24-hour access with chip/token.",
  kidsCorner: "Kids Corner: Monday-Friday, 8:00 AM-2:00 PM and 4:00 PM-8:00 PM.",
  month: "June 2026",
  source: "Total Fitness Studio Schedule. Instructors subject to change.",
};

export function classesForDay(day: StudioClassDay) {
  return totalFitnessClassSchedule.filter((item) => item.day === day);
}

export function currentStudioDay(date = new Date()): StudioClassDay {
  const dayIndex = date.getDay();
  return studioClassDays[(dayIndex + 6) % 7] ?? "Monday";
}

export function nextStudioClasses(day: StudioClassDay, limit = 3) {
  return classesForDay(day).slice(0, limit);
}

function classItem(
  id: string,
  day: StudioClassDay,
  title: string,
  start: string,
  end: string,
  instructor: string,
  category: StudioClassCategory,
  logKind: LogKind,
  image: string,
  note?: string,
): StudioClass {
  return {
    category,
    day,
    end,
    id,
    image,
    instructor,
    logDraft: draftForClass(title, logKind, instructor),
    logKind,
    note,
    start,
    title,
  };
}

function draftForClass(title: string, logKind: LogKind, instructor: string): Record<string, string> {
  const notes = `Total Fitness class · ${title} · ${instructor}`;

  if (logKind === "bike") return { minutes: "50", notes };
  if (logKind === "kettlebell") return { exercise: title, reps: "0" };
  if (logKind === "strength") return { exercise: title, notes, reps: "0", weight: "0" };
  if (logKind === "yoga") return { focus: title, minutes: "50", notes };
  if (logKind === "machine") return { category: "Studio class", gymName: "Total Fitness", machine: title, minutes: "50", notes };
  return { notes };
}
