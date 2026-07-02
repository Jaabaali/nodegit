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
});
