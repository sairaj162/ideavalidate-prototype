// Shared data shapes used across the app.

export type Stage = "Idea" | "Research" | "Prototype" | "Operating";

/** Self-assessment ratings from 1 to 5. A value of 0 means "not rated yet". */
export interface Ratings {
  problem: number;
  demand: number;
  differentiation: number;
  financial: number;
  readiness: number;
}

export interface Idea {
  id: string;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean | undefined;
  versionOf?: string;
  // Step 1
  name: string;
  category: string;
  description: string;
  targetMarket: string;
  stage: Stage;
  // Step 2
  problem: string;
  whoHasProblem: string;
  frequency: string;
  currentSolution: string;
  research: string;
  interviews: number | null;
  // Step 3
  segment: string;
  potentialCustomers: number | null;
  competitors: string;
  usp: string;
  uspEvidence: string;
  // Step 4
  currency: string;
  price: number | null;
  variableCost: number | null;
  fixedCosts: number | null;
  monthlySales: number | null;
  investment: number | null;
  // Step 5
  ratings: Ratings;
}

export const CATEGORIES = [
  "Food & Beverage",
  "Education",
  "Retail & E-commerce",
  "Services",
  "Technology",
  "Health & Wellness",
  "Agriculture",
  "Other",
];

export const STAGES: Stage[] = ["Idea", "Research", "Prototype", "Operating"];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
