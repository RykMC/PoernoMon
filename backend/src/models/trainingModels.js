import { z } from "zod";

export const startTrainingSchema = z.object({
  eigenschaft: z.enum(["angriff", "verteidigen", "gesundheit"])
});

export function validateStartTraining(req, res) {
  const parsed = startTrainingSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log("VALIDATE ERROR FLATTEN:", parsed.error.flatten());
    return res.status(400).json({ 
      error: "Ungültige Trainings-Daten.", 
      details: parsed.error.flatten() 
    });
  }
  return parsed.data;
}
