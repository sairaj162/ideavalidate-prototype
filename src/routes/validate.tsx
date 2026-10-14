import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/SiteHeader";
import { ScoreBadge } from "@/components/ScoreRing";
import { CATEGORIES, CURRENCIES, STAGES, type Idea, type Ratings, type Stage } from "@/lib/types";
import { CRITERIA, computeScore } from "@/lib/scoring";
import { computeFinance, formatMoney } from "@/lib/finance";
import { getSampleIdeas } from "@/lib/samples";
import { loadIdeas, useIdeas } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/validate")({
  validateSearch: (s: Record<string, unknown>): { edit?: string; sample?: string } => ({
    ...(typeof s["edit"] === "string" ? { edit: s["edit"] as string } : {}),
    ...(typeof s["sample"] === "string" ? { sample: s["sample"] as string } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Validate Your Business Idea — IdeaValidate" },
      { name: "description", content: "Step-by-step wizard to describe, rate and assess your business idea." },
      { property: "og:title", content: "Validate Your Business Idea — IdeaValidate" },
      { property: "og:description", content: "Answer five short steps and get a readiness report." },
    ],
  }),
  component: Wizard,
});

/** Form values are strings so inputs can be empty; converted to numbers on save. */
type Form = {
  name: string; category: string; description: string; targetMarket: string; stage: Stage | "";
  problem: string; whoHasProblem: string; frequency: string; currentSolution: string; research: string; interviews: string;
  segment: string; potentialCustomers: string; competitors: string; usp: string; uspEvidence: string;
  currency: string; price: string; variableCost: string; fixedCosts: string; monthlySales: string; investment: string;
  ratings: Ratings;
};

const EMPTY: Form = {
  name: "", category: "", description: "", targetMarket: "", stage: "",
  problem: "", whoHasProblem: "", frequency: "", currentSolution: "", research: "", interviews: "",
  segment: "", potentialCustomers: "", competitors: "", usp: "", uspEvidence: "",
  currency: "INR", price: "", variableCost: "", fixedCosts: "", monthlySales: "", investment: "",
  ratings: { problem: 0, demand: 0, differentiation: 0, financial: 0, readiness: 0 },
};

const STEPS = ["Basic info", "Problem & customers", "Market & competition", "Financials", "Readiness ratings", "Review"];
const STEP_GUIDANCE = [
  "Give your idea a clear name and describe who it serves. A specific target market makes later assumptions easier to assess.",
  "Describe a real customer problem and what people do today. Unknown research details can stay blank and will appear as next steps.",
  "Consider direct competitors and alternatives, not just businesses that offer the exact same product.",
  "Enter monthly estimates. The live calculation is illustrative; try conservative assumptions and compare scenarios later.",
  "Rate each criterion from 1 (early assumption) to 5 (supported by evidence). Missing ratings are allowed but lower the displayed score.",
  "Review your answers before saving. You can edit the report or create a separate version later.",
];

const str = (n: number | null) => (n == null ? "" : String(n));
const num = (s: string) => (s.trim() === "" || isNaN(Number(s)) ? null : Number(s));

function ideaToForm(i: Idea): Form {
  return {
    ...i, interviews: str(i.interviews), potentialCustomers: str(i.potentialCustomers), price: str(i.price),
    variableCost: str(i.variableCost), fixedCosts: str(i.fixedCosts), monthlySales: str(i.monthlySales), investment: str(i.investment),
  };
}

/** Returns error messages for the required fields of a given step. */
function validateStep(step: number, f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  const needNum = (k: keyof Form, label: string) => {
    const v = f[k] as string;
    if (v.trim() === "") e[k] = `${label} is required.`;
    else if (!Number.isFinite(Number(v)) || Number(v) < 0) e[k] = `${label} must be a number ≥ 0.`;
  };
  if (step === 0) {
    if (!f.name.trim()) e.name = "Business idea name is required.";
    if (!f.category) e.category = "Choose a category.";
    if (f.description.trim().length < 20) e.description = "Describe your idea in at least 20 characters.";
    if (!f.targetMarket.trim()) e.targetMarket = "Target market is required.";
    if (!f.stage) e.stage = "Choose the current stage.";
  }
  if (step === 1) {
    if (!f.problem.trim()) e.problem = "Describe the problem.";
    if (!f.whoHasProblem.trim()) e.whoHasProblem = "Who experiences the problem?";
    if (f.interviews && (!Number.isFinite(Number(f.interviews)) || Number(f.interviews) < 0)) e.interviews = "Must be a number ≥ 0.";
  }
  if (step === 2 && f.potentialCustomers && (!Number.isFinite(Number(f.potentialCustomers)) || Number(f.potentialCustomers) < 0)) {
    e.potentialCustomers = "Must be a number ≥ 0.";
  }
  if (step === 3) {
    needNum("price", "Selling price");
    needNum("variableCost", "Variable cost");
    needNum("fixedCosts", "Monthly fixed costs");
    needNum("monthlySales", "Monthly sales volume");
    if (f.investment && (!Number.isFinite(Number(f.investment)) || Number(f.investment) < 0)) e.investment = "Must be a number ≥ 0.";
  }
  return e;
}

function Wizard() {
  const { edit, sample } = Route.useSearch();
  const navigate = useNavigate();
  const { upsert } = useIdeas();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [editing, setEditing] = useState<Idea | null>(null);

  // When editing, load the saved idea from localStorage (browser only).
  useEffect(() => {
    if (sample) {
      const found = getSampleIdeas().find((idea) => idea.id === sample);
      if (found) {
        setForm({ ...ideaToForm(found), name: `${found.name} (my copy)` });
        setEditing(null);
        setErrors({});
      }
      return;
    }
    if (!edit) return;
    const found = loadIdeas().find((i) => i.id === edit);
    if (found) {
      setEditing(found);
      setForm(ideaToForm(found));
    }
  }, [edit, sample]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setRating = (k: keyof Ratings, v: number) => setForm((f) => ({ ...f, ratings: { ...f.ratings, [k]: v } }));

  const next = () => {
    const e = validateStep(step, form);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prev = () => { setErrors({}); setStep((s) => Math.max(s - 1, 0)); };

  const loadSample = () => {
    const s = getSampleIdeas()[0]!;
    setForm({ ...ideaToForm(s), name: `${s.name} (my copy)` });
    setErrors({});
    toast.success("Fictional sample loaded — feel free to change any answer.");
  };

  const submit = () => {
    // Re-check every data step before saving.
    for (let s = 0; s < 4; s++) {
      const e = validateStep(s, form);
      if (Object.keys(e).length) { setErrors(e); setStep(s); toast.error("Please fix the highlighted fields."); return; }
    }
    const now = new Date().toISOString();
    const idea: Idea = {
      id: editing?.id ?? crypto.randomUUID(),
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
      ...(editing?.isSample ? { isSample: true } : {}),
      name: form.name.trim(), category: form.category, description: form.description.trim(),
      targetMarket: form.targetMarket.trim(), stage: form.stage as Stage,
      problem: form.problem, whoHasProblem: form.whoHasProblem, frequency: form.frequency,
      currentSolution: form.currentSolution, research: form.research, interviews: num(form.interviews),
      segment: form.segment, potentialCustomers: num(form.potentialCustomers), competitors: form.competitors,
      usp: form.usp, uspEvidence: form.uspEvidence, currency: form.currency,
      price: num(form.price), variableCost: num(form.variableCost), fixedCosts: num(form.fixedCosts),
      monthlySales: num(form.monthlySales), investment: num(form.investment), ratings: form.ratings,
    };
    upsert(idea);
    toast.success(editing ? "Report updated." : "Assessment saved.");
    navigate({ to: "/reports/$id", params: { id: idea.id } });
  };

  const field = (k: keyof Form, label: string, opts: { area?: boolean; optional?: boolean; type?: string; placeholder?: string } = {}) => {
    const id = `f-${k}`;
    const Comp = opts.area ? Textarea : Input;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} title={opts.placeholder ?? label}>
          {label} {opts.optional ? <span className="font-normal text-muted-foreground">(optional)</span> : <span className="text-destructive">*</span>}
        </Label>
        <Comp
          id={id} type={opts.type} step={opts.type === "number" ? "any" : undefined} placeholder={opts.placeholder ?? (opts.optional ? "Not researched yet" : "")}
          value={form[k] as string} aria-invalid={!!errors[k]}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => set(k, e.target.value as never)}
        />
        {errors[k] && <p className="text-sm text-destructive">{errors[k]}</p>}
      </div>
    );
  };

  const select = (k: "category" | "stage" | "currency", label: string, options: string[]) => (
    <div className="space-y-1.5">
      <Label htmlFor={`f-${k}`}>{label} <span className="text-destructive">*</span></Label>
      <select
        id={`f-${k}`} value={form[k]} aria-invalid={!!errors[k]}
        onChange={(e) => set(k, e.target.value as never)}
        className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[k] && <p className="text-sm text-destructive">{errors[k]}</p>}
    </div>
  );

  const preview = computeScore(form.ratings);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title={editing ? `Edit: ${editing.name}` : "Validate your idea"} subtitle="Answer each step honestly. Unknown answers can stay blank — they'll be flagged as research to do.">
        {!editing && <Button variant="outline" onClick={loadSample}><Sparkles /> Load Sample Idea</Button>}
      </PageHeader>

      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">Step {step + 1} of {STEPS.length}: {STEPS[step]}</span>
          <span className="text-muted-foreground">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} aria-label="Wizard progress" />
        <ol className="mt-3 hidden gap-2 sm:flex">
          {STEPS.map((s, i) => (
            <li key={s} className={cn("flex-1 text-center text-xs", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</li>
          ))}
        </ol>
      </div>

      <p className="mb-4 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">{STEP_GUIDANCE[step]}</p>

      <Card className="space-y-5 p-6 shadow-card">
        {step === 0 && (
          <>
            {field("name", "Business idea name")}
            <div className="grid gap-5 sm:grid-cols-2">
              {select("category", "Business category", CATEGORIES)}
              {select("stage", "Current stage", STAGES)}
            </div>
            {field("description", "Short business description", { area: true })}
            {field("targetMarket", "Target market")}
          </>
        )}
        {step === 1 && (
          <>
            {field("problem", "What problem does the business solve?", { area: true })}
            {field("whoHasProblem", "Who experiences this problem?")}
            {field("frequency", "How frequently does the problem occur?", { optional: true })}
            {field("currentSolution", "How do customers solve it today?", { optional: true, area: true })}
            {field("research", "What customer research has been conducted?", { optional: true, area: true })}
            {field("interviews", "Number of customer interviews or survey responses", { optional: true, type: "number" })}
          </>
        )}
        {step === 2 && (
          <>
            <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">All fields here are optional. Blank answers are labelled “Not researched yet”.</p>
            {field("segment", "Target customer segment", { optional: true })}
            {field("potentialCustomers", "Estimated potential customers", { optional: true, type: "number" })}
            {field("competitors", "Competitor names or alternative solutions", { optional: true, area: true })}
            {field("usp", "Unique selling proposition", { optional: true, area: true })}
            {field("uspEvidence", "Evidence supporting your differentiation", { optional: true, area: true })}
          </>
        )}
        {step === 3 && (
          <>
            <div className="sm:w-1/2">{select("currency", "Currency", CURRENCIES)}</div>
            <div className="grid gap-5 sm:grid-cols-2">
              {field("price", "Expected selling price per sale", { type: "number" })}
              {field("variableCost", "Variable cost per sale", { type: "number" })}
              {field("fixedCosts", "Estimated monthly fixed costs", { type: "number" })}
              {field("monthlySales", "Estimated monthly sales volume", { type: "number" })}
            </div>
            {field("investment", "Initial investment", { optional: true, type: "number" })}
            <LiveFinance form={form} />
          </>
        )}
        {step === 4 && (
          <>
            <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
              Rate each area from 1 (early assumptions) to 5 (supported by evidence). These are self-assessments, not predictions.
            </p>
            <div className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-sm text-warning">
              These are <strong>self-assessment</strong> ratings — your own opinion. Independent evidence (interviews,
              surveys, competitor research) is entered in earlier steps and checked separately in your report.
            </div>
            {CRITERIA.map((c) => (
              <fieldset key={c.key} className="space-y-2">
                <legend className="flex w-full justify-between text-sm font-medium">
                  <span>{c.label} <span className="text-muted-foreground">· {c.weight * 100}%</span></span>
                  {!form.ratings[c.key] && <span className="text-xs font-normal text-warning">Not rated</span>}
                </legend>
                <p className="text-xs text-muted-foreground">{c.hint}</p>
                <div className="flex gap-2" role="radiogroup">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v} type="button" role="radio" aria-checked={form.ratings[c.key] === v}
                      aria-label={`${c.label} ${v} of 5`} onClick={() => setRating(c.key, v)}
                      className={cn(
                        "size-11 rounded-lg border text-sm font-semibold transition-colors",
                        form.ratings[c.key] === v ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
              <span className="text-sm">Live readiness score</span>
              <ScoreBadge score={preview.overall} />
            </div>
          </>
        )}
        {step === 5 && <Review form={form} goTo={setStep} />}
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={prev} disabled={step === 0}><ArrowLeft /> Previous</Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Next <ArrowRight /></Button>
        ) : (
          <Button onClick={submit}><Check /> {editing ? "Save changes" : "Generate assessment"}</Button>
        )}
      </div>
    </div>
  );
}

function formToFinance(f: Form) {
  return { price: num(f.price), variableCost: num(f.variableCost), fixedCosts: num(f.fixedCosts), monthlySales: num(f.monthlySales), investment: num(f.investment) };
}

function LiveFinance({ form }: { form: Form }) {
  const r = computeFinance(formToFinance(form));
  return (
    <div className="rounded-xl bg-secondary p-4 text-sm">
      <p className="font-medium">Live estimate</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <span>Revenue/month: <strong>{formatMoney(r.revenue, form.currency)}</strong></span>
        <span>Contribution/sale: <strong>{formatMoney(r.contribution, form.currency)}</strong></span>
        <span>Profit/month: <strong>{formatMoney(r.profit, form.currency)}</strong></span>
        <span>Break-even: <strong>{r.breakEven != null ? `${r.breakEven} sales` : "—"}</strong></span>
      </div>
      {r.contribution != null && r.contribution <= 0 && (
        <p className="mt-2 text-warning">⚠ Variable cost equals or exceeds the selling price.</p>
      )}
    </div>
  );
}

function Review({ form, goTo }: { form: Form; goTo: (n: number) => void }) {
  const score = computeScore(form.ratings);
  const show = (v: string) => (v.trim() ? v : <em className="text-muted-foreground">Not researched yet</em>);
  const sections: { step: number; title: string; rows: [string, React.ReactNode][] }[] = [
    { step: 0, title: "Basic info", rows: [["Name", form.name], ["Category", form.category], ["Stage", form.stage], ["Description", form.description], ["Target market", form.targetMarket]] },
    { step: 1, title: "Problem & customers", rows: [["Problem", show(form.problem)], ["Who", show(form.whoHasProblem)], ["Frequency", show(form.frequency)], ["Current solution", show(form.currentSolution)], ["Research", show(form.research)], ["Interviews", show(form.interviews)]] },
    { step: 2, title: "Market & competition", rows: [["Segment", show(form.segment)], ["Potential customers", show(form.potentialCustomers)], ["Competitors", show(form.competitors)], ["USP", show(form.usp)], ["Evidence", show(form.uspEvidence)]] },
    { step: 3, title: "Financials", rows: [["Price", `${form.currency} ${form.price}`], ["Variable cost", `${form.currency} ${form.variableCost}`], ["Fixed costs/month", `${form.currency} ${form.fixedCosts}`], ["Sales/month", form.monthlySales], ["Investment", show(form.investment)]] },
    { step: 4, title: "Ratings", rows: CRITERIA.map((c) => [c.label, form.ratings[c.key] ? `${form.ratings[c.key]}/5` : <em className="text-warning">Not rated</em>]) },
  ];
  return (
    <div className="space-y-5">
      {!score.complete && (
        <p className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-sm text-warning">
          {score.missing.length} rating(s) missing. You can go back and complete them, or continue — the report will be marked <strong>incomplete</strong>.
        </p>
      )}
      {sections.map((s) => (
        <div key={s.title}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{s.title}</h3>
            <Button variant="link" size="sm" onClick={() => goTo(s.step)}>Edit</Button>
          </div>
          <dl className="mt-1 divide-y rounded-lg border text-sm">
            {s.rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 px-3 py-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="col-span-2 break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
