import type { ReactElement } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  useLocation,
  useRoutes,
  type RouteObject,
} from "react-router-dom";
import { HomeRoute } from "../routes/home/home.js";

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
  return (
    <main>
      <nav aria-label="Application navigation">
        <Link to="/">Home</Link>
        {generatedNavLinks}
      </nav>
      <Outlet />
    </main>
  );
}

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRoute /> },
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
