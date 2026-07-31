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
);
