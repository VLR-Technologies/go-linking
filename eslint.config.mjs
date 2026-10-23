import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    '.next-product-qa/**',
    '.dev-data/**',
    '.npm-cache/**',
    '.browsers/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);
