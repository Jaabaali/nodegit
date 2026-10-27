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
  // Resolve declarations from the installed package, without checkout path aliases
  // or a separately installed @types/nodegit package.
  fs.writeFileSync(path.join(consumer, "contracts.ts"),
    fs.readFileSync(path.join(root, "test/types/contracts.ts"), "utf8")
      .replace('from "nodegit"', 'from "@jabali-ai/nodegit"'));
  run(process.execPath, [require.resolve("typescript/bin/tsc"),
    "--noEmit", "--strict", "--isolatedModules", "--target", "ES2022",
    "--module", "Node16", "--types", "node", "contracts.ts"], consumer);
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
      const signature = Git.Signature.now("Type checks", "types@example.com");
      const oid = await repo.createCommit("HEAD", signature, signature, "initial", tree.id(), []);
      const reference = await repo.getCurrentBranch();
      const annotated = await Git.AnnotatedCommit.fromRef(repo, reference);
      const analysis = await Git.Merge.analysisForRef(repo, reference, [annotated], 1);
      assert.strictEqual(typeof analysis.analysis_out, "number");
      assert.strictEqual(typeof analysis.preference_out, "number");
      assert.ok((await Git.Merge.commits(repo, oid, oid)) instanceof Git.Index);
      assert.strictEqual(await Git.Merge.merge(repo, annotated), undefined);
      assert.strictEqual(await Git.Graph.reachableFromAny(repo, oid, [oid]), 1);
      const diffText = "diff --git a/a b/a\\n--- a/a\\n+++ b/a\\n@@ -1 +1 @@\\n-old\\n+new\\n";
      const diff = await Git.Diff.fromBuffer(diffText, Buffer.byteLength(diffText));
      const nativePatch = await Git.Patch.fromDiff(diff, 0);
      assert.strictEqual(typeof await nativePatch.toBuf(), "string");
      assert.strictEqual(typeof await diff.toBuf(Git.Diff.FORMAT.PATCH), "string");
      const patches = await Git.Patch.convenientFromDiff(diff, [0]);
      assert.strictEqual(typeof patches[0].toBuf(), "string");
      assert.strictEqual(patches[0].lineStats().total_additions, 1);
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `], consumer);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
