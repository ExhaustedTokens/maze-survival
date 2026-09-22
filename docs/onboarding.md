# Onboarding

Per chi entra nel progetto. Scritto pensando a chi non ha mai usato GitHub: se una cosa non torna, chiedi su Discord, nessuna domanda è stupida.

## 1. Cosa ti serve

1. Un account **GitHub** (gratis, github.com). Manda a Matteo il tuo nome utente: ti arriva un invito all'org **ExhaustedTokens**, accettalo.
2. **Discord**, nel canale del progetto: per le chiacchiere e le domande veloci.
3. **Claude Code** (l'assistente AI da terminale): serve un abbonamento Claude. Installazione e primo avvio: https://claude.com/claude-code

## 2. GitHub in cinque righe

- Un **repo** è la cartella condivisa del progetto: questo è `ExhaustedTokens/maze-survival`.
- Una **issue** è un compito: ha un titolo, una descrizione, una persona assegnata, e si chiude quando è fatto. Tutto il lavoro passa da lì.
- La **board** (il Project dell'org) mostra le issue in colonne: da fare, in corso, fatto. È il posto dove si vede a che punto siamo.
- Un **branch** è una copia di lavoro dove modifichi le cose senza rompere la versione buona (`main`). Una **pull request** (PR) è la richiesta di portare il tuo lavoro su `main`: Matteo la guarda e la unisce.
- I file di documentazione (`docs/`) si possono modificare direttamente su `main`, anche dal sito di GitHub con la matita.

## 3. Come si lavora su un compito

1. Prendi una issue dalla board (o chiedi a Matteo quale).
2. Scrivi un commento nella issue quando inizi e quando hai finito, con il risultato (un file, uno screenshot, un link).
3. Se il compito produce file (un modello Blender, un documento), finiscono nel repo tramite branch e PR. Se non sai come, chiedi a Matteo: la prima volta si fa insieme.

## 4. Claude Code in pratica

- Apri il terminale **nella cartella del repo** e lancia `claude`. Legge da solo il file `CLAUDE.md`, quindi sa già cos'è il progetto e le regole.
- Parla in italiano, come a un collega: "spiegami cosa c'è in questa issue", "aiutami a esportare questo modello da Blender con pochi poligoni", "apri una PR con questo file".
- Prima di fare cose su GitHub (creare issue, PR, commit), Claude chiede conferma: leggi cosa sta per fare.
- Sui limiti di token: i piani base si esauriscono; le cose lunghe o tecniche passano da Matteo.

## 5. Blender e Horizon

La pipeline da Blender a Horizon Worlds (formati, limiti di poligoni e texture per mobile) viene documentata
nella issue di Fase 1 dedicata. Fino ad allora: modelli semplici, pochi poligoni, una texture per oggetto.
