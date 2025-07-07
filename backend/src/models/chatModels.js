import { z } from "zod";

// Dein Chat-Request
export const chatSchema = z.object({
  prompt: z.string().min(1).max(1000)
});

export function validateChat(req, res) {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültiger Chat-Prompt.", details: parsed.error.flatten() });
  }
  return parsed.data;
}
