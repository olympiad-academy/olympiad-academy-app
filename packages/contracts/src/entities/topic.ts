import { z } from "zod";

/**
 * `topics` table (MVP doc §12). Fixed list for MVP, not user-editable.
 */
export const TopicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  sort_order: z.number().int().nullable(),
});
export type Topic = z.infer<typeof TopicSchema>;

/**
 * A topic as returned by `GET /topics`, i.e. the topic plus the calling
 * student's progress in it (MVP doc §13: "topic list with per-topic mastery
 * %"; §5.7.C). The exact mastery shape isn't pinned down further in the
 * spec, so this is a first-pass contract fixation, not a literal transcription
 * — flag with product before renaming/removing fields.
 */
export const TopicWithProgressSchema = TopicSchema.extend({
  problemsAttempted: z.number().int().nonnegative(),
  problemsSolvedWithoutHints: z.number().int().nonnegative(),
  masteryPercent: z.number().min(0).max(100),
});
export type TopicWithProgress = z.infer<typeof TopicWithProgressSchema>;
