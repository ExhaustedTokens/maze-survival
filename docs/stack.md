# Stack di sviluppo per Horizon Worlds

Issue #6. **Parte 1, ricerca sulla documentazione ufficiale Meta** (23 settembre 2026): cosa dice Meta su strumenti,
script, test, pubblicazione, limiti e collaborazione. **Parte 2, prova pratica** (24 settembre 2026, PC di Matteo):
installazione, mondo di prova con uno script, pubblicazione e prova da telefono e da web. I risultati della prova sono
marcati **✅ verificato** e riassunti al §8.

Fonti: `developers.meta.com`, elencate in fondo e lette il 23 settembre 2026, più quello che abbiamo visto nell'editor.
Dove la documentazione è vecchia o si contraddice, lo scrivo.

## 1. Strumenti

- **Desktop Editor**: "the integrated game development environment for Worlds", gratuito, **solo Windows**. Dentro
  l'editor si costruisce la scena, si scrivono gli script, si fa l'anteprima e si pubblica. Meta lo paragona a Unity.
- **Strumenti VR**: "VR creation tools for Worlds are legacy tools. We strongly recommend using the desktop editor".
  Per noi irrilevanti: Worlds è ormai quasi solo mobile (vedi `docs/creator-program.md`).
- **Script in TypeScript**, scritti in un IDE esterno (VS Code di default, qualsiasi IDE installato su Windows).
- **Modelli 3D importati** (FBX + PNG): dettagli in `docs/pipeline-3d.md` (issue #7).
- **Strumenti AI dentro l'editor**: assistente per il codice (modelli "Llama" e "Specialist", addestrato su TypeScript e
  sulle API di Worlds), generazione di audio, texture e metadati degli asset. **✅ verificato**: dall'Italia l'editor
  mostra il pannello **"Gen AI" (Beta)** con "Generate an environment", "Generate 3D models", "Generate a sky",
  "Generate a texture", "Generate sound effects", "Generate ambient audio" e "Generate code and set up gameplay". Non
  ancora provati.
- **Meta Horizon Studio (Beta)** e **"early access tooling"**: citati nella pagina ufficiale dei bonus, ma nessuna
  documentazione pubblica li descrive. Non sappiamo se sostituiranno il Desktop Editor né quando: **da verificare**.
  Per ora l'unico strumento documentato e aperto a tutti è il Desktop Editor.

## 2. Requisiti

| Cosa | Requisito | Fonte |
|---|---|---|
| Sistema | "Windows 10 and up, Intel i5-4590 and up, 8 GB+ RAM" | [Install] |
| Account | account Meta Horizon Worlds, età 13+ per usare l'editor (18+ per monetizzare, vedi `docs/creator-program.md`) | [Install] |
| IDE | VS Code consigliato, da installare a parte | [Install], [Script] |
| TypeScript | "The Meta Horizon Worlds desktop editor requires TypeScript version **4.7.4** when creating or editing scripts" | [TS] |
| Visore | facoltativo (Quest Link solo per provare in VR, che non ci serve) | [Install] |

**✅ verificato: l'editor usa davvero TypeScript 4.7.4.** Nella cartella degli script di ogni mondo (§3) l'editor
crea:
- un `package.json` con `"typescript": "4.7.4"`, installato in `node_modules`;
- un `.vscode/settings.json` che fa usare a VS Code proprio quella versione;
- un `tsconfig.json` con `strict`, `module: CommonJS`, `target`/`lib: ES2020` e `typeRoots: ["types/"]`;
- una cartella `types/` con le dichiarazioni dei moduli `horizon/core`, `horizon/ui`, `horizon/camera`,
  `horizon/analytics`, `horizon/navmesh`, `horizon/performance`, `horizon/unity_asset_bundles`
  (`ApiVersion = "2.0.0"`).

Conseguenze per noi:
- il codice che finisce nel mondo va scritto in **sintassi TypeScript 4.7**: niente `satisfies`, parametri `const` o
  altre novità 5.x;
- il nostro tooling (TypeScript 5.9 con `verbatimModuleSyntax`) va affiancato da un controllo con `typescript@4.7.4`;
- controllando uno script con i tipi dell'editor, i file `.d.ts` di Meta danno 429 errori propri (TS1038 e simili)
  che spariscono con `skipLibCheck`. Lo script di prova compila con 0 errori;
- la logica pura (`src/core`) non importa moduli `horizon/*`, quindi si può controllare in CI senza copiare nel repo
  i tipi di Meta.

Il lavoro sul tooling è nella #22.

## 3. Dove vive il codice

Dalla pagina "Recommended Version Control Strategies":

- L'editor scrive tutti gli script del mondo in una cartella locale, la **"auto-sync directory"**, e la tiene
  sincronizzata con il mondo **nei due sensi**: se modifichi un file lì, la modifica va nel mondo; se un collaboratore
  modifica uno script, il file locale viene sovrascritto.
- Meta stessa lo paragona a Git senza controllo: "every time one of your teammates updates a script file locally, it's
  immediately force-pushed to the main branch of your repository".
- Per i team **Meta raccomanda Git**, con queste regole:
  1. lavorare in una cartella **diversa** dalla auto-sync directory, così le modifiche degli altri non sovrascrivono le tue;
  2. portare le modifiche nel mondo con una **pull request** sul ramo principale, poi un `git pull` **dentro** la auto-sync
     directory;
  3. usare **mondi clone come rami**: si modifica e si prova in un clone del mondo, poi si passa al mondo principale.
- Con gli script "file-backed" (default per i mondi nuovi) gli script stanno sul server con un ID; i cloni mantengono gli
  stessi ID. Quando si porta un clone nel mondo principale conta l'ordine: prima aggiornare gli asset nel clone, poi
  trascinare gli asset nel mondo principale, **poi** fare il pull del codice. Al contrario si creano script duplicati.
- Il mondo ha **backup in cloud** a intervalli regolari e si può ripristinare un backup dal Developer Dashboard.

**✅ Verificato nella prova:**

- La auto-sync directory è `%USERPROFILE%\AppData\LocalLow\Meta\Horizon Worlds\<id del mondo>\scripts\`. L'id del
  mondo compare nella barra del titolo dell'editor e nell'indirizzo `horizon.meta.com/world/<id>/`.
- La cartella contiene già un **`.gitignore`** (`.backups/`, `.operations.log`) e un file **`.editor`** con l'indice
  degli script (nome → hash): Meta la prevede sotto Git.
- **Cartella → mondo**: un file `.ts` scritto nella cartella, anche da fuori dall'editor, viene preso, compilato e messo
  nel mondo in **3–5 secondi** ("Scheduling 1 scripts to compile and execute").
- **Niente sottocartelle**: un file in `scripts/probe/` è stato ignorato, lo stesso file in `scripts/` è stato registrato
  in 3 secondi. Solo **file piatti**, e il **nome del file è il nome del modulo** (`import { x } from 'NomeScript'`).
- **Le cancellazioni non si propagano bene**: cancellando il file dalla cartella, l'editor prova a scaricare lo script
  ("Failed to unregister … may only exist in the build registry") ma lo lascia nel suo indice. Gli script si cancellano
  **dall'editor** (Scripts → ⋮ → Delete).
- C'è anche una cartella `editor_scripts/`, con tipi separati (`horizon_editor.d.ts`): non ci serve per ora.

**Cosa significa per noi** (proposta, confermata in parte dalla prova; le parti aperte sono nella #22):

| Nostro concetto | In Horizon |
|---|---|
| repo `maze-survival`, ramo `dev` | codice sorgente e storia; si lavora fuori dalla auto-sync directory |
| ambiente `staging` | un **mondo clone** privato: la sua auto-sync directory fa `git pull` di `staging` |
| ambiente `production` | il **mondo principale** pubblicato: la sua auto-sync directory fa `git pull` di `main` |
| "deploy" | `git pull` nella auto-sync directory del mondo giusto, a editor aperto, poi "Publish" |

Due conseguenze sulla pipeline attuale:

- **L'editor compila lui il TypeScript**: nel mondo entrano i file `.ts`, non i `.js` compilati. Lo zip di `dist/` che
  oggi `release` allega alla GitHub Release non serve al mondo. Serve la cartella dei sorgenti al tag di release. Da
  sistemare nella #22.
- **Niente sottocartelle nel mondo**: la divisione `src/core` / `src/horizon` di `docs/sviluppo.md` §4 resta come regola
  logica, ma nel mondo i file devono arrivare **piatti e con nomi unici**. Serve una struttura del repo compatibile
  (o uno script che la appiattisce) e import per nome di modulo, non per percorso: decisione nella #22.
- Il deploy **non si può automatizzare dalla CI**: richiede la auto-sync directory sul PC di chi pubblica, con l'editor
  aperto. La CI resta il cancello di qualità (lint, test, tipi); il passo finale è manuale e va scritto come checklist.

## 4. Test

- **Anteprima nell'editor** (tasto Play): si entra nel mondo dal punto di spawn. La "Preview device" simula il
  **mobile** (iPhone o Samsung, verticale od orizzontale, con le zone sicure per l'interfaccia). "Preview from here"
  parte da un punto scelto della scena.
- **Su telefono vero**: "Send Link to Mobile" manda un link all'app Meta Horizon; "Open in Browser" e "Copy Web Link"
  aprono la versione web. Vincolo: "You must publish your world at least once before you can preview on web or mobile".
- In alternativa, da `horizon.meta.com` → Creator Tools → dettagli del mondo → "Open preview version" (anche per le bozze).
- Log: gli script scrivono nella console dell'editor. Per le prestazioni ci sono metriche in tempo reale, "scrubbing"
  (ultimi 30 secondi circa) e tracce esportabili in Perfetto, anche da web e mobile.
- **Test automatici**: la documentazione non parla di test unitari. La nostra regola (logica pura in `src/core`
  testata con Vitest, adattatori sottili in `src/horizon`) resta l'unico modo di avere test automatici.

**✅ Verificato nella prova** (script di prova: una zona trigger che, quando entra un giocatore, mostra un messaggio e
aggiorna un testo):

- **Anteprima nell'editor**: lo script gira, il trigger rileva l'avatar a ogni ingresso.
- **Telefono** (app Meta Horizon, dal link del mondo pubblicato): funziona, con joystick e tasto salto. Il primo
  ingresso subito dopo la pubblicazione è rimasto bloccato su "Completamento…": è bastato riprovare.
- **Web** (browser del PC): funziona.
- **La Console dell'editor non si è caricata** ("Unable to Load Content – Something went wrong"), quindi i
  `console.log` non si vedevano. Canale di debug alternativo: `this.world.ui.showPopupForPlayer(player, testo, secondi)`,
  un messaggio sovrimpresso visibile ovunque si guardi.
- Il **Text gizmo ha una sola faccia**: visto da dietro il testo appare speculare. Per cartelli e indicazioni nel
  labirinto va orientato verso chi guarda.
- Se si ricrea un'entità (per esempio il Text), le proprietà degli script che la referenziavano restano vuote e vanno
  ricollegate a mano.

## 5. Pubblicazione

- Impostazioni del mondo: **"Available Through Web and Mobile"** (attivo di default) e **"Optimized for Web and
  Mobile"** (spento di default, da accendere dopo averlo provato su mobile). Hanno effetto subito sulla versione pubblicata.
- Immagini richieste (solo `.jpg`): `WORLD_AppSquare.jpg` 800×800, `WORLD_App_16_9.jpg` 1920×1080,
  `WORLD_Web_16_9.jpg` 1920×1080, `WORLD_Web_4_3.jpg` 560×420, `WORLD_App_Gallery1..6.jpg` 858×480.
- Per un mondo con modelli importati, dopo la pubblicazione servono "one to two minutes" di caching; se fallisce si
  ripubblica.

**✅ Verificato nella prova** (finestra "World settings and publish" dell'editor):

- Il banner in cima dice **"Starting June 15, 2026, new VR world publishing will no longer be available"**: conferma
  ufficiale, dentro lo strumento Meta, della fine della pubblicazione in VR.
- **Immagini**: le misure sono cambiate rispetto alla pagina di documentazione. Servono tre immagini, 16:9 **2560×1440**,
  quadrata **1440×1440** e verticale 9:16 **810×1440**, massimo 4 MB ciascuna. Quella verticale fa anche da sfondo
  alla schermata di caricamento su telefono.
- **Campi obbligatori**: nome, **rating** (questionario sul pubblico: "general audience" 13+, tutte le età, under 13,
  oppure "restricted" 18+; il nostro test è risultato "ages 10+"), genere, tipo ("Game world"), numero di giocatori,
  disponibilità (**"Mobile and web only"** di default) e comfort rating. Meta avvisa che può rivedere il rating.
- **Tempo di pubblicazione**: pochi secondi.
- Dopo la pubblicazione il mondo ha una **pagina pubblica** (`horizon.meta.com/world/<id>/`) visibile anche senza login,
  con autore, età, piattaforma e **"Fino a 8 persone"**: il numero massimo di giocatori predefinito è **8**, si cambia
  nelle impostazioni del mondo (massimo 32, §6).
- Nella finestra non c'era un'opzione di visibilità (privato / non in elenco): il mondo pubblicato è pubblico. Per un
  mondo di staging va verificato come tenerlo privato (bozza con tester invitati, o "Preview" senza pubblicare).
- Il **pubblico dichiarato** (13+, tutte le età, under 13) cambia chi trova il mondo e, probabilmente, cosa si può
  vendere: è una scelta di prodotto da fare nel GDD (#9).

## 6. Limiti

| Limite | Valore | Fonte |
|---|---|---|
| Oggetti con mesh | 3.000 (limite rigido) | [Capacity dialog] |
| Simulazione e animazione | 4,2 ms totali: ogni oggetto in movimento 0,0121 ms, trigger 0,002 ms, fisica 0,008 ms, testo 0,0035 ms, VFX 0,0059–0,1 ms | [Capacity dialog] |
| Giocatori | il costo va da 0 ms (1–4 giocatori) a 2,8 ms (20–32 giocatori): massimo **32** per istanza | [Capacity dialog] |
| Vertici (dialog di capacità) | 125.000 | [Capacity dialog] |
| Vertici a runtime | 600.000 (mondo con molto gameplay), 1 milione (mondo statico) | [Performance limits] |
| Draw call | 200 / 550 secondo "Performance limits"; 150 / 250 secondo "Best practices for custom models": le due pagine non concordano, conviene il valore più basso | [Performance limits], [Custom model best practices] |
| Download (tempi di viaggio) | vertici unici 200k / 400k; texture 40 / 80 megapixel (40 MP ≈ 25 MB) | [Performance limits] |
| Suoni | 15.000 KB | [Capacity dialog] |
| Classifiche | 3 consigliate | [Performance limits] |
| Memoria | 6 GB in modalità modifica su Quest (regola del 2024, VR) | [Memory limits] |

Per pubblicare, il mondo deve restare sotto il 100 % in oggetti, complessità geometrica, simulazione e suoni.
**Nota**: i 125.000 vertici del dialog e i 600.000 della pagina prestazioni misurano probabilmente cose diverse (forme
primitive contro modelli importati). Vale il dialog dell'editor, da guardare nella prova.

Per il nostro gioco contano soprattutto: **32 giocatori al massimo** e **4,2 ms di simulazione**, dove ogni trappola
che si muove costa. Un labirinto con pareti mobili va progettato con pochi oggetti dinamici.

## 7. Collaborazione

- Ruoli: **Editor** (modifica tutto, non pubblica) e **Tester** (visita il mondo non pubblicato, non modifica). Solo il
  proprietario del mondo (Matteo, titolare dell'account) pubblica.
- Si modifica in tempo reale in più persone. Meta avverte: se due persone modificano lo stesso asset insieme, una
  sovrascrive l'altra. Stessa cosa per gli script, attraverso la auto-sync directory (vedi §3).
- Inviti: dall'editor, menu Collaborators → Invite people.
- Proposta: Francesco ed Emilio come **Editor** nel mondo clone di staging e come **Tester** in quello principale.

## 8. Esito della prova pratica (24 settembre 2026)

| # | Verifica | Esito |
|---|---|---|
| 1 | Installare l'editor, versione e percorso della auto-sync directory | ✅ editor **v284.0.0.1.239** (installer MSI firmato "Meta Platforms, Inc.", circa 805 MB); cartella al §3 |
| 2 | Mondo come "custom model world" | ⚠️ l'editor non ha chiesto il tipo di mondo: i mondi nuovi del Desktop Editor sembrano già di quel tipo (le primitive sono "the legacy way"). Si conferma importando il primo FBX (#7) |
| 3 | Script di prova, pubblicazione, telefono e web, tempo di pubblicazione | ✅ tutto funziona (§4, §5); pubblicazione in pochi secondi |
| 4 | Versione di TypeScript e tipi di `horizon/*` | ✅ TypeScript **4.7.4**, API **2.0.0**, tipi in `types/` (§2) |
| 5 | Sottocartelle e import tra script | ✅ **solo file piatti**; import per nome del modulo (§3) |
| 6 | Giro Git nella auto-sync directory | ⏳ spostato nella #22: la sincronizzazione cartella → mondo di file scritti da fuori è confermata, il giro completo con un clone del repo e un mondo clone no |
| 7 | Strumenti AI e Horizon Studio | ✅ pannello "Gen AI" (Beta) disponibile dall'Italia; Horizon Studio ed "early access tooling" restano senza documentazione pubblica |

**Problema incontrato: schermo nero al primo avvio.** L'editor è rimasto nero per un login interrotto e per i resti di
una vecchia installazione Oculus. Sintomi, causa e soluzione (reinstallazione pulita) sono nel commento della #6
"Nota per chi installa il Desktop Editor", da leggere prima di installarlo.

**Follow-up** (#22): allineare il tooling a quanto verificato, cioè controllo con TypeScript 4.7.4 in CI,
struttura dei file piatta con import per nome di modulo, release con i sorgenti `.ts` al posto dello zip di `dist/`,
script di sincronizzazione verso la auto-sync directory e prova del giro Git completo con un mondo clone.

## Fonti

Tutte su `developers.meta.com`, lette il 23 settembre 2026. Prefisso comune: `https://developers.meta.com/horizon-worlds/documentation/desktop-editor/`.

- [Tools overview]: `get-started/tools-overview/`
- [Install]: `get-started/install-desktop-editor/`
- [TS] Managing TypeScript: `typescript/getting-started/managing-typescript/`
- [Script] Adding and editing scripts: `desktop-editor/getting-started/adding-and-editing-scripts/`
- [VCS] Recommended Version Control Strategies: `typescript/recommended-version-control-strategies/`
- [File-backed] Use file-backed scripts: `vr-creation/scripting/use-file-backed-scripts/`
- [Project structure]: `desktop-editor/getting-started/project-structure/`
- [Preview mode]: `desktop-editor/getting-started/preview-mode/`
- [Test mobile/web]: `create-for-web-and-mobile/how-to-test-on-web-and-mobile/`
- [Publish mobile]: `create-for-web-and-mobile/publishing-worlds-on-mobile/`
- [Collaborators]: `desktop-editor/getting-started/collaborator-management/`
- [Capacity dialog] World Capacity dialog: `desktop-editor/getting-started/world-capacity/`
- [Capacity limits] Creator capacity limits: `save-optimize-and-publish/capacity-limits-in-horizon/`
- [Performance limits]: `performance-best-practices-and-tooling/performance-limits-for-a-world/`
- [Memory limits]: `performance-best-practices-and-tooling/memory-limits-in-horizon-worlds/`
- [Custom model best practices]: `custom-model-import/creating-custom-models-for-horizon-worlds/best-practices/`
- [Custom model getting started]: `custom-model-import/getting-started-with-custom-model-import/`
- Note di rilascio (ultima elencata: "Meta Horizon v250"): `https://developers.meta.com/horizon-worlds/release-notes/`
- Horizon Studio Beta ed "early access tooling" citati in: `mhcp-program/monetization/bonus-program-overview/`

<!-- Definizioni dei link usati nelle tabelle: GitHub le rende cliccabili, non compaiono nel testo. -->
[Tools overview]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/get-started/tools-overview/
[Install]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/get-started/install-desktop-editor/
[TS]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/typescript/getting-started/managing-typescript/
[Script]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/desktop-editor/getting-started/adding-and-editing-scripts/
[VCS]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/typescript/recommended-version-control-strategies/
[File-backed]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/vr-creation/scripting/use-file-backed-scripts/
[Project structure]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/desktop-editor/getting-started/project-structure/
[Preview mode]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/desktop-editor/getting-started/preview-mode/
[Test mobile/web]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/create-for-web-and-mobile/how-to-test-on-web-and-mobile/
[Publish mobile]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/create-for-web-and-mobile/publishing-worlds-on-mobile/
[Collaborators]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/desktop-editor/getting-started/collaborator-management/
[Capacity dialog]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/desktop-editor/getting-started/world-capacity/
[Capacity limits]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/save-optimize-and-publish/capacity-limits-in-horizon/
[Performance limits]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/performance-best-practices-and-tooling/performance-limits-for-a-world/
[Memory limits]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/performance-best-practices-and-tooling/memory-limits-in-horizon-worlds/
[Custom model best practices]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/custom-model-import/creating-custom-models-for-horizon-worlds/best-practices/
[Custom model getting started]: https://developers.meta.com/horizon-worlds/documentation/desktop-editor/custom-model-import/getting-started-with-custom-model-import/
