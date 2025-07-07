import { z } from "zod";

// Für equip
export const equipSchema = z.object({
  slot: z.enum(["waffe", "kopfschutz", "brustschutz", "beinschutz"]),
  itemId: z.coerce.number().nullable()
});

export function validateEquip(req, res) {
  const parsed = equipSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Item-Daten.", details: parsed.error.flatten() });
  }
  return parsed.data;
}

// Für sell
export const sellSchema = z.object({
  preis: z.coerce.number().positive()
});

export function validateSell(req, res) {
  const parsed = sellSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültiger Preis.", details: parsed.error.flatten() });
  }
  return parsed.data;
}
