import {
  signInWithCustomToken,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  getDocs,
  collection,
  query,
  orderBy,
  setDoc,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

// ======================================================
// CONFIGURAZIONE
// ======================================================

const URL_WORKER_LOGIN =
  "https://imagekit-auth.judobagnoaripoli.workers.dev/login";

const COLLECTION_BLOCCO_PAGINE = "blocco_pagine";
const COLLECTION_NEWS = "news";

const IMAGEKIT_PUBLIC_KEY = "public_XGdQD6vo7Mo9P0AsfeKrHkJoXh8=";

const IMAGEKIT_AUTHENTICATION_ENDPOINT =
  "https://imagekit-auth.judobagnoaripoli.workers.dev";

const IMAGEKIT_UPLOAD_ENDPOINT =
  "https://upload.imagekit.io/api/v1/files/upload";

const IMAGEKIT_FOLDER_NEWS = "/news";

const IMAGEKIT_MAX_FILE_SIZE = 25 * 1024 * 1024;

const MASSIMO_NEWS_PER_CARICAMENTO = 3;

// ======================================================
// AVVIO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("pannello_amministratore.js caricato correttamente.");

  // ====================================================
  // ELEMENTI ACCESSO
  // ====================================================

  const pannelloAccesso = document.getElementById("pannelloAccesso");

  const pannelloAmministratore = document.getElementById(
    "pannelloAmministratore",
  );

  const inputNomeUtente = document.getElementById("inputNomeUtente");

  const inputPassword = document.getElementById("inputPassword");

  const pulsanteEntra = document.getElementById("pulsanteEntra");

  const pulsanteMostraPassword = document.getElementById(
    "pulsanteMostraPassword",
  );

  const errore = document.getElementById("erroreAccesso");

  // ====================================================
  // SELETTORE
  // ====================================================

  const selettoreImpostazioni = document.getElementById(
    "selettoreImpostazioni",
  );

  const selettoreNews = document.getElementById("selettoreNews");

  const selettoreEventi = document.getElementById("selettoreEventi");

  const sezioneImpostazioni = document.getElementById("sezioneImpostazioni");

  const sezioneNews = document.getElementById("sezioneNews");

  const sezioneEventi = document.getElementById("sezioneEventi");

  // ====================================================
  // CREAZIONE NOTIZIA
  // ====================================================

  const inputTitoloNotizia = document.getElementById("inputTitoloNotizia");

  const inputTestoNotizia = document.getElementById("inputTestoNotizia");

  const inputGiorno = document.getElementById("inputGiorno");

  const inputMese = document.getElementById("inputMese");

  const inputAnno = document.getElementById("inputAnno");

  const pulsantePubblica = document.getElementById("pulsantePubblica");

  const errorePubblicazione = document.getElementById("errorePubblicazione");

  const pulsanteCaricaImmagini = document.querySelector(
    ".pulsante_carica_immagini",
  );

  const pulsanteSalvaBozza = document.querySelector(".pulsante_salva_bozza");

  const pannelloCreazioneNotizia = document.querySelector(
    ".pannello_creazione_notizia",
  );

  const pannelloNotizie = document.querySelector(".pannello_notizie");

  const caricamentoCreazioneNotizia = document.getElementById(
    "caricamentoCreazioneNotizia",
  );

  const testoCaricamentoCreazioneNotizia = document.getElementById(
    "testoCaricamentoCreazioneNotizia",
  );

  // ====================================================
  // NEWS ADMIN
  // ====================================================

  const listaNotizieAdmin = document.querySelector(".lista_notizie_admin");

  const testoNotizieAssentiAdmin = document.querySelector(
    ".testo_notizie_assenti_admin",
  );

  const pulsanteCaricaAltro = document.querySelector(
    ".pannello_notizie .pulsante_carica_altro",
  );

  const notiziaFocusAdmin = document.getElementById("notiziaFocusAdmin");

  // ====================================================
  // VARIABILI IMMAGINE
  // ====================================================

  let fileImmagineNotizia = null;

  let nomeImmagineNotizia = "";

  let fileInputImmagine = null;

  let caricamentoImmagineInCorso = false;

  let boxImmagineNotizia = null;

  let testoNomeImmagineNotizia = null;

  let pulsanteRimuoviImmagine = null;

  // ====================================================
  // VARIABILI NEWS
  // ====================================================

  let elencoNewsAdmin = [];

  let numeroNewsVisibiliAdmin = MASSIMO_NEWS_PER_CARICAMENTO;

  let indiceNewsApertaAdmin = 0;

  // Memorizza la distanza originale tra
  // l'ultima news e il pulsante "Carica altro".
  let distanzaPulsanteCaricaAltroAdminVW = null;

  // ====================================================
  // CONTROLLO ELEMENTI
  // ====================================================

  if (
    !pannelloAccesso ||
    !pannelloAmministratore ||
    !inputNomeUtente ||
    !inputPassword ||
    !pulsanteEntra ||
    !pulsanteMostraPassword ||
    !errore ||
    !selettoreImpostazioni ||
    !selettoreNews ||
    !selettoreEventi ||
    !sezioneImpostazioni ||
    !sezioneNews ||
    !sezioneEventi ||
    !inputTitoloNotizia ||
    !inputTestoNotizia ||
    !inputGiorno ||
    !inputMese ||
    !inputAnno ||
    !pulsantePubblica ||
    !errorePubblicazione ||
    !pannelloCreazioneNotizia ||
    !pannelloNotizie ||
    !listaNotizieAdmin ||
    !notiziaFocusAdmin
  ) {
    console.error("Uno o più elementi HTML non sono stati trovati.");

    return;
  }

  pannelloAccesso.style.display = "none";

  pannelloAmministratore.style.display = "none";

  // ====================================================
  // ERRORI ACCESSO
  // ====================================================

  function mostraErrore(messaggio) {
    errore.textContent = messaggio;

    errore.style.display = "block";
  }

  function nascondiErrore() {
    errore.textContent = "";

    errore.style.display = "none";
  }

  // ====================================================
  // ESCAPE HTML
  // ====================================================

  function escapeHTML(testo) {
    return String(testo)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ====================================================
  // ERRORI PUBBLICAZIONE
  // ====================================================

  function mostraErrorePubblicazione(messaggi) {
    if (!errorePubblicazione) {
      return;
    }

    if (!messaggi || messaggi.length === 0) {
      errorePubblicazione.textContent = "";

      errorePubblicazione.classList.remove("visibile");

      return;
    }

    errorePubblicazione.innerHTML = messaggi
      .map((messaggio) => `<div>${escapeHTML(messaggio)}</div>`)
      .join("");

    errorePubblicazione.style.color = "#ff5b5b";

    errorePubblicazione.classList.add("visibile");
  }

  function mostraMessaggioPubblicazione(messaggio) {
    if (!errorePubblicazione) {
      return;
    }

    errorePubblicazione.textContent = messaggio;

    errorePubblicazione.style.color = "#2e8b57";

    errorePubblicazione.classList.add("visibile");
  }

  function nascondiErrorePubblicazione() {
    if (!errorePubblicazione) {
      return;
    }

    errorePubblicazione.textContent = "";

    errorePubblicazione.style.color = "#ff5b5b";

    errorePubblicazione.classList.remove("visibile");
  }

  // ====================================================
  // MOSTRA PASSWORD
  // ====================================================

  pulsanteMostraPassword.addEventListener("click", () => {
    inputPassword.type = "text";

    pulsanteMostraPassword.setAttribute("aria-label", "Password mostrata");

    pulsanteMostraPassword.setAttribute("title", "Password mostrata");
  });

  // ====================================================
  // SELETTORE
  // ====================================================

  function aggiornaSelettore(pagina) {
    const testoImpostazioni = document.querySelector(
      ".testo_selettore_impostazioni",
    );

    const testoNews = document.querySelector(".testo_selettore_news");

    const testoEventi = document.querySelector(".testo_selettore_eventi");

    const iconaImpostazioni = document.querySelector(
      ".icona_selettore_impostazioni",
    );

    const iconaNews = document.querySelector(".icona_selettore_news");

    const iconaEventi = document.querySelector(".icona_selettore_eventi");

    if (
      !testoImpostazioni ||
      !testoNews ||
      !testoEventi ||
      !iconaImpostazioni ||
      !iconaNews ||
      !iconaEventi
    ) {
      return;
    }

    if (pagina === "impostazioni") {
      testoImpostazioni.style.color = "#2a2a2a";

      testoNews.style.color = "#a6a6a6";

      testoEventi.style.color = "#868686";

      iconaImpostazioni.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_impostazioni_attivo.svg")';

      iconaNews.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_notizie_disattivo.svg")';

      iconaEventi.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_calendario_disattivo.svg")';

      return;
    }

    if (pagina === "news") {
      testoImpostazioni.style.color = "#a6a6a6";

      testoNews.style.color = "#2a2a2a";

      testoEventi.style.color = "#868686";

      iconaImpostazioni.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_impostazioni_disattivo.svg")';

      iconaNews.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_notizie_attivo.svg")';

      iconaEventi.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_calendario_disattivo.svg")';

      return;
    }

    if (pagina === "eventi") {
      testoImpostazioni.style.color = "#a6a6a6";

      testoNews.style.color = "#a6a6a6";

      testoEventi.style.color = "#868686";

      iconaImpostazioni.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_impostazioni_disattivo.svg")';

      iconaNews.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_notizie_disattivo.svg")';

      iconaEventi.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_calendario_disattivo.svg")';
    }
  }

  // ====================================================
  // MOSTRA SEZIONE
  // ====================================================

  function mostraSezione(sezione) {
    sezioneImpostazioni.style.display = "none";

    sezioneNews.style.display = "none";

    sezioneEventi.style.display = "none";

    if (sezione === sezioneImpostazioni) {
      sezioneImpostazioni.style.display = "block";

      aggiornaSelettore("impostazioni");

      window.scrollTo(0, 0);

      return;
    }

    if (sezione === sezioneNews) {
      sezioneNews.style.display = "block";

      aggiornaSelettore("news");

      aggiornaLayoutNotizia();

      caricaNewsAdmin();

      window.scrollTo(0, 0);

      return;
    }

    if (sezione === sezioneEventi) {
      sezioneEventi.style.display = "block";

      aggiornaSelettore("eventi");

      window.scrollTo(0, 0);
    }
  }

  selettoreImpostazioni.addEventListener("click", () => {
    mostraSezione(sezioneImpostazioni);
  });

  selettoreNews.addEventListener("click", () => {
    mostraSezione(sezioneNews);
  });

  selettoreEventi.addEventListener("click", () => {
    mostraSezione(sezioneEventi);
  });

  // ====================================================
  // BLOCCO PAGINE
  // ====================================================

  function aggiornaAspettoPulsante(pulsante, bloccata) {
    if (!pulsante) {
      return;
    }

    const testo = pulsante.querySelector(".testo_pulsante_blocca");

    if (bloccata) {
      pulsante.classList.add("attivo");

      if (testo) {
        testo.textContent = "Sblocca";
      }
    } else {
      pulsante.classList.remove("attivo");

      if (testo) {
        testo.textContent = "Blocca";
      }
    }
  }

  async function caricaStatoPagine() {
    console.log("Caricamento stato pagine...");

    try {
      const riferimento = collection(db, COLLECTION_BLOCCO_PAGINE);

      const risultati = await getDocs(query(riferimento));

      risultati.forEach((documento) => {
        const elementoPagina = document.querySelector(
          `[data-pagina="${documento.id}"]`,
        );

        if (!elementoPagina) {
          return;
        }

        const pulsante = elementoPagina.querySelector(".pulsante_blocca");

        if (!pulsante) {
          return;
        }

        const dati = documento.data();

        aggiornaAspettoPulsante(pulsante, dati.bloccata === true);
      });

      console.log("Stato pagine caricato.");
    } catch (error) {
      console.error("Errore caricamento stato pagine:", error);
    }
  }

  async function cambiaStatoPagina(elementoPagina, pulsante) {
    if (!elementoPagina || !pulsante) {
      return;
    }

    const pagina = elementoPagina.dataset.pagina;

    if (!pagina) {
      return;
    }

    const statoAttuale = pulsante.classList.contains("attivo");

    const nuovoStato = !statoAttuale;

    pulsante.style.pointerEvents = "none";

    try {
      const riferimento = doc(db, COLLECTION_BLOCCO_PAGINE, pagina);

      await setDoc(
        riferimento,
        {
          bloccata: nuovoStato,
        },
        {
          merge: true,
        },
      );

      aggiornaAspettoPulsante(pulsante, nuovoStato);

      console.log(`Pagina ${pagina}: ${nuovoStato ? "BLOCCATA" : "SBLOCCATA"}`);
    } catch (error) {
      console.error("Errore modifica stato pagina:", error);

      mostraErrore("Impossibile modificare lo stato della pagina.");
    } finally {
      pulsante.style.pointerEvents = "auto";
    }
  }

  document.querySelectorAll("[data-pagina]").forEach((elementoPagina) => {
    const pulsante = elementoPagina.querySelector(".pulsante_blocca");

    if (!pulsante) {
      return;
    }

    pulsante.addEventListener("click", () => {
      cambiaStatoPagina(elementoPagina, pulsante);
    });
  });

  // ====================================================
  // DATA
  // ====================================================

  function mantieniSoloNumeri(elemento) {
    elemento.value = elemento.value.replace(/\D/g, "");
  }

  function limitaData(elemento, massimo) {
    if (!elemento) {
      return;
    }

    mantieniSoloNumeri(elemento);

    if (elemento.value.length > massimo) {
      elemento.value = elemento.value.substring(0, massimo);
    }
  }

  inputGiorno.addEventListener("input", () => {
    limitaData(inputGiorno, 2);

    nascondiErrorePubblicazione();
  });

  inputMese.addEventListener("input", () => {
    limitaData(inputMese, 2);

    nascondiErrorePubblicazione();
  });

  inputAnno.addEventListener("input", () => {
    limitaData(inputAnno, 4);

    nascondiErrorePubblicazione();
  });

  // ====================================================
  // ADATTAMENTO CAMPI
  // ====================================================

  function adattaCampoTesto(elemento) {
    if (!elemento) {
      return 0;
    }

    const stile = window.getComputedStyle(elemento);

    const altezzaMinima = parseFloat(stile.minHeight) || 0;

    elemento.style.height = `${altezzaMinima}px`;

    const altezzaNecessaria = elemento.scrollHeight;

    const altezzaEffettiva = Math.max(altezzaNecessaria, altezzaMinima);

    elemento.style.height = `${altezzaEffettiva}px`;

    return Math.max(0, altezzaEffettiva - altezzaMinima);
  }

  // ====================================================
  // BOX IMMAGINE
  // ====================================================

  function creaBoxImmagine() {
    if (boxImmagineNotizia) {
      return;
    }

    boxImmagineNotizia = document.createElement("div");

    boxImmagineNotizia.className = "box_immagine_notizia";

    testoNomeImmagineNotizia = document.createElement("span");

    testoNomeImmagineNotizia.className = "nome_immagine_notizia";

    testoNomeImmagineNotizia.style.position = "absolute";

    testoNomeImmagineNotizia.style.left = "1vw";

    testoNomeImmagineNotizia.style.right = "4vw";

    testoNomeImmagineNotizia.style.top = "50%";

    testoNomeImmagineNotizia.style.transform = "translateY(-50%)";

    testoNomeImmagineNotizia.style.color = "#292929";

    testoNomeImmagineNotizia.style.fontFamily = "Inter, sans-serif";

    testoNomeImmagineNotizia.style.fontWeight = "400";

    testoNomeImmagineNotizia.style.fontSize = "1.25vw";

    testoNomeImmagineNotizia.style.whiteSpace = "nowrap";

    testoNomeImmagineNotizia.style.overflow = "hidden";

    testoNomeImmagineNotizia.style.textOverflow = "ellipsis";

    pulsanteRimuoviImmagine = document.createElement("button");

    pulsanteRimuoviImmagine.type = "button";

    pulsanteRimuoviImmagine.className = "pulsante_rimuovi_immagine";

    pulsanteRimuoviImmagine.textContent = "×";

    pulsanteRimuoviImmagine.style.position = "absolute";

    pulsanteRimuoviImmagine.style.right = "0.7vw";

    pulsanteRimuoviImmagine.style.top = "50%";

    pulsanteRimuoviImmagine.style.transform = "translateY(-50%)";

    pulsanteRimuoviImmagine.style.width = "2.4vw";

    pulsanteRimuoviImmagine.style.height = "2.4vw";

    pulsanteRimuoviImmagine.style.padding = "0";

    pulsanteRimuoviImmagine.style.border = "none";

    pulsanteRimuoviImmagine.style.background = "transparent";

    pulsanteRimuoviImmagine.style.color = "#292929";

    pulsanteRimuoviImmagine.style.fontFamily = "Arial, sans-serif";

    pulsanteRimuoviImmagine.style.fontSize = "2.2vw";

    pulsanteRimuoviImmagine.style.fontWeight = "400";

    pulsanteRimuoviImmagine.style.lineHeight = "2.2vw";

    pulsanteRimuoviImmagine.style.textAlign = "center";

    pulsanteRimuoviImmagine.style.cursor = "pointer";

    pulsanteRimuoviImmagine.addEventListener("click", () => {
      rimuoviImmagineNotizia();
    });

    boxImmagineNotizia.appendChild(testoNomeImmagineNotizia);

    boxImmagineNotizia.appendChild(pulsanteRimuoviImmagine);

    pannelloCreazioneNotizia.appendChild(boxImmagineNotizia);
  }

  function mostraBoxImmagine(nomeFile) {
    creaBoxImmagine();

    if (testoNomeImmagineNotizia) {
      testoNomeImmagineNotizia.textContent = nomeFile;
    }

    boxImmagineNotizia.style.display = "flex";

    aggiornaLayoutNotizia();
  }

  function nascondiBoxImmagine() {
    if (!boxImmagineNotizia) {
      return;
    }

    boxImmagineNotizia.style.display = "none";

    aggiornaLayoutNotizia();
  }

  function rimuoviImmagineNotizia() {
    fileImmagineNotizia = null;

    nomeImmagineNotizia = "";

    if (fileInputImmagine) {
      fileInputImmagine.value = "";
    }

    nascondiBoxImmagine();

    mostraMessaggioPubblicazione("Immagine rimossa dalla notizia.");
  }

  // ====================================================
  // LAYOUT CREAZIONE
  // ====================================================

  function aggiornaLayoutNotizia() {
    const spostamentoTitolo = adattaCampoTesto(inputTitoloNotizia);

    const spostamentoTesto = adattaCampoTesto(inputTestoNotizia);

    const boxImmagineVisibile =
      boxImmagineNotizia && boxImmagineNotizia.style.display !== "none";

    const spostamentoImmagine = boxImmagineVisibile ? "4.35vw" : "0px";

    const spostamentoTotale = spostamentoTitolo + spostamentoTesto;

    const elementiSottoTitolo = [
      {
        elemento: document.querySelector(".etichetta_data"),
        top: "13.5938vw",
      },

      {
        elemento: document.querySelector(".contenitore_data"),
        top: "18.0729vw",
      },

      {
        elemento: document.querySelector(".etichetta_immagini"),
        top: "22.1875vw",
      },
    ];

    elementiSottoTitolo.forEach(({ elemento, top }) => {
      if (!elemento) {
        return;
      }

      elemento.style.top = `calc(${top} + ${spostamentoTitolo}px)`;
    });

    if (boxImmagineNotizia) {
      boxImmagineNotizia.style.top = `calc(26.6146vw + ${spostamentoTitolo}px)`;
    }

    if (pulsanteCaricaImmagini) {
      pulsanteCaricaImmagini.style.top = `calc(26.6146vw + ${spostamentoTitolo}px + ${spostamentoImmagine})`;
    }

    const elementiSottoImmagini = [
      {
        elemento: document.querySelector(".etichetta_testo"),
        top: "32.7604vw",
      },

      {
        elemento: document.querySelector(".contenitore_testo_notizia"),
        top: "35.8333vw",
      },
    ];

    elementiSottoImmagini.forEach(({ elemento, top }) => {
      if (!elemento) {
        return;
      }

      elemento.style.top = `calc(${top} + ${spostamentoTitolo}px + ${spostamentoImmagine})`;
    });

    const spostamentoFinale = `calc(${spostamentoTotale}px + ${spostamentoImmagine})`;

    if (pulsanteSalvaBozza) {
      pulsanteSalvaBozza.style.top = `calc(63.3854vw + ${spostamentoFinale})`;
    }

    if (pulsantePubblica) {
      pulsantePubblica.style.top = `calc(63.3854vw + ${spostamentoFinale})`;
    }

    if (errorePubblicazione) {
      errorePubblicazione.style.top = `calc(60.15vw + ${spostamentoFinale})`;
    }

    if (caricamentoCreazioneNotizia) {
      caricamentoCreazioneNotizia.style.top = `calc(60.35vw + ${spostamentoFinale})`;
    }

    pannelloCreazioneNotizia.style.height = `calc(67.7604vw + ${spostamentoFinale})`;

    pannelloNotizie.style.top = `calc(92.44vw + ${spostamentoFinale})`;

    sezioneNews.style.minHeight = `calc(162.6042vw + ${spostamentoFinale})`;

    aggiornaLayoutPannelloNotizieAdmin();
  }

  // ====================================================
  // LAYOUT PANNELLO NEWS ADMIN
  // ====================================================

  function aggiornaLayoutPannelloNotizieAdmin() {
    if (!pannelloNotizie || !listaNotizieAdmin) {
      return;
    }

    const notizie = listaNotizieAdmin.querySelectorAll(
      ".notizia_piccola_admin",
    );

    const numeroNotizie = notizie.length;

    // ----------------------------------------------------
    // NESSUNA NEWS
    // ----------------------------------------------------

    if (numeroNotizie === 0) {
      if (pulsanteCaricaAltro) {
        pulsanteCaricaAltro.style.display = "none";
      }

      pannelloNotizie.style.height = "67.3438vw";

      return;
    }

    // ----------------------------------------------------
    // CALCOLO POSIZIONE REALE DELL'ULTIMA CARD
    // ----------------------------------------------------

    const ultimaNotizia = notizie[notizie.length - 1];

    const fondoUltimaNotizia =
      listaNotizieAdmin.offsetTop +
      ultimaNotizia.offsetTop +
      ultimaNotizia.offsetHeight;

    // ----------------------------------------------------
    // DISTANZA ORIGINALE DAL PULSANTE
    // ----------------------------------------------------

    if (pulsanteCaricaAltro && distanzaPulsanteCaricaAltroAdminVW === null) {
      const posizioneOriginalePulsante = pulsanteCaricaAltro.offsetTop;

      const distanzaOriginalePx =
        posizioneOriginalePulsante - fondoUltimaNotizia;

      distanzaPulsanteCaricaAltroAdminVW =
        (distanzaOriginalePx / window.innerWidth) * 100;

      /*
       * Sicurezza:
       * se per qualsiasi motivo la distanza
       * risultasse negativa, utilizziamo
       * una distanza minima di 2vw.
       */

      if (distanzaPulsanteCaricaAltroAdminVW < 0) {
        distanzaPulsanteCaricaAltroAdminVW = 2;
      }
    }

    // ----------------------------------------------------
    // POSIZIONE PULSANTE
    // ----------------------------------------------------

    if (pulsanteCaricaAltro) {
      const distanzaPulsantePx =
        ((distanzaPulsanteCaricaAltroAdminVW ?? 2) * window.innerWidth) / 100;

      const posizionePulsantePx = fondoUltimaNotizia + distanzaPulsantePx;

      pulsanteCaricaAltro.style.top = `${posizionePulsantePx}px`;
    }

    // ----------------------------------------------------
    // ALTEZZA PANNELLO
    // ----------------------------------------------------

    const altezzaPulsante = pulsanteCaricaAltro
      ? pulsanteCaricaAltro.offsetHeight
      : (4.1146 * window.innerWidth) / 100;

    const spazioFinale = (2 * window.innerWidth) / 100;

    const posizionePulsantePx = pulsanteCaricaAltro
      ? pulsanteCaricaAltro.offsetTop
      : fondoUltimaNotizia;

    const altezzaNecessaria =
      posizionePulsantePx + altezzaPulsante + spazioFinale;

    const altezzaMinimaPannello = (67.3438 * window.innerWidth) / 100;

    const altezzaPannello = Math.max(altezzaNecessaria, altezzaMinimaPannello);

    pannelloNotizie.style.height = `${altezzaPannello}px`;

    // ----------------------------------------------------
    // ALTEZZA SEZIONE NEWS
    // ----------------------------------------------------

    const topPannello = pannelloNotizie.offsetTop;

    const altezzaSezioneNecessaria =
      topPannello +
      pannelloNotizie.offsetHeight +
      (3 * window.innerWidth) / 100;

    const altezzaMinimaAttuale = parseFloat(sezioneNews.style.minHeight) || 0;

    const altezzaMinimaNecessaria = Math.max(
      altezzaMinimaAttuale,
      altezzaSezioneNecessaria,
    );

    sezioneNews.style.minHeight = `${altezzaMinimaNecessaria}px`;
  }

  // ====================================================
  // VALIDAZIONE DATA
  // ====================================================

  function dataValida() {
    const giorno = inputGiorno.value.trim();

    const mese = inputMese.value.trim();

    const anno = inputAnno.value.trim();

    if (giorno === "" || mese === "" || anno === "") {
      return false;
    }

    if (
      !/^\d{2}$/.test(giorno) ||
      !/^\d{2}$/.test(mese) ||
      !/^\d{4}$/.test(anno)
    ) {
      return false;
    }

    const giornoNumero = Number(giorno);

    const meseNumero = Number(mese);

    const annoNumero = Number(anno);

    if (
      annoNumero < 1 ||
      meseNumero < 1 ||
      meseNumero > 12 ||
      giornoNumero < 1 ||
      giornoNumero > 31
    ) {
      return false;
    }

    const data = new Date(annoNumero, meseNumero - 1, giornoNumero);

    return (
      data.getFullYear() === annoNumero &&
      data.getMonth() === meseNumero - 1 &&
      data.getDate() === giornoNumero
    );
  }

  function validaPubblicazione() {
    const errori = [];

    if (inputTitoloNotizia.value.trim() === "") {
      errori.push("Inserisci il titolo della notizia.");
    }

    if (inputTestoNotizia.value.trim() === "") {
      errori.push("Inserisci il testo della notizia.");
    }

    if (!dataValida()) {
      errori.push("Inserisci una data valida.");
    }

    return errori;
  }

  // ====================================================
  // IMAGEKIT AUTH
  // ====================================================

  async function ottieniAutenticazioneImageKit() {
    const risposta = await fetch(IMAGEKIT_AUTHENTICATION_ENDPOINT, {
      method: "GET",

      cache: "no-store",
    });

    if (!risposta.ok) {
      throw new Error("Impossibile ottenere l'autenticazione ImageKit.");
    }

    const dati = await risposta.json();

    if (!dati.token || !dati.signature || !dati.expire) {
      throw new Error("Risposta di autenticazione ImageKit non valida.");
    }

    return dati;
  }

  // ====================================================
  // UPLOAD IMAGEKIT
  // ====================================================

  async function caricaImmagineSuImageKit(file) {
    if (!file) {
      return "";
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Il file selezionato non è un'immagine.");
    }

    if (file.size > IMAGEKIT_MAX_FILE_SIZE) {
      throw new Error("L'immagine supera il limite di 25 MB.");
    }

    const autenticazione = await ottieniAutenticazioneImageKit();

    const formData = new FormData();

    formData.append("file", file);

    formData.append("fileName", file.name || `notizia-${Date.now()}.jpg`);

    formData.append(
      "publicKey",
      autenticazione.publicKey || IMAGEKIT_PUBLIC_KEY,
    );

    formData.append("signature", autenticazione.signature);

    formData.append("expire", String(autenticazione.expire));

    formData.append("token", autenticazione.token);

    formData.append("useUniqueFileName", "true");

    formData.append("folder", IMAGEKIT_FOLDER_NEWS);

    const risposta = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
      method: "POST",

      body: formData,
    });

    let dati = {};

    try {
      dati = await risposta.json();
    } catch {
      dati = {};
    }

    if (!risposta.ok || !dati.url) {
      console.error("Risposta ImageKit:", dati);

      throw new Error(
        dati.message ||
          dati.error ||
          "Impossibile caricare l'immagine su ImageKit.",
      );
    }

    return dati.url;
  }

  // ====================================================
  // SELEZIONE IMMAGINE
  // ====================================================

  function aggiornaStatoPulsanteImmagini() {
    if (!pulsanteCaricaImmagini) {
      return;
    }

    pulsanteCaricaImmagini.style.pointerEvents = caricamentoImmagineInCorso
      ? "none"
      : "auto";

    pulsanteCaricaImmagini.style.opacity = caricamentoImmagineInCorso
      ? "0.65"
      : "1";
  }

  if (pulsanteCaricaImmagini) {
    fileInputImmagine = document.createElement("input");

    fileInputImmagine.type = "file";

    fileInputImmagine.accept = "image/*";

    fileInputImmagine.style.display = "none";

    document.body.appendChild(fileInputImmagine);

    pulsanteCaricaImmagini.addEventListener("click", () => {
      if (caricamentoImmagineInCorso) {
        return;
      }

      fileInputImmagine.value = "";

      fileInputImmagine.click();
    });

    fileInputImmagine.addEventListener("change", () => {
      const file = fileInputImmagine.files?.[0];

      if (!file) {
        return;
      }

      nascondiErrorePubblicazione();

      if (!file.type.startsWith("image/")) {
        mostraErrorePubblicazione(["Il file selezionato non è un'immagine."]);

        fileInputImmagine.value = "";

        return;
      }

      if (file.size > IMAGEKIT_MAX_FILE_SIZE) {
        mostraErrorePubblicazione(["L'immagine supera il limite di 25 MB."]);

        fileInputImmagine.value = "";

        return;
      }

      /*
       * IMPORTANTE:
       *
       * NON viene effettuato alcun
       * upload qui.
       *
       * Il file rimane solamente
       * nella memoria del browser.
       */

      fileImmagineNotizia = file;

      nomeImmagineNotizia = file.name;

      mostraBoxImmagine(nomeImmagineNotizia);

      mostraMessaggioPubblicazione("Immagine caricata correttamente.");
    });
  }

  // ====================================================
  // LOADER
  // ====================================================

  function mostraLoader(testo = "Caricamento in corso...") {
    if (!caricamentoCreazioneNotizia) {
      return;
    }

    if (testoCaricamentoCreazioneNotizia) {
      testoCaricamentoCreazioneNotizia.textContent = testo;
    }

    caricamentoCreazioneNotizia.classList.add("visibile");

    caricamentoCreazioneNotizia.setAttribute("aria-hidden", "false");

    if (pulsanteSalvaBozza) {
      pulsanteSalvaBozza.style.pointerEvents = "none";

      pulsanteSalvaBozza.style.opacity = "0.65";
    }

    if (pulsantePubblica) {
      pulsantePubblica.style.pointerEvents = "none";

      pulsantePubblica.style.opacity = "0.65";
    }
  }

  function nascondiLoader() {
    if (!caricamentoCreazioneNotizia) {
      return;
    }

    caricamentoCreazioneNotizia.classList.remove("visibile");

    caricamentoCreazioneNotizia.setAttribute("aria-hidden", "true");

    if (pulsanteSalvaBozza) {
      pulsanteSalvaBozza.style.pointerEvents = "auto";

      pulsanteSalvaBozza.style.opacity = "1";
    }

    if (pulsantePubblica) {
      pulsantePubblica.style.pointerEvents = "auto";

      pulsantePubblica.style.opacity = "1";
    }
  }

  // ====================================================
  // PULIZIA CAMPI
  // ====================================================

  function pulisciCampiNotizia() {
    inputTitoloNotizia.value = "";

    inputTestoNotizia.value = "";

    inputGiorno.value = "";

    inputMese.value = "";

    inputAnno.value = "";

    fileImmagineNotizia = null;

    nomeImmagineNotizia = "";

    if (fileInputImmagine) {
      fileInputImmagine.value = "";
    }

    nascondiBoxImmagine();

    aggiornaLayoutNotizia();
  }

  // ====================================================
  // SALVA NOTIZIA
  // ====================================================

  async function salvaNotizia(pubblicata) {
    const errori = validaPubblicazione();

    if (errori.length > 0) {
      mostraErrorePubblicazione(errori);

      aggiornaLayoutNotizia();

      return false;
    }

    if (caricamentoImmagineInCorso) {
      mostraErrorePubblicazione([
        "Attendi il completamento del caricamento dell'immagine.",
      ]);

      return false;
    }

    const giorno = Number(inputGiorno.value.trim());

    const mese = Number(inputMese.value.trim());

    const anno = Number(inputAnno.value.trim());

    const dataNotizia = new Date(anno, mese - 1, giorno);

    mostraLoader(
      pubblicata ? "Pubblicazione in corso..." : "Salvataggio in corso...",
    );

    try {
      let immagineNotizia = "";

      /*
       * L'upload ImageKit viene fatto
       * SOLO adesso, dopo aver premuto
       * Pubblica oppure Salva come bozza.
       */

      if (fileImmagineNotizia) {
        immagineNotizia = await caricaImmagineSuImageKit(fileImmagineNotizia);
      }

      const datiNotizia = {
        titolo: inputTitoloNotizia.value.trim(),

        testo: inputTestoNotizia.value.trim(),

        data: Timestamp.fromDate(dataNotizia),

        immagine: immagineNotizia,

        pubblicata: pubblicata === true,
      };

      const riferimento = await addDoc(
        collection(db, COLLECTION_NEWS),
        datiNotizia,
      );

      console.log(
        `Notizia ${pubblicata ? "pubblicata" : "salvata come bozza"}:`,
        riferimento.id,
      );

      nascondiLoader();

      mostraMessaggioPubblicazione(
        pubblicata
          ? "Notizia pubblicata correttamente."
          : "Notizia salvata come bozza correttamente.",
      );

      pulisciCampiNotizia();

      await caricaNewsAdmin();

      return true;
    } catch (error) {
      console.error("Errore salvataggio notizia:", error);

      nascondiLoader();

      mostraErrorePubblicazione([
        error.message || "Impossibile salvare la notizia.",
      ]);

      aggiornaLayoutNotizia();

      return false;
    }
  }

  // ====================================================
  // PULSANTI SALVA / PUBBLICA
  // ====================================================

  pulsantePubblica.addEventListener("click", async (event) => {
    event.preventDefault();

    await salvaNotizia(true);
  });

  if (pulsanteSalvaBozza) {
    pulsanteSalvaBozza.addEventListener("click", async (event) => {
      event.preventDefault();

      await salvaNotizia(false);
    });
  }

  // ====================================================
  // INPUT TESTO
  // ====================================================

  inputTitoloNotizia.addEventListener("input", () => {
    nascondiErrorePubblicazione();

    aggiornaLayoutNotizia();
  });

  inputTestoNotizia.addEventListener("input", () => {
    nascondiErrorePubblicazione();

    aggiornaLayoutNotizia();
  });

  // ====================================================
  // RESIZE OBSERVER CAMPI
  // ====================================================

  if ("ResizeObserver" in window) {
    const osservatoreTextarea = new ResizeObserver(() => {
      aggiornaLayoutNotizia();
    });

    osservatoreTextarea.observe(inputTitoloNotizia);

    osservatoreTextarea.observe(inputTestoNotizia);
  }

  // ====================================================
  // ENTER DATA
  // ====================================================

  inputGiorno.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      inputMese.focus();
    }
  });

  inputMese.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      inputAnno.focus();
    }
  });

  // ====================================================
  // FORMATTA DATA NEWS
  // ====================================================

  function formattaDataNews(timestamp) {
    if (!timestamp) {
      return "";
    }

    let data;

    if (typeof timestamp.toDate === "function") {
      data = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      data = timestamp;
    } else {
      data = new Date(timestamp);
    }

    if (isNaN(data.getTime())) {
      return "";
    }

    return data.toLocaleDateString("it-IT", {
      day: "2-digit",

      month: "2-digit",

      year: "numeric",
    });
  }

  // ====================================================
  // PULIZIA TESTO HTML
  // ====================================================

  function pulisciTestoHTMLNews(testo) {
    if (!testo) {
      return "";
    }

    const contenitore = document.createElement("div");

    contenitore.innerHTML = testo;

    return (contenitore.textContent || contenitore.innerText || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ====================================================
  // ADATTAMENTO TESTO CARD
  // ====================================================

  function adattaTestoNews(elemento, testoCompleto, suffisso = " [...]") {
    if (!elemento) {
      return;
    }

    if (!testoCompleto) {
      elemento.textContent = "";

      return;
    }

    elemento.textContent = testoCompleto;

    if (elemento.scrollHeight <= elemento.clientHeight + 1) {
      return;
    }

    let sinistra = 0;

    let destra = testoCompleto.length;

    let migliore = "";

    while (sinistra <= destra) {
      const centro = Math.floor((sinistra + destra) / 2);

      const candidato = testoCompleto.substring(0, centro).trim() + suffisso;

      elemento.textContent = candidato;

      if (elemento.scrollHeight <= elemento.clientHeight + 1) {
        migliore = candidato;

        sinistra = centro + 1;
      } else {
        destra = centro - 1;
      }
    }

    if (!migliore) {
      elemento.textContent = suffisso;

      return;
    }

    let base = migliore.substring(0, migliore.length - suffisso.length).trim();

    const ultimoSpazio = base.lastIndexOf(" ");

    if (ultimoSpazio > 0) {
      base = base.substring(0, ultimoSpazio).trim();
    }

    elemento.textContent = base + suffisso;

    let indice = base.length;

    while (indice < testoCompleto.length) {
      const candidato =
        testoCompleto.substring(0, indice + 1).trim() + suffisso;

      elemento.textContent = candidato;

      if (elemento.scrollHeight <= elemento.clientHeight + 1) {
        indice++;
      } else {
        break;
      }
    }
  }

  // ====================================================
  // CARICAMENTO NEWS ADMIN
  // ====================================================

  async function caricaNewsAdmin() {
    try {
      const riferimento = collection(db, COLLECTION_NEWS);

      const q = query(riferimento, orderBy("data", "desc"));

      const snapshot = await getDocs(q);

      elencoNewsAdmin = [];

      snapshot.forEach((documento) => {
        const dati = documento.data();

        if (dati.pubblicata !== true) {
          return;
        }

        const immagine = dati.image ?? dati.immagine ?? "";

        elencoNewsAdmin.push({
          id: documento.id,

          titolo: dati.titolo || "",

          testo: dati.testo || "",

          data: dati.data || null,

          immagine: typeof immagine === "string" ? immagine.trim() : "",
        });
      });

      numeroNewsVisibiliAdmin = MASSIMO_NEWS_PER_CARICAMENTO;

      indiceNewsApertaAdmin = 0;

      creaNewsPiccoleAdmin();

      preparaFocusAdmin();

      aggiornaPulsanteCaricaAltroAdmin();

      console.log("News admin caricate:", elencoNewsAdmin);
    } catch (error) {
      console.error("Errore caricamento news admin:", error);
    }
  }

  // ====================================================
  // CREAZIONE CARD
  // ====================================================

  function creaNewsPiccoleAdmin() {
    if (!listaNotizieAdmin) {
      return;
    }

    listaNotizieAdmin
      .querySelectorAll(".notizia_piccola_admin")
      .forEach((elemento) => {
        elemento.remove();
      });

    if (elencoNewsAdmin.length === 0) {
      testoNotizieAssentiAdmin.style.display = "block";

      aggiornaPulsanteCaricaAltroAdmin();

      aggiornaLayoutPannelloNotizieAdmin();

      return;
    }

    testoNotizieAssentiAdmin.style.display = "none";

    const newsDaMostrare = elencoNewsAdmin.slice(0, numeroNewsVisibiliAdmin);

    newsDaMostrare.forEach((news, indice) => {
      const notiziaPiccola = document.createElement("div");

      notiziaPiccola.className = "notizia_piccola_admin";

      if (!news.immagine) {
        notiziaPiccola.classList.add("senza_immagine");
      }

      const sfondo = document.createElement("div");

      sfondo.className = "sfondo_notizia_piccola_admin";

      const immagine = document.createElement("div");

      immagine.className = "immagine_notizia_piccola_admin";

      if (news.immagine) {
        immagine.style.backgroundImage = `url("${news.immagine}")`;
      } else {
        immagine.style.backgroundImage = "none";
      }

      const data = document.createElement("span");

      data.className = "data_notizia_piccola_admin";

      data.textContent = formattaDataNews(news.data);

      const titolo = document.createElement("span");

      titolo.className = "titolo_notizia_piccola_admin";

      const testo = document.createElement("span");

      testo.className = "testo_notizia_piccola_admin";

      notiziaPiccola.appendChild(sfondo);

      notiziaPiccola.appendChild(immagine);

      notiziaPiccola.appendChild(data);

      notiziaPiccola.appendChild(titolo);

      notiziaPiccola.appendChild(testo);

      notiziaPiccola.addEventListener("click", () => {
        indiceNewsApertaAdmin = indice;

        apriNotiziaAdmin(indice);
      });

      listaNotizieAdmin.appendChild(notiziaPiccola);

      requestAnimationFrame(() => {
        adattaTestoNews(titolo, news.titolo, " [...]");

        adattaTestoNews(testo, pulisciTestoHTMLNews(news.testo), " [...]");
      });
    });

    aggiornaPulsanteCaricaAltroAdmin();

    aggiornaLayoutPannelloNotizieAdmin();
  }

  // ====================================================
  // PULSANTE CARICA ALTRO
  // ====================================================

  function aggiornaPulsanteCaricaAltroAdmin() {
    if (!pulsanteCaricaAltro) {
      return;
    }

    if (
      elencoNewsAdmin.length > MASSIMO_NEWS_PER_CARICAMENTO &&
      numeroNewsVisibiliAdmin < elencoNewsAdmin.length
    ) {
      pulsanteCaricaAltro.style.display = "block";
    } else {
      pulsanteCaricaAltro.style.display = "none";
    }

    aggiornaLayoutPannelloNotizieAdmin();
  }

  if (pulsanteCaricaAltro) {
    pulsanteCaricaAltro.addEventListener("click", () => {
      if (numeroNewsVisibiliAdmin >= elencoNewsAdmin.length) {
        return;
      }

      numeroNewsVisibiliAdmin += MASSIMO_NEWS_PER_CARICAMENTO;

      if (numeroNewsVisibiliAdmin > elencoNewsAdmin.length) {
        numeroNewsVisibiliAdmin = elencoNewsAdmin.length;
      }

      creaNewsPiccoleAdmin();

      aggiornaPulsanteCaricaAltroAdmin();

      aggiornaLayoutPannelloNotizieAdmin();
    });
  }

  // ====================================================
  // PREPARAZIONE FOCUS
  // ====================================================

  function preparaFocusAdmin() {
    notiziaFocusAdmin.innerHTML = "";

    const offuscamento = document.createElement("div");

    offuscamento.className = "offuscamento_background_admin";

    const notizia = document.createElement("div");

    notizia.className = "notizia_admin";

    const sfondo = document.createElement("div");

    sfondo.className = "sfondo_notizia_admin";

    const immagine = document.createElement("div");

    immagine.className = "immagine_notizia_admin";

    const data = document.createElement("span");

    data.className = "data_notizia_admin";

    const titolo = document.createElement("span");

    titolo.className = "titolo_notizia_admin_focus";

    const testo = document.createElement("span");

    testo.className = "testo_notizia_admin_focus";

    const pulsanteEsci = document.createElement("div");

    pulsanteEsci.className = "pulsante_esci_admin";

    const sfondoEsci = document.createElement("div");

    sfondoEsci.className = "sfondo_pulsante_esci_admin";

    const iconaEsci = document.createElement("div");

    iconaEsci.className = "icona_pulsante_esci_admin";

    pulsanteEsci.appendChild(sfondoEsci);

    pulsanteEsci.appendChild(iconaEsci);

    const pulsanteDestra = document.createElement("div");

    pulsanteDestra.className = "pulsante_scorri_destra_admin";

    const sfondoDestra = document.createElement("div");

    sfondoDestra.className = "sfondo_pulsante_scorri_destra_admin";

    const iconaDestra = document.createElement("div");

    iconaDestra.className = "icona_pulsante_scorri_destra_admin";

    pulsanteDestra.appendChild(sfondoDestra);

    pulsanteDestra.appendChild(iconaDestra);

    const pulsanteSinistra = document.createElement("div");

    pulsanteSinistra.className = "pulsante_scorri_sinistra_admin";

    const sfondoSinistra = document.createElement("div");

    sfondoSinistra.className = "sfondo_pulsante_scorri_sinistra_admin";

    const iconaSinistra = document.createElement("div");

    iconaSinistra.className = "icona_pulsante_scorri_sinistra_admin";

    pulsanteSinistra.appendChild(sfondoSinistra);

    pulsanteSinistra.appendChild(iconaSinistra);

    notizia.appendChild(sfondo);

    notizia.appendChild(immagine);

    notizia.appendChild(data);

    notizia.appendChild(titolo);

    notizia.appendChild(testo);

    notizia.appendChild(pulsanteEsci);

    notizia.appendChild(pulsanteDestra);

    notizia.appendChild(pulsanteSinistra);

    notiziaFocusAdmin.appendChild(offuscamento);

    notiziaFocusAdmin.appendChild(notizia);

    pulsanteEsci.addEventListener("click", (event) => {
      event.stopPropagation();

      chiudiNotiziaAdmin();
    });

    pulsanteDestra.addEventListener("click", (event) => {
      event.stopPropagation();

      if (elencoNewsAdmin.length === 0) {
        return;
      }

      indiceNewsApertaAdmin++;

      if (indiceNewsApertaAdmin >= elencoNewsAdmin.length) {
        indiceNewsApertaAdmin = 0;
      }

      aggiornaNotiziaFocusAdmin(indiceNewsApertaAdmin);
    });

    pulsanteSinistra.addEventListener("click", (event) => {
      event.stopPropagation();

      if (elencoNewsAdmin.length === 0) {
        return;
      }

      indiceNewsApertaAdmin--;

      if (indiceNewsApertaAdmin < 0) {
        indiceNewsApertaAdmin = elencoNewsAdmin.length - 1;
      }

      aggiornaNotiziaFocusAdmin(indiceNewsApertaAdmin);
    });

    offuscamento.addEventListener("click", () => {
      chiudiNotiziaAdmin();
    });

    aggiornaNotiziaFocusAdmin(0);
  }

  // ====================================================
  // APERTURA FOCUS
  // ====================================================

  function apriNotiziaAdmin(indice) {
    if (!notiziaFocusAdmin) {
      return;
    }

    if (!elencoNewsAdmin[indice]) {
      return;
    }

    indiceNewsApertaAdmin = indice;

    aggiornaNotiziaFocusAdmin(indice);

    notiziaFocusAdmin.scrollTop = 0;

    notiziaFocusAdmin.classList.add("aperta");

    document.body.classList.add("popup_aperto_admin");
  }

  // ====================================================
  // CHIUSURA FOCUS
  // ====================================================

  function chiudiNotiziaAdmin() {
    if (!notiziaFocusAdmin) {
      return;
    }

    notiziaFocusAdmin.classList.remove("aperta");

    document.body.classList.remove("popup_aperto_admin");
  }

  // ====================================================
  // AGGIORNA FOCUS
  // ====================================================

  function aggiornaNotiziaFocusAdmin(indice) {
    const news = elencoNewsAdmin[indice];

    if (!news) {
      return;
    }

    const data = notiziaFocusAdmin.querySelector(".data_notizia_admin");

    const titolo = notiziaFocusAdmin.querySelector(
      ".titolo_notizia_admin_focus",
    );

    const testo = notiziaFocusAdmin.querySelector(".testo_notizia_admin_focus");

    const immagine = notiziaFocusAdmin.querySelector(".immagine_notizia_admin");

    const notizia = notiziaFocusAdmin.querySelector(".notizia_admin");

    const pulsanteDestra = notiziaFocusAdmin.querySelector(
      ".pulsante_scorri_destra_admin",
    );

    const pulsanteSinistra = notiziaFocusAdmin.querySelector(
      ".pulsante_scorri_sinistra_admin",
    );

    if (data) {
      data.textContent = formattaDataNews(news.data);
    }

    if (titolo) {
      titolo.textContent = news.titolo;
    }

    if (testo) {
      testo.innerHTML = news.testo || "";
    }

    const senzaImmagine = !news.immagine || news.immagine.trim() === "";

    if (notizia) {
      if (senzaImmagine) {
        notizia.classList.add("notizia_senza_immagine_admin");
      } else {
        notizia.classList.remove("notizia_senza_immagine_admin");
      }
    }

    if (immagine) {
      if (senzaImmagine) {
        immagine.style.backgroundImage = "none";
      } else {
        immagine.style.backgroundImage = `url("${news.immagine}")`;
      }
    }

    if (pulsanteDestra) {
      pulsanteDestra.style.display = senzaImmagine ? "none" : "";
    }

    if (pulsanteSinistra) {
      pulsanteSinistra.style.display = senzaImmagine ? "none" : "";
    }

    requestAnimationFrame(() => {
      aggiornaAltezzaNotiziaAdmin();
    });
  }

  // ====================================================
  // ALTEZZA FOCUS
  // ====================================================

  function aggiornaAltezzaNotiziaAdmin() {
    const notizia = notiziaFocusAdmin.querySelector(".notizia_admin");

    const testo = notiziaFocusAdmin.querySelector(".testo_notizia_admin_focus");

    if (!notizia || !testo) {
      return;
    }

    const altezzaRealeTesto = testo.scrollHeight;

    const fineTesto = testo.offsetTop + altezzaRealeTesto;

    const spazioFinale = (2.60417 * window.innerWidth) / 100;

    const altezzaNotizia = fineTesto + spazioFinale;

    if (notizia.classList.contains("notizia_senza_immagine_admin")) {
      notizia.style.height = `${altezzaNotizia}px`;
    } else {
      notizia.style.height = `${Math.max(
        altezzaNotizia,
        (94.42 * window.innerWidth) / 100,
      )}px`;
    }
  }

  // ====================================================
  // TASTO ESC
  // ====================================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (notiziaFocusAdmin.classList.contains("aperta")) {
        chiudiNotiziaAdmin();
      }
    }

    if (!notiziaFocusAdmin.classList.contains("aperta")) {
      return;
    }

    if (event.key === "ArrowRight") {
      indiceNewsApertaAdmin++;

      if (indiceNewsApertaAdmin >= elencoNewsAdmin.length) {
        indiceNewsApertaAdmin = 0;
      }

      aggiornaNotiziaFocusAdmin(indiceNewsApertaAdmin);
    }

    if (event.key === "ArrowLeft") {
      indiceNewsApertaAdmin--;

      if (indiceNewsApertaAdmin < 0) {
        indiceNewsApertaAdmin = elencoNewsAdmin.length - 1;
      }

      aggiornaNotiziaFocusAdmin(indiceNewsApertaAdmin);
    }
  });

  // ====================================================
  // RESIZE
  // ====================================================

  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      aggiornaLayoutNotizia();

      creaNewsPiccoleAdmin();

      aggiornaAltezzaNotiziaAdmin();
    }, 50);
  });

  // ====================================================
  // FONT
  // ====================================================

  if (document.fonts) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        aggiornaLayoutNotizia();

        creaNewsPiccoleAdmin();

        aggiornaAltezzaNotiziaAdmin();
      });
    });
  }

  // ====================================================
  // LOGIN
  // ====================================================

  async function effettuaAccesso() {
    console.log("Tentativo di accesso...");

    nascondiErrore();

    const nomeUtente = inputNomeUtente.value.trim();

    const password = inputPassword.value;

    if (nomeUtente === "") {
      mostraErrore("Inserisci il nome utente.");

      inputNomeUtente.focus();

      return;
    }

    if (password === "") {
      mostraErrore("Inserisci la password.");

      inputPassword.focus();

      return;
    }

    pulsanteEntra.disabled = true;

    pulsanteEntra.style.pointerEvents = "none";

    pulsanteEntra.style.opacity = "0.7";

    try {
      const risposta = await fetch(URL_WORKER_LOGIN, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: nomeUtente,

          password: password,
        }),
      });

      let dati;

      try {
        dati = await risposta.json();
      } catch {
        dati = {};
      }

      if (!risposta.ok || !dati.ok || !dati.token) {
        mostraErrore(dati.errore || "Nome utente o password non corretti.");

        inputPassword.focus();

        return;
      }

      console.log("Custom Token Firebase ricevuto.");

      await signInWithCustomToken(auth, dati.token);

      console.log("Autenticazione Firebase riuscita.");
    } catch (error) {
      console.error("Errore durante l'accesso:", error);

      if (error.code === "auth/invalid-custom-token") {
        mostraErrore("Il token di autenticazione non è valido.");
      } else if (error.code === "auth/custom-token-mismatch") {
        mostraErrore("Il token appartiene a un progetto Firebase diverso.");
      } else {
        mostraErrore("Impossibile effettuare l'accesso.");
      }
    } finally {
      pulsanteEntra.disabled = false;

      pulsanteEntra.style.pointerEvents = "auto";

      pulsanteEntra.style.opacity = "1";
    }
  }

  // ====================================================
  // STATO AUTENTICAZIONE
  // ====================================================

  onAuthStateChanged(auth, async (user) => {
    console.log(
      "Stato autenticazione:",
      user ? "AUTENTICATO" : "NON AUTENTICATO",
    );

    if (user) {
      pannelloAccesso.style.display = "none";

      pannelloAmministratore.style.display = "block";

      mostraSezione(sezioneImpostazioni);

      await caricaStatoPagine();

      await caricaNewsAdmin();
    } else {
      pannelloAccesso.style.display = "block";

      pannelloAmministratore.style.display = "none";
    }
  });

  // ====================================================
  // EVENTI LOGIN
  // ====================================================

  pulsanteEntra.addEventListener("click", (event) => {
    event.preventDefault();

    effettuaAccesso();
  });

  inputNomeUtente.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      effettuaAccesso();
    }
  });

  inputPassword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      effettuaAccesso();
    }
  });

  inputNomeUtente.addEventListener("input", () => {
    nascondiErrore();
  });

  inputPassword.addEventListener("input", () => {
    nascondiErrore();
  });

  // ====================================================
  // AVVIO LAYOUT
  // ====================================================

  aggiornaLayoutNotizia();

  mostraSezione(sezioneImpostazioni);
});
