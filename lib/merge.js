var NodeGit = require("../");

var Merge = NodeGit.Merge;
// The public helpers below wrap the generated native signatures.
var native = /** @type {typeof import("../types/native")} */ (/** @type {unknown} */ (NodeGit));
var _commits = native.Merge.commits;
var _merge = native.Merge.merge;

/**
 * Merge 2 commits together and create an new index that can
 * be used to create a merge commit.
 *
 * @param {import("../types").Repository} repo Repository containing the commits
 * @param {import("../types").Commit | import("../types").Oid | string} ourCommit Destination commit
 * @param {import("../types").Commit | import("../types").Oid | string} theirCommit Commit to merge
 * @param {import("../types").MergeOptions | null} [options] Merge tree options
 * @returns {Promise<import("../types").Index>} Index containing the merge result
 */
function commits(repo, ourCommit, theirCommit, options) {
  return Promise.all([
    repo.getCommit(ourCommit),
    repo.getCommit(theirCommit)
  ]).then(function(commits) {
    return _commits.call(Merge, repo, commits[0], commits[1], options);
  });
}

/**
 * Merge a commit into HEAD and writes the results to the working directory.
 *
 * @param {import("../types").Repository} repo Repository receiving the merge
 * @param {import("../types").AnnotatedCommit} theirHead Commit to merge into HEAD
 * @param {import("../types").MergeOptions | null} [mergeOpts] Merge tree options
 * @param {import("../types").CheckoutOptions | null} [checkoutOpts] Checkout options
 * @returns {Promise<void>} Resolves when the merge completes
 */
function merge(repo, theirHead, mergeOpts, checkoutOpts) {
  // Even though git_merge takes an array of annotated_commits, it expects
  // exactly one to have been passed in or it will throw an error...  ¯\_(ツ)_/¯
  var theirHeads = [theirHead];

  return _merge.call(Merge, repo, theirHeads, theirHeads.length,
    mergeOpts, checkoutOpts);
}

exports.commits = Merge.commits = commits;
exports.merge = Merge.merge = merge;
