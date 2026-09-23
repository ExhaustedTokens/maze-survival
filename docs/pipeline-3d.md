# Pipeline 3D: da Blender a Horizon

Issue #7. **Parte 1, regole e limiti dalla documentazione ufficiale Meta** (23 settembre 2026), da leggere **prima di
modellare**. **Parte 2, prova pratica** (Francesco ed Emilio): una trappola modellata, esportata, importata nel mondo di
prova di #6 e vista da telefono. Quello che la prova deve confermare è in fondo.

Fonti: solo `developers.meta.com`, lette il 23 settembre 2026, elencate in fondo.

## 1. Le regole che cambiano il modo di modellare

| Regola | Cosa vuol dire per noi |
|---|---|
| Formati: **un file FBX** con le mesh e **PNG** per le texture (8 bit per canale, lati potenza di 2, massimo 4096×4096) | niente `.blend` nel mondo: si esporta. Il `.blend` resta nel repo come sorgente |
| **"Importing animation is not currently supported"**; l'import funziona solo per modelli rigidi, senza deformazioni | lame che oscillano, botole, cannoni si animano **con gli script** (rotazioni e spostamenti), non in Blender. I pezzi mobili vanno esportati **separati** |
| **Niente normal map** ("we currently do not support normal maps") | i dettagli si fanno con la geometria o si disegnano nella texture, non si "cuociono" in una normal map |
| **Niente shader personalizzati**, **niente shader a doppia faccia** | per superfici sottili visibili dai due lati (foglie, teli) servono poligoni rivolti da entrambe le parti |
| L'illuminazione è **cotta nei colori dei vertici** | la qualità di luci e ombre dipende da quanti vertici ci sono e dove: servono vertici dove passa il confine luce/ombra; vertici troppo vicini tra mesh diverse creano macchie scure |
| Solo il **canale UV 0** è usato; le normali dei vertici sono importate | un solo set di UV per mesh |
| **Gerarchia appiattita** e **pivot centrato** all'import ("subject to change") | mettere comunque il pivot alla base dell'oggetto: Meta dice che in futuro verrà rispettato |
| **Scala reale**: le unità dell'FBX devono essere corrette | modellare in metri, 1 unità = 1 metro |
| Nomi di nodi e file: **niente** `- . , / * $ &`; niente `_` nei nomi di materiali e texture, **tranne** i suffissi speciali | `SwingingBlade`, non `swinging-blade` o `Swinging_Blade` (vedi §3) |
| Tra isole UV con colori molto diversi serve **margine**: 8 px per texture 512, 16 px per 1024, 32 px per 2048 | evita che il colore "sbavi" nella luce di rimbalzo |
| Le **texture a dettaglio fine** rendono male da vicino | stile a dettaglio basso, colori ampi; usare **trim sheet** (strisce di texture riutilizzabili) per muri e pavimenti del labirinto |
| Collisioni: si può definire nell'FBX un **collider semplice** (Box, Sphere, Capsule, Mesh), che diventa un'entità solo di collisione | ogni trappola con una mesh complessa ha anche un collider semplice: prestazioni migliori e colpi più prevedibili |

## 2. Il mondo va creato "custom model world"

- Un mondo fatto con le **forme primitive** dell'editor e un mondo con **modelli importati** sono due tipi diversi:
  "You cannot convert a primitive asset world into a custom model world".
- Nel custom model world le primitive si usano **solo per il greybox** (abbozzare il labirinto), non per il mondo finale.
- Oggetti generati a runtime da asset che contengono primitive o entità statiche rompono luci e prestazioni.

**Conseguenza**: il mondo di prova di #6 e il mondo del gioco vanno creati **subito** come custom model world.
Il labirinto del prototipo si abbozza con primitive, poi muri e pavimenti diventano moduli Blender.

## 3. Materiali e nomi delle texture

Il **tipo di materiale** si sceglie con il **suffisso del nome del materiale** nell'FBX; le texture si chiamano come il
materiale più il suffisso dei canali. `NomeMateriale` è un segnaposto.

| Materiale (suffisso nell'FBX) | Texture | Canali | Uso tipico da noi |
|---|---|---|---|
| PBR standard (nessun suffisso) | `NomeMateriale_BR.png` | colore base (sRGB) + rugosità | muri, pavimenti, trappole |
| Metallo (`_Metal`) | `NomeMateriale_BR.png` | come sopra, metallicità = 1 | lame, cannoni |
| PBR a due texture | `_BR.png` + `NomeMateriale_MEO.png` | + metallicità, emissione, occlusione | parti che si illuminano (pulsanti delle trappole) |
| Non illuminato (`_Unlit`) | `NomeMateriale_B.png` | solo colore base | cartelli, segnali sempre leggibili |
| Non illuminato con trasparenza (`_Blend`) | `NomeMateriale_BA.png` | colore + alfa | effetti, aloni |
| Trasparente (`_Transparent`) | `_BR.png` + `NomeMateriale_MESA.png` | + metallo, emissione, speculare, alfa | vetri |
| Ritagliato (`_Masked`, `_MaskedVXM`) | `NomeMateriale_BA.png` | colore + alfa, taglio a 0,5 | grate, recinzioni |
| Colore ai vertici (`_VXC`) | nessuna | solo colore dei vertici | oggetti semplici, gradienti |
| Colore ai vertici × texture (`_VXM`) | `_BR.png` (+ `_MEO.png`) | colore dei vertici moltiplicato per la texture | stessa texture in colori diversi (varianti delle trappole) |
| Interfaccia (`_UIO`) | `NomeMateriale_BA.png` | colore + alfa, non illuminato | testi e icone nel mondo |

Esempio corretto: materiale `SwingingBlade_Metal`, texture `SwingingBlade_BR.png` (il suffisso `_Metal` non entra nel
nome della texture). Più materiali per mesh sono ammessi e più mesh possono condividere un materiale.

## 4. Budget

**Limiti ufficiali** (valgono per tutto il mondo, vedi anche `docs/stack.md` §6):

| Cosa | Valore Meta |
|---|---|
| Oggetto di circa 1 m³ | 1.000 poligoni, 500 vertici, texture 512×512 |
| Oggetto di circa 5 m³ | 2.000 poligoni, 1.000 vertici, texture 2048×2048 |
| Singola mesh | 12.000 poligoni massimo consigliato, 400.000 vertici massimo |
| Mondo, a runtime | 600.000 vertici (molto gameplay) / 1 milione (statico); draw call 150–200 (le pagine Meta non concordano) |
| Mondo, download | 200.000 vertici unici, 40 megapixel di texture (≈ 25 MB) per un mondo con molto gameplay |
| Oggetti con mesh | 3.000 |

**Budget proposto per maze-survival** (da confermare con la prova, criterio della #7):

| Asset | Poligoni | Texture | Materiali |
|---|---|---|---|
| Trappola piccola (lama, botola, pulsante) | ≤ 1.000 | una 512×512 `_BR` | 1 |
| Trappola grande (cannone, pedana mobile) | ≤ 2.000 | una 1024×1024 `_BR` | 1–2 |
| Modulo di muro o pavimento del labirinto | ≤ 500 | trim sheet condiviso 2048×2048 | 1 condiviso |
| Mondo intero | ≤ 150.000 vertici unici, ≤ 30 megapixel di texture | | |

Il budget del mondo sta sotto il limite Meta per lasciare spazio ad avatar, interfaccia ed effetti. I muri condividono
un'unica trim sheet così il labirinto costa quasi solo geometria.

## 5. Come si importa

Dal Desktop Editor: **Asset Library → My Assets → Add New → 3D Model**, selezionare **insieme** l'FBX e tutti i suoi
PNG → **Import** → trascinare l'asset nella scena. In alternativa si può caricare da `horizon.meta.com` (cartella →
import → trascinare FBX e texture). Dopo la pubblicazione, un mondo con modelli importati impiega "one to two minutes"
per la cache.

## 6. Nel repo

```
assets/
  traps/
    swinging-blade/          ← cartella in inglese, minuscolo, trattini
      SwingingBlade.blend     ← sorgente Blender
      SwingingBlade.fbx       ← export per Horizon
      SwingingBlade_BR.png    ← texture
```

I file binari sono già dichiarati in `.gitattributes` e Prettier ignora `assets/`. Limite per file: 10 MB, oltre si
apre una issue per Git LFS prima di caricarlo.

## 7. Da verificare nella prova pratica (parte 2)

1. **Impostazioni di export FBX da Blender**: la documentazione Meta dice solo di impostare correttamente le unità (con
   esempi per Houdini e Maya). Vanno trovati e scritti qui i valori che funzionano: scala, assi, cosa includere.
2. Che una trappola con **materiale `_Metal` e una texture `_BR`** si importi con l'aspetto atteso.
3. Che un **collider semplice** definito nell'FBX venga riconosciuto (guida "Collider Ingestion", non ancora letta nel
   dettaglio).
4. Come appare la trappola **da telefono** (screenshot nella PR), con poligoni e peso del file annotati.
5. Confermare o correggere il **budget del §4**.
6. Emilio rifà l'import seguendo solo questo documento e scrive nella PR dove si è bloccato.

## Fonti

Tutte su `developers.meta.com`, lette il 23 settembre 2026. Prefisso comune: `https://developers.meta.com/horizon-worlds/documentation/desktop-editor/`.

- Getting started with 3D model import: `custom-model-import/getting-started-with-custom-model-import/`
- Creating a Custom Model: `custom-model-import/creating-custom-models-for-horizon-worlds/creating-a-custom-model/`
- Best practices for custom models: `custom-model-import/creating-custom-models-for-horizon-worlds/best-practices/`
- Materials Guidance and Reference for Custom Models: `custom-model-import/creating-custom-models-for-horizon-worlds/materials-guidance-and-reference-for-custom-models/`
- Collider Ingestion User Guide: `custom-model-import/creating-custom-models-for-horizon-worlds/collider-ingestion-user-guide/`
- Performance limits for a World: `performance-best-practices-and-tooling/performance-limits-for-a-world/`
- World Capacity dialog: `desktop-editor/getting-started/world-capacity/`
