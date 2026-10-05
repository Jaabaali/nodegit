var assert = require("assert");

describe("ConvenientPatch", function() {
  var NodeGit = require("../../");
  var Diff = NodeGit.Diff;

  it("can retrieve the patch contents with toBuf", function() {
    var diffText = [
      "diff --git a/README.md b/README.md",
      "index 0000000..e69de29 100644",
      "--- a/README.md",
      "+++ b/README.md",
      "@@ -0,0 +1 @@",
      "+hello",
      ""
    ].join("\n");

    return Diff.fromBuffer(diffText, diffText.length)
      .then(function(diff) {
        return diff.patches();
      })
      .then(function(patches) {
        var patch = patches[0];
        var buf = patch.toBuf();

        assert.ok(buf.includes("diff --git a/README.md b/README.md"));
        assert.ok(buf.includes("+hello"));
      });
  });
  it("formats text after the diff is collected and can format it repeatedly", async function() {
    var text = [
      "diff --git a/file.txt b/file.txt", "--- a/file.txt", "+++ b/file.txt",
      "@@ -1 +1 @@", "-before", "+after", "\\ No newline at end of file", ""
    ].join("\n");
    var diff = await Diff.fromBuffer(text, Buffer.byteLength(text));
    var patches = await diff.patches();
    diff = null;
    if (global.gc) {
      global.gc();
    }
    var result = patches[0].toBuf();
    assert.strictEqual(typeof result, "string");
    assert.ok(result.includes("+after"));
    assert.ok(result.includes("\\ No newline at end of file"));
    assert.strictEqual(patches[0].toBuf(), result);
    assert.strictEqual(patches[0].lineStats().total_additions, 1);
  });
});
