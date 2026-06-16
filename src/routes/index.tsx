import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ghost Customer — Your customers, before they exist." },
      {
        name: "description",
        content:
          "Describe your product and get a panel of AI customers who tell you exactly why they'd buy — or walk away.",
      },
      { property: "og:title", content: "Ghost Customer" },
      {
        property: "og:description",
        content:
          "An AI-powered virtual focus group for founders and product teams.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          AI virtual focus group
        </div>
        <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Your customers,
          <br />
          before they exist.
        </h1>
        <p className="text-balance mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Describe your product and get a panel of AI customers who tell you
          exactly why they'd buy — or walk away.
        </p>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/setup">Start My Focus Group</Link>
          </Button>
        </div>
      </div>
      <footer className="absolute bottom-6 text-xs text-muted-foreground/70">
        Ghost Customer · Notion-grade research, simulated.
      </footer>
    </main>
  );
}
