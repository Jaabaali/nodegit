// Verify the actual PE machine type, not just the artifact's directory name.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const arch = process.argv[2];
const machines = { x64: 0x8664, arm64: 0xaa64 };
assert(machines[arch], "Expected x64 or arm64");
const directory = path.join(__dirname, "..", "prebuilds", "win32-" + arch);
const files = fs.readdirSync(directory).filter(file => file.endsWith(".node"));
assert(files.length > 0, "No Windows prebuilds found for " + arch);
for (const file of files) {
  const binary = fs.readFileSync(path.join(directory, file));
  assert.strictEqual(binary.toString("ascii", 0, 2), "MZ", file + ": missing DOS header");
  const pe = binary.readUInt32LE(0x3c);
  assert.strictEqual(binary.readUInt32LE(pe), 0x00004550, file + ": missing PE header");
  assert.strictEqual(binary.readUInt16LE(pe + 4), machines[arch], file + ": incorrect architecture");
}
console.log("Verified " + files.length + " Windows " + arch + " prebuilds");
