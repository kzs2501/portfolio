import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

/**
 * Who may import whom. Content is data; lib is framework-free helpers; demos are
 * self-contained (logic + UI); components are shared UI; app composes everything.
 */
const LAYER_RULES = [
  {
    target: "./src/content",
    from: ["./src/app", "./src/components", "./src/demos", "./src/lib"],
    message: "Content is data: it may not depend on UI or helpers.",
  },
  {
    target: "./src/lib",
    from: ["./src/app", "./src/components", "./src/demos"],
    message: "lib holds framework-free helpers: it may not depend on UI.",
  },
  {
    target: "./src/demos",
    from: ["./src/app", "./src/components"],
    message: "Demos are self-contained: they share code only through demos/shared and lib.",
  },
  {
    target: "./src/components",
    from: "./src/app",
    message: "Shared components may not depend on routes.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      "import/no-restricted-paths": ["error", { zones: LAYER_RULES }],
      "import/no-cycle": "error",
      "import/no-default-export": "error",

      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { considerDefaultExhaustiveForUnions: true, requireDefaultForNonUnion: true },
      ],
      // Numbers read naturally in copy and paths ("01", "Step 2 of 4").
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      // `onClick={() => setOpen(false)}` is idiomatic React, not confusing.
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],

      // Naming, after the Google TypeScript Style Guide.
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "default", format: ["camelCase"], leadingUnderscore: "forbid", trailingUnderscore: "forbid" },
        { selector: "import", format: ["camelCase", "PascalCase"] },
        { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"] },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        // `_` marks a positional parameter that's deliberately unused: `(_, index) => …`.
        { selector: "parameter", filter: { regex: "^_$", match: true }, format: null },
        { selector: "parameter", format: ["camelCase", "PascalCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        // Keys are data: CSS custom properties, HTML attributes, slugs.
        { selector: ["objectLiteralProperty", "objectLiteralMethod"], format: null },
        { selector: "typeProperty", format: ["camelCase"], filter: { regex: "^[a-z]", match: true } },
        // Booleans say what they are: isOpen, hasCopied, shouldAnimate.
        {
          selector: ["variable", "parameter", "typeProperty"],
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: ["is", "has", "can", "should", "did", "was", "are"],
          // Exempt: Next.js route segment config, which Next reads by fixed names.
          filter: { regex: "^(dynamicParams)$", match: false },
        },
      ],
    },
  },
  {
    // Next.js routes and tool configs require default exports; so do lazily loaded modules.
    files: [
      "src/app/**/*.{ts,tsx}",
      "*.config.{ts,mts,mjs}",
      "src/demos/*/demo.tsx",
      "src/components/command-palette/dialog.tsx",
    ],
    rules: { "import/no-default-export": "off" },
  },
  {
    // Browser tests: no fixed waits, no floating promises, web-first assertions.
    ...playwright.configs["flat/recommended"],
    files: ["e2e/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // Skipping where a browser lacks a feature is how Playwright's docs say to do it.
      "playwright/no-skipped-test": ["warn", { allowConditional: true }],
    },
  },
  {
    files: ["**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "content-review/**"]),
]);

export default eslintConfig;
