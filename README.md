© A.S.D. Judo Bagno a Ripoli - All rights reserved

# 🥋 A.S.D. Judo Bagno a Ripoli — Sito Web Ufficiale

Benvenuto nel repository del sito web ufficiale dell'**A.S.D. Judo Bagno a Ripoli**, associazione sportiva dilettantistica fondata nel 1975 a Bagno a Ripoli (Firenze).

Il progetto è stato ideato, progettato e sviluppato da **Niccolò Pardelli** ([@nicco.parde](https://www.instagram.com/nicco.parde/)).

---

## 📑 Indice dei Contenuti

1. [Panoramica del Progetto](#-panoramica-del-progetto)
2. [Stack Tecnologico e Scelte Architetturali](#-stack-tecnologico-e-scelte-architetturali)
3. [Design System e Regole di Conversione VW](#-design-system-e-regole-di-conversione-vw)
4. [Mappa delle Pagine e Struttura delle Cartelle](#-mappa-delle-pagine-e-struttura-delle-cartelle)
5. [Integrazioni Esterne e Servizi Cloud](#-integrazioni-esterne-e-servizi-cloud)
   - [Firebase (Firestore & Authentication)](#1-firebase-firestore--authentication)
   - [Cloudflare Worker](#2-cloudflare-worker)
   - [ImageKit Media Storage](#3-imagekit-media-storage)
6. [Funzionalità Core del Sito](#-funzionalità-core-del-sito)
   - [Sistema Dark Mode (Modalità Scura)](#1-sistema-dark-mode-modalità-scura)
   - [Sistema Blocco / Manutenzione Pagine](#2-sistema-blocco--manutenzione-pagine)
   - [Sistema Dinamico News](#3-sistema-dinamico-news)
   - [Calendario Eventi Dinamico](#4-calendario-eventi-dinamico)
   - [Pannello Amministratore](#5-pannello-amministratore)
7. [Variabili e Design Tokens (style.css)](#-variabili-e-design-tokens-stylecss)
8. [Guida per Sviluppatori e Manutentori](#-guida-per-sviluppatori-e-manutentori)
9. [Hosting e Deploy](#-hosting-e-deploy)
10. [Crediti e Contatti](#-crediti-e-contatti)
11. [Note Legali, Copyright e Proprietà Intellettuale](#-note-legali-copyright-e-proprietà-intellettuale)

---

## 🌟 Panoramica del Progetto

Il sito dell'A.S.D. Judo Bagno a Ripoli è una web application orientata alle massime prestazioni, accessibilità e fedeltà visiva. È ospitato come sito statico su **GitHub Pages** con dominio personalizzato e arricchito da servizi cloud serverless per la gestione dei contenuti dinamici:

- **Notizie sportive ed editoriali** aggiornabili in tempo reale con immagini in alta risoluzione.
- **Calendario mensile interattivo** con gestione integrata degli appuntamenti, gare e stage.
- **Pannello di controllo riservato** con autenticazione sicura per l'amministrazione del dojo.
- **Controllo centralizzato di manutenzione** pagina per pagina.
- **Tema scuro (Dark Mode)** integrato e persistente con Drawer laterale.

---

## 🛠 Stack Tecnologico e Scelte Architetturali

Il sito adotta volutamente un'architettura **No-Framework (Vanilla Web)**:

- **HTML5 Semantico**: massimizza l'accessibilità (screen reader) e l'indicizzazione SEO naturale.
- **CSS3 Puro (Vanilla CSS)**: layout custom, transizioni fluide e supporto completo a Custom Properties (CSS Variables).
- **JavaScript ES6+ Modulare**: logica modulare nativa via browser (`type="module"`), zero bundler obbligatori (niente Webpack/Vite obbligatorio per l'esecuzione pubblica), zero tempi di compilazione.
- **Firebase SDK (CDN gstatic)**: Cloud Firestore per il database real-time e Firebase Authentication per la sessione amministratore.
- **Cloudflare Worker**: microservizio serverless intermedio per l'autenticazione sicura e la generazione di token ImageKit.
- **ImageKit**: CDN globale e media storage per il caricamento e l'ottimizzazione automatica delle immagini.

### Perché No-Framework?
1. **Longevità e stabilità**: nessun rischio di rottura per aggiornamenti di versioni di framework (React, Vue, Angular) nel corso degli anni.
2. **Prestazioni fulminee**: nessun download di runtime JS pesanti sul client; First Contentful Paint (FCP) quasi istantaneo.
3. **Hosting statico a costo zero**: piena compatibilità con GitHub Pages, CDN Cloudflare e qualsiasi hosting HTTP statico.

---

## 📐 Design System e Regole di Conversione VW

L'intero design del sito è stato realizzato su **Figma** basandosi su una risoluzione di riferimento:

$$\mathbf{1920 \times 1080 \text{ px}}$$

### La Regola di Conversione in `vw`
Per garantire che tutti gli elementi mantengano proporzioni perfette a qualsiasi risoluzione orizzontale del monitor, **tutte le misure del design (posizioni, larghezze, altezze, margini, padding, font-size) sono calcolate in viewport width (`vw`)**:

$$\text{valore\_vw} = \frac{\text{valore\_px}}{1920} \times 100$$

*Esempi pratici:*
- `192 px` $\rightarrow$ `10vw`
- `96 px` $\rightarrow$ `5vw`
- `275 px` $\rightarrow$ `14.3229vw`
- `8 px` $\rightarrow$ `0.4167vw`

### Comportamento su Dispositivi Mobili (Smartphone e Tablet)
Da mobile il sito non adotta un layout riorganizzato o un responsive design tradizionale che stravolge la composizione: **la versione mobile è semplicemente la versione da PC rimpicciolita in scala**.
Grazie all'utilizzo sistematico dell'unità di misura `vw` calcolata sulla base di 1920px (per font, immagini, altezze, larghezze e posizioni), l'intera interfaccia grafica scala fluidamente e proporzionalmente al ridursi della larghezza dello schermo dello smartphone, mantenendo la composizione e i rapporti dimensionali identici a quelli desktop senza rompere il design.

### Il Layout a Posizionamento Assoluto
Il sito adotta intenzionalmente un layout basato su `position: absolute` calibrato con coordinate `vw`. 

> [!IMPORTANT]
> **Regola fondamentale per chi modifica il codice:**
> **Non rimpiazzare arbitrariamente il sistema a coordinate assolute con Flexbox o CSS Grid globali, né inserire media query o breakpoint con font e posizioni fisse in pixel (`px`).**
> Modifiche strutturali invasive al sistema di posizionamento possono alterare le proporzioni del design originale Figma. Flexbox e Grid sono ammessi esclusivamente a livello locale dove già adottati (es. griglia calendario, flex per bottoni, liste interne).

---

## 🗺 Mappa delle Pagine e Struttura delle Cartelle

Il repository segue la **regola dell'accoppiamento 1:1**: per ogni pagina pubblica esiste un file HTML nella root, un file CSS dedicato in `css/` e un file JS dedicato in `javascript/`.

| Pagina | File HTML | Foglio di Stile | Script Specifico | Attributo Body |
|---|---|---|---|---|
| **Home** | `index.html` | `css/home.css` | `javascript/home.js` | `data-pagina="home"` |
| **Unisciti a noi** | `unisciti_a_noi.html` | `css/unisciti_a_noi.css` | `javascript/unisciti_a_noi.js` | `data-pagina="unisciti_a_noi"` |
| **Storia** | `storia.html` | `css/storia.css` | `javascript/storia.js` | `data-pagina="storia"` |
| **Info e orari** | `info_e_orari.html` | `css/info_e_orari.css` | `javascript/info_e_orari.js` | `data-pagina="info_e_orari"` |
| **Shoku Geiko** | `shoku_geiko.html` | `css/shoku_geiko.css` | `javascript/shoku_geiko.js` | `data-pagina="shoku_geiko"` |
| **News** | `news.html` | `css/news.css` | `javascript/news.js` | `data-pagina="news"` |
| **Calendario eventi** | `calendario_eventi.html` | `css/calendario_eventi.css` | `javascript/calendario_eventi.js` | `data-pagina="calendario_eventi"` |
| **Pannello admin** | `pannello_amministratore.html` | `css/pannello_amministratore.css` | `javascript/pannello_amministratore.js` | *Speciale* |

### Struttura Completa del Repository:

```text
Sito/
├── index.html                        # Home page
├── unisciti_a_noi.html               # Pagina iscrizioni e corsi
├── storia.html                       # Storia del club e maestri
├── info_e_orari.html                 # Orari, prezzi e dojo
├── shoku_geiko.html                  # Stage estivo a Pietralunga
├── news.html                         # Articoli e aggiornamenti
├── calendario_eventi.html            # Calendario gare ed eventi
├── pannello_amministratore.html      # Dashboard gestione contenuti
├── README.md                         # Questo file di documentazione
│
├── css/
│   ├── style.css                     # Stili globali, variabili CSS, header, footer, drawer, dark mode
│   ├── home.css                      # Stili specifici Home page
│   ├── unisciti_a_noi.css            # Stili specifici Unisciti a noi
│   ├── storia.css                    # Stili specifici Storia
│   ├── info_e_orari.css              # Stili specifici Info e orari
│   ├── shoku_geiko.css               # Stili specifici Shoku Geiko
│   ├── news.css                      # Stili specifici News e popupFocus
│   ├── calendario_eventi.css         # Stili specifici Calendario ed elenco eventi
│   └── pannello_amministratore.css   # Stili specifici interfaccia Amministratore
│
├── javascript/
│   ├── code.js                       # Logica comune: Drawer laterale e gestione Dark Mode
│   ├── firebase-config.js            # Inizializzazione Firebase App, Auth e Firestore
│   ├── pagina_blocco.js              # Listener manutenzione in tempo reale (Firestore)
│   ├── imagekit.js                   # Helper per caricamento e autenticazione ImageKit
│   ├── home.js                       # Logica Home (anteprima ultime notizie)
│   ├── unisciti_a_noi.js             # Logica Unisciti a noi
│   ├── storia.js                     # Logica Storia
│   ├── info_e_orari.js               # Logica Info e orari
│   ├── shoku_geiko.js                # Logica Shoku Geiko
│   ├── news.js                       # Logica catalogo News, ricerca, paginazione e popup
│   ├── calendario_eventi.js          # Logica motore calendario, eventi Firestore e filtri
│   └── pannello_amministratore.js    # Logica login, CRUD news, eventi e manutenzione
│
└── assets/                           # Asset grafici suddivisi per sezione
    ├── global/                       # Loghi istituzionali, federazioni, icone comuni, svg
    ├── home/                         # Immagini e grafiche della Home
    ├── unisciti_a_noi/               # Grafiche Unisciti a noi
    ├── storia/                       # Foto storiche e sfondi
    ├── info_e_orari/                 # Grafiche dojo e icone
    ├── shoku_geiko/                  # Vettoriali e foto dello stage estivo (inclusi SVG dark)
    ├── news/                         # Asset statici interfaccia news
    ├── calendario_eventi/            # Icone navigazione calendario
    ├── pannello_amministratore/      # Icone pannello di controllo
    └── documenti/                    # Moduli e documenti scaricabili
```

---

## ☁️ Integrazioni Esterne e Servizi Cloud

Il sito combina tre servizi cloud per garantire sicurezza, separazione delle responsabilità e zero credenziali private esposte sul frontend.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Browser Utente                           │
│  (index.html, news.html, pannello_amministratore.html, ...) │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       1. Login credenziali            3. Parametri auth
          (user + password)               epimeri (token, sign)
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Cloudflare Worker                           │
│  https://imagekit-auth.judobagnoaripoli.workers.dev         │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       2. Custom Token                 4. Upload sicuro
          Firebase                        (fino a 25MB)
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Google Firebase         │ │         ImageKit           │
│  - Firestore (Dati/Notizie)  │ │  - CDN Immagini HD         │
│  - Auth (Sessione Admin)     │ │  - Cartella /news          │
└──────────────────────────────┘ └────────────────────────────┘
```

### 1. Firebase (Firestore & Authentication)
- **Configurazione**: `javascript/firebase-config.js` contiene la configurazione client standard Firebase.
- **Collezioni Firestore utilizzate**:
  - `news`: Memorizza le notizie pubblicate. Ogni documento contiene: `titolo`, `data`, `descrizioneBreve`, `testoCompleto`, `urlImmagine`, `fileIdImageKit`, `timestampCreazione`.
  - `blocco_pagine`: Documenti con ID pari al nome pagina (`home`, `news`, `storia`, ecc.) contenenti il campo booleano `bloccata: true/false`.
  - `eventi`: Memorizza gli eventi del calendario (`titolo`, `descrizione`, `data`, `orarioInizio`, `orarioFine`, `categoria/tag`).
- **Autenticazione**: Non usa password Firebase esposte, ma un **Firebase Custom Token** generato dal Cloudflare Worker a seguito di verifica sicura.

### 2. Cloudflare Worker
L'endpoint serverless attivo risiede su:
`https://imagekit-auth.judobagnoaripoli.workers.dev`

- **Endpoint `/login`**: Riceve `username` e `password` via POST HTTPS; se validi, genera e restituisce un Firebase Custom Token cifrato con la chiave privata di servizio.
- **Endpoint `/`**: Restituisce la firma effimera ImageKit (`token`, `signature`, `expire`) calcolata con la Private Key salvata nei Secrets di Cloudflare (mai esposta su GitHub).
- **Endpoint `/imagekit/delete`**: Riceve il `fileId` da eliminare ed esegue la chiamata DELETE autenticata verso ImageKit quando una news viene rimossa.

> [!CAUTION]
> I segreti di Firebase Admin e la Private Key di ImageKit risiedono esclusivamente nelle variabili d'ambiente protette del Cloudflare Worker. Non inserire mai chiavi private all'interno del repository Git.

### 3. ImageKit Media Storage
- Endpoint di upload: `https://upload.imagekit.io/api/v1/files/upload`
- Public Key: esposta nel client per l'upload tramite firma del Worker.
- Cartella di destinazione: `/news`
- Limite file: impostato a **25 MB** per immagine.

---

## ⚡ Funzionalità Core del Sito

### 1. Sistema Dark Mode (Modalità Scura)
La modalità scura è implementata a livello globale tramite la classe semantica `[data-theme="dark"]` applicata al tag radice `<html>`.

- **Prevenzione FOUC (Flash of Unstyled Content)**: In cima ad ogni pagina, all'interno del tag `<head>`, è presente un micro-script sincrono che legge immediatamente `localStorage.getItem('theme')` prima del rendering visivo:
  ```html
  <script>
    try {
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
  </script>
  ```
- **Controllo Utente**: Un interruttore animato risiede all'interno del **Side Drawer** (menu laterale a comparsa attivabile tramite il pulsante hamburger in alto a destra).
- **Gestione Vettoriali e Grafica**:
  - Le tabelle e icone complesse (es. Shoku Geiko orari) dispongono di file SVG gemelli con grafica invertita:
    - `orari_sezione_3.svg` (chiaro) $\leftrightarrow$ `orari_sezione_3_dark.svg` (scuro con tratti e scritte bianche).
    - `icone_info_hotel.svg` (chiaro) $\leftrightarrow$ `icone_info_hotel_dark.svg` (scuro con icone bianche).
  - Lo switch avviene via CSS:
    ```css
    [data-theme="dark"] body[data-pagina="shoku_geiko"] .sezione_3 {
      background-image: url("../assets/shoku_geiko/orari_sezione_3_dark.svg") !important;
    }
    ```

### 2. Sistema Blocco / Manutenzione Pagine
Tutte le pagine pubbliche caricano nel `<head>` il modulo `javascript/pagina_blocco.js` e riportano l'attributo identificativo sul `<body>` (es. `<body data-pagina="info_e_orari">`).

- Lo script imposta un listener real-time (`onSnapshot`) sul documento Firestore corrispondente.
- Se lo stato `bloccata` diventa `true`, inietta istantaneamente a tutto schermo una schermata di cortesia con animazione *"Pagina in manutenzione"*, disattivando l'interazione fino a nuovo sblocco dal pannello amministratore.

### 3. Sistema Dinamico News
La pagina `news.html` implementa un'interfaccia a schede dinamiche:
- **Caricamento a scaglioni**: Mostra inizialmente 3 notizie, caricando i blocchi successivi (altre 3) tramite il pulsante "Carica altri articoli".
- **Ricerca testuale in tempo reale**: Filtra istantaneamente titolo e testo, evidenziando i termini corrispondenti.
- **Focus / Modale Notizia**: Cliccando su una card si apre il visualizzatore a tutto schermo con testo completo e foto ingrandita.
- **Isolamento eventi di click**: I controlli interni alle card usano `event.stopPropagation()` per non interferire con il click del contenitore.

### 4. Calendario Eventi Dinamico
In `calendario_eventi.html`, la griglia del mese viene renderizzata dinamicamente in JS:
- Calcolo automatico di giorni del mese, primo giorno della settimana e giorni di riporto dal mese precedente.
- Evidenziazione grafica del giorno corrente (`.calendario_cella--oggi`) e dei giorni con eventi in programma (`.decorazione_cerchio`).
- Card pubbliche degli eventi sincronizzate con Firestore e popup modale di anteprima dettagli.

### 5. Pannello Amministratore
Accessibile da `pannello_amministratore.html`:
- Permette di attivare/disattivare la modalità manutenzione di ogni singola pagina con un click.
- Modulo di pubblicazione nuove notizie con drag & drop di immagini, anteprima e caricamento automatico su ImageKit.
- Modifica e cancellazione notizie esistenti con aggiornamento istantaneo del database.

---

## 🎨 Variabili e Design Tokens (`style.css`)

Tutti i parametri di stile sono centralizzati nelle Custom Properties di `:root` in [css/style.css](file:///c:/Users/Niccolò/Desktop/Personali/Sito%20ASD%20Judo%20Bagno%20a%20Ripoli/Sito/css/style.css):

```css
:root {
  /* Tipografia */
  --font-titoli: "Dela Gothic One", Arial, sans-serif;
  --font-testo: "DM Serif Text", Georgia, serif;
  --font-display: "DM Serif Display", Georgia, serif;
  --font-admin: "Inter", Arial, sans-serif;

  /* Palette Colori Principale */
  --colore-bianco: #ffffff;
  --colore-nero: #000000;
  --colore-grigio-scuro: #2a2a2a;
  --colore-grigio-primario: #292929;
  --colore-fondo-body: #111111;

  /* Grigi Secondari */
  --colore-testo-grigio: #4d4d4d;
  --colore-testo-card: #444444;
  --colore-testo-mutato: #666666;
  --colore-grigio-chiaro: #d9d9d9;
  --colore-bordo-grigio: #a7a7a7;

  /* Ombreggiature Vettoriali VW */
  --colore-ombra-forte: rgba(0, 0, 0, 0.4);
}
```

---

## 👨‍💻 Guida per Sviluppatori e Manutentori

Prima di apportare modifiche al codice, attenersi rigorosamente alle seguenti regole:

### 1. Modifiche di Layout e Dimensioni
- Calcolare ogni nuova misura partendo dal design a **1920px**: `px / 1920 * 100vw`.
- **Comportamento Mobile**: Ricordare che la versione per dispositivi mobili è semplicemente la versione desktop rimpicciolita in scala: evitare media query o breakpoint che impongano font-size o altezze fisse in pixel (`px`), altrimenti si rompe la proporzionalità fluida rispetto agli altri elementi.
- Se un testo o una card deve essere centrata verticalmente in un contenitore con altezza `vw`, utilizzare:
  ```css
  top: 50%;
  transform: translateY(-50%);
  ```
- Non sostituire `position: absolute` con layout fluidi non concordati.

### 2. Gestione degli Asset
- Inserire nuove immagini sempre nella sottocartella corretta di `assets/` (es. `assets/news/`, `assets/storia/`).
- Verificare sempre che l'immagine sia compressa (formati consigliati: WebP, SVG per icone, PNG ottimizzati).
- Aggiungere sempre un attributo `alt` descrittivo per ogni tag `<img>`.

### 3. Aggiunta di Nuove Sezioni o Pagine
- Includere nell'`<head>` il selettore di tema anti-flicker e il modulo `pagina_blocco.js`.
- Assegnare il rispettivo `data-pagina` al `<body>`.
- Includere l'header standard con navigazione e pulsante hamburger `#menuToggle`.
- Includere in chiusura il footer standard e il `#sideDrawer` per garantire navigazione e Dark Mode ovunque.
- Collegare lo script condiviso `code.js` con attributo `defer`.

### 4. Come testare il sito in locale
Trattandosi di un sito statico con moduli JavaScript ES6 (`type="module"`), è necessario avviarlo tramite un web server locale per evitare blocchi CORS sui percorsi relativi:

```bash
# Esempio con Node.js / npx
npx serve .

# Oppure con Python 3
python -m http.server 8000
```
Aprire il browser su `http://localhost:8000` (o porta indicata).

---

## 🚀 Hosting e Deploy

- **Piattaforma**: GitHub Pages
- **Ramo principale**: `main` (o branch di produzione designato)
- **Dominio personalizzato**: Gestito tramite file `CNAME` configurato verso i DNS del dominio ufficiale dell'associazione.
- **Certificato SSL**: Rilasciato e rinnovato automaticamente tramite Cloudflare / GitHub Pages con HTTPS forzato.

---

## 👤 Crediti e Contatti

- **Ideazione, Design Grafico e Sviluppo Web**:
  **Niccolò Pardelli**
  - Instagram: [@nicco.parde](https://www.instagram.com/nicco.parde/)
- **Associazione Sportiva**:
  **A.S.D. Judo Bagno a Ripoli**
  - Sede: Via del Pratello 15 — Bagno a Ripoli (FI), Italia
  - Email ufficiale: `judobagnoaripoli@gmail.com`
  - Instagram Associazione: [@judo_bagno_a_ripoli](https://www.instagram.com/judo_bagno_a_ripoli/)

---

## ⚖️ Note Legali, Copyright e Proprietà Intellettuale

Tutti i contenuti, il codice sorgente, i file di stile, gli elementi grafici, i marchi, i loghi, le fotografie e i testi presenti in questo repository e nel sito web ad esso collegato sono di esclusiva proprietà di **A.S.D. Judo Bagno a Ripoli** e dell'autore **Niccolò Pardelli**, e sono tutelati dalla Legge sul Diritto d'Autore (Legge 22 aprile 1941 n. 633 e successive modifiche) e dalle normative internazionali vigenti sulla proprietà intellettuale.

### Termini di Utilizzo e Restrizioni:
1. **Divieto di riproduzione**: È fatto espresso divieto di copiare, duplicare, riprodurre, distribuire, pubblicare o riutilizzare, in tutto o in parte, il codice sorgente (HTML, CSS, JavaScript), il layout grafico originale Figma, i vettoriali SVG personalizzati e i contenuti multimediali senza preventiva autorizzazione scritta.
2. **Divieto di utilizzo commerciale**: È vietato qualsiasi utilizzo a scopo di lucro, riutilizzo per terze società sportive o cessione a terzi del materiale presente in questo archivio.
3. **Marchi e Loghi**: I loghi e i marchi delle federazioni affiliate (FIJLKAM, UISP, CSEN, CONI) appartengono ai rispettivi legittimi proprietari e sono utilizzati esclusivamente a titolo rappresentativo dell'affiliazione sportiva.
4. **Protezione dei dati personali**: L'infrastruttura rispetta i principi di minimizzazione del trattamento dei dati secondo il Regolamento UE 2016/679 (GDPR). Le credenziali amministrative e i dati sensibili non sono memorizzati nel frontend né tracciati nel presente repository pubblico.

---

*Ultimo aggiornamento documentazione: Settembre 2026*