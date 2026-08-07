import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { contract } from "@olympiad-academy-app/api-client";
import { ROUTES } from "@/constants/routes.js";
import { createAuthFormResolver, type AuthFormValues } from "@/auth/auth-form-resolver.js";
import { useAuthApi } from "@/auth/auth-api-context.js";
import { browserAuthSession } from "@/auth/auth-session.js";
import type { LoginBody } from "@/auth/auth-api.js";
import { AuthLayout } from "../auth-layout.js";
import { AuthTextField } from "../auth-text-field.js";
import { AuthSubmitButton } from "../auth-submit-button.js";
import styles from "../auth-shared.module.css";

interface ProtectedRouteState {
  from?: string;
}

/**
 * Login screen (plan S5, D9): the same resolver machinery as signup, over
 * `contract.login.body` (no `name`, password min(1) rather than min(8)).
 * On success (AC3): navigates back to wherever ProtectedRoutes redirected
 * from (`state.from`, D7) or /topics by default, replacing history so Back
 * never lands on /login again.
 */
export const LoginRoute = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const authApi = useAuthApi();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<AuthFormValues, unknown, LoginBody>({
    resolver: createAuthFormResolver(contract.login.body, {}),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const submitLogin = async (body: LoginBody): Promise<void> => {
    setSubmitError(null);
    const result = await authApi.login(body);
    if (result.ok) {
      browserAuthSession.setToken(result.token);
      const from = (location.state as ProtectedRouteState | null)?.from;
      void navigate(from ?? ROUTES.TOPICS, { replace: true });
      return;
    }
    // OLY-42 owns the per-variant error UI (invalid/network); this slice
    // must not fail silently on a real backend error while that lands.
    setSubmitError("auth.errorGeneric");
  };

  const submitHandler = handleSubmit((body): void => {
    void submitLogin(body);
  });
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    void submitHandler(event);
  };

  return (
    <AuthLayout>
      <h1 className={styles["title"]}>{t("auth.login")}</h1>
      <p className={styles["subtitle"]}>{t("auth.appSubtitle")}</p>
      <form className={styles["form"]} onSubmit={onSubmit} noValidate>
        <AuthTextField
          id="login-identity"
          label={t("auth.contact")}
          placeholder={t("auth.contactPlaceholder")}
          autoComplete="username"
          error={formState.errors.identity}
          registration={register("identity")}
        />
        <AuthTextField
          id="login-password"
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          autoComplete="current-password"
          error={formState.errors.password}
          registration={register("password")}
        />
        {formState.errors.formError?.message !== undefined ? (
          <p className={styles["formError"]} role="alert">
            {t(formState.errors.formError.message)}
          </p>
        ) : null}
        {submitError !== null ? (
          <p className={styles["formError"]} role="alert">
            {t(submitError)}
          </p>
        ) : null}
        <AuthSubmitButton label={t("auth.login")} isSubmitting={formState.isSubmitting} />
      </form>
      <div className={styles["switchLink"]}>
        <Link to={ROUTES.SIGNUP}>{t("auth.signup")} →</Link>
      </div>
    </AuthLayout>
  );
};
