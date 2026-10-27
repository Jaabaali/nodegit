var assert = require("assert");
var fs = require("fs");
var path = require("path");
var ts = require("typescript");
var Git = require("../../");

describe("Bundled declarations", function() {
  it("declares constant values that match the loaded native API and compatibility aliases", function() {
    var directory = path.join(__dirname, "../../types");
    var count = 0;
    var previous = process.noDeprecation;
    process.noDeprecation = true;
    try {
      fs.readdirSync(directory).filter(file => file.endsWith(".d.ts")).forEach(function(file) {
        var source = ts.createSourceFile(file,
          fs.readFileSync(path.join(directory, file), "utf8"), ts.ScriptTarget.Latest, true);
        function visit(node, names) {
          if (ts.isModuleDeclaration(node)) {
            names = names.concat(node.name.text);
          }
          if (ts.isVariableDeclaration(node) && node.type && ts.isTypeLiteralNode(node.type)) {
            node.type.members.forEach(function(member) {
              var symbol = names.concat(node.name.text, member.name.text);
              var actual = symbol.reduce((value, name) => value && value[name], Git);
              var expected = Number(member.type.getText(source));
              assert.strictEqual(actual, expected, symbol.join("."));
              count++;
            });
          }
          ts.forEachChild(node, child => visit(child, names));
        }
        visit(source, []);
      });
    } finally {
      process.noDeprecation = previous;
    }
    assert.ok(count > 500, "Expected generated runtime constants to be checked");
  });
});
