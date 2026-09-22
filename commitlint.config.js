// Conventional commits, Angular convention: feat, fix, perf, refactor, docs, test, build, ci, chore, style, revert.
// Enforced on the PR title, which becomes the squash commit on dev. Details in docs/sviluppo.md §3.
export default {
  extends: ['@commitlint/config-conventional'],
};
