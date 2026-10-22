import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Startup Idea Validator" },
      { name: "description", content: "Learn about Startup Idea Validator’s purpose, approach, limitations and future possibilities." },
      { property: "og:title", content: "About Startup Idea Validator" },
      { property: "og:description", content: "The purpose, approach, limitations and future scope of Startup Idea Validator." },
    ],
  }),
  component: About,
});

const SECTIONS: { title: string; items: string[] | string }[] = [
  { title: "Purpose", items: "Startup Idea Validator helps aspiring entrepreneurs think through a business idea before investing significant time or money. It provides a structured way to consider the problem, customer demand, competition and basic finances." },
  { title: "Why validate first?", items: "Aspiring entrepreneurs often invest time and money in ideas without structured validation of the problem, demand, competition and finances. Many lack access to simple, free tools that guide them through this thinking." },
  { title: "What it helps you do", items: [
    "Provide a free, structured, step-by-step idea validation workflow.",
    "Calculate a transparent weighted readiness score.",
    "Estimate basic unit economics and break-even volume.",
    "Generate clear, rule-based next steps.",
  ] },
  { title: "Who it's for", items: ["Aspiring entrepreneurs", "Students", "Small business owners"] },
  { title: "Limitations", items: [
    "Scores rely on self-reported information and self-assessment ratings.",
    "Data is stored locally in this browser (localStorage) and does not synchronize between devices.",
    "Clearing browser data deletes saved reports.",
    "Financial estimates are simplified and exclude taxes, financing and seasonality.",
  ] },
  { title: "Possible improvements", items: [
    "Optional cloud sync and accounts.",
    "Industry-specific criteria and benchmarks.",
    "Multi-language support for local communities.",
    "Mentor review and sharing of reports.",
  ] },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="About Startup Idea Validator" subtitle="A practical starting point for evaluating and improving business ideas." />
      <div className="space-y-5">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-6 shadow-card">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            {typeof s.items === "string" ? (
              <p className="mt-2 text-muted-foreground">{s.items}</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
