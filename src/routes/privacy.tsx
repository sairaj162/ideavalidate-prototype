import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — IdeaValidate" },
      { name: "description", content: "IdeaValidate stores saved ideas only in your browser's localStorage." },
      { property: "og:title", content: "Privacy Notice — IdeaValidate" },
      { property: "og:description", content: "Your data stays in your browser." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title="Privacy Notice" />
      <Card className="p-6 shadow-card text-muted-foreground">
        This frontend prototype stores saved ideas in the browser's localStorage. Data is not uploaded to a server.
        Clearing browser data may delete saved records.
      </Card>
    </div>
  ),
});
