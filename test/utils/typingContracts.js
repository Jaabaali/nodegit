var assert = require("assert");
var fs = require("fs");
var path = require("path");

// Shared by checkout tests and the isolated tarball consumer.
module.exports = async function verifyTypingContracts(Git, directory) {
  var bare = await Git.Repository.init(path.join(directory, "bare"), 1);
  assert.strictEqual(bare.workdir(), undefined);

  var repo = await Git.Repository.init(path.join(directory, "workdir"), 0);
  assert.strictEqual(typeof repo.workdir(), "string");
  assert.strictEqual(repo.getNamespace(), undefined);

  var index = await repo.index();
  assert.strictEqual(index.getByIndex(0), undefined);
  assert.strictEqual(index.getByPath("missing"), undefined);
  fs.writeFileSync(path.join(repo.workdir(), "file.txt"), "first\n");
  var signature = Git.Signature.now("Typing checks", "types@example.com");
  var first = await repo.createCommitOnHead(["file.txt"], signature, signature, "Summary only");
  var commit = await repo.getCommit(first);
  assert.strictEqual(commit.body(), undefined);
  assert.strictEqual(commit.messageEncoding(), undefined);

  index = await repo.refreshIndex();
  assert.strictEqual(index.getByIndex(0).path, "file.txt");
  assert.strictEqual(index.getByPath("file.txt").path, "file.txt");
  assert.strictEqual(index.getByIndex(index.entryCount()), undefined);

  var direct = await repo.getCurrentBranch();
  var symbolic = await Git.Reference.lookup(repo, "HEAD");
  assert.strictEqual(direct.symbolicTarget(), undefined);
  assert.strictEqual(direct.target().tostrS(), first.tostrS());
  assert.strictEqual(direct.targetPeel(), undefined);
  assert.strictEqual(symbolic.symbolicTarget(), direct.name());
  assert.strictEqual(symbolic.target(), undefined);
  assert.strictEqual(symbolic.targetPeel(), undefined);

  fs.writeFileSync(path.join(repo.workdir(), "file.txt"), "second\n");
  var second = await repo.createCommitOnHead(["file.txt"], signature, signature, "Second\n\nDetails");
  var next = await repo.getCommit(second);
  assert.strictEqual(next.body(), "Details");
  assert.strictEqual(await Git.Graph.descendantOf(repo, second.tostrS(), first.tostrS()), 1);
  assert.strictEqual(await Git.Graph.descendantOf(repo, first, second), 0);
  assert.strictEqual(await Git.Graph.descendantOf(repo, second.tostrS(), first), 1);

  var diff = await Git.Diff.treeToTree(repo, await commit.getTree(), await next.getTree(), null);
  assert.strictEqual(diff.numDeltas(), 1);
  assert.strictEqual(diff.getDelta(0).status(), Git.Diff.DELTA.MODIFIED);
  assert.strictEqual(diff.getDelta(diff.numDeltas()), undefined);

  repo.setNamespace("typing-check");
  assert.strictEqual(repo.getNamespace(), "typing-check");
};
