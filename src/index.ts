/**
 * Punto di ingresso. Il codice del gioco arriva dopo il GO di Fase 1 (issue #10):
 * per ora questo modulo serve a verificare che lint, typecheck, test e build funzionino.
 */
export const WORLD_NAME = 'maze-survival';

export function describeWorld(): string {
  return `${WORLD_NAME}: maze survival per Meta Horizon Worlds`;
}
