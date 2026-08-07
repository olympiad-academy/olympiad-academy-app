import type { ReactElement } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useRoutes,
  type RouteObject,
} from "react-router-dom";
import { ROUTES } from "@/constants/routes.js";
import { LandingRoute } from "@/routes/landing/landing.js";
import { SignupRoute } from "@/routes/auth/signup/signup.js";
import { LoginRoute } from "@/routes/auth/login/login.js";
import { ProfileStubRoute } from "@/routes/stubs/profile-stub.js";
import { TopicsStubRoute } from "@/routes/stubs/topics-stub.js";
import { browserAuthSession } from "@/auth/auth-session.js";

// These bindings are replaced by managed schematic integration blocks.
// Function form (not mutable lets): reads stay unnarrowed for the linter and
// no eslint-disable is needed anywhere — inline disables are banned here.
// Rebound for OLY-40 (plan S3, decision D7): real auth is live, so
// ProtectedRoutes now actually gates /topics and /profile.
const generatedAuthRequired = (): boolean => true;
const generatedHasAuthSession = (): boolean => browserAuthSession.hasSession();
const generatedPublicRoutes = (): RouteObject[] => [];
const generatedProtectedRoutes = (): RouteObject[] => [
  { path: ROUTES.TOPICS, element: <TopicsStubRoute /> },
  { path: ROUTES.PROFILE, element: <ProfileStubRoute /> },
];
const generatedNavLinks = (): ReactElement[] => [];
// vibe-engineer:web-app-integrations:end

const ProtectedRoutes = (): ReactElement => {
  const location = useLocation();
  if (generatedAuthRequired() && !generatedHasAuthSession()) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};

/**
 * The mirror image of ProtectedRoutes (D7): an already-authenticated user who
 * reaches a pre-auth screen — the landing, /signup or /login, whether by
 * typed URL, browser history, a stale tab, or the brand link in the post-auth
 * header — is sent forward to /topics instead of being shown "log in" and
 * "sign up" again. Part of AC3's "back never returns to auth screens".
 *
 * No loading branch on purpose: the session is read synchronously from
 * localStorage (D7), so unlike an async-session app there is no interim state
 * where "authenticated" is not yet known and a spinner would be required.
 */
const RedirectIfAuthenticated = (): ReactElement => {
  if (browserAuthSession.hasSession()) {
    return <Navigate to={ROUTES.TOPICS} replace />;
  }
  return <Outlet />;
};

const AppShell = (): ReactElement => {
  // Each screen owns its nav (switchers included), as in the design of
  // record — the shell is a bare outlet. Schematic nav links, when an
  // integration block assigns them, still render above the screen.
  return (
    <main>
      {generatedNavLinks().length > 0 ? (
        <nav aria-label="Application navigation">{generatedNavLinks()}</nav>
      ) : null}
      <Outlet />
    </main>
  );
};

const appRoutes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <AppShell />,
    children: [
      // The landing and the auth screens all sit behind the forward guard
      // (D7): every one of them is a pre-auth screen, so a user who already
      // has a session is sent on to /topics rather than being offered "log
      // in" and "sign up" again. /topics and /profile moved to
      // generatedProtectedRoutes below.
      {
        element: <RedirectIfAuthenticated />,
        children: [
          { index: true, element: <LandingRoute /> },
          { path: ROUTES.SIGNUP, element: <SignupRoute /> },
          { path: ROUTES.LOGIN, element: <LoginRoute /> },
        ],
      },
      ...generatedPublicRoutes(),
      { element: <ProtectedRoutes />, children: generatedProtectedRoutes() },
    ],
  },
];

const AppRoutes = (): ReactElement | null => {
  return useRoutes(appRoutes);
};

export const App = (): ReactElement => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};
