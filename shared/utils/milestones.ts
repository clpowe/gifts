import { SPECIAL_LABELS } from "./constants";

/**
 * Given the age someone will turn on their NEXT birthday, return a
 * milestone descriptor, or null if it isn't a landmark age.
 */
export function getMilestone(nextAge: number | null): Milestone | null {
  if (nextAge === null || !MILESTONE_AGES.has(nextAge)) return null;

  if (SPECIAL_LABELS[nextAge]) {
    return { age: nextAge, label: SPECIAL_LABELS[nextAge] };
  }

  // Landmark decades (30–100) + the 75 diamond year
  if (nextAge >= 30 && (nextAge % 10 === 0 || nextAge === 75)) {
    const tag = nextAge === 75 ? "Diamond Year" : "Landmark Decade";
    return { age: nextAge, label: `🌟 ${tag}: Turning ${nextAge}!` };
  }

  // 5, 10, 20
  return { age: nextAge, label: `✨ Milestone: Turning ${nextAge}!` };
}
