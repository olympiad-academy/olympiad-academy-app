/**
 * OLY-10 review (decimals): the comma is a display/input convenience, the
 * canonical stored form of a decimal uses a point. Otherwise `0,7` and `0.7`
 * end up in `problems.correct_answer` as two different strings.
 *
 * This canonicalizes only the decimal separator — it is NOT a validator. A
 * value like `1,234,5` still normalizes to `1.234.5` and will fail later in
 * the answer-checking layer, which is where numeric validity is enforced
 * (that ticket is separate and not built yet). Keep this function a pure
 * string normalization.
 */
export function normalizeDecimalAnswer(input: string): string {
  return input.trim().replaceAll(",", ".");
}
