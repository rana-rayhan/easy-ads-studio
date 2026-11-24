import type { z } from "zod";
import type { RuleRender, Rule } from "antd/es/form";

// Turns one Zod field schema into an Ant Design rule.
// The first Zod issue message (already translated) is shown under the field.
export const zodRule = (schema: z.ZodType): Rule => ({
  validator: async (_, value) => {
    const result = schema.safeParse(value ?? "");
    if (!result.success) return Promise.reject(new Error(result.error.issues[0].message));
  },
});

// Validates ALL form values against the full schema (including .refine),
// then shows only the message that belongs to this field.
export const zodFieldRule =
  (schema: z.ZodType, field: string): RuleRender =>
  ({ getFieldsValue }) => ({
    validator: async () => {
      const result = schema.safeParse(getFieldsValue(true));
      if (result.success) return;

      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) throw new Error(issue.message);
    },
  });

export const hasRole = (userRoles: UserRole[], allowed: UserRole[]) => userRoles.some((role) => allowed.includes(role));
