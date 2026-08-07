import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import type { AuthApi } from "./auth-api.js";
import { browserAuthApi } from "./browser-auth-api.js";

/**
 * Injection seam for AuthApi (D5). Production never needs the provider —
 * useAuthApi() falls back to the browser singleton — so app.tsx stays
 * untouched; tests wrap SignupRoute/LoginRoute in `<AuthApiProvider
 * value={mockInstance}>` to control every D6 scenario without a network.
 */
const AuthApiContext = createContext<AuthApi | null>(null);

export const AuthApiProvider = ({
  value,
  children,
}: {
  value: AuthApi;
  children: ReactNode;
}): ReactElement => {
  return <AuthApiContext.Provider value={value}>{children}</AuthApiContext.Provider>;
};

export const useAuthApi = (): AuthApi => {
  return useContext(AuthApiContext) ?? browserAuthApi;
};
