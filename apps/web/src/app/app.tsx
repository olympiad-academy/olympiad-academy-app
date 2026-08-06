import type { ReactElement } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useRoutes,
  type RouteObject,
} from "react-router-dom";
import { LandingRoute } from "@/routes/landing/landing.js";
import { AuthStubRoute } from "@/routes/stubs/auth-stub.js";
import { TopicsStubRoute } from "@/routes/stubs/topics-stub.js";

// These bindings are reassigned by managed schematic integration blocks.
// eslint-disable-next-line prefer-const
let generatedAuthRequired = false;
// eslint-disable-next-line prefer-const
let generatedHasAuthSession = (): boolean => true;
const generatedPublicRoutes: RouteObject[] = [];
const generatedProtectedRoutes: RouteObject[] = [];
const generatedNavLinks: ReactElement[] = [];
// vibe-engineer:web-app-integrations:end

function ProtectedRoutes(): ReactElement {
  const location = useLocation();
  if (generatedAuthRequired && !generatedHasAuthSession()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

function AppShell(): ReactElement {
  // Each screen owns its nav (switchers included), as in the design of
  // record — the shell is a bare outlet. Schematic nav links, when an
  // integration block assigns them, still render above the screen.
  return (
    <main>
      {generatedNavLinks.length > 0 ? (
        <nav aria-label="Application navigation">{generatedNavLinks}</nav>
      ) : null}
      <Outlet />
    </main>
  );
}

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingRoute /> },
      // Routing skeleton (D2/D8): real targets for the landing CTAs and the
      // post-auth redirect from day one; the screens themselves land later.
      { path: "signup", element: <AuthStubRoute kind="signup" /> },
      { path: "login", element: <AuthStubRoute kind="login" /> },
      { path: "topics", element: <TopicsStubRoute /> },
      ...generatedPublicRoutes,
      { element: <ProtectedRoutes />, children: generatedProtectedRoutes },
    ],
  },
];

function AppRoutes(): ReactElement | null {
  return useRoutes(appRoutes);
}

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
