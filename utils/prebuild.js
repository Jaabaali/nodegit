const prebuildify = require("prebuildify");
const targets = require("./runtimeTargets.json");

async function main() {
  const builds = process.argv.includes("--preview") ?
    { electron: [targets.electronPreview] }
    : { node: targets.node, electron: targets.electron };

  for (const [runtime, versions] of Object.entries(builds)) {
    await new Promise((resolve, reject) => {
      prebuildify({
        // Runtime tags are also used by Studio to skip unnecessary rebuilds.
        name: runtime,
        napi: false,
        strip: true,
        targets: versions.map(version => runtime + "@" + version)
      }, error => error ? reject(error) : resolve());
    });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
