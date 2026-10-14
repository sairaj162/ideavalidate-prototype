import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Info, Lightbulb, Search, Swords, Target, TrendingUp, Wallet, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ScoreRing";
import { getSampleIdeas } from "@/lib/samples";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IdeaValidate — Turn Your Business Idea Into a Validated Opportunity" },
      { name: "description", content: "Evaluate your business concept, uncover weaknesses and assess financial feasibility before investing time and money." },
      { property: "og:title", content: "IdeaValidate — Business Idea Validator" },
      { property: "og:description", content: "Score your idea's readiness, spot risks and get rule-based next steps." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Target, title: "Market Validation", text: "Check how clearly the problem is defined and whether real customers back it." },
  { icon: Swords, title: "Competition Analysis", text: "List alternatives and test whether your differentiation is supported by evidence." },
  { icon: Wallet, title: "Financial Feasibility", text: "Calculate revenue, contribution per sale, profit and break-even volume." },
  { icon: TrendingUp, title: "Actionable Insights", text: "Get clear next steps generated from transparent, rule-based logic." },
];

const STEPS = [
  { icon: Lightbulb, title: "Describe", text: "Enter your idea, customers and market." },
  { icon: Search, title: "Evaluate", text: "Rate readiness across five weighted criteria." },
  { icon: BarChart3, title: "Analyze", text: "See your score, risks and financial summary." },
  { icon: Wrench, title: "Improve", text: "Follow the next steps and re-assess." },
];

function Home() {
  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
              Turn Your Business Idea Into a Validated Opportunity.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Evaluate your business concept, uncover weaknesses, assess financial feasibility, and discover the next
              steps before investing your time and money.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/validate">Validate My Idea <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/how-it-works">Explore How It Works</Link>
              </Button>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-semibold">Explore sample ideas</h2>
            <p className="mt-2 text-muted-foreground">Start with fictional examples, then change any answer to make them your own.</p>
          </div>
          <p className="text-sm text-muted-foreground">Your assessments stay in this browser.</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getSampleIdeas().map((idea) => (
            <Card key={idea.id} className="flex flex-col p-5 shadow-card transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-medium text-primary">{idea.category} · {idea.stage}</p>
              <h3 className="mt-2 font-semibold">{idea.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{idea.description}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/validate" search={{ sample: idea.id }}>Use this sample <ArrowRight /></Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold">What gets evaluated</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6 shadow-card transition-transform hover:-translate-y-0.5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><f.icon className="size-5" /></span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-3xl font-semibold">Four simple steps</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold text-primary">0{i + 1}</span>
                <s.icon className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex gap-3 rounded-2xl border bg-secondary p-5 text-sm text-muted-foreground">
          <Info className="size-5 shrink-0 text-foreground" />
          <p>
            <strong className="text-foreground">Educational disclaimer:</strong> Scores are preliminary assessments based on
            the information you provide. They are not guarantees of business success.
          </p>
        </div>
      </section>
    </>
  );
}

function DashboardPreview() {
  const bars = [
    ["Problem", 80], ["Demand", 60], ["Different.", 60], ["Finance", 60], ["Readiness", 80],
  ] as const;
  return (
    <Card className="p-6 shadow-elevated" aria-label="Example report preview">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Example report · fictional</p>
          <p className="font-display font-semibold">Campus Stationery Delivery</p>
        </div>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-accent-foreground">Promising</span>
      </div>
      <div className="mt-6 flex items-center gap-6">
        <ScoreRing score={67} size={120} />
        <div className="flex-1 space-y-2.5">
          {bars.map(([l, v]) => (
            <div key={l}>
              <div className="flex justify-between text-xs"><span>{l}</span><span className="text-muted-foreground">{v}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${v}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[["Revenue", "₹26,400"], ["Profit", "₹1,700"], ["Break-even", "172/mo"]].map(([l, v]) => (
          <div key={l} className="rounded-lg bg-secondary p-3">
            <p className="text-[11px] text-muted-foreground">{l}</p>
            <p className="font-display text-sm font-semibold">{v}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
