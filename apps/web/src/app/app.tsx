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
 * navigates to /signup or /login (typed URL, browser history, stale tab) is
 * sent forward to /topics instead of seeing the auth form again — part of
 * AC3's "back never returns to auth screens".
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
      { index: true, element: <LandingRoute /> },
      // Auth screens sit behind the forward guard (D7). /topics and
      // /profile moved to generatedProtectedRoutes below.
      {
        element: <RedirectIfAuthenticated />,
        children: [
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
