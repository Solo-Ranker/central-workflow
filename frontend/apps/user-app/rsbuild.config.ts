import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

const BASE_URL =
  process.env.APP_BASE_URL ?? 'http://localhost:3001';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'user_app',
      exposes: {
        './button': './src/Button.tsx',
        './workflow': './src/registration.ts',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3001,
    cors: { origin: '*' },
  },
  output: {
    assetPrefix: BASE_URL,
    distPath: {
      root: "dist",
    },
  },
});
