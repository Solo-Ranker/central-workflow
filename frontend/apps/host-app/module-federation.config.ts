import { dependencies } from './package.json';
import type { Rspack } from '@rsbuild/core';

export const mfConfig: Rspack.ModuleFederationPluginOptions = {
  name: 'host',
  remotes: {
    user_app: 'user_app@http://localhost:3001/mf-manifest.json',
    account_app: 'account_app@http://localhost:3002/mf-manifest.json',
    promotion_app: 'promotion_app@http://localhost:3003/mf-manifest.json',
  },
  shared: {
    ...dependencies,
    react: {
      singleton: true,
      requiredVersion: dependencies.react,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: dependencies['react-dom'],
    },
  },
};
