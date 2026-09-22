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

- **Il repo è pubblico.** Mai cifre, quote, dati fiscali, cognomi, email personali o accordi: vanno nel repo privato
  `ExhaustedTokens/team` (patto, rendiconto). In caso di dubbio, va lì.
- Ogni compito è una issue **nel formato standard** (template "Storia": storia, contesto, risultato atteso, criteri di accettazione verificabili, task, fuori scope, dipendenze, "per chi sviluppa", stima, priorità; template "Bug": passi, atteso, osservato, ambiente, priorità, criteri con il test che riproduce; vedi `docs/sviluppo.md` §9). La board è il Project #1 dell'org. Aggiornare la issue, non raccontarlo in chat.
- Quando una PR viene mergiata, aggiornare il corpo delle issue collegate (stato, commit, cosa resta) e chiuderle con un commento finale.
- Decisioni in `docs/decisioni.md` (data, decisione, motivo). Le decisioni economiche seguono il patto nel repo `team`.
- Numeri su bonus e fondi Meta: citare sempre la fonte ufficiale, altrimenti scrivere "da verificare".

## Regole di sviluppo (dettagli in [docs/sviluppo.md](docs/sviluppo.md))

- **Lingua:** codice, commenti, identificatori, messaggi di log, test, config, workflow, **messaggi di commit e
  titoli delle PR in inglese**. Issue, descrizioni delle PR, `docs/`, README, questo file e la chat in italiano.
- **Rami:** `main` (pubblicato) ⊆ `staging` (candidato) ⊆ `dev` (integrazione, default). Ramo di lavoro
  `<type>/<issue>-<slug>` → **PR verso `dev`**, squash merge. `staging` e `main` si muovono **solo** con il
  workflow `promote` (fast-forward). Mai commit diretti su `staging`/`main`.
- **Commit:** conventional commits in inglese, convenzione Angular (`feat`, `fix`, `perf`, `refactor`, `docs`, `test`,
  `build`, `ci`, `chore`, `style`, `revert`). Il titolo della PR è il messaggio del commit: scriverlo così.
  Versioni automatiche con semantic-release (rc su `staging`, finale su `main`): mai toccare la versione a mano.
- **Principi:** KISS (funzioni ≤ 50 righe, complessità ≤ 10, imposto da ESLint), DRY con la regola del tre,
  SOLID, design pattern solo per problemi reali e nominati nel codice (`MatchStateMachine`, `TrapFactory`).
- **TDD:** prima il test, poi il codice (rosso → verde → refactor). Un `fix` parte da un test che riproduce il bug.
  Logica di gioco pura in `src/core/` (testata, copertura ≥ 80 % o la CI fallisce), adattatori Horizon sottili e
  senza logica in `src/horizon/`. Ciclo: `docker compose run --rm tools npm run test:watch`.
- **Qualità:** Prettier, ESLint strict type-checked + unicorn + sonarjs con zero warning, `tsc` strict al massimo,
  Vitest con soglie di copertura. Tutto via Docker: `docker compose run --rm tools npm run check` deve passare
  prima di aprire la PR. Niente `eslint-disable` senza un commento che spiega perché.
- **Pipeline:** `ci` (job `lint`, `test`, `build`, `pr-title` su PR e push), `pr-triage` (assegna la PR al suo autore e richiede la review di
  Copilot su ogni PR; Matteo è reviewer via `CODEOWNERS`), `promote` (manuale, dev→staging→main, solo con i tre job
  verdi; production richiede l'approvazione di Matteo), `release` (semantic-release, GitHub Release con lo zip di
  `dist`). `promote` usa il segreto `MAINTAINER_TOKEN`. Il deploy nel mondo Horizon è manuale
  dal Desktop Editor finché Meta non offre un'API.
