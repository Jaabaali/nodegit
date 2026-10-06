// Exercise the published layout and lifecycle scripts outside the checkout.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "nodegit-package-"));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(command + " failed: " + (result.signal || result.status));
  }
}

function npm(args, cwd) {
  // npm supplies its CLI path to scripts; invoking Node also works on Windows.
  run(process.execPath, [process.env.npm_execpath].concat(args), cwd);
}

try {
  npm(["pack", "--pack-destination", temporary], root);
  const archive = fs.readdirSync(temporary).find(file => file.endsWith(".tgz"));
  if (!archive) {
    throw new Error("npm pack did not produce a tarball");
  }
  const consumer = path.join(temporary, "consumer");
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, "package.json"), '{"private":true}');
  npm(["install", path.join(temporary, archive), "--foreground-scripts", "--no-audit", "--no-fund"], consumer);
  run(process.execPath, ["-e", `
    const assert = require("assert");
    const fs = require("fs");
    const Git = require("@jabali-ai/nodegit");
    (async () => {
      const repo = await Git.Repository.init("repository", 0);
      fs.writeFileSync("repository/example.txt", "packaged install\\n");
      const index = await repo.refreshIndex();
      await index.addByPath("example.txt");
      await index.write();
      const tree = await repo.getTree(await index.writeTree());
      const entry = await tree.getEntry("example.txt");
      assert.strictEqual((await entry.getBlob()).toString(), "packaged install\\n");
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `], consumer);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
