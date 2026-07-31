const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

function resolveTypeScriptSourceForJsImport(context, moduleName, platform) {
  if (!moduleName.endsWith(".js")) return null;
  if (
    !(moduleName.startsWith("./") || moduleName.startsWith("../") || path.isAbsolute(moduleName))
  ) {
    return null;
  }

  const withoutJsExtension = moduleName.slice(0, -".js".length);
  const sourceExtensions = [".ts", ".tsx", ".mts", ".cts"];

  for (const extension of sourceExtensions) {
    try {
      return context.resolveRequest(context, `${withoutJsExtension}${extension}`, platform);
    } catch {
      if (extension === sourceExtensions[sourceExtensions.length - 1]) {
        return null;
      }
    }
  }

  return null;
}

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const sourceResolution = resolveTypeScriptSourceForJsImport(context, moduleName, platform);
  if (sourceResolution !== null) return sourceResolution;
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
