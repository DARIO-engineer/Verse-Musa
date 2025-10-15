const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuração para resolver problemas de spawn no Windows
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Configuração de resolver para evitar conflitos
config.resolver = {
  ...config.resolver,
  alias: {
    '@': './src',
  },
};

// Configuração para reduzir uso de workers e evitar spawn issues
config.maxWorkers = 1;

module.exports = config;
