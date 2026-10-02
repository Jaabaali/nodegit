const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const targets = require("../utils/runtimeTargets.json");
const versions = process.argv.includes("--preview") ?
  [targets.electronPreview] : targets.electron;
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "nodegit-electron-runtime-"));

function run(command, args, env) {
  const result = spawnSync(command, args, { cwd: temporary, env, stdio: "inherit" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(command + " failed: " + (result.signal || result.status));
  }
}

try {
  for (const version of versions) {
    run(process.execPath, [process.env.npm_execpath, "install", "--prefix", temporary,
      "--ignore-scripts", "--no-audit", "--no-fund", "electron@" + version], process.env);
    const electronDirectory = path.join(temporary, "node_modules", "electron");
    const env = { ...process.env };
    delete env.ELECTRON_SKIP_BINARY_DOWNLOAD;
    run(process.execPath, [path.join(electronDirectory, "install.js")], env);
    const executable = path.join(electronDirectory, "dist",
      fs.readFileSync(path.join(electronDirectory, "path.txt"), "utf8").trim());
    const repository = fs.mkdtempSync(path.join(temporary, "repository-"));
    run(executable, [path.join(__dirname, "electron-smoke.js"), repository], {
      ...env, ELECTRON_RUN_AS_NODE: "1", PREBUILDS_ONLY: "1"
    });
  }
} finally {
  // Windows keeps native repository files locked until the Electron child exits.
  fs.rmSync(temporary, { recursive: true, force: true });
}
