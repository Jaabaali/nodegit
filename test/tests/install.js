var assert = require("assert");
var EventEmitter = require("events");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

describe("packaged installer build requests", function() {
  function simulate(env) {
    var flagsModule = { exports: {} };
    var processStub = {
      env: env, arch: "x64", versions: { modules: "137" },
      execPath: process.execPath, platform: process.platform
    };
    var loads = 0;
    var builds = 0;
    var preparations = 0;
    var root = path.resolve(__dirname, "../..");

    // Simulate a published package: no .git and a loadable host prebuild.
    vm.runInNewContext(fs.readFileSync(path.join(root, "utils/buildFlags.js"), "utf8"), {
      module: flagsModule, process: processStub, __dirname: path.join(root, "utils"),
      require: function(name) {
        return name === "fs" ? { statSync: function() { throw new Error("ENOENT"); } } : require(name);
      }
    });
    var installModule = { exports: {} };
    var mockRequire = function(name) {
      if (name === "../utils/buildFlags") { return flagsModule.exports; }
      if (name === "./preinstall") {
        return function() { preparations++; return Promise.resolve(); };
      }
      if (name === "node-gyp-build") { return function() { loads++; }; }
      if (name === "child_process") {
        return { spawn: function(command, args) {
          assert.strictEqual(command, process.execPath);
          assert.strictEqual(args[0], "resolved-node-gyp.js");
          assert.strictEqual(args[1], "rebuild");
          builds++;
          var child = new EventEmitter();
          process.nextTick(function() { child.emit("close", 0); });
          return child;
        } };
      }
      return require(name);
    };
    mockRequire.resolve = function() { return "resolved-node-gyp.js"; };
    vm.runInNewContext(fs.readFileSync(path.join(root, "lifecycleScripts/install.js"), "utf8"), {
      module: installModule, process: processStub, require: mockRequire,
      __dirname: path.join(root, "lifecycleScripts"),
      console: { log: function() {}, info: function() {} }
    });
    return installModule.exports().then(function() {
      return { loads: loads, builds: builds, preparations: preparations };
    });
  }

  [
    { npm_config_build_from_source: "true" },
    { npm_config_runtime: "electron", npm_config_target: "42.0.0" },
    { npm_config_runtime: "electron" },
    { npm_config_target: "26.0.0" },
    { npm_config_arch: "arm64" },
    { npm_package_config_node_gyp_target: "26.0.0" },
    { npm_package_config_node_gyp_build_from_source: "true" },
    { BUILD_ONLY: "1" },
    { BUILD_DEBUG: "1" }
  ].forEach(function(env) {
    it("builds despite a host prebuild for " + JSON.stringify(env), async function() {
      assert.deepStrictEqual(await simulate(env), { loads: 0, builds: 1, preparations: 1 });
    });
  });

  [{}, { npm_config_build_from_source: "false" }, {
    npm_config_build_from_source: "true", npm_package_config_node_gyp_build_from_source: "false"
  }].forEach(function(env) {
    it("uses the host prebuild for " + JSON.stringify(env), async function() {
      assert.deepStrictEqual(await simulate(env), { loads: 1, builds: 0, preparations: 0 });
    });
  });
});
