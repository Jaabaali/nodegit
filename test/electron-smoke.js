// Run in Electron with a host-Node build present to verify prebuild fallback.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

async function main() {
  assert.ok(process.versions.electron, "Expected an Electron runtime");
  const Git = require("../");
  const directory = process.argv[2];
  assert.ok(directory, "Expected a repository directory from the test runner");
  const repo = await Git.Repository.init(directory, 0);
  const filename = "hello world.txt";
  fs.writeFileSync(path.join(directory, filename), "first\n");
  const index = await repo.refreshIndex();
  await index.addByPath(filename);
  await index.write();
  const signature = Git.Signature.now("Runtime Test", "test@example.com");
  const oid = await repo.createCommit("HEAD", signature, signature,
    "initial", await index.writeTree(), []);
  const commit = await repo.getCommit(oid);
  const entry = await (await commit.getTree()).getEntry(filename);
  assert.strictEqual((await entry.getBlob()).toString(), "first\n");
  fs.writeFileSync(path.join(directory, filename), "second\n");
  const diff = await Git.Diff.indexToWorkdir(repo, index, {});
  const patches = await diff.patches();
  assert.strictEqual(patches.length, 1);
  assert.match(await patches[0].toBuf(), /\+second/);
  console.log("Electron " + process.versions.electron + " (ABI " +
    process.versions.modules + "): repository, commit, blob and patch passed");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
