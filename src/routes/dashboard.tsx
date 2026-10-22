import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/SiteHeader";
import { ScoreBadge } from "@/components/ScoreRing";
import { computeScore } from "@/lib/scoring";
import { useIdeas } from "@/lib/storage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Startup Idea Validator" },
      { name: "description", content: "Overview of all assessed business ideas, average scores and category breakdown." },
      { property: "og:title", content: "Dashboard — Startup Idea Validator" },
      { property: "og:description", content: "Stats and charts calculated from your saved assessments." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const { ideas, ready, resetDemo } = useIdeas();
  const scored = ideas.map((i) => ({ idea: i, score: computeScore(i.ratings).overall }));
  const total = scored.length;
  const avg = total ? Math.round(scored.reduce((s, x) => s + x.score, 0) / total) : 0;
  const needResearch = scored.filter((x) => x.score < 60).length;
  const latest = [...scored].sort((a, b) => b.idea.updatedAt.localeCompare(a.idea.updatedAt)).slice(0, 5);
  const byCat = Object.entries(
    ideas.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.category]: (acc[i.category] ?? 0) + 1 }), {}),
  ).map(([name, value]) => ({ name, value }));
  const samples = ideas.filter((i) => i.isSample).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Dashboard" subtitle={`Calculated from ideas saved in this browser${samples ? ` (includes ${samples} fictional demo idea${samples > 1 ? "s" : ""})` : ""}.`}>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="outline"><RotateCcw /> Reset demo data</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset to demo data?</AlertDialogTitle>
              <AlertDialogDescription>All your saved ideas will be deleted and replaced with the two fictional sample ideas.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { resetDemo(); toast.success("Demo data restored."); }}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button asChild><Link to="/validate">Validate My Idea</Link></Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total ideas assessed" value={ready ? total : "…"} />
        <StatCard label="Average assessment score" value={ready ? avg : "…"} />
        <StatCard label="Ideas needing more research (score < 60)" value={ready ? needResearch : "…"} />
      </div>

      {ready && total === 0 ? (
        <Card className="mt-6 p-10 text-center text-muted-foreground">No ideas yet. <Link to="/validate" className="text-primary underline">Assess your first idea</Link>.</Card>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="p-6 shadow-card lg:col-span-2">
              <h2 className="font-semibold">Scores by business idea</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scored.map((x) => ({ name: x.idea.name.slice(0, 18), score: x.score }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-6 shadow-card">
              <h2 className="font-semibold">Category breakdown</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                      {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="mt-6 p-6 shadow-card">
            <h2 className="font-semibold">Latest assessments</h2>
            <ul className="mt-3 divide-y">
              {latest.map(({ idea, score }) => (
                <li key={idea.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <Link to="/reports/$id" params={{ id: idea.id }} className="font-medium hover:text-primary">{idea.name}</Link>
                    <p className="text-xs text-muted-foreground">{idea.category} · {new Date(idea.updatedAt).toLocaleDateString()}{idea.isSample ? " · Demo" : ""}</p>
                  </div>
                  <ScoreBadge score={score} />
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="p-6 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold">{value}</p>
    </Card>
  );
}
