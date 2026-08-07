import js from "@eslint/js";
import tseslint from "typescript-eslint";

const vibeEngineerPlugin = {
  rules: {
    "no-broad-domain-map-model": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow broad Record<string, unknown> domain models; use named schemas/types at boundaries instead.",
        },
        messages: {
          broadRecord:
            "Avoid broad Record<string, unknown> domain models. Model the shape with a named type/schema instead.",
        },
        schema: [],
      },
      create(context) {
        return {
          TSTypeReference(node) {
            if (node.typeName?.type !== "Identifier" || node.typeName.name !== "Record") {
              return;
            }

            const typeArguments = node.typeArguments?.params ?? node.typeParameters?.params ?? [];
            const [keyType, valueType] = typeArguments;
            if (keyType?.type === "TSStringKeyword" && valueType?.type === "TSUnknownKeyword") {
              context.report({ node, messageId: "broadRecord" });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.turbo/**",
      "**/node_modules/**",
      // Workflow memory and design evidence, not project source: gitignored,
      // outside every tsconfig, and sometimes verbatim snapshots of foreign
      // code. Linting them fails on the project service before any rule runs.
      // .prettierignore already excludes the same directories.
      ".vibe/**",
      ".claude/**",
      "apps/mobile/babel.config.cjs",
      "apps/mobile/index.js",
      "apps/mobile/metro.config.cjs",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        fetch: "readonly",
        process: "readonly",
        setTimeout: "readonly",
      },
    },
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["apps/web/*.config.ts"],
        },
      },
    },
    plugins: {
      "vibe-engineer": vibeEngineerPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-expect-error": "allow-with-description",
          minimumDescriptionLength: 20,
        },
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-confusing-void-expression": "error",
      "@typescript-eslint/no-extraneous-class": ["error", { allowWithDecorator: true }],
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "no-empty": ["error", { allowEmptyCatch: false }],
      "no-fallthrough": "error",
      "no-implicit-coercion": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='JSON'][callee.property.name='parse']",
          message: "Parse untrusted JSON only behind a named runtime boundary validator.",
        },
      ],
      "vibe-engineer/no-broad-domain-map-model": "error",
    },
  },
  {
    files: ["**/test/**/*.ts", "**/test/**/*.tsx", "**/prisma/**/*.ts", "**/*.config.ts"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    // Clean-code standards from docs/code-standards.md, machine-enforced
    // (operator, 2026-08-06). Scoped to apps/web — the code this project
    // owns; widening to apps/api and apps/mobile is a team follow-up, not
    // something a frontend ticket rewrites under its owners.
    files: ["apps/web/**/*.ts", "apps/web/**/*.tsx"],
    linterOptions: {
      // Inline eslint-* comments are banned: fix the code or this config,
      // never mute. This also makes the scaffold's old disable comments
      // inert — the marker bindings are functions now precisely so they
      // need no suppression.
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      curly: ["error", "all"],
      "max-depth": ["error", 3],
      "max-params": ["error", 3],
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
      "no-console": "error",
      // "t" stays: it is the i18next translation function name, not a variable.
      "id-length": ["error", { min: 2, exceptions: ["t", "i", "j", "x", "y", "_"] }],
    },
  },
  {
    // Boolean-prefix naming needs type information, which the repo config
    // deliberately disables for test files — so this rule is src-only.
    files: ["apps/web/src/**/*.ts", "apps/web/src/**/*.tsx"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          types: ["boolean"],
          // `format` is checked against the name with the prefix already
          // removed, so `isSubmitting` is judged as `Submitting`. The letter
          // after the prefix must be capitalised for the prefix to read as
          // one, which means the remainder is always PascalCase and listing
          // camelCase alone made the rule impossible to satisfy — every
          // correctly-prefixed boolean failed, so destructuring a boolean
          // (`const { isSubmitting } = formState`) had to be avoided rather
          // than fixed. Both formats are listed because the remainder is the
          // thing being matched, not the whole name; the prefix requirement
          // is unchanged, and a bare `submitting` is still an error.
          format: ["camelCase", "PascalCase"],
          prefix: ["is", "has", "should", "can"],
        },
      ],
    },
  },
);
