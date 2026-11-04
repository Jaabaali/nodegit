import * as Git from "@jabali-ai/nodegit";
import * as AliasedGit from "nodegit";

type Assert<T extends true> = T;
type IsAny<T> = 0 extends (1 & T) ? true : false;
type NotAny<T> = IsAny<T> extends true ? false : true;
type SyncText = Assert<ReturnType<Git.ConvenientPatch["toBuf"]> extends string ? true : false>;
type AsyncText = Assert<ReturnType<Git.Patch["toBuf"]> extends Promise<string> ? true : false>;
type CheckedMerge = Assert<NotAny<Awaited<ReturnType<typeof Git.Merge.commits>>>>;

// Constants are runtime objects, usable with isolatedModules and as union types.
const delta: Git.Diff.DELTA = Git.Diff.DELTA.ADDED;
const flags: Git.Diff.OPTION = Git.Diff.OPTION.INCLUDE_UNTRACKED | Git.Diff.OPTION.RECURSE_UNTRACKED_DIRS;
const patchFormat: Git.Diff.FORMAT.PATCH = Git.Diff.FORMAT.PATCH;
const added: 1 = Git.Diff.DELTA.ADDED;
const readableObject: Readonly<Record<string, number>> = Git.Diff.DELTA;
const compatibleAlias: typeof Git.Merge = AliasedGit.Merge;
// @ts-expect-error Constant members cannot be assigned.
Git.Diff.DELTA.ADDED = 9;
// @ts-expect-error Constant types are numeric.
const badDelta: Git.Diff.DELTA = "ADDED";

async function patchContracts(diff: Git.Diff, convenient: Git.ConvenientPatch) {
  const text: string = convenient.toBuf();
  const context: number = convenient.lineStats().total_context;
  const patch = await Git.Patch.fromDiff(diff, 0);
  // @ts-expect-error The native API can omit a patch for a skipped delta.
  patch.numHunks();
  if (!patch) throw new Error("Expected a text patch");
  const nativeText: string = await patch.toBuf();
  const hunk = await patch.getHunk(0);
  const lineCount: number = hunk.linesInHunk;
  const header: string = hunk.hunk.header();
  const patches: Git.ConvenientPatch[] = await Git.Patch.convenientFromDiff(diff, [0]);
  // @ts-expect-error The convenient method returns text synchronously.
  const promise: Promise<string> = convenient.toBuf();
  // @ts-expect-error The generated native method takes a numeric delta index.
  await Git.Patch.fromDiff(diff, "0");
  return { text, context, nativeText, lineCount, header, patches };
}

async function mergeContracts(repo: Git.Repository, reference: Git.Reference, head: Git.AnnotatedCommit) {
  const result = await Git.Merge.analysisForRef(repo, reference, [head], 1);
  const analysis: number = result.analysis_out;
  const preference: number = result.preference_out;
  // @ts-expect-error Native multiple outputs resolve to an object.
  const single: number = result;
  const index: Git.Index = await Git.Merge.commits(repo, "HEAD", "HEAD", null);
  const merged: void = await Git.Merge.merge(repo, head, null, null);
  const reachable: number = await Git.Graph.reachableFromAny(repo, "HEAD", ["HEAD"]);
  // @ts-expect-error The public convenience method does not take a native length argument.
  await Git.Graph.reachableFromAny(repo, "HEAD", ["HEAD"], 1);
  return { analysis, preference, index, merged, reachable };
}

async function indexContracts(index: Git.Index, repo: Git.Repository, oid: Git.Oid) {
  const conflicts: number = index.hasConflicts();
  // @ts-expect-error The native method returns 0 or 1, not a JavaScript boolean.
  const boolean: boolean = index.hasConflicts();
  const entries = await index.conflictGet("file.txt");
  const ours: Git.IndexEntry | null = entries.our_out;
  const theirs: Git.IndexEntry | null = entries.their_out;
  // @ts-expect-error Native output parameters are named our_out and their_out.
  entries.ours_out;
  const counts = await Git.Graph.aheadBehind(repo, oid, oid);
  const ahead: number = counts.ahead;
  const behind: number = counts.behind;
  return { conflicts, ours, theirs, ahead, behind };
}

function optionalResultContracts(commit: Git.Commit, repo: Git.Repository,
  reference: Git.Reference, index: Git.Index, diff: Git.Diff) {
  // Null C pointers from synchronous bindings become undefined, not null.
  // @ts-expect-error A summary-only commit has no body.
  const body: string = commit.body();
  // @ts-expect-error The encoding header may be absent.
  const encoding: string = commit.messageEncoding();
  // @ts-expect-error Bare repositories have no working directory.
  const directory: string = repo.workdir();
  // @ts-expect-error Repositories need not have an active namespace.
  const namespace: string = repo.getNamespace();
  // @ts-expect-error Direct references have no symbolic target.
  const symbolic: string = reference.symbolicTarget();
  // @ts-expect-error Symbolic references have no direct target.
  const target: Git.Oid = reference.target();
  // @ts-expect-error A peeled target may be absent.
  const peeled: Git.Oid = reference.targetPeel();
  // @ts-expect-error Index positions can be out of bounds.
  const byIndex: Git.IndexEntry = index.getByIndex(0);
  // @ts-expect-error Index paths can be absent.
  const byPath: Git.IndexEntry = index.getByPath("missing");
  // @ts-expect-error Diff positions can be out of bounds.
  const delta: Git.DiffDelta = diff.getDelta(0);

  const maybeDirectory: string | undefined = repo.workdir();
  const maybeTarget: Git.Oid | undefined = reference.target();
  const maybeEntry: Git.IndexEntry | undefined = index.getByPath("file.txt");
  const maybeDelta: Git.DiffDelta | undefined = diff.getDelta(0);
  if (maybeDirectory) maybeDirectory.toUpperCase();
  if (maybeTarget) maybeTarget.tostrS();
  if (maybeEntry) maybeEntry.path.toUpperCase();
  if (maybeDelta) maybeDelta.status();
}

async function descendantContracts(repo: Git.Repository, oid: Git.Oid) {
  const strings: number = await Git.Graph.descendantOf(repo, oid.tostrS(), oid.tostrS());
  const objects: number = await Git.Graph.descendantOf(repo, oid, oid);
  const mixed: number = await Git.Graph.descendantOf(repo, oid.tostrS(), oid);
  // @ts-expect-error Native Oid inputs accept objects or strings, not numbers.
  await Git.Graph.descendantOf(repo, 0, oid);
  return { strings, objects, mixed };
}
