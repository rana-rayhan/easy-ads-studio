import type { Rule } from "antd/es/form";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72; // bcrypt ignores everything after 72 bytes

export const passwordRules: Rule[] = [
  { required: true, message: "Please input your password!" },
  { min: PASSWORD_MIN_LENGTH, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters!` },
  { max: PASSWORD_MAX_LENGTH, message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters!` },
  { pattern: /[a-z]/, message: "Password must contain a lowercase letter!" },
  { pattern: /[A-Z]/, message: "Password must contain an uppercase letter!" },
  { pattern: /\d/, message: "Password must contain a number!" },
  { pattern: /[^A-Za-z0-9]/, message: "Password must contain a special character!" },
];
