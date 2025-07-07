import { z } from "zod";

// Dein Skill-Request
export const skillSchema = z.object({
  eigenschaft: z.enum([
    "angriff", "krit_chance", "krit_schaden", "doppelschlag", 
    "ausweichen", "verteidigen", "leben_pro_treffer", "max_leben",
    "gluck", "mehr_kampfstaub", "mehr_xp", "mehr_coins"
  ])
});

export function validateSkill(req, res) {
  const parsed = skillSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Eigenschaft.", details: parsed.error.flatten() });
  }
  return parsed.data;
}
