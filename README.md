# @jabali-ai/nodegit

NodeGit maintained for Jabali Studio's Node.js and Electron requirements.
For general-purpose use, start with [upstream NodeGit](https://github.com/nodegit/nodegit).

[![Testing](https://github.com/Jaabaali/nodegit/actions/workflows/tests.yml/badge.svg)](https://github.com/Jaabaali/nodegit/actions/workflows/tests.yml)

This downstream fork updates libgit2, runtime support, and packaging, and may add
compatible APIs. It is not merely a redistribution of upstream prebuilt binaries.

## Versioning and compatibility

Releases use `0.28.0-jabali.N`: the base identifies the upstream development line,
and `N` identifies a Jabali revision. The initial baseline is upstream
`0.28.0-alpha.38` (`e6c71bc1`), not a claim that upstream 0.28.0 is stable.

Within a Jabali revision series, we aim to preserve existing APIs and documented
behavior while allowing compatible additions. Known differences and runtime changes
must be documented in release notes. Intentional breaking changes require a new,
explicitly documented release line. These versions are npm prereleases; Studio
should pin an exact version rather than rely on normal minor-version ranges.

The bundled libgit2 is Jabali's patched **1.9.7**, pinned through the submodule to
`ab53b868ec186927eaccfc1409d24ab4c331df77`. Package versions do not track libgit2 versions.

## Installation

The public package name is `@jabali-ai/nodegit` on npmjs. Once the first release is
published, install an exact revision:

```sh
npm install --save-exact @jabali-ai/nodegit@0.28.0-jabali.0
```

Existing code can retain `require("nodegit")` with an npm alias:

```sh
npm install --save-exact nodegit@npm:@jabali-ai/nodegit@0.28.0-jabali.0
```

## Runtime support

Node.js 24 is the minimum. CI tests Node.js 24 and 26 on Linux x64, macOS arm64,
and Windows x64. Windows arm64 is built but not runtime-tested.
The prebuild configuration targets Node.js 24, 25, and 26 and Electron 42–44.
Exact versions are recorded in `utils/runtimeTargets.json`. CI runs offline
repository, commit, blob, and patch smoke tests in each stable Electron runtime
on Linux x64, macOS arm64, and Windows x64. Electron 45 prerelease builds and
runtime tests are advisory until promoted to the stable matrix. These checks do
not replace Jabali Studio integration testing or promise support for later releases.

Matching native binaries are loaded from the package using `node-gyp-build`.
Electron prefers its matching prebuild over a host-Node source build left by
installation. When no Electron prebuild matches, the normal source-build lookup
applies; that build must target the Electron version being used.
When no matching binary is available, installation builds from source and requires
a compiler, Python, and platform development dependencies. Dependency installation
and source builds may require network access.

Electron source builds may also compile OpenSSL when no prepared OpenSSL directory
or binary mirror is configured. On macOS this requires Perl, Xcode command-line
tools, and make; the OpenSSL build runs its tests. On Windows it requires Perl
and Visual Studio C++ build tools, including the target architecture tools and
`vcvarsall.bat` environment. A prepared directory can be selected with
`npm_config_openssl_dir`, or a binary mirror with `npm_config_openssl_bin_url`
and an optional `npm_config_openssl_bin_sha256`. Without an explicit hash, the
mirror must provide a `.sha256` sidecar. Source compilation can take considerably
longer than using a prebuild.

Studio currently ships for macOS arm64 and Windows. Linux CI provides modern
Linux validation; compatibility with older distributions is outside the current
scope. Before shipping Studio for Linux, validate and document the required glibc,
OpenSSL, and other system library versions on the chosen baseline.

## TypeScript

This package does not yet bundle TypeScript declarations. Studio currently uses
`@types/nodegit@0.28.9`, local declaration patches, and the `nodegit` import name.
Installing this fork under an npm alias preserves that setup; importing the scoped
package directly requires declarations for that module name.

The binding generator emits C++ and JavaScript, not `.d.ts` files. TypeScript
declarations must be checked separately against both the generated native API and
the handwritten JavaScript convenience API.

## Building and releasing

```sh
git clone --recurse-submodules https://github.com/Jaabaali/nodegit.git
cd nodegit
npm ci
npm test
```

See [RELEASING.md](RELEASING.md) for the release process. Merging into `main` runs
CI and builds artifacts; it does not publish a package or bump its version.

Upstream API documentation: <https://www.nodegit.org/>.

## API examples.

> [!NOTE]
> **ESM (ECMAScript Modules) style using `import` is preferred** and highly recommended over CJS (CommonJS `require`) for `@jabali-ai/nodegit`.

### Cloning a repository and reading a file:

```javascript
import Git from "@jabali-ai/nodegit";

// Clone a given repository into the `./tmp` folder.
Git.Clone("https://github.com/Jaabaali/nodegit", "./tmp")
  // Look up this known commit.
  .then(function (repo) {
    // Use a known commit sha from this repository.
    return repo.getCommit("59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5");
  })
  // Look up a specific file within that commit.
  .then(function (commit) {
    return commit.getEntry("README.md");
  })
  // Get the blob contents from the file.
  .then(function (entry) {
    // Patch the blob to contain a reference to the entry.
    return entry.getBlob().then(function (blob) {
      blob.entry = entry;
      return blob;
    });
  })
  // Display information about the blob.
  .then(function (blob) {
    // Show the path, sha, and filesize in bytes.
    console.log(blob.entry.path() + blob.entry.sha() + blob.rawsize() + "b");

    // Show a spacer.
    console.log(Array(72).join("=") + "\n\n");

    // Show the entire file.
    console.log(String(blob));
  })
  .catch(function (err) {
    console.log(err);
  });
```

### Emulating git log:

```javascript
import Git from "@jabali-ai/nodegit";

// Open the repository directory.
Git.Repository.open("tmp")
  // Open the default branch.
  .then(function (repo) {
    return repo.getHeadCommit();
  })
  // Display information about commits.
  .then(function (firstCommit) {
    // Create a new history event emitter.
    var history = firstCommit.history();

    // Create a counter to only show up to 9 entries.
    var count = 0;

    // Listen for commit events from the history.
    history.on("commit", function (commit) {
      // Disregard commits past 9.
      if (++count >= 9) {
        return;
      }

      // Show the commit sha.
      console.log("commit " + commit.sha());

      // Store the author object.
      var author = commit.author();

      // Display author information.
      console.log("Author:\t" + author.name() + " <" + author.email() + ">");

      // Show the commit date.
      console.log("Date:\t" + commit.date());

      // Give some space and show the message.
      console.log("\n    " + commit.message());
    });

    // Start emitting events.
    history.start();
  });
```

For more examples, check the `examples/` folder.

## Unit tests.

You will need to build locally before running the tests. See above.

```bash
npm test
```

## Maintained by ##
Alex Aveillán [@AlexaXs](http://github.com/AlexaXs) with help from tons of
[awesome contributors](https://github.com/nodegit/nodegit/contributors)!

### Alumni Maintainers ###
Ian Hattendorf [@ianhattendorf](http://github.com/ianhattendorf),
John Alden [@zawata](http://github.com/zawata),
Tyler Ang-Wanek [@twwanek](http://twitter.com/twwanek),
Tim Branyen [@tbranyen](http://twitter.com/tbranyen),
John Haley [@johnhaley81](http://twitter.com/johnhaley81),
Max Korp [@maxkorp](http://twitter.com/MaximilianoKorp),
Steve Smith [@orderedlist](https://twitter.com/orderedlist),
Michael Robinson [@codeofinterest](http://twitter.com/codeofinterest), and
Nick Kallen [@nk](http://twitter.com/nk)
