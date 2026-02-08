import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import * as dotenv from "dotenv";

dotenv.config();

const USER_APP_URL = process.env.USER_APP_URL ?? "http://localhost:3001";

const ACCOUNT_APP_URL = process.env.ACCOUNT_APP_URL ?? "http://localhost:3002";

const PROMOTION_APP_URL =
  process.env.PROMOTION_APP_URL ?? "http://localhost:3003";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "host_app",
      remotes: {
        user_app: `user_app@${USER_APP_URL}/mf-manifest.json`,
        account_app: `account_app@${ACCOUNT_APP_URL}/mf-manifest.json`,
        promotion_app: `promotion_app@${PROMOTION_APP_URL}/mf-manifest.json`,
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    port: 3000,
  },
  source: {
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL)
    },
  },
  output: {
    assetPrefix: process.env.APP_BASE_URL,
    distPath: {
      root: "dist",
    },
  },
});
