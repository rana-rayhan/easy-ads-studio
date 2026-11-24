import { defineConfig } from "eslint/config";

export default defineConfig({
  ignores: ["dist/**", "node_modules/**"],
  rules: {
    "no-undef": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/*": "off",
  },
});
