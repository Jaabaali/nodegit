var NodeGit = require("../");

var Graph = NodeGit.Graph;

// Capture the native signature before installing the convenience wrapper.
var native = /** @type {typeof import("../types/native")} */ (/** @type {unknown} */ (NodeGit));
var _reachableFromAny = native.Graph.reachableFromAny;

/**
 * Determine if a commit is reachable from any of a list of commits by following parent edges.
 * @param {import("../types").Repository} repository Repository containing the commits
 * @param {import("../types").Oid | string} commit Commit to test
 * @param {Array<import("../types").Oid | string>} descendant_array Descendant commit IDs
 * @returns {Promise<number>} One if reachable, zero otherwise
 */
function reachableFromAny(repository, commit, descendant_array) {
  return _reachableFromAny(repository, commit, descendant_array, descendant_array.length);
}

exports.reachableFromAny = Graph.reachableFromAny = reachableFromAny;
