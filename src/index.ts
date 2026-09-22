/**
 * Entry point. Game code lands after the Phase 1 GO decision (issue #10):
 * for now this module only proves that lint, typecheck, tests and build work.
 */
export const WORLD_NAME = 'maze-survival';

export function describeWorld(): string {
  return `${WORLD_NAME}: maze survival for Meta Horizon Worlds`;
}
