import { z } from "zod";

export const startTrainingSchema = z.object({
  eigenschaft: z.enum(["angriff", "verteidigung", "gesundheit"])
});

export function validateStartTraining(req, res) {
  const parsed = startTrainingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: "Ungültige Trainings-Daten.", 
      details: parsed.error.flatten() 
    });
  }
  return parsed.data;
}
