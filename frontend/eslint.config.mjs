import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Global ignore patterns
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
  // Architectural Boundary Rules: UI Primitives Isolation
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/**", "@/app/**", "@/components/layout/**"],
              message:
                "UI primitive components must remain purely reusable and cannot import from features, app, or layout components.",
            },
          ],
        },
      ],
    },
  },
  // Architectural Boundary Rules: Layout Isolation
  {
    files: ["src/components/layout/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**"],
              message: "Layout components cannot import from route pages (app/**).",
            },
          ],
        },
      ],
    },
  },
  // General Architectural Invariants (Applied to application source files)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["node:fs", "node:fs/promises", "fs"],
              message: "Filesystem operations are forbidden in frontend components.",
            },
            {
              group: ["@/features/*/internal/*"],
              message:
                "Feature private internals must not be imported across boundaries. Import from the feature public API or types.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
