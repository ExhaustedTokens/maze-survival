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
- Branch per issue, PR verso `main`, review di Matteo. Docs si possono toccare direttamente su `main`.
- Numeri su bonus e fondi Meta: citare sempre la fonte ufficiale, altrimenti scrivere "da verificare".
