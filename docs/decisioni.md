# Decisioni

Formato: data — decisione — motivo. Le più recenti in fondo. Per cambiare una decisione se ne aggiunge una nuova che la sostituisce.

- 2026-09-22 — **Piattaforma: Meta Horizon Worlds, target mobile e web.** — Meta ha spostato i bonus del Creator Program su mobile/web; costo di ingresso quasi zero. (Kickoff YoloDevs, proposta di Francesco)
- 2026-09-22 — **Un mondo solo, per primo: maze survival stile Squid Game.** — Concentrarsi su un progetto e farlo bene; il genere unisce tensione da eliminazione e percorso a ostacoli, e la tribuna per gli eliminati tiene la gente in sessione. Sparatutto scartato per difficoltà tecnica; altre idee nel backlog `later`.
- 2026-09-22 — **Account creator Meta intestato a Matteo.** — È il software engineer del team e gestisce pubblicazione e parte tecnica. Meta paga un solo account; gli altri fatturano al titolare secondo `docs/patto.md`.
- 2026-09-22 — **Ruoli: Matteo tech lead (core, logica, review); Francesco game design e 3D; Emilio 3D, trappole, playtest.** — Competenze di ciascuno; Francesco ed Emilio lavorano su task assegnate tramite issue.
- 2026-09-22 — **Ritmo: la sera, a tempo perso. Nessuna scadenza fissa; si procede a fasi con un GO/NO-GO alla fine della validazione.** — Tutti hanno un lavoro; il progetto non deve costare stress.
- 2026-09-22 — **Prima di scrivere codice si verificano i termini del Creator Program (eleggibilità Italia, soglie, payout) e lo stack reale di Horizon.** — I numeri sentiti al kickoff arrivavano da una ricerca generata dall'AI, non dai termini Meta.
- 2026-09-22 — **Repo `ExhaustedTokens/maze-survival`, board nel Project #1 dell'org, chat su Discord.** — Lo stato del lavoro vive su GitHub, non in chat.
- 2026-09-22 — **Regole di sviluppo fissate da subito: KISS, DRY, SOLID, design pattern nominati; conventional commits (Angular) e SemVer automatico; Prettier, ESLint strict, tsc strict, Vitest; CI/CD con GitHub Actions.** — Richiesta di Matteo: una base solida costa poco ora e tanto dopo. Dettagli in `docs/sviluppo.md`.
- 2026-09-22 — **Rami `dev` (default, PR con squash) → `staging` (pre-release rc) → `main` (release), promozione solo fast-forward con il workflow `promote`.** — Storia lineare: le stesse commit salgono di ambiente, i tag di semantic-release restano coerenti, niente merge da risolvere.
- 2026-09-22 — **Protezione server dei rami rimandata.** — Ruleset e branch protection sono a pagamento sui repo privati del piano Free; i ruleset sono pronti in `.github/rulesets/` e si importano se il repo diventa pubblico o l'org passa a Team.
