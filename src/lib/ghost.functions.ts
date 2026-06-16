import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

const personaSchema = z.object({
  name: z.string(),
  age: z.number(),
  title: z.string(),
  backstory: z.string(),
  goal: z.string(),
  frustration: z.string(),
  tag: z.string(),
});

export type Persona = z.infer<typeof personaSchema>;

const panelSchema = z.object({
  personas: z.array(personaSchema),
});

const GeneratePanelInput = z.object({
  product: z.string().min(1),
  customer: z.string().min(1),
});

export const generatePanel = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GeneratePanelInput.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const { output } = await generateText({
      model: gateway(MODEL),
      output: Output.object({ schema: panelSchema }),
      system:
        "You are an expert UX researcher who builds vivid, realistic customer personas for focus groups. " +
        "Create exactly 4 distinct, human personas. They must feel like real, specific people — varied in age, " +
        "background, temperament, and buying attitude. Give each a unique personality tag such as Skeptic, " +
        "Early Adopter, Budget-Conscious, Loyalist, Pragmatist, or similar. Backstories should be 2-3 sentences " +
        "and concrete. Avoid generic or interchangeable characters.",
      prompt:
        `Product description: ${data.product}\n\n` +
        `Target customer: ${data.customer}\n\n` +
        "Generate exactly 4 focus-group personas for this product.",
    });

    if (!output.personas || output.personas.length === 0) {
      throw new Error("Failed to generate personas");
    }
    return output.personas.slice(0, 4);
  });

const chatSchema = z.object({
  responses: z.array(
    z.object({
      name: z.string(),
      response: z.string(),
    }),
  ),
});

const AskPanelInput = z.object({
  product: z.string(),
  customer: z.string(),
  personas: z.array(personaSchema),
  history: z.array(
    z.object({
      role: z.enum(["user", "panel"]),
      content: z.string(),
    }),
  ),
  question: z.string().min(1),
});

export const askPanel = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AskPanelInput.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const personaProfiles = data.personas
      .map(
        (p, i) =>
          `Persona ${i + 1}: ${p.name}, ${p.age}, ${p.title} [${p.tag}]\n` +
          `Backstory: ${p.backstory}\n` +
          `Top goal: ${p.goal}\n` +
          `Biggest frustration: ${p.frustration}`,
      )
      .join("\n\n");

    const historyText = data.history.length
      ? data.history
          .map((h) => (h.role === "user" ? `Moderator: ${h.content}` : h.content))
          .join("\n\n")
      : "(none yet)";

    const { output } = await generateText({
      model: gateway(MODEL),
      output: Output.object({ schema: chatSchema }),
      system:
        "You are running a virtual focus group. You voice exactly 4 personas. Each persona answers the " +
        "moderator's question fully in character — using their own voice, attitude, goals, and frustrations. " +
        "Keep each response to 2-4 sentences, conversational and specific, never generic. They may disagree " +
        "with each other. Return one response per persona, in the same order as provided.\n\n" +
        `PRODUCT: ${data.product}\nTARGET CUSTOMER: ${data.customer}\n\nPANEL:\n${personaProfiles}`,
      prompt:
        `Conversation so far:\n${historyText}\n\n` +
        `New moderator question: ${data.question}\n\n` +
        "Have all 4 personas respond in character.",
    });

    return output.responses ?? [];
  });
