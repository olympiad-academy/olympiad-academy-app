import { z } from "zod";

/**
 * `ask_why_log` table (MVP doc §12). One row per "Ask Why" question,
 * anchored to an attempt (MVP doc §5.5, §16.2).
 */
export const AskWhyLogSchema = z.object({
  id: z.string().uuid(),
  attempt_id: z.string().uuid(),
  question: z.string().min(1),
  ai_response: z.string().min(1),
  created_at: z.string().datetime(),
});
export type AskWhyLog = z.infer<typeof AskWhyLogSchema>;
