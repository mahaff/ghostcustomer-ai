import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generatePanel } from "@/lib/ghost.functions";
import { useGhostStore } from "@/store/ghost";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up your panel — Ghost Customer" },
      {
        name: "description",
        content: "Describe your product and target customer to generate your AI focus group.",
      },
    ],
  }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const callGenerate = useServerFn(generatePanel);
  const { setBrief, setPersonas } = useGhostStore();

  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = product.trim().length > 10 && customer.trim().length > 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      setBrief(product.trim(), customer.trim());
      const personas = await callGenerate({
        data: { product: product.trim(), customer: customer.trim() },
      });
      setPersonas(personas);
      pendo.track("panel_generated", {
        product_description_length: product.trim().length,
        customer_description_length: customer.trim().length,
        persona_count: personas.length,
        persona_tags: personas.map((p) => p.tag).join(", "),
        persona_names: personas.map((p) => p.name).join(", "),
      });
      navigate({ to: "/panel" });
    } catch (err) {
      console.error(err);
      pendo.track("panel_generation_failed", {
        product_description_length: product.trim().length,
        customer_description_length: customer.trim().length,
        error_message: String(err instanceof Error ? err.message : err).substring(0, 200),
      });
      toast.error("Couldn't generate your panel. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <button
        onClick={() => navigate({ to: "/" })}
        className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-3xl font-semibold tracking-tight">Set up your focus group</h1>
      <p className="mt-2 text-muted-foreground">
        The more specific you are, the sharper your panel.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <div className="space-y-3">
          <Label htmlFor="product" className="text-sm font-medium">
            Describe your product, who it's for, and what problem it solves.
          </Label>
          <Textarea
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. A mobile app that turns receipts into automatic expense reports for freelancers who hate bookkeeping..."
            rows={6}
            className="resize-none bg-card text-base"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="customer" className="text-sm font-medium">
            Who is your target customer?
          </Label>
          <Input
            id="customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="e.g. Freelance designers and consultants in the US"
            className="h-12 bg-card text-base"
          />
        </div>

        <Button type="submit" size="lg" disabled={!canSubmit || loading} className="h-12 px-7 text-base">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating panel…
            </>
          ) : (
            "Generate My Panel"
          )}
        </Button>
      </form>
    </main>
  );
}
