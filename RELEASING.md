# Jabali releases

This fork serves Jabali Studio. Upstream NodeGit remains the recommended starting
point for general-purpose use. Public npm releases use `@jabali-ai/nodegit`.

## Versions

Use `0.28.0-jabali.N` for the current upstream development baseline
(`0.28.0-alpha.38`, commit `e6c71bc1`). Increment the Jabali revision for each
published change; never reuse or modify a published version. Keep the manifest
and lockfile versions synchronized. For the next revision:

```sh
npm version prerelease --preid=jabali --no-git-tag-version
```

Use [Conventional Commits](CONTRIBUTING.md#commit-messages-and-pull-request-titles)
to describe changes and organize release notes. Commit types do not replace this
upstream-based version policy or trigger publication.

Each revision should preserve the preceding revision's API and documented
behavior. Compatible additions are welcome. Document intentional breaking
changes under a new release line before shipping them. Track libgit2 independently
and record its exact version and commit in every release's notes.

## Release checklist

1. Prepare a version/release-notes PR. List the upstream baseline, additions,
   behavior differences, libgit2 commit, and supported runtimes/platforms.
2. Require passing platform CI, packaged-install tests, Electron runtime tests,
   and a Jabali Studio integration test. Building an Electron binary alone does
   not establish Electron compatibility.
3. After merging, collect the prebuild artifacts from that exact `main` commit
   into `prebuilds/` in a clean recursive checkout. Install development dependencies
   with `npm ci --ignore-scripts`.
4. Run `npm pack`. Its `prepack` hook generates the JavaScript and native bindings.
   Inspect the tarball and install it into a separate test project; verify loading
   under each supported runtime, including Electron, without using a checkout's
   local build. Verify the source-build fallback separately.
5. With explicit release approval and npm organization access, publish the tested
   tarball: `npm publish ./jabali-ai-nodegit-<version>.tgz --access public --tag jabali`.
6. Tag that source commit `v<version>` and create the matching GitHub release.
   Update Studio's exact dependency version in a separate consumer change.

The `jabali` npm dist-tag identifies this downstream prerelease line. CI does not
automatically publish on merge or commit a version bump. npm authentication must
be configured by the release operator; no private Artifact Registry is required.
