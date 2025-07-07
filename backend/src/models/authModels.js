import { z } from "zod";

// 📨 Register & Login
export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

//  Set Username
export const setUsernameSchema = z.object({
  username: z.string().min(3).max(30)
});

// Prüfung inkl. Response
export function validateAuth(req, res) {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Email oder Passwort.", details: parsed.error.flatten() });
  }
  return parsed.data;
}

export function validateUsername(req, res) {
  const parsed = setUsernameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültiger Name.", details: parsed.error.flatten() });
  }
  return parsed.data;
}
