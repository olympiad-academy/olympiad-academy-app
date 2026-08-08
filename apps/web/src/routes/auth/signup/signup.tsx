import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { contract } from "@olympiad-academy-app/api-client";
import { ROUTES } from "@/constants/routes.js";
import { createAuthFormResolver, type AuthFormValues } from "@/auth/auth-form-resolver.js";
import { useAuthApi } from "@/auth/auth-api-context.js";
import { browserAuthSession } from "@/auth/auth-session.js";
import { estimatePasswordStrength } from "@/auth/password-strength.js";
import type { SignupBody } from "@/auth/auth-api.js";
import { AuthLayout } from "../auth-layout.js";
import { AuthTextField } from "../auth-text-field.js";
import { AuthSubmitButton } from "../auth-submit-button.js";
import { AuthFormAlert } from "../auth-form-alert.js";
import { PasswordStrengthMeter } from "../password-strength-meter.js";
import { useAuthSubmit } from "../use-auth-submit.js";
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues, unknown, SignupBody>({
    resolver: createAuthFormResolver(contract.signup.body, { language: i18n.language }),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  // Advisory only — never fed back into validation (AC7/D9). Watched rather
  // than read from formState so the meter tracks every keystroke, including
  // before the field is first blurred, which is when the advice is useful.
  const passwordStrength = estimatePasswordStrength(watch("password"));

  const { onSubmit, submitErrorKey } = useAuthSubmit<SignupBody>({
    handleSubmit,
    submit: (body) => authApi.signup(body),
    onSuccess: (result) => {
      browserAuthSession.setToken(result.token);
      void navigate(ROUTES.TOPICS, { replace: true });
    },
  });

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
          error={errors.name}
          registration={register("name")}
        />
        <AuthTextField
          id="signup-identity"
          label={t("auth.contact")}
          placeholder={t("auth.contactPlaceholder")}
          hint={t("auth.contactHint")}
          autoComplete="username"
          error={errors.identity}
          registration={register("identity")}
        />
        <AuthTextField
          id="signup-password"
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          autoComplete="new-password"
          error={errors.password}
          registration={register("password")}
          footer={<PasswordStrengthMeter strength={passwordStrength} />}
        />
        <AuthFormAlert messageKey={errors.formError?.message} />
        <AuthFormAlert messageKey={submitErrorKey} />
        <AuthSubmitButton label={t("auth.startPractising")} isSubmitting={isSubmitting} />
      </form>
      <div className={styles["switchLink"]}>
        <Link to={ROUTES.LOGIN}>{t("auth.alreadyHaveAccount")} →</Link>
      </div>
    </AuthLayout>
  );
};
