import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/SiteHeader";
import { CRITERIA } from "@/lib/scoring";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Startup Idea Validator" },
      { name: "description", content: "How Startup Idea Validator scores business ideas: weighted criteria, financial formulas and rule-based recommendations." },
      { property: "og:title", content: "How It Works — Startup Idea Validator" },
      { property: "og:description", content: "Transparent scoring formula and financial calculations explained." },
    ],
  }),
  component: HowItWorks,
});

const BANDS = [
  ["0–39", "Major assumptions to investigate"],
  ["40–59", "Early-stage idea; more validation needed"],
  ["60–79", "Promising areas; test remaining risks"],
  ["80–100", "Strong preparation; verify assumptions with real customers"],
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="How It Works" subtitle="Everything is calculated in your browser with simple, transparent formulas." />
      <div className="space-y-6">
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold">1. Weighted readiness score</h2>
          <p className="mt-2 rounded-lg bg-secondary p-3 font-mono text-sm">Score = Σ (weight × rating / 5) × 100</p>
          <table className="mt-4 w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="py-1">Criterion</th><th>Weight</th></tr></thead>
            <tbody>{CRITERIA.map((c) => <tr key={c.key} className="border-t"><td className="py-2">{c.label}</td><td>{c.weight * 100}%</td></tr>)}</tbody>
          </table>
          <p className="mt-3 text-sm text-muted-foreground">Unrated criteria count as 0 and the report is marked incomplete — never assumed perfect.</p>
        </Card>
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold">2. Score interpretation</h2>
          <ul className="mt-3 space-y-2 text-sm">{BANDS.map(([r, l]) => <li key={r}><strong className="inline-block w-20">{r}</strong>{l}</li>)}</ul>
          <p className="mt-3 text-sm text-muted-foreground">The score measures preliminary readiness from your inputs, not the probability of success.</p>
        </Card>
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold">3. Financial calculator</h2>
          <ul className="mt-3 space-y-1.5 font-mono text-sm">
            <li>Monthly revenue = price × monthly sales</li>
            <li>Contribution per sale = price − variable cost</li>
            <li>Operating profit = contribution × sales − fixed costs</li>
            <li>Break-even volume = fixed costs ÷ contribution (if contribution &gt; 0)</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">Initial investment is shown separately. All results are estimates.</p>
        </Card>
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold">4. Rule-based recommendations</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>Weak demand evidence → interview potential customers.</li>
            <li>No competitor research → research competing products and alternatives.</li>
            <li>Weak differentiation → test a clearer unique value proposition.</li>
            <li>Negative contribution per sale → review pricing and costs.</li>
            <li>Break-even above estimated sales → flag the feasibility gap.</li>
          </ul>
        </Card>
        <Button asChild size="lg"><Link to="/validate">Validate My Idea</Link></Button>
      </div>
    </div>
  );
}
