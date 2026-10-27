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
