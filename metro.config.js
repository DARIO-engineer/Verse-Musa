const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Otimizações para reduzir bundle size
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      drop_console: true, // Remove console.log em produção
      reduce_funcs: true,
      passes: 3,
    },
    mangle: {
      toplevel: true,
    },
    output: {
      comments: false,
      ascii_only: true,
    },
  },
};

// Excluir arquivos desnecessários do bundle
config.resolver = {
  ...config.resolver,
  blacklistRE: /node_modules\/.*\/(test|__tests__|__mocks__|\.test\.js|\.spec\.js)/,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;
