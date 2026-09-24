# Regole di sviluppo

Come si scrive, si integra e si rilascia il codice di maze-survival. Valgono per tutti, Claude compreso.
Comandi in fondo. Le regole si cambiano con una riga in `docs/decisioni.md`, non a voce.

## 0. Lingua

- **Inglese** per tutto ciò che sta nel codice e nel tooling: identificatori, commenti, messaggi di log ed errore,
  nomi dei test, file di configurazione, workflow, **messaggi di commit e titoli delle PR** (il titolo diventa il commit).
- **Italiano** per tutto ciò che è comunicazione tra noi: issue, descrizioni e discussioni delle PR, `docs/`, README,
  `CLAUDE.md`, chat.

## 1. Principi

**KISS.** La soluzione più semplice che funziona. Il prototipo (Fase 2) è un labirinto statico con due trappole:
niente sistema generico di trappole, niente configurazione, niente "lo faremo servire dopo". Il linter lo impone:
funzioni entro 50 righe, complessità ciclomatica e cognitiva ≤ 10, annidamento ≤ 3, ≤ 4 parametri.

**DRY.** Una cosa vive in un posto solo: una costante, una funzione, un tipo. Ma la regola del tre vale: si estrae
un'astrazione alla terza ripetizione, non alla prima. Due righe simili non sono duplicazione, due logiche uguali sì.

**SOLID.**
- *Single responsibility*: un componente Horizon fa una cosa (il timer del round, la tribuna, una trappola). Se il nome ha una "e", sono due componenti.
- *Open/closed*: le trappole implementano un'interfaccia comune; aggiungerne una non tocca il gestore della partita.
- *Liskov*: ogni trappola è usabile ovunque serve "una trappola", senza casi speciali.
- *Interface segregation*: interfacce piccole (`Activatable`, `Eliminable`), non un `GameObject` che sa tutto.
- *Dependency inversion*: la logica di partita dipende da interfacce, non dagli oggetti concreti del mondo; le dipendenze si passano, non si cercano.

**Design pattern.** Si usano quando risolvono un problema che c'è, e si nominano nel codice (`MatchStateMachine`, `TrapFactory`).
Quelli che ci aspettiamo nel gioco: **State** per le fasi della partita (lobby → corsa → fine); **Observer / eventi**
per "giocatore eliminato", "trappola attivata" (Horizon ha già un bus di eventi, si usa quello); **Strategy** per il
comportamento delle trappole; **Factory** per spawn di giocatori e oggetti; **Command** per le azioni della tribuna.
Nessun pattern "per completezza".

## 2. Rami e flusso

Tre rami lunghi, storia **lineare**: `main` ⊆ `staging` ⊆ `dev`.

| Ramo | Cos'è | Come si aggiorna |
|---|---|---|
| `dev` | integrazione, ramo di default | **pull request** da un ramo di lavoro, **squash merge** |
| `staging` | candidato al rilascio, provato nel mondo di staging | promozione fast-forward da `dev` (workflow `promote`) |
| `main` | quello che è pubblicato | promozione fast-forward da `staging` (workflow `promote`) |

- Ramo di lavoro: `<type>/<issue>-<slug>` in inglese, es. `feat/23-tribune-traps`, `fix/31-round-timer`, `docs/12-gdd`.
  Un ramo per issue, vita breve, cancellato al merge (automatico).
- PR sempre verso `dev`. Il **titolo della PR diventa il messaggio del commit** su `dev`: deve essere un conventional commit
  in inglese (sotto). La descrizione della PR è in italiano.
- Promozione: da GitHub → Actions → `promote` → "Run workflow" → `staging` o `production`. Il workflow verifica che il
  fast-forward sia possibile e che la CI sia verde sul commit, poi sposta il ramo e lancia la release.
- Nessun commit diretto su `staging` e `main`. Un hotfix è una PR su `dev` promossa subito: se qualcuno commette su `main`
  per sbaglio, la storia non è più lineare e il workflow di promozione si rifiuta finché non si riallinea (`git merge main` in `dev`).

## 3. Commit e versioni

**Conventional commits (convenzione Angular)**, in inglese, controllati da commitlint sul titolo della PR:

```
<type>(<optional scope>): <imperative description, lowercase, no trailing period>
```

Esempi: `feat(tribune): let eliminated players trigger the first trap`, `fix(round): stop the timer when the maze empties`,
`docs: describe the Blender export pipeline`.

| tipo | quando | versione |
|---|---|---|
| `feat` | funzionalità nuova per chi gioca | minor (0.**x**.0) |
| `fix` | correzione di un comportamento sbagliato | patch (0.0.**x**) |
| `perf` | più veloce/leggero senza cambiare comportamento | patch |
| `refactor` | ristrutturazione senza cambiare comportamento | nessuna |
| `docs`, `test`, `build`, `ci`, `chore`, `style` | documentazione, test, tooling, pipeline, manutenzione, formattazione | nessuna |
| `revert` | annulla un commit precedente | dipende |

Un cambiamento incompatibile (salvataggi, API tra componenti) si segnala con `!` dopo il tipo o `BREAKING CHANGE:` nel corpo → major.

**Semantic Versioning, automatico.** Nessuno scrive numeri di versione a mano (`package.json` resta a `0.0.0-development`):
- push su `staging` → `semantic-release` calcola la versione dai commit e pubblica una **pre-release** `X.Y.Z-rc.N` su GitHub Releases;
- push su `main` → pubblica la release finale `X.Y.Z`, con tag, note di rilascio generate dai commit e lo zip degli script.
- Punto di partenza: il tag `v0.1.0` messo al setup (nessun codice di gioco). Finché si resta in 0.x, un `feat` alza la
  minor (0.2.0) e un `fix` la patch (0.1.1). Si passa a 1.0.0 quando il mondo è pubblicato e giocabile, con un
  commit `feat!:` deliberato, non per caso.

## 4. Test e TDD

**Prima il test, poi il codice.** Ciclo: un test che descrive il comportamento e fallisce (rosso) → il minimo codice
che lo fa passare (verde) → pulizia con i test verdi (refactor). Un `fix` parte sempre da un test che riproduce il bug;
un `feat` arriva con i test che ne descrivono le regole. Il test è la specifica: se non sai scrivere il test, la
regola di gioco non è ancora chiara e va chiarita nella issue, non nel codice.

Perché sia possibile, il codice ha due zone:
- `src/core/` (e in generale tutto tranne `src/horizon/`): **logica di gioco pura** in TypeScript, senza dipendenze
  da Horizon. Stato della partita, eliminazioni, timer, regole delle trappole, punteggi. Qui vive il TDD.
- `src/horizon/`: **adattatori sottili** verso le API di Horizon (componenti, eventi, entità). Nessun `if` di gioco:
  ricevono eventi e chiamano il core. Si provano a mano nel mondo di staging.

Attenzione: nel mondo gli script arrivano **piatti**, senza sottocartelle, e si importano per nome di modulo
(`stack.md` §3). Le due zone sono una regola logica; come si mappano sui file (nomi, cartelle, script di copia) si
decide nella #22, prima di scrivere il primo codice di gioco.

Copertura minima **80 %** su righe, funzioni, rami e istruzioni della zona core, misurata da Vitest: sotto, la CI fallisce.
Il report appare come commento sulla PR e nel riepilogo del job `test`. La soglia si alza, non si abbassa.

Ciclo TDD in locale: `docker compose run --rm tools npm run test:watch` rilancia i test a ogni salvataggio.

## 5. Qualità automatica

Tutto gira in Docker (`compose.yaml`), niente toolchain locale su Windows, e la CI ripete gli stessi comandi.

| Strumento | Cosa fa | Quando blocca |
|---|---|---|
| **Prettier** | formattazione unica per TS, JS, JSON, YAML | CI (`format:check`); Markdown escluso: lo modificano anche non sviluppatori dal sito |
| **ESLint** | `typescript-eslint` strict e stylistic *type-checked*, `unicorn`, `sonarjs`, limiti di complessità (§1) | CI, zero warning ammessi |
| **tsc** | `strict` più `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax` | CI (`typecheck`) |
| **Vitest** | test unitari della logica di gioco (`src/**/*.test.ts`) con copertura ≥ 80 % (§4) | CI (`test`) |
| **commitlint** | titolo della PR conforme | CI (`pr-title`) |

Nuova regola o eccezione a una regola: nella PR, motivata nella descrizione. Mai `eslint-disable` senza commento che dice perché.

## 6. Pipeline (GitHub Actions)

| Workflow | Parte quando | Fa |
|---|---|---|
| `ci` | PR verso `dev`; push su `dev`, `staging`, `main` | quattro job in parallelo: `lint` (format, lint, typecheck), `test` (Vitest con soglie di copertura, report sulla PR), `build` (artefatto `dist`), `pr-title` (solo sulle PR) |
| `promote` | a mano (Run workflow) | fast-forward `dev`→`staging` o `staging`→`main`, solo con `lint`, `test`, `build` verdi sul commit. Verso `production` il job parte solo dopo l'**approvazione di Matteo** (environment `production`). Spinge con il segreto `MAINTAINER_TOKEN` (§7); il push fa partire `release` |
| `pr-triage` | PR aperta, riaperta o pronta per la review | assegna la PR al suo autore e richiede la code review di Copilot (basta il `GITHUB_TOKEN`). Matteo è richiesto come reviewer da `CODEOWNERS` |
| `release` | push su `staging`/`main` (o lanciato da `promote`) | rifà i controlli, costruisce, zippa `dist`, `semantic-release` crea tag e GitHub Release (pre-release su staging) |

**Deploy su Horizon.** Meta non offre un'API per pubblicare mondi: la pubblicazione passa dal Desktop Editor, che
compila lui (con TypeScript 4.7.4) i file `.ts` presenti nella sua "auto-sync directory",
`%USERPROFILE%\AppData\LocalLow\Meta\Horizon Worlds\<id mondo>\scripts\` (dettagli in [`stack.md`](stack.md) §3).
La prova della #6 ha confermato che un file scritto lì viene compilato e messo nel mondo in pochi secondi, e che la
pubblicazione dall'editor richiede pochi secondi. Il flusso previsto:

1. `promote` porta il commit su `staging` o `main` (qualità garantita dalla CI).
2. Chi pubblica apre nell'editor il mondo giusto: il **mondo clone** per `staging`, il **mondo principale** per `main`.
3. Porta nella auto-sync directory di quel mondo i file del ramo corrispondente: `git pull` se la cartella è un clone
   del repo, oppure lo script di copia. Il giro esatto, con i file piatti, si definisce nella #22.
4. Verifica in anteprima (anche "Preview device: Mobile") e pubblica con "Publish".

Gli script eliminati nel repo vanno cancellati anche dall'editor: la cancellazione di un file non si propaga.
Lo zip di `dist/` allegato oggi alle release non serve al mondo (ci vanno i sorgenti `.ts`): si rivede nella #22.
Il deploy resta manuale: richiede l'editor aperto sul PC di chi pubblica.

## 7. Protezione dei rami e repo pubblico

Il repo è **pubblico** proprio per poter usare i ruleset di GitHub (sul piano Free non valgono sui repo privati).
Conseguenza: qui non entrano mai cifre, quote, dati fiscali, cognomi, email personali o accordi; stanno nel repo
privato `ExhaustedTokens/team`. Il codice è visibile ma senza licenza open source: tutti i diritti riservati.

Ruleset attivi (sorgenti versionati in `.github/rulesets/`, si cambiano lì e si riapplicano):

- `dev`: solo pull request, squash merge, i check `lint`, `test`, `build` e `pr-title` verdi, **1 approvazione**,
  conversazioni risolte; niente force push né cancellazione. Gli admin del repo possono fare bypass, ma solo
  esplicitamente dal bottone della PR, e resta tracciato. Su ogni PR vengono richiesti in automatico
  Matteo come reviewer (via `CODEOWNERS`) e la code review di Copilot (workflow `pr-triage`, che assegna anche la PR al suo autore). Copilot commenta,
  non approva: l'approvazione resta di una persona.
- `staging` e `main`: nessun push diretto, si muovono solo con il workflow `promote` (e dagli admin in emergenza);
  niente force push né cancellazione.

GitHub non permette di dare il bypass all'app "GitHub Actions", quindi il `GITHUB_TOKEN` del workflow non può spingere
su `staging`/`main`. Per questo
`promote` usa il segreto **`MAINTAINER_TOKEN`**: un PAT fine-grained di Matteo, limitato a questo
repo con il solo permesso *Contents: read and write*, scadenza un anno (segnarsi il rinnovo). Senza
segreto il workflow avvisa e il push viene rifiutato dal ruleset. Se un giorno dà fastidio il rinnovo, l'alternativa è una GitHub App dell'org con
`actions/create-github-app-token`.

Chiunque abbia accesso in scrittura può lanciare `promote`, ma il PAT non deve permettere a chiunque di spingere su
`main`: il job usa gli **environment** `staging` (libero) e `production` (richiede l'approvazione di Matteo dalla pagina
del run prima di partire). Quindi: promuovere a staging lo può fare chiunque del team, in produzione decide Matteo.

Il segreto non è del repo ma degli **environment** `staging` e `production` (stesso valore in entrambi), e i due
environment accettano solo run partiti dal ramo `dev` (deployment branch policy). Così un `promote.yml` modificato su
un altro ramo non entra nell'environment e non vede il PAT, e per cambiare `promote.yml` su `dev` serve una PR approvata.
`promote` si lancia sempre con "Use workflow from: dev".

## 8. Comandi

```bash
docker compose run --rm tools npm ci                 # prima volta e dopo ogni cambio di dipendenze
docker compose run --rm tools npm run check          # format + lint + typecheck + test con copertura: quello che fa la CI
docker compose run --rm tools npm run test:watch     # ciclo TDD: rilancia i test a ogni salvataggio
docker compose run --rm tools npm test               # solo i test, una volta
docker compose run --rm tools npm run test:coverage  # test con report di copertura e soglie
docker compose run --rm tools npm run format         # sistema la formattazione
docker compose run --rm tools npm run lint:fix       # sistema quello che ESLint sa sistemare
docker compose run --rm tools npm run build          # compila in dist/
```

## 9. Issue e Definition of Done

Ogni issue deve essere sviluppabile **da chiunque, anche con un agente AI, senza fare domande**. Si scrive dal template
"Storia" (o "Bug") e ha sempre queste parti:

| Parte | Cosa contiene | Errore tipico |
|---|---|---|
| **Storia** | "Come `<ruolo>`, voglio `<cosa>`, così da `<valore>`" | descrivere la soluzione invece del bisogno |
| **Contesto** | perché adesso, cosa esiste già, link a decisioni e documenti | dare per scontato quello che sa solo chi era in call |
| **Risultato atteso** | cosa esiste alla fine, con nome e posizione (file, documento, mondo) | "sistemare le trappole" |
| **Criteri di accettazione** | caselle verificabili con un sì/no da chiunque | "fatto bene", "quando serve", "possibilmente" |
| **Task** | i passi in ordine, compresa la PR con il titolo | — |
| **Fuori scope** | cosa non si fa qui | issue che si allargano finché non si chiudono più |
| **Dipendenze** | "Bloccata da / Blocca", con i numeri | lavoro che aspetta qualcosa senza dirlo |
| **Per chi sviluppa** | ramo, file, comandi, output, cosa non toccare | — |
| **Stima e priorità** | S / M / L / XL; massima / alta / media / bassa | — |

**Definition of Done**, uguale per tutte: criteri di accettazione tutti spuntati; PR mergiata su `dev` per qualsiasi modifica al repo (codice,
documenti, configurazione, workflow); **commento finale** nella issue con l'esito in poche righe; issue chiusa e spostata su Done nella board.

**Igiene:** chi mergia una PR aggiorna il corpo delle issue collegate (stato, link al commit, cosa resta). Una issue
il cui corpo non corrisponde più alla realtà è peggio di nessuna issue. Le idee non diventano issue: vanno nel backlog (#12).
Cifre, accordi e dati personali non stanno mai qui: repo privato `team`.

**Board:** le issue nuove **non** entrano da sole nel Project #1. Chi apre una issue la aggiunge subito: dalla colonna
destra della issue, "Projects" → `maze-survival`, oppure `tools/gh-et project item-add 1 --owner ExhaustedTokens --url <link della issue>`.
Lo stato si aggiorna a mano quando si inizia (In Progress); chiudere la issue la porta su Done da sola.

**Bug: contratto diverso, più corto** (template "Bug"): passi per riprodurre, comportamento atteso (con la regola del
GDD o del documento violata), osservato, ambiente, versione, priorità, criteri di accettazione con il **test che riproduce
il bug** scritto prima del fix, e "per chi sviluppa" se si sa dove guardare. Non servono storia, contesto, task e fuori
scope: il bug è già lo scope. La Definition of Done è la stessa; il titolo della PR è `fix(<ambito>): ...` e genera una patch.
