import type { LogKind, OnboardingProfile } from "@/types/rebuild";

export type GymMachineCategory = "Cardio" | "Strength machine" | "Free weights" | "Functional" | "Recovery";

export type GymMachinePreset = {
  category: GymMachineCategory;
  logKind: LogKind;
  name: string;
};

export type GymPreset = {
  address: string;
  city: string;
  id: string;
  machines: GymMachinePreset[];
  name: string;
  note: string;
};

export const totalFitnessMachineInventory: GymMachinePreset[] = [
  { category: "Strength machine", logKind: "machine", name: "Leg extension" },
  { category: "Strength machine", logKind: "machine", name: "Seated leg curl" },
  { category: "Strength machine", logKind: "machine", name: "Rotary torso" },
  { category: "Strength machine", logKind: "machine", name: "Abdominal" },
  { category: "Strength machine", logKind: "machine", name: "Converging chest press" },
  { category: "Strength machine", logKind: "machine", name: "Inner thigh" },
  { category: "Cardio", logKind: "machine", name: "Treadmill" },
  { category: "Cardio", logKind: "jacobsLadder", name: "Jacob's Ladder" },
  { category: "Free weights", logKind: "strength", name: "Bench Press" },
  { category: "Free weights", logKind: "kettlebell", name: "Kettlebells" },
  { category: "Free weights", logKind: "strength", name: "Barbells" },
  { category: "Cardio", logKind: "bike", name: "Stationary bike" },
  { category: "Cardio", logKind: "bike", name: "Recumbent bike" },
  { category: "Cardio", logKind: "machine", name: "Elliptical" },
  { category: "Cardio", logKind: "machine", name: "StairMaster" },
  { category: "Cardio", logKind: "machine", name: "Row machine" },
  { category: "Cardio", logKind: "machine", name: "Air bike" },
  { category: "Strength machine", logKind: "machine", name: "Leg press" },
  { category: "Strength machine", logKind: "machine", name: "Hack squat" },
  { category: "Strength machine", logKind: "machine", name: "Smith machine" },
  { category: "Strength machine", logKind: "machine", name: "Chest press" },
  { category: "Strength machine", logKind: "machine", name: "Shoulder press" },
  { category: "Strength machine", logKind: "machine", name: "Lat pulldown" },
  { category: "Strength machine", logKind: "machine", name: "Seated row" },
  { category: "Strength machine", logKind: "machine", name: "Cable station" },
  { category: "Strength machine", logKind: "machine", name: "Cable crossover" },
  { category: "Strength machine", logKind: "machine", name: "Pec deck" },
  { category: "Strength machine", logKind: "machine", name: "Rear delt machine" },
  { category: "Strength machine", logKind: "machine", name: "Calf raise" },
  { category: "Strength machine", logKind: "machine", name: "Assisted pull-up / dip" },
  { category: "Free weights", logKind: "strength", name: "Squat rack" },
  { category: "Free weights", logKind: "strength", name: "Bench press" },
  { category: "Free weights", logKind: "strength", name: "Incline bench" },
  { category: "Free weights", logKind: "strength", name: "Weight bench" },
  { category: "Free weights", logKind: "strength", name: "Barbell" },
  { category: "Free weights", logKind: "strength", name: "EZ curl bar" },
  { category: "Free weights", logKind: "dumbbellCurls", name: "Dumbbells" },
  { category: "Functional", logKind: "farmerCarries", name: "Farmer carry space" },
  { category: "Functional", logKind: "machine", name: "Pull-up bar" },
  { category: "Functional", logKind: "machine", name: "Dip station" },
  { category: "Functional", logKind: "machine", name: "Battle ropes" },
  { category: "Functional", logKind: "machine", name: "Medicine balls" },
  { category: "Functional", logKind: "machine", name: "Resistance bands" },
  { category: "Functional", logKind: "machine", name: "Turf or open floor" },
  { category: "Recovery", logKind: "yoga", name: "Yoga mats" },
  { category: "Recovery", logKind: "yoga", name: "Foam roller" },
];

export const localGymPresets: GymPreset[] = [
  {
    address: "71717 29 Palms Hwy",
    city: "Twentynine Palms",
    id: "total-fitness-29-palms",
    machines: totalFitnessMachineInventory,
    name: "Total Fitness",
    note: "Starter inventory for Total Fitness 29 Palms. Edit it as you learn the exact floor.",
  },
  {
    address: "73782 2 Mile Rd",
    city: "Twentynine Palms",
    id: "29-fitness",
    machines: totalFitnessMachineInventory,
    name: "29 Fitness",
    note: "Starter local gym template.",
  },
  {
    address: "57725 29 Palms Hwy #300",
    city: "Yucca Valley",
    id: "five-star-gym-fitness",
    machines: totalFitnessMachineInventory,
    name: "Five Star Gym & Fitness",
    note: "Starter local gym template.",
  },
  {
    address: "57248 29 Palms Hwy",
    city: "Yucca Valley",
    id: "viva-fit",
    machines: totalFitnessMachineInventory,
    name: "Viva Fit",
    note: "Starter local gym template.",
  },
];

export const defaultGymEquipment = unique(totalFitnessMachineInventory.map((machine) => machine.name));

export function getGymPreset(id?: string) {
  return localGymPresets.find((gym) => gym.id === id) ?? null;
}

export function getProfileGymEquipment(profile: OnboardingProfile | null) {
  return profile?.homeGymEquipment?.length ? profile.homeGymEquipment : profile?.equipment?.length ? profile.equipment : defaultGymEquipment;
}

export function getProfileMachineOptions(profile: OnboardingProfile | null): GymMachinePreset[] {
  const selectedNames = new Set(getProfileGymEquipment(profile));
  const presetMachines = totalFitnessMachineInventory.filter((machine) => selectedNames.has(machine.name));
  const customMachines = Array.from(selectedNames)
    .filter((name) => !presetMachines.some((machine) => machine.name === name))
    .map((name) => ({ category: "Functional" as const, logKind: "machine" as const, name }));

  return [...presetMachines, ...customMachines].sort((a, b) => a.name.localeCompare(b.name));
}

export function machineCategoryFor(name: string) {
  return totalFitnessMachineInventory.find((machine) => machine.name === name)?.category ?? "Strength machine";
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}
