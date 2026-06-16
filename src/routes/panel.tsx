import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  SendHorizontal,
  RotateCcw,
  Check,
  Split,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PersonaCard } from "@/components/PersonaCard";
import { askPanel, synthesizePulse } from "@/lib/ghost.functions";
import { useGhostStore } from "@/store/ghost";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [{ title: "Your panel — Ghost Customer" }],
  }),
  component: Panel,
});

function colorFor(name: string) {
  const palette = [
    "text-sky-300",
    "text-emerald-300",
    "text-amber-300",
    "text-violet-300",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % palette.length;
  return palette[h];
}

function Panel() {
  const navigate = useNavigate();
  const callAsk = useServerFn(askPanel);
  const callPulse = useServerFn(synthesizePulse);
  const {
    product,
    customer,
    personas,
    chat,
    addUserTurn,
    addPanelTurn,
    setPulse,
    reset,
  } = useGhostStore();

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && personas.length === 0) navigate({ to: "/setup" });
  }, [hydrated, personas.length, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length, loading]);

  if (!hydrated || personas.length === 0) return null;

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setQuestion("");
    addUserTurn(q);
    setLoading(true);
    try {
      const history = useGhostStore.getState().chat.map((turn) =>
        turn.role === "user"
          ? { role: "user" as const, content: turn.content }
          : {
              role: "panel" as const,
              content: turn.replies
                .map((r) => `${r.name}: ${r.response}`)
                .join("\n"),
            },
      );
      const replies = await callAsk({
        data: { product, customer, personas, history, question: q },
      });
      addPanelTurn(replies);
      const turnIndex = useGhostStore.getState().chat.length - 1;
      try {
        const pulse = await callPulse({ data: { question: q, replies } });
        setPulse(turnIndex, pulse);
      } catch (pulseErr) {
        console.error(pulseErr);
      }
    } catch (err) {
      console.error(err);
      toast.error("The panel couldn't respond. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    reset();
    navigate({ to: "/setup" });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
          <RotateCcw className="h-4 w-4" /> New panel
        </Button>
      </div>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight">Your focus group</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Four simulated customers, ready to react. Ask them anything about your product.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {personas.map((p, i) => (
          <PersonaCard key={`${p.name}-${i}`} persona={p} />
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground/70">
          Focus group chat
        </h2>

        <div className="mt-4 space-y-6">
          {chat.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
              Ask your first question — e.g. “Would you pay $20/month for this?”
            </div>
          )}

          {chat.map((turn, i) =>
            turn.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-secondary px-4 py-2.5 text-sm">
                  {turn.content}
                </div>
              </div>
            ) : (
              <div key={i} className="space-y-3">
                {turn.replies.map((r, j) => (
                  <div
                    key={j}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className={`mb-1 text-xs font-semibold ${colorFor(r.name)}`}>
                      {r.name}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {r.response}
                    </p>
                  </div>
                ))}
                {turn.pulse && (
                  <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-5 ring-1 ring-inset ring-primary/10">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary/90">
                      <Sparkles className="h-3.5 w-3.5" /> Panel Pulse
                    </div>
                    <div className="space-y-3 text-sm leading-relaxed">
                      <div className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" />
                        <p className="text-foreground/90">
                          <span className="font-medium text-foreground">Agreement: </span>
                          {turn.pulse.agreement}
                        </p>
                      </div>
                      <div className="flex gap-2.5">
                        <Split className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/90" />
                        <p className="text-foreground/90">
                          <span className="font-medium text-foreground">Disagreement: </span>
                          {turn.pulse.disagreement}
                        </p>
                      </div>
                      <div className="border-t border-border/60 pt-3 text-foreground/80 italic">
                        {turn.pulse.synthesis}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ),
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> The panel is thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleAsk}
          className="sticky bottom-4 mt-6 flex items-end gap-3 rounded-2xl border border-border bg-card/90 p-3 backdrop-blur"
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk(e);
              }
            }}
            placeholder="Ask your panel a question…"
            rows={1}
            className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent text-base focus-visible:ring-0"
          />
          <Button type="submit" size="icon" disabled={!question.trim() || loading} className="h-11 w-11 shrink-0">
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </section>
    </main>
  );
}
