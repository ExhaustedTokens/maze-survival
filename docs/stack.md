# Stack di sviluppo per Horizon Worlds

Issue #6. **Parte 1, ricerca sulla documentazione ufficiale Meta** (23 settembre 2026): cosa dice Meta su strumenti,
script, test, pubblicazione, limiti e collaborazione. **Parte 2, prova pratica** (installazione, mondo di prova su
mobile e web, tempi reali): da fare sul PC di Matteo, le domande aperte sono in fondo.

Fonti: solo `developers.meta.com`, elencate in fondo e lette il 23 settembre 2026. Dove la documentazione è vecchia o
si contraddice, lo scrivo.

## 1. Strumenti

- **Desktop Editor**: "the integrated game development environment for Worlds", gratuito, **solo Windows**. Dentro
  l'editor si costruisce la scena, si scrivono gli script, si fa l'anteprima e si pubblica. Meta lo paragona a Unity.
- **Strumenti VR**: "VR creation tools for Worlds are legacy tools. We strongly recommend using the desktop editor".
  Per noi irrilevanti: Worlds è ormai quasi solo mobile (vedi `docs/creator-program.md`).
- **Script in TypeScript**, scritti in un IDE esterno (VS Code di default, qualsiasi IDE installato su Windows).
- **Modelli 3D importati** (FBX + PNG): dettagli in `docs/pipeline-3d.md` (issue #7).
- **Strumenti AI dentro l'editor**: assistente per il codice (modelli "Llama" e "Specialist", addestrato su TypeScript e
  sulle API di Worlds), generazione di audio, texture e metadati degli asset. Nel 2025 la generazione AI era "coming
  soon to the European Union": disponibilità in Italia **da verificare** nella prova.
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

**TypeScript 4.7.4 è un problema per il nostro tooling.** Il repo usa TypeScript 5.9 con opzioni che la 4.7 non
conosce (`verbatimModuleSyntax`), e il codice potrebbe usare sintassi 5.x (`satisfies`, parametri `const`) che l'editor
rifiuterebbe. Non è chiaro se la pagina sia aggiornata: esiste anche una "TypeScript API v2.0.0" di Horizon. Va
verificato quale compilatore usa davvero l'editor (vedi §8). Se è ancora la 4.7.4, proposta: il codice che finisce nel
mondo (`src/core` e `src/horizon`) si scrive in sintassi compatibile con la 4.7, e la CI aggiunge un controllo di tipi
con `typescript@4.7.4` su quei file, lasciando la 5.x per lint e test.

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

**Cosa significa per noi** (proposta, da confermare con la prova):

| Nostro concetto | In Horizon |
|---|---|
| repo `maze-survival`, ramo `dev` | codice sorgente e storia; si lavora fuori dalla auto-sync directory |
| ambiente `staging` | un **mondo clone** privato: la sua auto-sync directory fa `git pull` di `staging` |
| ambiente `production` | il **mondo principale** pubblicato: la sua auto-sync directory fa `git pull` di `main` |
| "deploy" | `git pull` nella auto-sync directory del mondo giusto, a editor aperto, poi "Publish" |

Due conseguenze sulla pipeline attuale:

- **L'editor compila lui il TypeScript**: nel mondo entrano i file `.ts`, non i `.js` compilati. Lo zip di `dist/` che
  oggi `release` allega alla GitHub Release non serve al mondo. Serve la cartella dei sorgenti al tag di release. Da
  sistemare dopo la prova (issue di follow-up).
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

## 5. Pubblicazione

- Impostazioni del mondo: **"Available Through Web and Mobile"** (attivo di default) e **"Optimized for Web and
  Mobile"** (spento di default, da accendere dopo averlo provato su mobile). Hanno effetto subito sulla versione pubblicata.
- Immagini richieste (solo `.jpg`): `WORLD_AppSquare.jpg` 800×800, `WORLD_App_16_9.jpg` 1920×1080,
  `WORLD_Web_16_9.jpg` 1920×1080, `WORLD_Web_4_3.jpg` 560×420, `WORLD_App_Gallery1..6.jpg` 858×480.
- Per un mondo con modelli importati, dopo la pubblicazione servono "one to two minutes" di caching; se fallisce si
  ripubblica. Tempo di pubblicazione complessivo: **da misurare** nella prova.

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

## 8. Da verificare nella prova pratica (parte 2, Matteo)

1. Installare l'editor, annotare versione e percorso della **auto-sync directory**.
2. Creare il mondo come **"custom model world"**. Un mondo di forme primitive non si converte dopo, e i modelli
   Blender servono (vedi `docs/pipeline-3d.md`).
3. Aggiungere lo script di prova (un pulsante che cambia colore o testo), pubblicare, provarlo **da telefono e da web**,
   misurare il tempo di pubblicazione.
4. **Quale TypeScript usa l'editor** (4.7.4 o più recente) e come fornisce i tipi di `horizon/core` alla cartella:
   decide come configuriamo `tsconfig` e la CI (§2).
5. Se la auto-sync directory accetta **sottocartelle** (`core/`, `horizon/`) o solo file piatti, e come si importano gli
   script tra loro: decide la struttura di `src/`.
6. Provare il giro Git del §3: auto-sync directory del mondo clone collegata a un clone del repo, `git pull`, script
   aggiornato nel mondo.
7. Se nell'editor italiano compaiono gli strumenti AI e cosa sono Horizon Studio e gli strumenti in early access.

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
