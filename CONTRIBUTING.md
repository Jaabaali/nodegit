Contribution Guidelines
-----------------------

## Commit messages and pull request titles

New Jabali-authored commits and pull request titles follow
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
type(optional-scope): concise description
```

Use `feat` for new functionality, `fix` for bug fixes, and `docs`, `test`, `ci`,
`build`, `refactor`, `perf`, `style`, `chore`, or `revert` as appropriate for other
changes. Use lowercase types and descriptive scopes such as `install`, `bindings`,
`deps`, or `windows` when helpful.

Examples:

```text
fix(install): honor explicit Electron rebuild targets
build(deps): update node-gyp for Visual Studio 2026
ci(windows): verify ARM64 prebuild architecture
docs: clarify the upstream compatibility baseline
```

For breaking changes, add `!` before the colon and include a `BREAKING CHANGE:`
footer describing the impact and migration. Breaking changes still require the
release planning described in [RELEASING.md](RELEASING.md).

This convention applies going forward; preserve existing commits and upstream
history. Git-generated merge and revert messages are allowed. Do not rewrite
imported commits merely to change their messages.

Commit types describe changes; they do not automatically bump versions or publish
packages. Releases continue to use the documented `0.28.0-jabali.N` policy.

### A Note on Issues and Support ##

We try to be available pretty often to help when problems come up. We like to split incoming questions
into two categories: potential bugs/features, and questions. If you want a feature added, or think you've found a bug
in the code (or in the examples), search the [issue tracker](https://github.com/nodegit/nodegit/issues) and if you don't
find anything, file a new issue. If you just have questions, instead of using issues, [sign up](http://slack.libgit2.org/)
to libgit2's Slack instance and then contact us in the [#nodegit channel](https://libgit2.slack.com/messages/nodegit/).

## How to Help ##

NodeGit is iterating pretty quickly, but it can always go faster. We welcome help with the deeper darker parts,
like the templates and binding and more, but there are plenty of smaller things to do as well.
Things that are always needed:
 - Filing issues (see above).
 - Writing tests (See [here](https://github.com/nodegit/nodegit/blob/master/TESTING.md)).
 - Writing examples.

These are all good easy ways to start getting involved with the project. You can also look through the issue tracker
and see if you can help with any existing issues. Please comment with your intention and any questions before getting
started; duplicating work or doing something that would be rejected always sucks.

Additionally, [the documentation](http://www.nodegit.org) needs some love. Get in touch with one of us on Slack if
you'd like to lend a hand with that.

For anything else, Slack is probably the best way to get in touch as well. Happy coding, merge you soon!
