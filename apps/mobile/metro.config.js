/**
 * Metro config for the OpenFlip mobile app.
 *
 * Configures Metro to resolve workspace packages (@openflip/shared, etc.)
 * from the monorepo root node_modules.
 */

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root for changes in workspace packages
config.watchFolders = [monorepoRoot];

// Resolve modules from both the app's node_modules and the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Ensure workspace packages are resolved correctly
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
