import { describe, expect, it } from "vitest";
import { computeScore, interpretScore } from "./scoring";
import { computeFinance } from "./finance";

describe("scoring", () => {
  it("all 5s give 100", () => {
    expect(computeScore({ problem: 5, demand: 5, differentiation: 5, financial: 5, readiness: 5 }).overall).toBe(100);
  });
  it("uses weights 20/25/20/20/15", () => {
    // only demand = 5 -> 25
    expect(computeScore({ problem: 0, demand: 5, differentiation: 0, financial: 0, readiness: 0 }).overall).toBe(25);
    expect(computeScore({ problem: 0, demand: 0, differentiation: 0, financial: 0, readiness: 5 }).overall).toBe(15);
  });
  it("missing ratings are not perfect and mark incomplete", () => {
    const r = computeScore({ problem: 5, demand: 0, differentiation: 5, financial: 5, readiness: 5 });
    expect(r.overall).toBe(75);
    expect(r.complete).toBe(false);
  });
  it("bands", () => {
    expect(interpretScore(39).tier).toBe("low");
    expect(interpretScore(40).tier).toBe("mid");
    expect(interpretScore(60).tier).toBe("good");
    expect(interpretScore(80).tier).toBe("high");
  });
});

describe("finance", () => {
  it("computes revenue, contribution, profit, break-even", () => {
    const f = computeFinance({ price: 100, variableCost: 60, fixedCosts: 2000, monthlySales: 80, investment: 5000 });
    expect(f.revenue).toBe(8000);
    expect(f.contribution).toBe(40);
    expect(f.profit).toBe(1200);
    expect(f.breakEven).toBe(50);
  });
  it("no break-even when cost >= price", () => {
    const f = computeFinance({ price: 50, variableCost: 50, fixedCosts: 100, monthlySales: 10, investment: null });
    expect(f.breakEven).toBeNull();
    expect(f.warnings.length).toBeGreaterThan(0);
  });
});
