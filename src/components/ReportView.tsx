import { AlertTriangle, CheckCircle2, HelpCircle, ListChecks } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { ScoreRing, tierBg, tierText } from "@/components/ScoreRing";
import { computeScore, interpretScore } from "@/lib/scoring";
import { computeFinance, formatMoney } from "@/lib/finance";
import { analyzeIdea } from "@/lib/recommendations";
import type { Idea } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReportView({ idea }: { idea: Idea }) {
  const score = computeScore(idea.ratings);
  const band = interpretScore(score.overall);
  const fin = computeFinance(idea);
  const a = analyzeIdea(idea);
  const chartData = score.criteria.map((c) => ({ name: c.label.split(" ")[0], score: c.score }));

  return (
    <div className="space-y-6">
      {!score.complete && (
        <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
          <AlertTriangle className="size-5 shrink-0" />
          <p><strong>Incomplete assessment.</strong> Missing ratings ({score.missing.join(", ")}) count as 0 — edit the idea to complete them.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center gap-3 p-6 text-center shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Overall readiness score</p>
          <ScoreRing score={score.overall} />
          <p className={cn("font-semibold", tierText[band.tier])}>{band.label}</p>
          <p className="text-xs text-muted-foreground">
            Measures preliminary readiness from your inputs — not the probability of business success.
          </p>
        </Card>

        <Card className="p-6 shadow-card lg:col-span-2">
          <h2 className="text-lg font-semibold">Criterion breakdown</h2>
          <div className="mt-4 space-y-3">
            {score.criteria.map((c) => {
              const t = interpretScore(c.score).tier;
              return (
                <div key={c.key}>
                  <div className="flex justify-between text-sm">
                    <span title={c.hint}>{c.label} <span className="text-muted-foreground">({c.weight * 100}%)</span></span>
                    <span className="font-medium">{c.rating ? `${c.rating}/5 · ${c.score}` : "Not rated"}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div className={cn("h-2 rounded-full transition-all", tierBg[t])} style={{ width: `${c.score}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.hint} Score contribution: {Math.round(c.weight * c.rating / 5 * 100)} points.</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <h2 className="font-semibold">How to read this score</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each rating is scaled from 1–5 and multiplied by its published weight. The weighted contributions are added to produce a score from 0–100. This is a transparent self-assessment, not a prediction or guarantee of business success.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Evidence confidence: {idea.interviews != null && idea.interviews >= 10 && idea.competitors.trim() && idea.research.trim() ? "Moderate — interviews and research are recorded; verify them independently." : "Low — add customer research and competitor evidence to support your ratings."}
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard title="Strengths" icon={<CheckCircle2 className="size-5 text-primary" />} items={a.strengths} />
        <ListCard title="Major risks" icon={<AlertTriangle className="size-5 text-destructive" />} items={a.risks} empty="No major risks flagged by the rules." />
        <ListCard title="Missing research" icon={<HelpCircle className="size-5 text-warning" />} items={a.missing} empty="Nothing missing — nice work." />
        <ListCard title="Recommended next steps" icon={<ListChecks className="size-5 text-primary" />} items={a.actions} ordered />
      </div>

      <Card className="p-6 shadow-card">
        <h2 className="text-lg font-semibold">Financial summary <span className="text-sm font-normal text-muted-foreground">(estimates based on your inputs)</span></h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Monthly revenue" value={formatMoney(fin.revenue, idea.currency)} />
          <Stat label="Contribution / sale" value={formatMoney(fin.contribution, idea.currency)} />
          <Stat label="Monthly operating profit" value={formatMoney(fin.profit, idea.currency)} negative={(fin.profit ?? 0) < 0} />
          <Stat label="Break-even volume" value={fin.breakEven != null ? `${fin.breakEven} sales/mo` : "Not reachable"} />
          <Stat label="Initial investment" value={formatMoney(fin.investment, idea.currency)} />
        </div>
        {fin.warnings.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-warning">
            {fin.warnings.map((w) => <li key={w}>⚠ {w}</li>)}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="rounded-xl bg-secondary p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-lg font-semibold", negative && "text-destructive")}>{value}</p>
    </div>
  );
}

function ListCard({ title, icon, items, empty, ordered }: { title: string; icon: React.ReactNode; items: string[]; empty?: string; ordered?: boolean }) {
  return (
    <Card className="p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-lg font-semibold">{icon}{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((t, i) => (
            <li key={t} className="flex gap-2">
              <span className="text-muted-foreground">{ordered ? `${i + 1}.` : "•"}</span>{t}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
