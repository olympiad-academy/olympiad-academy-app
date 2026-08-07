import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { contract } from "@olympiad-academy-app/api-client";
import { ROUTES } from "@/constants/routes.js";
import { createAuthFormResolver, type AuthFormValues } from "@/auth/auth-form-resolver.js";
import { useAuthApi } from "@/auth/auth-api-context.js";
import { browserAuthSession } from "@/auth/auth-session.js";
import type { SignupBody } from "@/auth/auth-api.js";
import { AuthLayout } from "../auth-layout.js";
import { AuthTextField } from "../auth-text-field.js";
import { AuthSubmitButton } from "../auth-submit-button.js";
import styles from "../auth-shared.module.css";

/**
 * Signup screen (plan S4, D9): react-hook-form + the contract-schema
 * resolver (auth-form-resolver.ts) over `contract.signup.body`. On success
 * (AC3): the token is stored and navigation replaces history so Back never
 * returns here (the redirect-forward guard in app.tsx covers the other
 * direction — an authenticated user typing /signup again).
 */
export const SignupRoute = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const authApi = useAuthApi();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<AuthFormValues, unknown, SignupBody>({
    resolver: createAuthFormResolver(contract.signup.body, { language: i18n.language }),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const submitSignup = async (body: SignupBody): Promise<void> => {
    setSubmitError(null);
    const result = await authApi.signup(body);
    if (result.ok) {
      browserAuthSession.setToken(result.token);
      void navigate(ROUTES.TOPICS, { replace: true });
      return;
    }
    // OLY-42 owns the per-variant error UI (duplicate/invalid/network); this
    // slice must not fail silently on a real backend error while that lands.
    setSubmitError("auth.errorGeneric");
  };

  const submitHandler = handleSubmit((body): void => {
    void submitSignup(body);
  });
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    void submitHandler(event);
  };

  return (
    <AuthLayout>
      <h1 className={styles["title"]}>{t("auth.signup")}</h1>
      <p className={styles["subtitle"]}>{t("auth.appSubtitle")}</p>
      <form className={styles["form"]} onSubmit={onSubmit} noValidate>
        <AuthTextField
          id="signup-name"
          label={t("auth.name")}
          placeholder={t("auth.namePlaceholder")}
          autoComplete="name"
          error={formState.errors.name}
          registration={register("name")}
        />
        <AuthTextField
          id="signup-identity"
          label={t("auth.contact")}
          placeholder={t("auth.contactPlaceholder")}
          hint={t("auth.contactHint")}
          autoComplete="username"
          error={formState.errors.identity}
          registration={register("identity")}
        />
        <AuthTextField
          id="signup-password"
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          autoComplete="new-password"
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
        <AuthSubmitButton label={t("auth.startPractising")} isSubmitting={formState.isSubmitting} />
      </form>
      <div className={styles["switchLink"]}>
        <Link to={ROUTES.LOGIN}>{t("auth.alreadyHaveAccount")} →</Link>
      </div>
    </AuthLayout>
  );
};
