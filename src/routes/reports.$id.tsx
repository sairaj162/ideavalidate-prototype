import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Download, LayoutDashboard, Pencil, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/SiteHeader";
import { ReportView } from "@/components/ReportView";
import { useIdeas } from "@/lib/storage";

export const Route = createFileRoute("/reports/$id")({
  head: () => ({
    meta: [
      { title: "Assessment Report — Startup Idea Validator" },
      { name: "description", content: "Readiness score, risks, missing research and financial summary for a business idea." },
      { property: "og:title", content: "Assessment Report — Startup Idea Validator" },
      { property: "og:description", content: "A preliminary readiness report for a business idea." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { ideas, ready, duplicate } = useIdeas();
  const idea = ideas.find((i) => i.id === id);

  if (!ready) return <div className="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">Loading report…</div>;
  if (!idea)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Report not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been deleted or saved in a different browser.</p>
        <Button asChild className="mt-6"><Link to="/reports">Back to My Reports</Link></Button>
      </div>
    );

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(idea, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${idea.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "idea"}-report.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const duplicateReport = () => {
    const copy = duplicate(idea);
    toast.success("A new local version was created.");
    void navigate({ to: "/reports/$id", params: { id: copy.id } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title={idea.name}
        subtitle={`${idea.category} · ${idea.stage} stage${idea.versionOf ? " · Versioned copy" : ""}${idea.isSample ? " · Fictional sample data" : ""} · Updated ${new Date(idea.updatedAt).toLocaleDateString()}`}
      >
        <Button variant="outline" asChild><Link to="/validate" search={{ edit: idea.id }}><Pencil /> Edit idea</Link></Button>
        <Button variant="outline" onClick={duplicateReport}><Copy /> Duplicate version</Button>
        <Button variant="outline" onClick={exportJson}><Download /> Export JSON</Button>
        <Button variant="outline" onClick={() => window.print()}><Printer /> Print / Save PDF</Button>
        <Button asChild><Link to="/dashboard"><LayoutDashboard /> Dashboard</Link></Button>
      </PageHeader>
      <p className="mb-6 text-muted-foreground">{idea.description}</p>
      <ReportView idea={idea} />
    </div>
  );
}
