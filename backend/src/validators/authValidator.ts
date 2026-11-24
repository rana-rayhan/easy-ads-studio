import { z } from "zod";
import { MessageKey } from "../enums/MessageKeys";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+-])[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+A-Za-z\d-]{12,72}$/;

const nameSchema = (requiredMessage: string, lengthMessage: string) =>
  z.string().trim().min(1, requiredMessage).min(2, lengthMessage).max(50, lengthMessage);

const emailSchema = z
  .string()
  .trim()
  .min(1, MessageKey.VALIDATION_EMAIL_REQUIRED)
  .pipe(z.email({ error: MessageKey.VALIDATION_EMAIL_INVALID }))
  .transform((email) => email.toLowerCase());

export const passwordSchema = z
  .string()
  .min(1, MessageKey.VALIDATION_PASSWORD_REQUIRED)
  .min(12, MessageKey.VALIDATION_PASSWORD_LENGTH)
  .max(72, MessageKey.VALIDATION_PASSWORD_LENGTH)
  .regex(PASSWORD_REGEX, MessageKey.VALIDATION_PASSWORD_WEAK);

export const userRegisterSchema = z.object({
  firstName: nameSchema(MessageKey.VALIDATION_FIRST_NAME_REQUIRED, MessageKey.VALIDATION_FIRST_NAME_LENGTH),
  lastName: nameSchema(MessageKey.VALIDATION_LAST_NAME_REQUIRED, MessageKey.VALIDATION_LAST_NAME_LENGTH),
  email: emailSchema,
  password: passwordSchema,
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, MessageKey.VALIDATION_PASSWORD_REQUIRED),
});
