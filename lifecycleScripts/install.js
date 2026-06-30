var buildFlags = require("../utils/buildFlags");
var spawn = require("child_process").spawn;
var path = require("path");

module.exports = function install() {
  console.log("[nodegit] Running install script");

  // Try to use node-gyp-build to find local prebuilds
  try {
    require("node-gyp-build")(path.join(__dirname, ".."));
    console.info("[nodegit] Found local prebuild, skipping build from source.");
    return Promise.resolve();
  } catch (e) {
    console.info("[nodegit] No local prebuild found, building from source.");
  }

  var args = ["rebuild"];

  if (buildFlags.debugBuild) {
    console.info("[nodegit] Building debug version.");
    args.push("--debug");
  }

  // Ensure we use the local node-gyp
  const gypPath = path.resolve(__dirname, "..", "node_modules", ".bin", "node-gyp");

  return new Promise(function(resolve, reject) {
    var spawnedNodeGyp = spawn(gypPath, args, {
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    spawnedNodeGyp.on("close", function(code) {
      if (!code) {
        resolve();
      } else {
        reject(code);
      }
    });
  })
    .then(function() {
      console.info("[nodegit] Completed installation successfully.");
    });
};

// Called on the command line
if (require.main === module) {
  module.exports()
    .catch(function(e) {
      console.error("[nodegit] ERROR - Could not finish install");
      console.error("[nodegit] ERROR - finished with error code: " + e);
      process.exit(e);
    });
}
