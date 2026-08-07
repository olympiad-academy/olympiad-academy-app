/**
 * Advisory password-strength estimate for the signup form.
 *
 * This is NOT validation and must never become validation: what a password
 * must satisfy is `contract.signup.body`'s rule and nothing else (AC7/D9).
 * The meter only tells the student that a password clearing the contract's
 * min(8) may still be a poor one — the submit button does not care what it
 * returns.
 *
 * The model follows NIST SP 800-63B rather than classic composition rules:
 * length is the dominant term, character variety only breaks ties between
 * bands, and no class of character is ever required. Demanding
 * digit + symbol + uppercase pushes people toward predictable "Password1!"
 * shapes, which is precisely what that guidance moved away from — and it
 * would also contradict the note this project sent its backend owner asking
 * for a length-based rule rather than composition rules.
 *
 * Deliberately dependency-free: a real estimator (zxcvbn and friends) ships
 * a dictionary measured in hundreds of kilobytes, which is not a trade this
 * screen justifies. The trivial-shape check below covers the failure modes
 * a length-only score would otherwise rate highly.
 */

export type PasswordStrength = "weak" | "fair" | "strong";

/** Mirrors `contract.signup.body`'s min(8); a copy would drift, so this is
 * only used to describe bands below/above it, never to accept or reject. */
const CONTRACT_MINIMUM = 8;
const FAIR_LENGTH = 12;
const STRONG_LENGTH = 16;

const CHARACTER_CLASSES = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/] as const;

const countCharacterClasses = (password: string): number => {
  return CHARACTER_CLASSES.filter((pattern) => pattern.test(password)).length;
};

/**
 * Share of neighbouring character pairs that step by one, up or down. Near
 * 1 means the string is essentially a walk along the keyboard's character
 * order — "abcdef", "987654", or "12345678901234", whose single wrap at
 * 9 -> 0 is why "one unbroken run" is not a sufficient test.
 */
const SEQUENTIAL_PAIR_SHARE_LIMIT = 0.8;

const sequentialPairShare = (password: string): number => {
  const characters = Array.from(password);
  const pairCount = characters.length - 1;
  if (pairCount <= 0) {
    return 0;
  }
  const sequentialPairs = characters.filter((character, index, all) => {
    const previous = all[index - 1];
    return (
      previous !== undefined && Math.abs(character.charCodeAt(0) - previous.charCodeAt(0)) === 1
    );
  }).length;
  return sequentialPairs / pairCount;
};

/**
 * Shapes that are long but guessable in seconds: one character repeated, or
 * a walk along the alphabet or the digits. Length alone would rate both as
 * strong, which would be actively misleading — a meter that calls
 * "abcdefghijklmnop" strong is worse than no meter.
 */
const hasTrivialShape = (password: string): boolean => {
  const isSingleRepeatedCharacter = new Set(password).size === 1;
  const isSequenceWalk = sequentialPairShare(password) >= SEQUENTIAL_PAIR_SHARE_LIMIT;
  return isSingleRepeatedCharacter || isSequenceWalk;
};

/**
 * @param password Accepts `undefined` because react-hook-form's `watch`
 *   returns it for a field the user has not touched yet, whatever the form
 *   value type claims.
 * @returns `null` when there is nothing to judge yet (empty field), so the
 *   caller can render no meter at all rather than an "it is weak" verdict on
 *   a password the student has not started typing.
 */
export const estimatePasswordStrength = (password: string | undefined): PasswordStrength | null => {
  if (password === undefined || password.length === 0) {
    return null;
  }
  if (hasTrivialShape(password)) {
    return "weak";
  }
  if (password.length >= STRONG_LENGTH) {
    return "strong";
  }
  if (password.length >= FAIR_LENGTH) {
    return countCharacterClasses(password) >= 2 ? "strong" : "fair";
  }
  if (password.length >= CONTRACT_MINIMUM) {
    return countCharacterClasses(password) >= 3 ? "fair" : "weak";
  }
  return "weak";
};
