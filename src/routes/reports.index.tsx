import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Eye, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/SiteHeader";
import { ScoreBadge } from "@/components/ScoreRing";
import { computeScore, interpretScore } from "@/lib/scoring";
import { CATEGORIES } from "@/lib/types";
import { useIdeas } from "@/lib/storage";
import { parseIdeaJson, type ImportedIdea } from "@/lib/import-export";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "My Reports — Startup Idea Validator" },
      {
        name: "description",
        content: "Search, open, edit and delete your saved business idea assessments.",
      },
      { property: "og:title", content: "My Reports — Startup Idea Validator" },
      { property: "og:description", content: "All your saved idea assessments in one place." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { ideas, ready, remove, importIdea } = useIdeas();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [pendingImport, setPendingImport] = useState<ImportedIdea | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const list = ideas.filter(
    (i) => i.name.toLowerCase().includes(q.toLowerCase()) && (!cat || i.category === cat),
  );

  const saveImport = (idea: ImportedIdea, asCopy: boolean) => {
    try {
      const imported = importIdea(idea, asCopy);
      setPendingImport(null);
      if (fileInput.current) fileInput.current.value = "";
      toast.success(asCopy ? "Report imported as a new copy." : "Report restored.");
      setQ("");
      setCat("");
      window.setTimeout(() => {
        document
          .getElementById(`report-${imported.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The report could not be imported.");
    }
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    if (file.size > 1_000_000) {
      toast.error("The JSON file is too large. Choose a report under 1 MB.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    try {
      const idea = parseIdeaJson(await file.text());
      if (ideas.some((item) => item.id === idea.id)) {
        setPendingImport(idea);
        return;
      }
      saveImport(idea, false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The report could not be imported.");
    } finally {
      if (fileInput.current && !pendingImport) fileInput.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="My Reports" subtitle="Saved in this browser only.">
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label="Choose a report JSON file"
          onChange={(event) => void handleImport(event.target.files?.[0])}
        />
        <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
          <Upload /> Import JSON
        </Button>
        <Button asChild>
          <Link to="/validate">
            <Plus /> New assessment
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Search by idea name"
            placeholder="Search by idea name…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by category"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {ready && list.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">
          No reports match.{" "}
          <Link to="/validate" className="text-primary underline">
            Create a new assessment
          </Link>
          .
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((i) => {
          const s = computeScore(i.ratings);
          return (
            <Card key={i.id} id={`report-${i.id}`} className="flex flex-col gap-4 p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{i.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{i.category}</Badge>
                    {i.isSample && <Badge variant="outline">Fictional sample</Badge>}
                    {!s.complete && (
                      <Badge variant="outline" className="text-warning">
                        Incomplete
                      </Badge>
                    )}
                  </div>
                </div>
                <ScoreBadge score={s.overall} />
              </div>
              <p className="text-sm text-muted-foreground">{interpretScore(s.overall).label}</p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link to="/reports/$id" params={{ id: i.id }}>
                    <Eye /> Open
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/validate" search={{ edit: i.id }}>
                    <Pencil /> Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete “{i.name}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the report from this browser. It cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          remove(i.id);
                          toast.success("Report deleted.");
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          );
        })}
      </div>

      <AlertDialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report already exists</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport
                ? `“${pendingImport.name}” has the same ID as an existing report. Import it as a separate copy, or cancel. Your existing report will not be changed.`
                : "This report already exists. Your existing report will not be changed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingImport(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingImport) saveImport(pendingImport, true);
              }}
            >
              Import as new copy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
