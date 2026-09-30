# @jabali/nodegit

> Node bindings to the [libgit2](http://libgit2.github.com/) project.

[![Actions Status](https://github.com/Jaabaali/nodegit/workflows/Testing/badge.svg)](https://github.com/Jaabaali/nodegit/actions)

**Stable (libgit2@v0.28.3): 0.28.3**

Downstream fork of [nodegit](https://github.com/nodegit/nodegit) maintained by tje Jabali team. This fork is specifically optimized for modern runtime environments (Node.js v24+ and Electron v40+) and includes prebuilt native binaries bundled directly inside the published package, eliminating the need for network requests during installation.

## Installation & Registry Configuration

This package is published to the private Google Cloud Artifact Registry (GCP) at:
`https://us-east4-npm.pkg.dev/jabali-infra/npm-infra`

### 1. Registry Setup

To configure npm or yarn to associate the `@jabali` scope with this registry, you can retrieve the correct configuration settings by running `gcloud`:

```bash
gcloud artifacts print-settings npm \
    --project=jabali-infra \
    --repository=npm-infra \
    --location=us-east4 \
    --scope=@jabali
```

This will print the settings you need to append to your `.npmrc` file. For reference, a typical `.npmrc` entry looks like this:

```ini
@jabali:registry=https://us-east4-npm.pkg.dev/jabali-infra/npm-infra/
```

### 2. Authenticating & Refreshing Tokens

Before running any `npm` or `yarn` command (such as `npm install` or `npm publish`), you will need to authenticate and refresh the access token in your `.npmrc` file. This can be done by running:

```bash
npx google-artifactregistry-auth PATH_TO_NPMRC
```

or simply run

```bash
npm run login:google-artifactregistry
```

_(Where `PATH_TO_NPMRC` is the path to your `.npmrc` file, e.g., `./.npmrc` or `~/.npmrc`)_.

### 3. Installation Options

You can install this package in one of two ways:

#### Option A: Install as Scoped Package

To use the package directly under its scoped name:

```bash
npm install @jabali/nodegit
```

_Note: This requires updating your code imports to refer to `@jabali/nodegit` (e.g., `require("@jabali/nodegit")`)._

#### Option B: Install as an Alias (Recommended for existing codebases)

If you want to use this fork as a drop-in replacement without modifying any existing `require("nodegit")` or `import ... from "nodegit"` statements throughout your codebase, you can install the scoped package under the `nodegit` name alias:

```bash
npm install nodegit@npm:@jabali/nodegit
```

## Compatibility & Prebuilt Binaries

This fork of NodeGit is specifically optimized and maintained for modern runtime environments:

- **Runtime Support**: Full out-of-the-box compatibility with **Node.js v24+** and **Electron v40+**.
- **Offline Bundling**: Prebuilt native binaries are bundled directly inside the published package (using `prebuildify` + `node-gyp-build`). Unlike the upstream package which relies on download-on-install scripts (e.g., `node-pre-gyp` fetching from external AWS S3 buckets), this package requires **no network requests during installation**, making it highly reliable, secure, and compatible with offline or air-gapped development environments.
- **Compilation Fallback**: If a compatible prebuilt binary is not found for your system architecture, it automatically falls back to a local build via `node-gyp` (which requires local build tools like Xcode Command Line Tools, GCC, and Python).

## Upstream API Documentation

[http://www.nodegit.org/](http://www.nodegit.org/)

## Installing from Source

If you receive errors about libstdc++, which are commonly experienced when
building on Travis-CI, you can fix this by upgrading to the latest
libstdc++-4.9.

In Ubuntu:

```sh
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt-get update
sudo apt-get install libstdc++-4.9-dev
```

If you receive errors about _lifecycleScripts_ preinstall/install you probably miss _libssl-dev_
In Ubuntu:

```
sudo apt-get install libssl-dev
```

You will need the following libraries installed on your linux machine:

- libpcre
- libpcreposix
- libkrb5
- libk5crypto
- libcom_err

When building locally, you will also need development packages for kerberos and pcre, so both of these utilities must be present on your machine:

- pcre-config
- krb5-config

If you are still encountering problems while installing, you should try the
[Building from source](http://www.nodegit.org/guides/install/from-source/)
instructions.

## API examples.

> [!NOTE]
> **ESM (ECMAScript Modules) style using `import` is preferred** and highly recommended over CJS (CommonJS `require`) for `@jabali/nodegit`.

### Cloning a repository and reading a file:

```javascript
import Git from "@jabali/nodegit";

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
import Git from "@jabali/nodegit";

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
