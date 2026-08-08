import type { ReactElement } from "react";
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
import { AuthFormAlert } from "../auth-form-alert.js";
import { useAuthSubmit } from "../use-auth-submit.js";
import styles from "../auth-shared.module.css";

/**
 * Where ProtectedRoutes recorded the user was heading before it bounced
 * them here (app.tsx sets `state={{ from: location.pathname }}`).
 *
 * Read with a check rather than a cast: history state is attacker-editable
 * (`history.pushState({from: "https://elsewhere"}, ...)` from any script) and
 * survives a reload, so asserting its shape would let an arbitrary value
 * reach `navigate()`. Only an in-app absolute path is accepted; anything
 * else falls back to the default destination.
 */
const readRedirectTarget = (state: unknown): string | null => {
  if (typeof state !== "object" || state === null || !("from" in state)) {
    return null;
  }
  const { from } = state;
  // A single leading slash: "/topics" yes, "//evil.example" and
  // "https://evil.example" no — protocol-relative URLs are navigable.
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
    return null;
  }
  return from;
};

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues, unknown, LoginBody>({
    resolver: createAuthFormResolver(contract.login.body, {}),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { onSubmit, submitErrorKey } = useAuthSubmit<LoginBody>({
    handleSubmit,
    submit: (body) => authApi.login(body),
    onSuccess: (result) => {
      browserAuthSession.setToken(result.token);
      void navigate(readRedirectTarget(location.state) ?? ROUTES.TOPICS, { replace: true });
    },
  });

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
          error={errors.identity}
          registration={register("identity")}
        />
        <AuthTextField
          id="login-password"
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          autoComplete="current-password"
          error={errors.password}
          registration={register("password")}
        />
        <AuthFormAlert messageKey={errors.formError?.message} />
        <AuthFormAlert messageKey={submitErrorKey} />
        <AuthSubmitButton label={t("auth.login")} isSubmitting={isSubmitting} />
      </form>
      <div className={styles["switchLink"]}>
        <Link to={ROUTES.SIGNUP}>{t("auth.signup")} →</Link>
      </div>
    </AuthLayout>
  );
};
