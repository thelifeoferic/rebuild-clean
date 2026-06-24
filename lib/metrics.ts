export function formatWeight(value: number) {
  return `${value.toFixed(1)} lb`;
}

export function formatMinutes(value: number) {
  return `${value} min`;
}

export function totalReps(sets: number[]) {
  return sets.reduce((sum, reps) => sum + reps, 0);
}
