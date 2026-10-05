const fs = require("fs")
const JSON5 = require("json5");
const path = require("path");

const last = arr => arr[arr.length - 1];
module.exports = function isBuildingForElectron(nodeRootDir) {
  if (!nodeRootDir) {
    return false;
  }
  let isElectron = last(nodeRootDir.split(path.sep)).startsWith("iojs");

  if (!isElectron) {
    try {
      // Not ideal, would love it if there were a full featured gyp package to do this operation instead.
      const { variables: { built_with_electron } } = JSON5.parse(
        fs.readFileSync(
          path.resolve(nodeRootDir, "include", "node", "config.gypi"),
          "utf8"
        )
      );

      if (built_with_electron) {
        isElectron = true;
      }
    } catch (e) {}
  }
  return isElectron;
};

if (require.main === module) {
  if (!process.argv[2]) {
    process.exit(1);
  }
  process.stdout.write(module.exports(process.argv[2]) ? "1" : "0");
}
