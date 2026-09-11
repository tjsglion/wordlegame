import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    "cloudflare-env.d.ts",
    "next-env.d.ts",
    // Alternate dist dir used by `NEXT_DIST_DIR=.next-build npm run build`
    // (see README troubleshooting). Generated output, must not be linted.
    ".next-build/**",
  ]),
]);

export default eslintConfig;
