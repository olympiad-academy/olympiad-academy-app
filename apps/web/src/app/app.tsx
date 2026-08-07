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
import { AuthStubRoute } from "@/routes/stubs/auth-stub.js";
import { ProfileStubRoute } from "@/routes/stubs/profile-stub.js";
import { TopicsStubRoute } from "@/routes/stubs/topics-stub.js";

// These bindings are replaced by managed schematic integration blocks.
// Function form (not mutable lets): reads stay unnarrowed for the linter and
// no eslint-disable is needed anywhere — inline disables are banned here.
const generatedAuthRequired = (): boolean => false;
const generatedHasAuthSession = (): boolean => true;
const generatedPublicRoutes = (): RouteObject[] => [];
const generatedProtectedRoutes = (): RouteObject[] => [];
const generatedNavLinks = (): ReactElement[] => [];
// vibe-engineer:web-app-integrations:end

const ProtectedRoutes = (): ReactElement => {
  const location = useLocation();
  if (generatedAuthRequired() && !generatedHasAuthSession()) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
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
      // Routing skeleton (D2/D8): real targets for the landing CTAs and the
      // post-auth redirect from day one; the screens themselves land later.
      { path: ROUTES.SIGNUP, element: <AuthStubRoute kind="signup" /> },
      { path: ROUTES.LOGIN, element: <AuthStubRoute kind="login" /> },
      { path: ROUTES.TOPICS, element: <TopicsStubRoute /> },
      { path: ROUTES.PROFILE, element: <ProfileStubRoute /> },
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
