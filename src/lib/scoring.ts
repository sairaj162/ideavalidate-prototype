import type { Ratings } from "./types";

/** The five criteria and their weights (weights add up to 1.0 = 100%). */
export const CRITERIA: { key: keyof Ratings; label: string; weight: number; hint: string }[] = [
  { key: "problem", label: "Problem clarity", weight: 0.2, hint: "How clearly can you describe the problem?" },
  { key: "demand", label: "Customer-demand evidence", weight: 0.25, hint: "Do real customers say they want this?" },
  { key: "differentiation", label: "Competitive differentiation", weight: 0.2, hint: "How different are you from alternatives?" },
  { key: "financial", label: "Financial feasibility", weight: 0.2, hint: "Do your numbers make sense?" },
  { key: "readiness", label: "Readiness to test", weight: 0.15, hint: "Can you run a small test soon?" },
];

export interface ScoreResult {
  overall: number; // 0-100
  criteria: { key: keyof Ratings; label: string; weight: number; hint: string; rating: number; score: number }[];
  missing: string[]; // labels of unrated criteria
  complete: boolean;
}

/**
 * Weighted score = sum of (weight × rating / 5) × 100.
 * Unrated criteria (0) contribute 0 — they are never treated as perfect —
 * and the result is flagged as incomplete.
 */
export function computeScore(ratings: Ratings): ScoreResult {
  let total = 0;
  const missing: string[] = [];
  const criteria = CRITERIA.map((c) => {
    const rating = Math.max(0, Math.min(5, Math.round(ratings[c.key] || 0)));
    if (rating === 0) missing.push(c.label);
    total += c.weight * (rating / 5) * 100;
    return { ...c, rating, score: Math.round((rating / 5) * 100) };
  });
  return { overall: Math.round(total), criteria, missing, complete: missing.length === 0 };
}

export type Tier = "low" | "mid" | "good" | "high";

/** Converts a score into a band label used across the UI. */
export function interpretScore(score: number): { tier: Tier; label: string } {
  if (score < 40) return { tier: "low", label: "Major assumptions to investigate" };
  if (score < 60) return { tier: "mid", label: "Early-stage idea; more validation needed" };
  if (score < 80) return { tier: "good", label: "Promising areas; test remaining risks" };
  return { tier: "high", label: "Strong preparation; verify assumptions with real customers" };
}
