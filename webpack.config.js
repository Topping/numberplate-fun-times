const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@react-navigation']
    }
  }, argv);

  // Customize the config before returning it.
  if (env.mode === 'production') {
    // Set public path for GitHub Pages
    config.output.publicPath = '/numberplate-fun/';
  }

  return config;
}; 