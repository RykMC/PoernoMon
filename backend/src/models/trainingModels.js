import { z } from "zod";

export const startTrainingSchema = z.object({
  eigenschaft: z.enum(["angriff", "verteidigen", "gesundheit"])
});

export function validateStartTraining(req, res) {
  console.log("====== VALIDATE START TRAINING ======");
  console.log("Body:", req.body);
  console.log("Schema:", startTrainingSchema);
  const parsed = startTrainingSchema.safeParse(req.body);
  console.log("Parsed:", parsed);
  if (!parsed.success) {
    console.log("VALIDATE ERROR FLATTEN:", parsed.error.flatten());
    return res.status(400).json({ 
      error: "Ungültige Trainings-Daten.", 
      details: parsed.error.flatten() 
    });
  }
  return parsed.data;
}
