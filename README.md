# maze-survival

Un mondo per **Meta Horizon Worlds**, pensato per mobile e web: un **maze survival in stile Squid Game**.
Labirinto con pareti che si muovono, eliminazione, PvP/PvE, e una tribuna dove chi è stato eliminato
resta in partita attivando trappole ed effetti contro chi corre ancora.

Team: Matteo (tech lead), Francesco (game design, 3D), Emilio (3D, trappole, playtest).
Si lavora la sera, a tempo perso, in italiano.

## Perché

Meta paga i creatori di mondi tramite il **Horizon Creator Program**: traguardi di utenti, bonus mensili
su tempo speso e ritorni, una quota sulle vendite in-world. I bonus oggi premiano soprattutto mobile e web.
Il costo per noi è quasi zero (abbonamenti AI), quindi si prova. I numeri sentiti in giro
(fondo da 50M$, soglie, percentuali) **vanno verificati sui termini ufficiali** prima di contarci: è la Fase 1.

## Come lavoriamo

- **Lo stato del lavoro è su GitHub**: ogni compito è una issue, la board è il
  [Project dell'org](https://github.com/orgs/ExhaustedTokens/projects/1). Se non è in una issue, non esiste.
- Le decisioni vanno in [`docs/decisioni.md`](docs/decisioni.md).
- Codice: un branch per issue, pull request verso `main`, review di Matteo.
- Chat veloce su Discord; tutto quello che deve durare più di un giorno finisce in una issue.
- Nuovi nel team: partire da [`docs/onboarding.md`](docs/onboarding.md).

## Piano

| Fase | Obiettivo | Esito |
|---|---|---|
| **0 · Setup** | Repo, board, patto scritto, onboarding, Discord | Tutti lavorano nello stesso posto |
| **1 · Validazione** | Termini del Creator Program ed eleggibilità Italia; Desktop Editor installato e un mondo di prova pubblicato su mobile; pipeline Blender → Horizon provata; benchmark di 3–5 mondi simili | **GO / NO-GO** documentato |
| **2 · Prototipo** | Core loop minimo: labirinto statico, N giocatori, eliminazione, arrivo, tribuna con 1–2 trappole. Zero skin, zero shop | Playtest tra noi e amici |
| **3 · Lancio** | Pubblicare, misurare tempo in sessione e ritorni, poi pareti mobili, stage multipli, shop | Primi traguardi Meta |

Le idee parcheggiate (ghost mode, escape room, prop hunt, carte, Beyblade, avatar VRChat) stanno nel backlog con etichetta `later`.

## Documenti

- [`docs/decisioni.md`](docs/decisioni.md) — registro delle decisioni
- [`docs/patto.md`](docs/patto.md) — accordo tra i tre (bozza da discutere)
- [`docs/onboarding.md`](docs/onboarding.md) — come entrare nel progetto: GitHub, Claude Code, regole
- [`CLAUDE.md`](CLAUDE.md) — contesto per Claude Code
