import { z } from "zod";

/**
 * `daily_activity` table (MVP doc §12). One row per student per calendar day,
 * accumulating practice counters used by the profile/session views (§5.7,
 * §14 Screen 5) — e.g. `streakDays` and `calloutStat` derive from these
 * counters, so the row is upserted during the day rather than append-only.
 *
 * OLY-10 first-pass fixation: §12 does not spell out the exact column list
 * for this table, so this shape is derived from what the existing contracts
 * already reference (`problems_attempted`, `problems_solved`,
 * `problems_solved_without_hints` in entities/topic.ts and the profile
 * fragments in src/api/contract.ts). Flag with product before renaming or
 * removing a field.
 *
 * `date` is the calendar day (Uzbekistan local) the counters belong to, not
 * an instant; `created_at` is the row's insertion timestamp.
 */
export const DailyActivitySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: z.string().date(),
  problems_attempted: z.number().int().nonnegative(),
  problems_solved: z.number().int().nonnegative(),
  problems_solved_without_hints: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
});
export type DailyActivity = z.infer<typeof DailyActivitySchema>;
