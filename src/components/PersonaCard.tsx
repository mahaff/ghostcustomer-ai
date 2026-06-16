import type { Persona } from "@/lib/ghost.functions";

const tagStyles: Record<string, string> = {
  skeptic: "text-rose-300/90 border-rose-300/20 bg-rose-300/5",
  "early adopter": "text-sky-300/90 border-sky-300/20 bg-sky-300/5",
  "budget-conscious": "text-amber-300/90 border-amber-300/20 bg-amber-300/5",
  loyalist: "text-emerald-300/90 border-emerald-300/20 bg-emerald-300/5",
  pragmatist: "text-violet-300/90 border-violet-300/20 bg-violet-300/5",
};

function tagClass(tag: string) {
  return (
    tagStyles[tag.trim().toLowerCase()] ??
    "text-muted-foreground border-border bg-secondary/40"
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
            {initials(persona.name)}
          </div>
          <div>
            <div className="font-medium leading-tight">{persona.name}</div>
            <div className="text-xs text-muted-foreground">
              {persona.age} · {persona.title}
            </div>
          </div>
        </div>
      </div>

      <span
        className={`mt-4 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tagClass(
          persona.tag,
        )}`}
      >
        {persona.tag}
      </span>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {persona.backstory}
      </p>

      <div className="mt-auto space-y-3 pt-5">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
            Top goal
          </div>
          <div className="mt-0.5 text-sm">{persona.goal}</div>
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
            Biggest frustration
          </div>
          <div className="mt-0.5 text-sm">{persona.frustration}</div>
        </div>
      </div>
    </div>
  );
}
