var assert = require("assert");
var fse = require("fs-extra");
var os = require("os");
var path = require("path");
var NodeGit = require("../../");

// These fork-specific checks also run directly without the network fixtures in test/runner.
describe("libgit2 fork integration", function() {
  var directory;
  var filterRegistered = false;
  var filterName = "nodegit_integration_filter";

  afterEach(async function() {
    if (filterRegistered) {
      await NodeGit.FilterRegistry.unregister(filterName);
      filterRegistered = false;
    }
    if (directory) {
      await fse.remove(directory);
      directory = null;
    }
  });

  it("passes disabledFilters through checkout without disabling other filters", async function() {
    directory = await fse.mkdtemp(path.join(os.tmpdir(), "nodegit-libgit2-"));
    var repository = await NodeGit.Repository.init(directory, 0);
    var filename = "file with spaces.txt";
    var filePath = path.join(directory, filename);
    var original = "original content\n";
    await fse.writeFile(filePath, original);
    var index = await repository.refreshIndex();
    await index.addByPath(filename);
    await index.write();
    var tree = await index.writeTree();
    var signature = NodeGit.Signature.now("NodeGit Test", "test@example.com");
    await repository.createCommit("HEAD", signature, signature, "fixture", tree, []);
    await fse.writeFile(path.join(directory, ".gitattributes"), "*.txt filter=" + filterName + " -text\n");

    var applied = 0;
    var filtered = Buffer.from("filtered content\n");
    await NodeGit.FilterRegistry.register(filterName, {
      check: function() { return NodeGit.Error.CODE.OK; },
      apply: function(to, from, source) {
        if (source.mode() === NodeGit.Filter.MODE.SMUDGE) {
          applied++;
        }
        to.set(filtered, filtered.length);
        return NodeGit.Error.CODE.OK;
      }
    }, 0);
    filterRegistered = true;

    await fse.writeFile(filePath, "modified");
    await NodeGit.Checkout.head(repository, {
      checkoutStrategy: NodeGit.Checkout.STRATEGY.FORCE,
      paths: [filename],
      disabledFilters: [filterName]
    });
    assert.strictEqual(await fse.readFile(filePath, "utf8"), original);
    assert.strictEqual(applied, 0);

    // Disabling an unrelated name must still invoke the registered JS callback.
    await fse.writeFile(filePath, "modified again");
    await NodeGit.Checkout.head(repository, {
      checkoutStrategy: NodeGit.Checkout.STRATEGY.FORCE,
      paths: [filename],
      disabledFilters: ["some_other_filter"]
    });
    assert.strictEqual(await fse.readFile(filePath, "utf8"), filtered.toString());
    assert.ok(applied > 0);
  });

  it("preserves unquoted binary paths with spaces through parsing and printing", async function() {
    var input = "diff --git a/new image.png b/new image.png\n" +
      "new file mode 100644\n" +
      "index 000000000..4ef673d95\n" +
      "Binary files /dev/null and b/new image.png differ\n";
    var diff = await NodeGit.Diff.fromBuffer(input, Buffer.byteLength(input));
    assert.strictEqual(diff.numDeltas(), 1);
    assert.strictEqual(diff.getDelta(0).newFile().path(), "new image.png");

    var output = await diff.toBuf(NodeGit.Diff.FORMAT.PATCH);
    var text = output.toString();
    assert.ok(text.includes("diff --git a/new image.png b/new image.png"));
    var reparsed = await NodeGit.Diff.fromBuffer(text, Buffer.byteLength(text));
    assert.strictEqual(reparsed.getDelta(0).newFile().path(), "new image.png");
  });
});
