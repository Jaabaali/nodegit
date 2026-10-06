const fs = require("fs");
const path = require("path");
const load = require("node-gyp-build");
const matching = require("node-gyp-build/node-gyp-build.js");

function entries(directory) {
  try {
    return fs.readdirSync(directory);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

module.exports = function loadNative(root) {
  if (process.versions.electron) {
    // Loading a host-Node build can crash Electron before an exception is raised.
    // Reuse node-gyp-build's matching rules and select the Electron prebuild first.
    const directory = path.join(root, "prebuilds");
    const tuple = entries(directory).map(matching.parseTuple)
      .filter(matching.matchTuple(process.env.npm_config_platform || process.platform,
        process.env.npm_config_arch || process.arch))
      .sort(matching.compareTuples)[0];
    if (tuple) {
      const prebuilds = path.join(directory, tuple.name);
      const candidate = entries(prebuilds).map(matching.parseTags)
        .filter(matching.matchTags("electron", process.versions.modules))
        .sort(matching.compareTags("electron"))[0];
      if (candidate) {
        return require(path.join(prebuilds, candidate.file));
      }
    }
  }
  return load(root);
};
