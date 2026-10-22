import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/SiteHeader";
import { ScoreBadge } from "@/components/ScoreRing";
import { computeFinance, formatMoney } from "@/lib/finance";
import { computeScore, interpretScore } from "@/lib/scoring";
import { useIdeas } from "@/lib/storage";
import type { Idea } from "@/lib/types";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Scenarios — Startup Idea Validator" },
      {
        name: "description",
        content: "Compare business ideas and adjust financial assumptions locally.",
      },
    ],
  }),
  component: ComparePage,
});

type Assumptions = { price: string; monthlySales: string; fixedCosts: string };

const toNumber = (value: string, fallback: number | null) => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

function ComparePage() {
  const { ideas, ready } = useIdeas();
  const [selected, setSelected] = useState<string[]>([]);
  const [assumptions, setAssumptions] = useState<Record<string, Assumptions>>({});
  const chosen = selected
    .map((id) => ideas.find((idea) => idea.id === id))
    .filter((idea): idea is Idea => Boolean(idea));

  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const setValue = (idea: Idea, key: keyof Assumptions, value: string) => {
    setAssumptions((current) => ({
      ...current,
      [idea.id]: {
        price: current[idea.id]?.price ?? String(idea.price ?? ""),
        monthlySales: current[idea.id]?.monthlySales ?? String(idea.monthlySales ?? ""),
        fixedCosts: current[idea.id]?.fixedCosts ?? String(idea.fixedCosts ?? ""),
        [key]: value,
      },
    }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="Compare scenarios"
        subtitle="Choose up to three saved ideas, then adjust price, monthly sales, and fixed costs to explore what-if outcomes. Changes here are a temporary simulation and do not edit your saved reports."
      >
        <Button asChild variant="outline">
          <Link to="/reports">View reports</Link>
        </Button>
      </PageHeader>

      {!ready ? (
        <Card className="p-8 text-center text-muted-foreground" aria-live="polite">
          Loading your local assessments…
        </Card>
      ) : ideas.length === 0 ? (
        <Card className="p-8 text-center">
          <GitCompareArrows className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">Create an assessment to compare scenarios</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved assessments will appear here. Everything stays in this browser.
          </p>
          <Button asChild className="mt-4">
            <Link to="/validate">
              Create assessment <ArrowRight />
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          <Card className="p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">Select 2–3 assessments</h2>
              <span className="text-sm text-muted-foreground">{selected.length}/3 selected</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea) => (
                <label
                  key={idea.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:border-primary"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(idea.id)}
                    disabled={!selected.includes(idea.id) && selected.length >= 3}
                    onChange={() => toggle(idea.id)}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block font-medium">{idea.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {idea.category}
                      {idea.isSample ? " · Fictional sample" : ""}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          {chosen.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {chosen.map((idea) => {
                const values = assumptions[idea.id] ?? {
                  price: String(idea.price ?? ""),
                  monthlySales: String(idea.monthlySales ?? ""),
                  fixedCosts: String(idea.fixedCosts ?? ""),
                };
                const finance = computeFinance({
                  price: toNumber(values.price, idea.price),
                  variableCost: idea.variableCost,
                  fixedCosts: toNumber(values.fixedCosts, idea.fixedCosts),
                  monthlySales: toNumber(values.monthlySales, idea.monthlySales),
                  investment: idea.investment,
                });
                const score = computeScore(idea.ratings);
                return (
                  <Card key={idea.id} className="p-5 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{idea.category}</p>
                        <h3 className="mt-1 font-semibold">{idea.name}</h3>
                      </div>
                      <ScoreBadge score={score.overall} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {interpretScore(score.overall).label}
                    </p>
                    <div className="mt-4 grid gap-3">
                      <ScenarioInput
                        label={`Price (${idea.currency})`}
                        value={values.price}
                        onChange={(value) => setValue(idea, "price", value)}
                      />
                      <ScenarioInput
                        label="Sales per month"
                        value={values.monthlySales}
                        onChange={(value) => setValue(idea, "monthlySales", value)}
                      />
                      <ScenarioInput
                        label={`Fixed costs/month (${idea.currency})`}
                        value={values.fixedCosts}
                        onChange={(value) => setValue(idea, "fixedCosts", value)}
                      />
                    </div>
                    <dl className="mt-4 space-y-2 rounded-lg bg-secondary p-4 text-sm">
                      <Metric
                        label="Monthly revenue"
                        value={formatMoney(finance.revenue, idea.currency)}
                      />
                      <Metric
                        label="Operating profit"
                        value={formatMoney(finance.profit, idea.currency)}
                      />
                      <Metric
                        label="Break-even"
                        value={
                          finance.breakEven == null
                            ? "Not reachable"
                            : `${finance.breakEven} sales/month`
                        }
                      />
                      <Metric
                        label="Investment"
                        value={formatMoney(finance.investment, idea.currency)}
                      />
                    </dl>
                    <Button asChild variant="link" className="mt-2 px-0">
                      <Link to="/reports/$id" params={{ id: idea.id }}>
                        Open report <ArrowRight />
                      </Link>
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
          {selected.length === 1 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Select one more assessment to compare scenarios side by side.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ScenarioInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-xs font-medium">
      {label}
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
