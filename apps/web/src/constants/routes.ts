/**
 * Single source of truth for app routes (guide pattern, TypeScript.md §2.6).
 * Every <Link>, <Navigate> and the route table reference these constants —
 * a typo in a path is a compile error, not a runtime 404. Adding a route
 * means adding one key here; RoutePath is the type of every valid path.
 */
export const ROUTES = {
  HOME: "/",
  SIGNUP: "/signup",
  LOGIN: "/login",
  TOPICS: "/topics",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
