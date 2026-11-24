import { defineConfig } from "eslint/config";

export default defineConfig([
  // Global ignores must be in their own object, or ESLint still lints these folders
  { ignores: ["dist/**", "node_modules/**"] },
  {
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/*": "off",
    },
  },
]);
