var buildFlags = require("../utils/buildFlags");
var spawn = require("child_process").spawn;
var path = require("path");
var prepareForBuild = require("./preinstall");

module.exports = function install() {
  console.log("[nodegit] Running install script");

  if (!buildFlags.mustBuild) {
    try {
      require("node-gyp-build")(path.join(__dirname, ".."));
      console.info("[nodegit] Found local prebuild, skipping build from source.");
      return Promise.resolve();
    } catch (e) {
      console.info("[nodegit] No local prebuild found, building from source.");
    }
  }

  var args = ["rebuild"];

  if (buildFlags.debugBuild) {
    console.info("[nodegit] Building debug version.");
    args.push("--debug");
  }

  // Package managers may hoist node-gyp outside this package's node_modules.
  const gypPath = require.resolve("node-gyp/bin/node-gyp.js");

  return Promise.resolve()
    .then(function() {
      return prepareForBuild();
    })
    .then(function() {
      return new Promise(function(resolve, reject) {
        var spawnedNodeGyp = spawn(process.execPath, [gypPath].concat(args), {
          stdio: "inherit"
        });

        spawnedNodeGyp.on("error", reject);
        spawnedNodeGyp.on("close", function(code) {
          if (!code) {
            resolve();
          } else {
            reject(code);
          }
        });
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
      process.exit(typeof e === "number" ? e : 1);
    });
}
