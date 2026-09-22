# maze-survival — contesto per Claude Code

Vale anche il `CLAUDE.md` del workspace (`../../CLAUDE.md`): token dell'org via `tools/gh-et`, mai toccare Fantaking, si parla in italiano.

## Cos'è

Un mondo per **Meta Horizon Worlds**, target **mobile e web** (non VR): maze survival stile Squid Game.
Obiettivo: un mondo che tenga la gente in sessione e la faccia tornare, perché i bonus del
Horizon Creator Program si calcolano su tempo speso, ritorni e vendite in-world.
Dettagli e piano a fasi nel [README](README.md).

## Stato

Fase 0/1: setup e validazione. **Non c'è ancora codice.** Prima di scrivere codice di gioco vanno chiuse
le issue con etichetta `fase-1` e la decisione GO/NO-GO.

## Stack (da confermare in Fase 1)

- **Meta Horizon Desktop Editor** con scripting **TypeScript** (Horizon TypeScript API). È la via ufficiale
  per i mondi; gira su Windows in locale, ed è l'eccezione alla regola "tutto in Docker/WSL" del workspace.
  Tooling TypeScript (lint, test) può stare in Docker.
- **Blender** per gli asset 3D (trappole, gadget, skin), esportati e importati nell'editor.
  Su mobile contano poligoni e texture: budget da definire nella issue della pipeline.
- Meta ha annunciato strumenti Unity e generativi per Horizon: cosa sia disponibile davvero per mobile
  si verifica in Fase 1, non si dà per scontato.

## Persone e ruoli

- **Matteo** (`m-bonanno`): tech lead, core e logica di gioco, review delle PR, orchestra il lavoro con l'AI.
  Titolare dell'account creator Meta.
- **Francesco** (`Revans117`): game design, 3D in Blender, conosce Horizon Worlds e VRChat da utente e creatore.
- **Emilio**: 3D, trappole e gadget, playtest. Si sta avvicinando a GitHub e Claude Code adesso:
  spiegare i passaggi, non darli per scontati.

## Regole

- Ogni compito è una issue; la board è il Project #1 dell'org. Aggiornare la issue, non raccontarlo in chat.
- Decisioni in `docs/decisioni.md` (data, decisione, motivo). Le decisioni economiche seguono `docs/patto.md`.
- Numeri su bonus e fondi Meta: citare sempre la fonte ufficiale, altrimenti scrivere "da verificare".

## Regole di sviluppo (dettagli in [docs/sviluppo.md](docs/sviluppo.md))

- **Rami:** `main` (pubblicato) ⊆ `staging` (candidato) ⊆ `dev` (integrazione, default). Ramo di lavoro
  `<tipo>/<issue>-<cosa>` → **PR verso `dev`**, squash merge. `staging` e `main` si muovono **solo** con il
  workflow `promote` (fast-forward). Mai commit diretti su `staging`/`main`.
- **Commit:** conventional commits, convenzione Angular (`feat`, `fix`, `perf`, `refactor`, `docs`, `test`,
  `build`, `ci`, `chore`, `style`, `revert`). Il titolo della PR è il messaggio del commit: scriverlo così.
  Versioni automatiche con semantic-release (rc su `staging`, finale su `main`): mai toccare la versione a mano.
- **Principi:** KISS (funzioni ≤ 50 righe, complessità ≤ 10, imposto da ESLint), DRY con la regola del tre,
  SOLID, design pattern solo per problemi reali e nominati nel codice (`MatchStateMachine`, `TrapFactory`).
- **Qualità:** Prettier, ESLint strict type-checked + unicorn + sonarjs con zero warning, `tsc` strict al massimo,
  Vitest. Tutto via Docker: `docker compose run --rm tools npm run check` deve passare prima di aprire la PR.
  Niente `eslint-disable` senza un commento che spiega perché.
- **Logica di gioco separata dalle API Horizon**, così si testa con Vitest senza l'editor.
- **Pipeline:** `ci` (PR e push), `promote` (manuale, dev→staging→main), `release` (semantic-release, GitHub Release
  con lo zip di `dist`). Il deploy nel mondo Horizon è manuale dal Desktop Editor finché Meta non offre un'API.
