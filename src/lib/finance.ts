/** Simple monthly unit economics. All values are estimates from user input. */
export interface FinanceInput {
  price: number | null;
  variableCost: number | null;
  fixedCosts: number | null;
  monthlySales: number | null;
  investment: number | null;
}

export interface FinanceResult {
  revenue: number | null;
  contribution: number | null;
  profit: number | null;
  breakEven: number | null; // units per month, null when not computable
  investment: number | null;
  warnings: string[];
}

const ok = (n: number | null): n is number => typeof n === "number" && Number.isFinite(n);

export function computeFinance(f: FinanceInput): FinanceResult {
  const warnings: string[] = [];
  const revenue = ok(f.price) && ok(f.monthlySales) ? f.price * f.monthlySales : null;
  const contribution = ok(f.price) && ok(f.variableCost) ? f.price - f.variableCost : null;
  const profit =
    ok(contribution) && ok(f.monthlySales) && ok(f.fixedCosts)
      ? contribution * f.monthlySales - f.fixedCosts
      : null;

  let breakEven: number | null = null;
  if (ok(contribution) && ok(f.fixedCosts)) {
    if (contribution > 0) breakEven = Math.ceil(f.fixedCosts / contribution);
    else warnings.push("Variable cost per sale equals or exceeds the selling price — every sale loses money.");
  }
  if (ok(breakEven) && ok(f.monthlySales) && breakEven > f.monthlySales) {
    warnings.push(`You need about ${breakEven} sales/month to break even, but estimate only ${f.monthlySales}.`);
  }
  if (!ok(f.price) || !ok(f.variableCost) || !ok(f.fixedCosts) || !ok(f.monthlySales)) {
    warnings.push("Some financial inputs are missing, so not every figure can be calculated.");
  }
  return { revenue, contribution, profit, breakEven, investment: ok(f.investment) ? f.investment : null, warnings };
}

export function formatMoney(n: number | null, currency: string): string {
  if (!ok(n)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${Math.round(n)}`;
  }
}
