# AGENTS.md — ASD Judo Bagno a Ripoli

## 1. Scopo del file

Questo file contiene le istruzioni e il contesto permanente del progetto per Codex.

**Prima di modificare il progetto, leggere questo file e il codice esistente.**
L'obiettivo è fare modifiche mirate senza rompere il design o le funzionalità già presenti.

---

## 2. Panoramica del progetto

Questo è il sito web dell'**A.S.D. Judo Bagno a Ripoli**.

Il sito è principalmente un sito statico, ospitato su **GitHub Pages**, con un dominio personalizzato previsto.

La maggior parte delle pagine contiene HTML + CSS e pochissima logica JavaScript.
Le parti dinamiche principali sono:

- sistema delle News;
- pannello amministratore;
- autenticazione dell'amministratore;
- controllo dello stato di manutenzione/blocco delle pagine;
- integrazione Firebase/Firestore;
- integrazione ImageKit tramite Cloudflare Worker;
- sistema eventi, attualmente predisposto ma non ancora completato.

Non introdurre framework o cambiare architettura senza una richiesta esplicita.

---

## 3. Struttura attuale del repository

La cartella principale del sito è `Sito/`.

Struttura:

```text
Sito/
├── index.html
├── news.html
├── calendario_eventi.html
├── info_e_orari.html
├── shoku_geiko.html
├── storia.html
├── unisciti_a_noi.html
├── pannello_amministratore.html
├── README.md
│
├── css/
│   ├── style.css
│   ├── home.css
│   ├── news.css
│   ├── calendario_eventi.css
│   ├── info_e_orari.css
│   ├── shoku_geiko.css
│   ├── storia.css
│   ├── unisciti_a_noi.css
│   └── pannello_amministratore.css
│
├── javascript/
│   ├── code.js
│   ├── firebase-config.js
│   ├── imagekit.js
│   ├── pagina_blocco.js
│   ├── home.js
│   ├── news.js
│   ├── calendario_eventi.js
│   ├── info_e_orari.js
│   ├── shoku_geiko.js
│   ├── storia.js
│   ├── unisciti_a_noi.js
│   └── pannello_amministratore.js
│
└── assets/
    ├── global/
    ├── home/
    ├── news/
    ├── calendario_eventi/
    ├── info_e_orari/
    ├── pannello_amministratore/
    ├── shoku_geiko/
    ├── storia/
    ├── unisciti_a_noi/
    └── documenti/
```

### Regola fondamentale sui file per pagina

Ogni pagina ha normalmente:

- un file HTML nella root di `Sito/`;
- un CSS specifico in `Sito/css/`;
- un JavaScript specifico in `Sito/javascript/`.

Esempi:

```text
index.html
css/home.css
javascript/home.js
```

```text
news.html
css/news.css
javascript/news.js
```

Il CSS comune è `css/style.css`.

Il JavaScript comune attualmente è `javascript/code.js`, che può essere usato in futuro per logica realmente condivisa.

> **Nota:** nella versione attuale la cartella si chiama `javascript/`, non `js/`. Non rinominarla senza motivo.

---

## 4. Mappa delle pagine

| Pagina | HTML | CSS specifico | JS specifico |
|---|---|---|---|
| Home | `index.html` | `css/home.css` | `javascript/home.js` |
| News | `news.html` | `css/news.css` | `javascript/news.js` |
| Calendario | `calendario_eventi.html` | `css/calendario_eventi.css` | `javascript/calendario_eventi.js` |
| Info e orari | `info_e_orari.html` | `css/info_e_orari.css` | `javascript/info_e_orari.js` |
| Shoku Geiko | `shoku_geiko.html` | `css/shoku_geiko.css` | `javascript/shoku_geiko.js` |
| Storia | `storia.html` | `css/storia.css` | `javascript/storia.js` |
| Unisciti a noi | `unisciti_a_noi.html` | `css/unisciti_a_noi.css` | `javascript/unisciti_a_noi.js` |
| Pannello amministratore | `pannello_amministratore.html` | `css/pannello_amministratore.css` | `javascript/pannello_amministratore.js` |

`pannello_amministratore.html` è un caso speciale: ha una logica autonoma e non deve essere trattato come una normale pagina statica.

---

## 5. Design e riferimento Figma

Il design originale del sito è stato realizzato in **Figma**.

Il file Figma è la principale reference visiva del progetto.

URL: `https://www.figma.com/design/SAY9r81MTW9AkVFk1o2Uxx/Sito-Judo-Design`
File Key: `SAY9r81MTW9AkVFk1o2Uxx`

La reference principale è basata su una risoluzione:

**1920 × 1080 px**

### Regola di conversione delle misure

Le misure del design Figma vengono normalmente convertite in `vw`.

Formula:

```text
valore_vw = valore_px / 1920 * 100
```

Esempio:

```text
192 px → 10vw
96 px  → 5vw
384 px → 20vw
```

Questa regola riguarda:

- larghezze;
- altezze quando derivate dal design;
- distanze;
- margini;
- padding;
- posizioni;
- dimensioni dei testi;
- dimensioni delle immagini;
- dimensioni dei pulsanti;
- coordinate degli elementi.

### IMPORTANTE

Il progetto utilizza deliberatamente un layout basato su `position: absolute` per molti elementi.

**Non sostituire arbitrariamente il sistema a posizionamento assoluto con Flexbox, Grid o un layout responsive completamente diverso.**

Il layout è stato costruito in funzione del design Figma e modifiche strutturali possono rompere l'intera pagina.

È possibile usare Flexbox/Grid solo quando il codice esistente lo utilizza già o quando serve localmente senza alterare il sistema di posizionamento della pagina.

---

## 6. Colori e tipografia

I colori principali del sito sono:

```text
Bianco: #FFFFFF
Grigio principale: #2A2A2A
```

Esistono altri grigi e colori secondari specifici per singole sezioni.
Prima di crearne di nuovi, controllare il CSS esistente.

### Font

Il font principale per i titoli e molti elementi grafici è:

```text
Dela Gothic One
```

Il CSS attuale definisce inoltre:

```text
DM Serif Text
DM Serif Display
```

come font testuali.

Controllare sempre `css/style.css` prima di introdurre nuovi font.

---

## 7. Header / selettore di pagina / footer

Le pagine condividono una struttura grafica comune.

### Selettore

In cima alle pagine è presente il selettore/navigazione del sito.

Lo stile comune è gestito principalmente da:

```text
css/style.css
```

Non duplicare lo stile del selettore nei CSS delle singole pagine se la modifica è globale.

### Footer

Il footer comune è gestito principalmente da:

```text
css/style.css
```

Contiene informazioni di contatto, loghi, informazioni del sito e altri elementi comuni.

Se una modifica riguarda il footer in tutte le pagine, modificare prima `style.css` invece di duplicare regole nei CSS specifici.

---

## 8. Assets

Tutte le immagini, SVG, loghi, forme e documenti sono in:

```text
Sito/assets/
```

Esiste una cartella `global/` per gli asset comuni.

Ogni pagina ha una propria cartella per gli asset specifici.

Esempio:

```text
assets/global/
assets/home/
assets/news/
assets/storia/
assets/shoku_geiko/
assets/unisciti_a_noi/
```

### Regola

Prima di creare un nuovo asset, verificare se ne esiste già uno compatibile.

Non duplicare immagini o SVG senza necessità.

Non spostare o rinominare asset esistenti senza verificare tutti i riferimenti HTML/CSS/JS.

---

## 9. JavaScript condiviso e specifico

`javascript/code.js` è destinato alla logica comune.

I file specifici gestiscono invece la propria pagina.

`javascript/pagina_blocco.js` è una funzionalità comune speciale: controlla in tempo reale tramite Firestore se una pagina è bloccata/manutenzione.

Le pagine normali usano un attributo:

```html
<body data-pagina="...">
```

Esempi:

```html
<body data-pagina="home">
<body data-pagina="news">
<body data-pagina="calendario_eventi">
```

Non rimuovere `data-pagina` dalle pagine che utilizzano `pagina_blocco.js`.

---

## 10. Firebase

Il progetto usa Firebase.

Configurazione client:

```text
javascript/firebase-config.js
```

Attualmente vengono utilizzati:

- Firebase App;
- Firestore;
- Firebase Authentication.

Gli import Firebase sono effettuati tramite URL CDN `gstatic`.

### Firestore

Le funzionalità dinamiche principali utilizzano Firestore.

Collezioni attualmente note:

```text
news
blocco_pagine
```

`blocco_pagine` viene usata da `pagina_blocco.js`.

`news` contiene le notizie del sito.

### Sicurezza

Non inserire mai nel repository:

- password;
- private key;
- secret del Cloudflare Worker;
- secret ImageKit;
- credenziali amministratore;
- token di autenticazione permanenti.

La configurazione client Firebase può contenere valori normalmente esposti nel frontend; non trattare comunque questo come un motivo per inserire credenziali private.

---

## 11. Sistema News

Le News sono la principale parte dinamica del sito pubblico.

La pagina:

```text
news.html
```

utilizza:

```text
javascript/news.js
css/news.css
```

Le notizie vengono recuperate da Firestore.

Il sistema attuale comprende funzionalità come:

- caricamento delle notizie;
- ordinamento;
- visualizzazione di un numero limitato iniziale;
- "carica altro";
- ricerca;
- evidenziazione dei risultati;
- apertura della notizia in formato grande;
- adattamento del testo;
- gestione delle immagini;
- navigazione tra notizie.

Il numero massimo configurato per il caricamento iniziale/aggiuntivo è attualmente:

```text
3
```

### Regola importante sugli eventi click

Le card/notizie piccole possono essere elementi cliccabili che aprono la notizia grande.

I pulsanti contenuti dentro una card devono funzionare **indipendentemente** dalla card stessa.

Quando si aggiungono o modificano pulsanti interni:

- evitare che il click venga propagato accidentalmente al contenitore;
- usare `event.stopPropagation()` quando necessario;
- non rompere il click principale della card;
- mantenere separati i comportamenti del contenitore e dei controlli interni.

Questa è una regola funzionale importante del progetto.

---

## 12. Pannello amministratore

Il pannello è:

```text
pannello_amministratore.html
```

con:

```text
css/pannello_amministratore.css
javascript/pannello_amministratore.js
```

È una pagina speciale e deve essere trattata separatamente dal normale sito pubblico.

### Accesso

Il login viene effettuato tramite un Cloudflare Worker:

```text
https://imagekit-auth.judobagnoaripoli.workers.dev/login
```

Il browser invia username/password al Worker.

Il Worker restituisce un Firebase Custom Token.

Il frontend usa quindi:

```text
signInWithCustomToken(...)
```

per autenticare l'utente su Firebase.

Le credenziali reali non devono essere inserite nel frontend.

### Funzionalità del pannello

Il pannello è progettato per gestire:

- impostazioni;
- stato di blocco/manutenzione delle pagine;
- News;
- creazione di News;
- modifica di News;
- eliminazione di News;
- visualizzazione delle News;
- caricamento immagini;
- sezione eventi.

Gli eventi sono ancora in sviluppo e non devono essere considerati una funzionalità completata.

---

## 13. ImageKit e Cloudflare Worker

Le immagini delle News non vengono archiviate direttamente in Firestore.

Il flusso attuale è:

```text
Pannello amministratore
        ↓
Cloudflare Worker
        ↓
parametri di autenticazione ImageKit
        ↓
ImageKit
        ↓
URL immagine
        ↓
Firestore (dati della News)
```

Il frontend usa un endpoint Worker per ottenere:

```text
token
signature
expire
```

e poi effettua l'upload verso ImageKit.

Endpoint attuale:

```text
https://imagekit-auth.judobagnoaripoli.workers.dev
```

Endpoint di upload ImageKit:

```text
https://upload.imagekit.io/api/v1/files/upload
```

Cartella ImageKit prevista per le News:

```text
/news
```

Limite attualmente impostato nel pannello:

```text
25 MB per immagine
```

### IMPORTANTE

Il codice del Cloudflare Worker e i suoi secret non sono presenti nella copia del repository analizzata in questo momento.

Quindi **non inventare la configurazione interna del Worker**.

Se serve modificarne il comportamento, chiedere/analizzare il codice del Worker prima di fare supposizioni.

I secret del Worker devono rimanere su Cloudflare e non devono essere copiati nel repository.

---

## 14. Regola sulle immagini e cancellazione

ImageKit e Firestore sono sistemi separati.

Una News può contenere l'URL di un'immagine ospitata su ImageKit.

Quando si modifica o elimina una News, non assumere automaticamente che cancellare il documento Firestore cancelli anche il file ImageKit.

Prima di implementare o modificare una funzione di cancellazione immagini:

1. verificare come viene identificato il file ImageKit;
2. verificare se il Worker espone un endpoint sicuro per eliminarlo;
3. verificare cosa viene salvato nel documento Firestore;
4. verificare il comportamento reale dell'attuale codice;
5. non inserire una private key ImageKit nel frontend.

Se il Worker non fornisce una funzione di cancellazione, non inventarne una lato client usando credenziali private.

---

## 15. GitHub Pages

Il sito è destinato a essere pubblicato tramite:

```text
GitHub Pages
```

con dominio personalizzato.

Il frontend deve quindi rimanere compatibile con hosting statico.

Non introdurre:

- server Node obbligatori per il sito pubblico;
- backend locale necessario per il rendering delle pagine;
- framework che richiedano un processo server;
- dipendenze non necessarie.

Firebase e Cloudflare Worker sono servizi esterni già previsti dall'architettura.

---

## 16. Regole di modifica del codice

Quando viene richiesta una modifica:

### Prima

1. Leggere il file interessato.
2. Leggere il CSS/JS collegato.
3. Controllare `style.css` se la modifica riguarda elementi comuni.
4. Controllare gli asset utilizzati.
5. Controllare eventuali dipendenze Firebase/ImageKit.
6. Cercare gli utilizzi della classe, ID o funzione prima di modificarla.

### Durante

- modificare il meno possibile;
- mantenere naming e struttura esistenti;
- non riscrivere file enormi se basta una modifica locale;
- non cambiare l'architettura senza richiesta;
- non sostituire `position: absolute` arbitrariamente;
- mantenere il riferimento Figma;
- mantenere il sistema `vw` basato su 1920 px;
- non eliminare funzionalità esistenti per risolvere un problema locale.

### Dopo

Verificare almeno:

- console JavaScript;
- import/export ES modules;
- riferimenti agli asset;
- click e propagazione degli eventi;
- comportamento della pagina interessata;
- eventuali pagine che condividono `style.css`;
- compatibilità con GitHub Pages.

---

## 17. Cosa NON fare

Non:

- introdurre React/Vue/Angular senza richiesta;
- convertire l'intero sito a Flexbox/Grid;
- sostituire il layout assoluto esistente;
- cambiare tutte le misure da `vw` a `px`;
- creare un nuovo sistema di design se ne esiste già uno;
- duplicare il footer o il selettore;
- spostare asset senza aggiornare i riferimenti;
- mettere password o secret nel frontend;
- mettere secret Cloudflare/ImageKit in Git;
- assumere che Firestore cancelli automaticamente un file ImageKit;
- modificare il comportamento delle News senza verificare anche il pannello amministratore;
- correggere una cosa rompendo una funzionalità già funzionante;
- aggiungere dipendenze inutili.

---

## 18. Priorità quando ci sono conflitti

In caso di conflitto tra una modifica richiesta e il codice esistente, seguire questa priorità:

1. Sicurezza.
2. Funzionalità esplicitamente richiesta dall'utente.
3. Comportamenti già funzionanti.
4. Design Figma.
5. Struttura e convenzioni esistenti.
6. Ottimizzazioni o refactoring.

Non fare refactoring "per pulizia" durante una modifica funzionale, a meno che sia necessario.

---

## 19. Stato attuale del progetto

Alla data di creazione di questo documento:

- il sito statico è strutturato;
- il design è basato su Figma 1920×1080;
- il sistema globale CSS è in `css/style.css`;
- le pagine hanno CSS/JS specifici;
- Firebase/Firestore è utilizzato;
- le News sono dinamiche;
- il pannello amministratore è in sviluppo;
- ImageKit è utilizzato per le immagini delle News;
- Cloudflare Worker gestisce autenticazione amministratore e autenticazione ImageKit;
- il calendario eventi è predisposto ma non ancora completato;
- il sito è destinato a GitHub Pages.

---

## 20. Procedura consigliata per Codex

Per ogni richiesta:

```text
1. Capire quale pagina/funzionalità è coinvolta.
2. Leggere i file direttamente collegati.
3. Controllare le regole di questo AGENTS.md.
4. Cercare classi/ID/funzioni correlate.
5. Fare la modifica minima necessaria.
6. Controllare le regressioni.
7. Riassumere cosa è stato modificato e quali file sono stati toccati.
```

Se la richiesta è ambigua o richiede di cambiare architettura, fermarsi prima di fare una grande riscrittura.

---

## 21. Regola finale

**Il codice esistente è la source of truth per i dettagli tecnici.**

Questo documento descrive l'architettura e le regole del progetto, ma non deve essere usato per inventare dettagli che non risultano dal codice.

Quando questo file e il codice sembrano discordare:

- verificare il codice;
- evitare supposizioni;
- aggiornare `AGENTS.md` se la nuova architettura è stata scelta intenzionalmente.

L'obiettivo è mantenere il sito stabile, riconoscibile rispetto al design Figma e facile da sviluppare nel tempo.
