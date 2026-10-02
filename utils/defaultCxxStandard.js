const targetArg = process.argv[2] || 'none';

let runtime = process.env.npm_config_runtime || 'node';
let versionStr = targetArg;

// 1. Parse target string (e.g. electron@40.0.0)
if (targetArg.includes('@')) {
  const parts = targetArg.split('@');
  runtime = parts[0];
  versionStr = parts[1];
}

const targetSpecified = versionStr !== 'none';
let cxxStandard = '14';

if (targetSpecified) {
  const majorVersion = Number.parseInt(versionStr.split('.')[0]);

  // If runtime is not explicitly electron, but version is high (>= 30),
  // it's likely Electron. When Node.js eventually reaches v30,
  // it will also require C++20, so this assumption remains safe.
  if (runtime !== 'electron' && majorVersion >= 30) {
    runtime = 'electron';
  }

  if (runtime === 'electron') {
    // Thresholds for Electron versions
    if (majorVersion >= 32) {
      cxxStandard = '20';
    } else if (majorVersion >= 21) {
      cxxStandard = '17';
    }
  } else {
    // Thresholds for Node.js versions
    if (majorVersion >= 24) {
      cxxStandard = '20';
    } else if (majorVersion >= 18) {
      cxxStandard = '17';
    }
  }
} else {
  const abiVersion = Number.parseInt(process.versions.modules) ?? 0;
  // Node 18 === 108
  // Node 20 === 115
  // Node 22 === 127
  // Node 24 === 131
  if (abiVersion >= 131) {
    cxxStandard = '20';
  } else if (abiVersion >= 108) {
    cxxStandard = '17';
  }
}

process.stdout.write(cxxStandard);
