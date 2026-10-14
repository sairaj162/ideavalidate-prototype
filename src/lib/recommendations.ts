import type { Idea } from "./types";
import { computeScore } from "./scoring";
import { computeFinance } from "./finance";

export interface Analysis {
  strengths: string[];
  risks: string[];
  missing: string[];
  actions: string[];
}

const blank = (s: string) => !s || s.trim().length === 0;

/** Rule-based analysis — plain if/else rules, no AI. */
export function analyzeIdea(idea: Idea): Analysis {
  const score = computeScore(idea.ratings);
  const fin = computeFinance(idea);
  const r = idea.ratings;
  const strengths: string[] = [];
  const risks: string[] = [];
  const missing: string[] = [];
  const actions: string[] = [];

  // Ratings-based strengths
  score.criteria.forEach((c) => {
    if (c.rating >= 4) strengths.push(`${c.label} rated ${c.rating}/5.`);
  });
  if ((idea.interviews ?? 0) >= 20) strengths.push(`${idea.interviews} customer interviews/surveys collected — real evidence.`);
  if (ok(fin.profit) && fin.profit > 0) strengths.push("Estimated monthly operating profit is positive.");

  // Demand
  if (r.demand > 0 && r.demand <= 2) {
    risks.push("Customer-demand evidence is weak.");
    actions.push("Interview at least 15–20 potential customers about the problem before building more.");
  }
  if (!idea.interviews) {
    missing.push("No customer interviews or survey responses recorded.");
    if (!actions.some((a) => a.startsWith("Interview"))) actions.push("Interview potential customers to collect independent evidence.");
  } else if (idea.interviews < 10) {
    actions.push(`Expand research beyond ${idea.interviews} responses to reduce bias.`);
  }

  // Competition
  if (blank(idea.competitors)) {
    missing.push("Competitors / alternative solutions: Not researched yet.");
    actions.push("Research competing products and the alternative ways customers solve this today.");
  }
  if (r.differentiation > 0 && r.differentiation <= 2) {
    risks.push("Differentiation from alternatives is weak.");
    actions.push("Test a clearer unique value proposition with a simple landing page or pitch.");
  }
  if (!blank(idea.usp) && blank(idea.uspEvidence)) {
    missing.push("No evidence supporting the claimed unique selling proposition.");
  }
  if (idea.potentialCustomers == null) missing.push("Estimated potential customers: Not researched yet.");
  if (blank(idea.research)) missing.push("Customer research conducted: Not researched yet.");

  // Financials
  if (fin.contribution != null && fin.contribution <= 0) {
    risks.push("Each sale loses money (negative or zero contribution).");
    actions.push("Revisit pricing and cost assumptions — raise price or reduce variable cost.");
  }
  if (fin.breakEven != null && idea.monthlySales != null && fin.breakEven > idea.monthlySales) {
    risks.push(`Feasibility gap: break-even needs ${fin.breakEven} sales/month vs ${idea.monthlySales} estimated.`);
    actions.push("Close the break-even gap by lowering fixed costs or validating higher sales volume.");
  }
  if (idea.investment == null) missing.push("Initial investment: Not estimated yet.");

  // Other ratings
  if (r.problem > 0 && r.problem <= 2) {
    risks.push("The problem is not yet clearly defined.");
    actions.push("Write a one-sentence problem statement and validate it with real users.");
  }
  if (r.readiness > 0 && r.readiness <= 2) actions.push("Plan a small, low-cost pilot (e.g. 2-week trial with 10 customers).");
  if (r.financial > 0 && r.financial <= 2) risks.push("You rated your own financial feasibility as low.");
  score.missing.forEach((m) => missing.push(`Rating missing: ${m}.`));

  if (actions.length === 0) actions.push("Run a small paid pilot to verify assumptions with real customers.");
  if (strengths.length === 0) strengths.push("You have documented your idea — the first step of validation.");
  return { strengths, risks, missing, actions };
}

function ok(n: number | null): n is number {
  return typeof n === "number" && Number.isFinite(n);
}
