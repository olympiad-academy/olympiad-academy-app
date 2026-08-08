/**
 * Where ProtectedRoutes recorded the user was heading before it bounced them
 * to the login screen (app.tsx sets `state={{ from: location.pathname }}`).
 *
 * Read with a check rather than a cast: history state is attacker-editable —
 * any script on the page can call `history.pushState({ from: … }, "", …)` —
 * and it survives a reload, so asserting its shape would let an arbitrary
 * value reach `navigate()`. Only an in-app absolute path is accepted;
 * anything else falls back to the caller's default destination.
 *
 * Lives in its own module rather than inside login.tsx so the rule below can
 * be tested directly, without driving a form to reach it.
 */

/**
 * One leading "/", and the next character is not a second separator.
 *
 * The backslash in the lookahead is not decoration. A URL parser normalises
 * "\" to "/" for special schemes, so "/\evil.example" resolves
 * protocol-relative exactly as "//evil.example" does, and a plain
 * `startsWith("//")` test lets it through (independent review, second pass).
 */
const IN_APP_PATH = /^\/(?![/\\])/;

export const readRedirectTarget = (state: unknown): string | null => {
  if (typeof state !== "object" || state === null || !("from" in state)) {
    return null;
  }
  const { from } = state;
  if (typeof from !== "string" || !IN_APP_PATH.test(from)) {
    return null;
  }
  return from;
};
