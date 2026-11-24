import { z } from "zod";
import { PASSWORD_REGEX } from "../constants/password";

export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, { error: t("validation.emailRequired") })
      .pipe(z.email({ error: t("validation.emailInvalid") }))
      .transform((email) => email.toLowerCase()),
    password: z.string().min(1, { error: t("validation.passwordRequired") }),
  });

export const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, { error: t("validation.firstNameRequired") })
        .min(2, { error: t("validation.firstNameLength") })
        .max(50, { error: t("validation.firstNameLength") }),

      lastName: z
        .string()
        .trim()
        .min(1, { error: t("validation.lastNameRequired") })
        .min(2, { error: t("validation.lastNameLength") })
        .max(50, { error: t("validation.lastNameLength") }),

      email: z
        .string()
        .trim()
        .min(1, { error: t("validation.emailRequired") })
        .pipe(z.email({ error: t("validation.emailInvalid") }))
        .transform((email) => email.toLowerCase()),

      password: z
        .string()
        .min(1, { error: t("validation.passwordRequired") })
        .min(12, { error: t("validation.passwordLength") })
        .max(72, { error: t("validation.passwordLength") })
        .regex(PASSWORD_REGEX, { error: t("validation.passwordWeak") }),

      confirmPassword: z.string().min(1, { error: t("validation.confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      error: t("validation.passwordsDoNotMatch"),
    });

export type RegisterFormType = z.infer<ReturnType<typeof createRegisterSchema>>;

export type LoginFormType = z.infer<ReturnType<typeof createLoginSchema>>;
