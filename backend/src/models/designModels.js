import { z } from "zod";

// Für /design/select
export const setDesignSchema = z.object({
  type: z.enum(["frame", "background"]),
  designId: z.number()
});

// Für /design/markGesehen
export const markGesehenSchema = z.object({
  erfolgId: z.number()
});

export function validateSetDesign(req, res) {
  const parsed = setDesignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Design-Daten.", details: parsed.error.flatten() });
  }
  return parsed.data;
}

export function validateMarkGesehen(req, res) {
  const parsed = markGesehenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Erfolg-Daten.", details: parsed.error.flatten() });
  }
  return parsed.data;
}
