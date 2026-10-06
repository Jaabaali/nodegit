var fs = require("fs");
var path = require("path");

var isGitRepo;

try {
  fs.statSync(path.join(__dirname, "..", ".git"));
  isGitRepo = true;
} catch (e) {
  isGitRepo = false;
}

const convertArch = (archStr) => {
  const convertedArch = {
    'ia32': 'x86',
    'x86': 'x86',
    'x64': 'x64',
    'arm64': 'arm64'
  }[archStr];

  if (!convertedArch) {
    throw new Error('unsupported architecture');
  }

  return convertedArch;
}

const hostArch = convertArch(process.arch);
// Match node-gyp's precedence for npm package config and legacy npm config.
const config = (name) => process.env["npm_package_config_node_gyp_" + name]
  || process.env["npm_config_" + name];
const targetArch = config("arch")
  ? convertArch(config("arch"))
  : hostArch;
const runtime = process.versions.electron ? "electron" : "node";
const targetRequested = !!config("target")
  || (config("runtime") && config("runtime") !== runtime)
  || targetArch !== hostArch;

module.exports = {
  hostArch,
  targetArch,
  debugBuild: !!process.env.BUILD_DEBUG,
  isElectron: config("runtime") === "electron",
  isGitRepo: isGitRepo,
  isNwjs: config("runtime") === "node-webkit",
  // A loadable host binary does not satisfy an explicit target or source build.
  mustBuild: !!(isGitRepo || process.env.BUILD_DEBUG || process.env.BUILD_ONLY
    || config("build_from_source") === "true" || targetRequested)
};
