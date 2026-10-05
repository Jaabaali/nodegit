var assert = require("assert");
var path = require("path");
var execFileSync = require("child_process").execFileSync;

describe("C++ standard selection", function() {
  it("distinguishes explicit Node targets from Electron header builds", function() {
    const fs = require("fs");
    const os = require("os");
    const headers = fs.mkdtempSync(path.join(os.tmpdir(), "nodegit-electron-headers-"));
    const directory = path.join(headers, "include", "node");
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "config.gypi"),
      JSON.stringify({ variables: { built_with_electron: 1 } }));
    const script = path.resolve(__dirname, "../../utils/defaultCxxStandard.js");
    const run = function(target, isElectron, runtime) {
      return execFileSync(process.execPath, [script, target, isElectron === "1" ? headers : "none"], {
        env: { ...process.env, npm_config_runtime: runtime, npm_package_config_node_gyp_runtime: "" }
      }).toString();
    };
    try {
      assert.strictEqual(run("node@30.0.0", "0", "node"), "20");
      assert.strictEqual(run("node@31.0.0", "0", "node"), "20");
      assert.strictEqual(run("24.0.0", "0", "node"), "20");
      assert.strictEqual(run("31.0.0", "1", "node"), "17");
      assert.strictEqual(run("44.5.1", "1", "node"), "20");
      assert.strictEqual(run("electron@44.5.1", "0", "node"), "20");
    } finally {
      fs.rmSync(headers, { recursive: true, force: true });
    }
  });
});
