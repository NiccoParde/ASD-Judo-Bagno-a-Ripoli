import {
  signInWithCustomToken,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  getDocs,
  collection,
  query,
  setDoc,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";


/* ====================================================== */
/* CONFIGURAZIONE LOGIN */
/* ====================================================== */

const URL_WORKER_LOGIN =
  "https://imagekit-auth.judobagnoaripoli.workers.dev/login";


/* ====================================================== */
/* CONFIGURAZIONE FIRESTORE */
/* ====================================================== */

const COLLECTION_BLOCCO_PAGINE =
  "blocco_pagine";

const COLLECTION_NEWS =
  "news";


/* ====================================================== */
/* CONFIGURAZIONE IMAGEKIT */
/* ====================================================== */

const IMAGEKIT_PUBLIC_KEY =
  "public_XGdQD6vo7Mo9P0AsfeKrHkJoXh8=";

const IMAGEKIT_AUTHENTICATION_ENDPOINT =
  "https://imagekit-auth.judobagnoaripoli.workers.dev";

const IMAGEKIT_UPLOAD_ENDPOINT =
  "https://upload.imagekit.io/api/v1/files/upload";

const IMAGEKIT_FOLDER_NEWS =
  "/news";

const IMAGEKIT_MAX_FILE_SIZE =
  25 * 1024 * 1024;


/* ====================================================== */
/* AVVIO */
/* ====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  console.log(
    "pannello_amministratore.js caricato correttamente."
  );


  /* ====================================================== */
  /* ELEMENTI PRINCIPALI */
  /* ====================================================== */

  const pannelloAccesso =
    document.getElementById("pannelloAccesso");

  const pannelloAmministratore =
    document.getElementById("pannelloAmministratore");

  const inputNomeUtente =
    document.getElementById("inputNomeUtente");

  const inputPassword =
    document.getElementById("inputPassword");

  const pulsanteEntra =
    document.getElementById("pulsanteEntra");

  const pulsanteMostraPassword =
    document.getElementById("pulsanteMostraPassword");

  const errore =
    document.getElementById("erroreAccesso");


  /* ====================================================== */
  /* SELETTORE */
  /* ====================================================== */

  const selettoreImpostazioni =
    document.getElementById("selettoreImpostazioni");

  const selettoreNews =
    document.getElementById("selettoreNews");

  const selettoreEventi =
    document.getElementById("selettoreEventi");


  /* ====================================================== */
  /* SEZIONI */
  /* ====================================================== */

  const sezioneImpostazioni =
    document.getElementById("sezioneImpostazioni");

  const sezioneNews =
    document.getElementById("sezioneNews");

  const sezioneEventi =
    document.getElementById("sezioneEventi");


  /* ====================================================== */
  /* NEWS */
  /* ====================================================== */

  const inputTitoloNotizia =
    document.getElementById("inputTitoloNotizia");

  const inputTestoNotizia =
    document.getElementById("inputTestoNotizia");

  const inputGiorno =
    document.getElementById("inputGiorno");

  const inputMese =
    document.getElementById("inputMese");

  const inputAnno =
    document.getElementById("inputAnno");

  const pulsantePubblica =
    document.getElementById("pulsantePubblica");

  const errorePubblicazione =
    document.getElementById("errorePubblicazione");


  const pulsanteCaricaImmagini =
    document.querySelector(
      ".pulsante_carica_immagini"
    );


  const pulsanteSalvaBozza =
    document.querySelector(
      ".pulsante_salva_bozza"
    );


  const pannelloCreazioneNotizia =
    document.querySelector(
      ".pannello_creazione_notizia"
    );


  const pannelloNotizie =
    document.querySelector(
      ".pannello_notizie"
    );


  /* ====================================================== */
  /* STATO IMMAGINE */
  /* ====================================================== */

  /*
   * IMPORTANTE:
   *
   * L'immagine NON viene più caricata immediatamente
   * su ImageKit.
   *
   * Conserviamo solamente il File selezionato nel browser.
   *
   * L'upload su ImageKit avverrà esclusivamente quando
   * l'utente pubblicherà la notizia oppure la salverà
   * come bozza.
   */

  let fileImmagineNotizia = null;

  let immagineNotizia = "";

  let nomeImmagineNotizia = "";

  let fileInputImmagine = null;

  let caricamentoImmagineInCorso = false;


  /* ====================================================== */
  /* BOX IMMAGINE */
  /* ====================================================== */

  let boxImmagineNotizia = null;

  let testoNomeImmagineNotizia = null;

  let pulsanteRimuoviImmagine = null;


  /* ====================================================== */
  /* CONTROLLO ELEMENTI */
  /* ====================================================== */

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
    !pannelloNotizie
  ) {

    console.error(
      "Uno o più elementi HTML non sono stati trovati."
    );

    return;
  }


  /* ====================================================== */
  /* STATO INIZIALE */
  /* ====================================================== */

  pannelloAccesso.style.display =
    "none";

  pannelloAmministratore.style.display =
    "none";


  /* ====================================================== */
  /* ERRORI ACCESSO */
  /* ====================================================== */

  function mostraErrore(messaggio) {

    errore.textContent =
      messaggio;

    errore.style.display =
      "block";
  }


  function nascondiErrore() {

    errore.textContent =
      "";

    errore.style.display =
      "none";
  }


  /* ====================================================== */
  /* ESCAPE HTML */
  /* ====================================================== */

  function escapeHTML(testo) {

    return String(testo)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* ====================================================== */
  /* ERRORI PUBBLICAZIONE */
  /* ====================================================== */

  function mostraErrorePubblicazione(
    messaggi
  ) {

    if (!errorePubblicazione) {
      return;
    }


    if (
      !messaggi ||
      messaggi.length === 0
    ) {

      errorePubblicazione.textContent =
        "";

      errorePubblicazione.classList.remove(
        "visibile"
      );

      return;
    }


    errorePubblicazione.innerHTML =
      messaggi
        .map(
          (messaggio) =>
            `<div>${escapeHTML(messaggio)}</div>`
        )
        .join("");


    errorePubblicazione.style.color =
      "#ff5b5b";

    errorePubblicazione.classList.add(
      "visibile"
    );
  }


  /* ====================================================== */
  /* MESSAGGIO SUCCESSO */
  /* ====================================================== */

  function mostraMessaggioPubblicazione(
    messaggio
  ) {

    if (!errorePubblicazione) {
      return;
    }


    errorePubblicazione.textContent =
      messaggio;

    errorePubblicazione.style.color =
      "#2e8b57";

    errorePubblicazione.classList.add(
      "visibile"
    );
  }


  /* ====================================================== */
  /* NASCONDI MESSAGGIO */
  /* ====================================================== */

  function nascondiErrorePubblicazione() {

    if (!errorePubblicazione) {
      return;
    }


    errorePubblicazione.textContent =
      "";

    errorePubblicazione.style.color =
      "#ff5b5b";

    errorePubblicazione.classList.remove(
      "visibile"
    );
  }


  /* ====================================================== */
  /* MOSTRA PASSWORD */
  /* ====================================================== */

  pulsanteMostraPassword.addEventListener(
    "click",
    () => {

      inputPassword.type =
        "text";


      pulsanteMostraPassword.setAttribute(
        "aria-label",
        "Password mostrata"
      );


      pulsanteMostraPassword.setAttribute(
        "title",
        "Password mostrata"
      );
    }
  );


  /* ====================================================== */
  /* AGGIORNA SELETTORE */
  /* ====================================================== */

  function aggiornaSelettore(
    pagina
  ) {

    const testoImpostazioni =
      document.querySelector(
        ".testo_selettore_impostazioni"
      );

    const testoNews =
      document.querySelector(
        ".testo_selettore_news"
      );

    const testoEventi =
      document.querySelector(
        ".testo_selettore_eventi"
      );


    const iconaImpostazioni =
      document.querySelector(
        ".icona_selettore_impostazioni"
      );

    const iconaNews =
      document.querySelector(
        ".icona_selettore_news"
      );

    const iconaEventi =
      document.querySelector(
        ".icona_selettore_eventi"
      );


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


    if (
      pagina ===
      "impostazioni"
    ) {

      testoImpostazioni.style.color =
        "#2a2a2a";

      testoNews.style.color =
        "#a6a6a6";

      testoEventi.style.color =
        "#868686";


      iconaImpostazioni.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_impostazioni_attivo.svg")';

      iconaNews.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_notizie_disattivo.svg")';

      iconaEventi.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_calendario_disattivo.svg")';

      return;
    }


    if (
      pagina ===
      "news"
    ) {

      testoImpostazioni.style.color =
        "#a6a6a6";

      testoNews.style.color =
        "#2a2a2a";

      testoEventi.style.color =
        "#868686";


      iconaImpostazioni.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_impostazioni_disattivo.svg")';

      iconaNews.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_notizie_attivo.svg")';

      iconaEventi.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_calendario_disattivo.svg")';

      return;
    }


    if (
      pagina ===
      "eventi"
    ) {

      testoImpostazioni.style.color =
        "#a6a6a6";

      testoNews.style.color =
        "#a6a6a6";

      testoEventi.style.color =
        "#868686";


      iconaImpostazioni.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_impostazioni_disattivo.svg")';

      iconaNews.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_notizie_disattivo.svg")';

      iconaEventi.style.backgroundImage =
        'url("../assets/pannello_amministratore/icona_calendario_disattivo.svg")';
    }
  }


  /* ====================================================== */
  /* MOSTRA SEZIONE */
  /* ====================================================== */

  function mostraSezione(
    sezione
  ) {

    sezioneImpostazioni.style.display =
      "none";

    sezioneNews.style.display =
      "none";

    sezioneEventi.style.display =
      "none";


    if (
      sezione ===
      sezioneImpostazioni
    ) {

      sezioneImpostazioni.style.display =
        "block";


      aggiornaSelettore(
        "impostazioni"
      );


      window.scrollTo(
        0,
        0
      );

      return;
    }


    if (
      sezione ===
      sezioneNews
    ) {

      sezioneNews.style.display =
        "block";


      aggiornaSelettore(
        "news"
      );


      aggiornaLayoutNotizia();


      window.scrollTo(
        0,
        0
      );

      return;
    }


    if (
      sezione ===
      sezioneEventi
    ) {

      sezioneEventi.style.display =
        "block";


      aggiornaSelettore(
        "eventi"
      );


      window.scrollTo(
        0,
        0
      );
    }
  }


  selettoreImpostazioni.addEventListener(
    "click",
    () => {

      mostraSezione(
        sezioneImpostazioni
      );
    }
  );


  selettoreNews.addEventListener(
    "click",
    () => {

      mostraSezione(
        sezioneNews
      );
    }
  );


  selettoreEventi.addEventListener(
    "click",
    () => {

      mostraSezione(
        sezioneEventi
      );
    }
  );


  /* ====================================================== */
  /* ASPETTO PULSANTI BLOCCO */
  /* ====================================================== */

  function aggiornaAspettoPulsante(
    pulsante,
    bloccata
  ) {

    if (!pulsante) {
      return;
    }


    const testo =
      pulsante.querySelector(
        ".testo_pulsante_blocca"
      );


    if (bloccata) {

      pulsante.classList.add(
        "attivo"
      );


      if (testo) {

        testo.textContent =
          "Sblocca";
      }

    } else {

      pulsante.classList.remove(
        "attivo"
      );


      if (testo) {

        testo.textContent =
          "Blocca";
      }
    }
  }


  /* ====================================================== */
  /* CARICA STATO PAGINE */
  /* ====================================================== */

  async function caricaStatoPagine() {

    console.log(
      "Caricamento stato pagine..."
    );


    try {

      const riferimento =
        collection(
          db,
          COLLECTION_BLOCCO_PAGINE
        );


      const risultati =
        await getDocs(
          query(riferimento)
        );


      risultati.forEach(
        (documento) => {

          const elementoPagina =
            document.querySelector(
              `[data-pagina="${documento.id}"]`
            );


          if (!elementoPagina) {
            return;
          }


          const pulsante =
            elementoPagina.querySelector(
              ".pulsante_blocca"
            );


          if (!pulsante) {
            return;
          }


          const dati =
            documento.data();


          aggiornaAspettoPulsante(
            pulsante,
            dati.bloccata === true
          );
        }
      );


      console.log(
        "Stato pagine caricato."
      );

    } catch (error) {

      console.error(
        "Errore caricamento stato pagine:",
        error
      );
    }
  }


  /* ====================================================== */
  /* CAMBIA STATO PAGINA */
  /* ====================================================== */

  async function cambiaStatoPagina(
    elementoPagina,
    pulsante
  ) {

    if (
      !elementoPagina ||
      !pulsante
    ) {

      return;
    }


    const pagina =
      elementoPagina.dataset.pagina;


    if (!pagina) {
      return;
    }


    const statoAttuale =
      pulsante.classList.contains(
        "attivo"
      );


    const nuovoStato =
      !statoAttuale;


    pulsante.style.pointerEvents =
      "none";


    try {

      const riferimento =
        doc(
          db,
          COLLECTION_BLOCCO_PAGINE,
          pagina
        );


      await setDoc(
        riferimento,
        {
          bloccata:
            nuovoStato,
        },
        {
          merge:
            true,
        }
      );


      aggiornaAspettoPulsante(
        pulsante,
        nuovoStato
      );


      console.log(
        `Pagina ${pagina}: ${
          nuovoStato
            ? "BLOCCATA"
            : "SBLOCCATA"
        }`
      );

    } catch (error) {

      console.error(
        "Errore modifica stato pagina:",
        error
      );


      mostraErrore(
        "Impossibile modificare lo stato della pagina."
      );

    } finally {

      pulsante.style.pointerEvents =
        "auto";
    }
  }


  document
    .querySelectorAll(
      "[data-pagina]"
    )
    .forEach(
      (elementoPagina) => {

        const pulsante =
          elementoPagina.querySelector(
            ".pulsante_blocca"
          );


        if (!pulsante) {
          return;
        }


        pulsante.addEventListener(
          "click",
          () => {

            cambiaStatoPagina(
              elementoPagina,
              pulsante
            );
          }
        );
      }
    );


  /* ====================================================== */
  /* CAMPI NUMERICI */
  /* ====================================================== */

  function mantieniSoloNumeri(
    elemento
  ) {

    elemento.value =
      elemento.value.replace(
        /\D/g,
        ""
      );
  }


  function limitaData(
    elemento,
    massimo
  ) {

    if (!elemento) {
      return;
    }


    mantieniSoloNumeri(
      elemento
    );


    if (
      elemento.value.length >
      massimo
    ) {

      elemento.value =
        elemento.value.substring(
          0,
          massimo
        );
    }
  }


  inputGiorno.addEventListener(
    "input",
    () => {

      limitaData(
        inputGiorno,
        2
      );


      nascondiErrorePubblicazione();
    }
  );


  inputMese.addEventListener(
    "input",
    () => {

      limitaData(
        inputMese,
        2
      );


      nascondiErrorePubblicazione();
    }
  );


  inputAnno.addEventListener(
    "input",
    () => {

      limitaData(
        inputAnno,
        4
      );


      nascondiErrorePubblicazione();
    }
  );


  /* ====================================================== */
  /* AUTO-ESPANSIONE TEXTAREA */
  /* ====================================================== */

  function adattaCampoTesto(
    elemento
  ) {

    if (!elemento) {
      return 0;
    }


    const stile =
      window.getComputedStyle(
        elemento
      );


    const altezzaMinima =
      parseFloat(
        stile.minHeight
      ) || 0;


    elemento.style.height =
      `${altezzaMinima}px`;


    const altezzaNecessaria =
      elemento.scrollHeight;


    const altezzaEffettiva =
      Math.max(
        altezzaNecessaria,
        altezzaMinima
      );


    elemento.style.height =
      `${altezzaEffettiva}px`;


    return Math.max(
      0,
      altezzaEffettiva -
        altezzaMinima
    );
  }


  /* ====================================================== */
  /* CREA BOX IMMAGINE */
  /* ====================================================== */

  function creaBoxImmagine() {

    if (
      boxImmagineNotizia
    ) {

      return;
    }


    boxImmagineNotizia =
      document.createElement(
        "div"
      );


    boxImmagineNotizia.className =
      "box_immagine_notizia";


    boxImmagineNotizia.style.width =
      "40vw";

    boxImmagineNotizia.style.height =
      "3.6458vw";

    boxImmagineNotizia.style.position =
      "absolute";

    boxImmagineNotizia.style.left =
      "0";

    boxImmagineNotizia.style.top =
      "26.6146vw";

    boxImmagineNotizia.style.background =
      "#ffffff";

    boxImmagineNotizia.style.border =
      "0.1562vw solid rgba(41, 41, 41, 1)";

    boxImmagineNotizia.style.borderRadius =
      "0.3125vw";

    boxImmagineNotizia.style.boxShadow =
      "-0.2083vw 0.2083vw 0.2083vw rgba(0, 0, 0, 0.25)";

    boxImmagineNotizia.style.boxSizing =
      "border-box";

    boxImmagineNotizia.style.display =
      "flex";

    boxImmagineNotizia.style.alignItems =
      "center";

    boxImmagineNotizia.style.zIndex =
      "15";


    /* ================================================== */
    /* NOME FILE */
    /* ================================================== */

    testoNomeImmagineNotizia =
      document.createElement(
        "span"
      );


    testoNomeImmagineNotizia.className =
      "nome_immagine_notizia";


    testoNomeImmagineNotizia.style.position =
      "absolute";

    testoNomeImmagineNotizia.style.left =
      "1vw";

    testoNomeImmagineNotizia.style.right =
      "4vw";

    testoNomeImmagineNotizia.style.top =
      "50%";

    testoNomeImmagineNotizia.style.transform =
      "translateY(-50%)";

    testoNomeImmagineNotizia.style.color =
      "#292929";

    testoNomeImmagineNotizia.style.fontFamily =
      "Inter, sans-serif";

    testoNomeImmagineNotizia.style.fontWeight =
      "400";

    testoNomeImmagineNotizia.style.fontSize =
      "1.25vw";

    testoNomeImmagineNotizia.style.whiteSpace =
      "nowrap";

    testoNomeImmagineNotizia.style.overflow =
      "hidden";

    testoNomeImmagineNotizia.style.textOverflow =
      "ellipsis";


    /* ================================================== */
    /* PULSANTE X */
    /* ================================================== */

    pulsanteRimuoviImmagine =
      document.createElement(
        "button"
      );


    pulsanteRimuoviImmagine.type =
      "button";

    pulsanteRimuoviImmagine.className =
      "pulsante_rimuovi_immagine";

    pulsanteRimuoviImmagine.textContent =
      "×";


    pulsanteRimuoviImmagine.style.position =
      "absolute";

    pulsanteRimuoviImmagine.style.right =
      "0.7vw";

    pulsanteRimuoviImmagine.style.top =
      "50%";

    pulsanteRimuoviImmagine.style.transform =
      "translateY(-50%)";

    pulsanteRimuoviImmagine.style.width =
      "2.4vw";

    pulsanteRimuoviImmagine.style.height =
      "2.4vw";

    pulsanteRimuoviImmagine.style.padding =
      "0";

    pulsanteRimuoviImmagine.style.border =
      "none";

    pulsanteRimuoviImmagine.style.background =
      "transparent";

    pulsanteRimuoviImmagine.style.color =
      "#292929";

    pulsanteRimuoviImmagine.style.fontFamily =
      "Arial, sans-serif";

    pulsanteRimuoviImmagine.style.fontSize =
      "2.2vw";

    pulsanteRimuoviImmagine.style.fontWeight =
      "400";

    pulsanteRimuoviImmagine.style.lineHeight =
      "2.2vw";

    pulsanteRimuoviImmagine.style.textAlign =
      "center";

    pulsanteRimuoviImmagine.style.cursor =
      "pointer";

    pulsanteRimuoviImmagine.style.transition =
      "transform 0.1s ease";


    pulsanteRimuoviImmagine.addEventListener(
      "mouseenter",
      () => {

        pulsanteRimuoviImmagine.style.transform =
          "translateY(-50%) scale(1.15)";
      }
    );


    pulsanteRimuoviImmagine.addEventListener(
      "mouseleave",
      () => {

        pulsanteRimuoviImmagine.style.transform =
          "translateY(-50%) scale(1)";
      }
    );


    pulsanteRimuoviImmagine.addEventListener(
      "click",
      () => {

        rimuoviImmagineNotizia();
      }
    );


    boxImmagineNotizia.appendChild(
      testoNomeImmagineNotizia
    );


    boxImmagineNotizia.appendChild(
      pulsanteRimuoviImmagine
    );


    pannelloCreazioneNotizia.appendChild(
      boxImmagineNotizia
    );
  }


  /* ====================================================== */
  /* MOSTRA BOX IMMAGINE */
  /* ====================================================== */

  function mostraBoxImmagine(
    nomeFile
  ) {

    creaBoxImmagine();


    if (
      testoNomeImmagineNotizia
    ) {

      testoNomeImmagineNotizia.textContent =
        nomeFile;
    }


    boxImmagineNotizia.style.display =
      "flex";


    aggiornaLayoutNotizia();
  }


  /* ====================================================== */
  /* NASCONDI BOX IMMAGINE */
  /* ====================================================== */

  function nascondiBoxImmagine() {

    if (
      !boxImmagineNotizia
    ) {

      return;
    }


    boxImmagineNotizia.style.display =
      "none";


    aggiornaLayoutNotizia();
  }


  /* ====================================================== */
  /* RIMUOVI IMMAGINE */
  /* ====================================================== */

  function rimuoviImmagineNotizia() {

    /*
     * Eliminiamo solamente il riferimento locale.
     *
     * Siccome il file non è ancora stato caricato su
     * ImageKit, non rimane nessun file inutile online.
     */

    fileImmagineNotizia =
      null;

    immagineNotizia =
      "";

    nomeImmagineNotizia =
      "";


    if (
      fileInputImmagine
    ) {

      fileInputImmagine.value =
        "";
    }


    nascondiBoxImmagine();


    mostraMessaggioPubblicazione(
      "Immagine rimossa dalla notizia."
    );
  }


  /* ====================================================== */
  /* AGGIORNA LAYOUT NEWS */
  /* ====================================================== */

  function aggiornaLayoutNotizia() {

    if (
      !inputTitoloNotizia ||
      !inputTestoNotizia ||
      !pannelloCreazioneNotizia ||
      !pannelloNotizie
    ) {

      return;
    }


    const spostamentoTitolo =
      adattaCampoTesto(
        inputTitoloNotizia
      );


    const spostamentoTesto =
      adattaCampoTesto(
        inputTestoNotizia
      );


    const boxImmagineVisibile =
      boxImmagineNotizia &&
      boxImmagineNotizia.style.display !==
        "none";


    const spostamentoImmagine =
      boxImmagineVisibile
        ? "4.35vw"
        : "0px";


    const spostamentoTotale =
      spostamentoTitolo +
      spostamentoTesto;


    /* ================================================== */
    /* ELEMENTI SOTTO IL TITOLO */
    /* ================================================== */

    const elementiSottoTitolo = [
      {
        elemento:
          document.querySelector(
            ".etichetta_data"
          ),
        top:
          "13.5938vw",
      },

      {
        elemento:
          document.querySelector(
            ".contenitore_data"
          ),
        top:
          "18.0729vw",
      },

      {
        elemento:
          document.querySelector(
            ".etichetta_immagini"
          ),
        top:
          "22.1875vw",
      },
    ];


    elementiSottoTitolo.forEach(
      ({
        elemento,
        top,
      }) => {

        if (!elemento) {
          return;
        }


        elemento.style.top =
          `calc(${top} + ${spostamentoTitolo}px)`;
      }
    );


    /* ================================================== */
    /* BOX IMMAGINE */
    /* ================================================== */

    if (
      boxImmagineNotizia
    ) {

      boxImmagineNotizia.style.top =
        `calc(26.6146vw + ${spostamentoTitolo}px)`;
    }


    /* ================================================== */
    /* PULSANTE CARICA IMMAGINE */
    /* ================================================== */

    if (
      pulsanteCaricaImmagini
    ) {

      pulsanteCaricaImmagini.style.top =
        `calc(26.6146vw + ${spostamentoTitolo}px + ${spostamentoImmagine})`;
    }


    /* ================================================== */
    /* ELEMENTI SOTTO LE IMMAGINI */
    /* ================================================== */

    const elementiSottoImmagini = [
      {
        elemento:
          document.querySelector(
            ".etichetta_testo"
          ),
        top:
          "32.7604vw",
      },

      {
        elemento:
          document.querySelector(
            ".contenitore_testo_notizia"
          ),
        top:
          "35.8333vw",
      },
    ];


    elementiSottoImmagini.forEach(
      ({
        elemento,
        top,
      }) => {

        if (!elemento) {
          return;
        }


        elemento.style.top =
          `calc(${top} + ${spostamentoTitolo}px + ${spostamentoImmagine})`;
      }
    );


    /* ================================================== */
    /* SPOSTAMENTO FINALE */
    /* ================================================== */

    const spostamentoFinale =
      `calc(${spostamentoTotale}px + ${spostamentoImmagine})`;


    /* ================================================== */
    /* SALVA BOZZA */
    /* ================================================== */

    if (
      pulsanteSalvaBozza
    ) {

      pulsanteSalvaBozza.style.top =
        `calc(63.3854vw + ${spostamentoFinale})`;
    }


    /* ================================================== */
    /* PUBBLICA */
    /* ================================================== */

    if (
      pulsantePubblica
    ) {

      pulsantePubblica.style.top =
        `calc(63.3854vw + ${spostamentoFinale})`;
    }


    /* ================================================== */
    /* ERRORE PUBBLICAZIONE */
    /* ================================================== */

    if (
      errorePubblicazione
    ) {

      errorePubblicazione.style.top =
        `calc(60.15vw + ${spostamentoFinale})`;
    }


    /* ================================================== */
    /* ALTEZZA PANNELLO CREAZIONE */
    /* ================================================== */

    pannelloCreazioneNotizia.style.height =
      `calc(67.7604vw + ${spostamentoFinale})`;


    /* ================================================== */
    /* PANNELLO NOTIZIE */
    /* ================================================== */

    pannelloNotizie.style.top =
      `calc(92.44vw + ${spostamentoFinale})`;


    /* ================================================== */
    /* ALTEZZA SEZIONE NEWS */
    /* ================================================== */

    sezioneNews.style.minHeight =
      `calc(162.6042vw + ${spostamentoFinale})`;
  }


  /* ====================================================== */
  /* VALIDAZIONE DATA */
  /* ====================================================== */

  function dataValida() {

    const giorno =
      inputGiorno.value.trim();

    const mese =
      inputMese.value.trim();

    const anno =
      inputAnno.value.trim();


    if (
      giorno === "" ||
      mese === "" ||
      anno === ""
    ) {

      return false;
    }


    if (
      !/^\d{2}$/.test(giorno) ||
      !/^\d{2}$/.test(mese) ||
      !/^\d{4}$/.test(anno)
    ) {

      return false;
    }


    const giornoNumero =
      Number(giorno);

    const meseNumero =
      Number(mese);

    const annoNumero =
      Number(anno);


    if (
      annoNumero < 1 ||
      meseNumero < 1 ||
      meseNumero > 12 ||
      giornoNumero < 1 ||
      giornoNumero > 31
    ) {

      return false;
    }


    const data =
      new Date(
        annoNumero,
        meseNumero - 1,
        giornoNumero
      );


    return (
      data.getFullYear() ===
        annoNumero &&
      data.getMonth() ===
        meseNumero - 1 &&
      data.getDate() ===
        giornoNumero
    );
  }


  /* ====================================================== */
  /* VALIDAZIONE PUBBLICAZIONE */
  /* ====================================================== */

  function validaPubblicazione() {

    const errori = [];


    if (
      inputTitoloNotizia.value.trim() === ""
    ) {

      errori.push(
        "Inserisci il titolo della notizia."
      );
    }


    if (
      inputTestoNotizia.value.trim() === ""
    ) {

      errori.push(
        "Inserisci il testo della notizia."
      );
    }


    if (
      !dataValida()
    ) {

      errori.push(
        "Inserisci una data valida."
      );
    }


    return errori;
  }


  /* ====================================================== */
  /* IMAGEKIT: AUTENTICAZIONE */
  /* ====================================================== */

  async function ottieniAutenticazioneImageKit() {

    const risposta =
      await fetch(
        IMAGEKIT_AUTHENTICATION_ENDPOINT,
        {
          method:
            "GET",

          cache:
            "no-store",
        }
      );


    if (!risposta.ok) {

      throw new Error(
        "Impossibile ottenere l'autenticazione ImageKit."
      );
    }


    const dati =
      await risposta.json();


    if (
      !dati.token ||
      !dati.signature ||
      !dati.expire
    ) {

      throw new Error(
        "Risposta di autenticazione ImageKit non valida."
      );
    }


    return dati;
  }


  /* ====================================================== */
  /* IMAGEKIT: UPLOAD */
  /* ====================================================== */

  async function caricaImmagineSuImageKit(
    file
  ) {

    if (!file) {
      return "";
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      throw new Error(
        "Il file selezionato non è un'immagine."
      );
    }


    if (
      file.size >
      IMAGEKIT_MAX_FILE_SIZE
    ) {

      throw new Error(
        "L'immagine supera il limite di 25 MB."
      );
    }


    const autenticazione =
      await ottieniAutenticazioneImageKit();


    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    formData.append(
      "fileName",
      file.name ||
        `notizia-${Date.now()}.jpg`
    );


    formData.append(
      "publicKey",
      autenticazione.publicKey ||
        IMAGEKIT_PUBLIC_KEY
    );


    formData.append(
      "signature",
      autenticazione.signature
    );


    formData.append(
      "expire",
      String(
        autenticazione.expire
      )
    );


    formData.append(
      "token",
      autenticazione.token
    );


    formData.append(
      "useUniqueFileName",
      "true"
    );


    formData.append(
      "folder",
      IMAGEKIT_FOLDER_NEWS
    );


    const risposta =
      await fetch(
        IMAGEKIT_UPLOAD_ENDPOINT,
        {
          method:
            "POST",

          body:
            formData,
        }
      );


    let dati = {};


    try {

      dati =
        await risposta.json();

    } catch {

      dati = {};
    }


    if (
      !risposta.ok ||
      !dati.url
    ) {

      console.error(
        "Risposta ImageKit:",
        dati
      );


      throw new Error(
        dati.message ||
        dati.error ||
        "Impossibile caricare l'immagine su ImageKit."
      );
    }


    return dati.url;
  }


  /* ====================================================== */
  /* STATO PULSANTE IMMAGINI */
  /* ====================================================== */

  function aggiornaStatoPulsanteImmagini() {

    if (
      !pulsanteCaricaImmagini
    ) {

      return;
    }


    pulsanteCaricaImmagini.style.pointerEvents =
      caricamentoImmagineInCorso
        ? "none"
        : "auto";


    pulsanteCaricaImmagini.style.opacity =
      caricamentoImmagineInCorso
        ? "0.65"
        : "1";
  }


  /* ====================================================== */
  /* SELEZIONE IMMAGINE */
  /* ====================================================== */

  if (
    pulsanteCaricaImmagini
  ) {

    fileInputImmagine =
      document.createElement(
        "input"
      );


    fileInputImmagine.type =
      "file";


    fileInputImmagine.accept =
      "image/*";


    fileInputImmagine.style.display =
      "none";


    document.body.appendChild(
      fileInputImmagine
    );


    pulsanteCaricaImmagini.addEventListener(
      "click",
      () => {

        if (
          caricamentoImmagineInCorso
        ) {

          return;
        }


        fileInputImmagine.value =
          "";


        fileInputImmagine.click();
      }
    );


    fileInputImmagine.addEventListener(
      "change",
      async () => {

        const file =
          fileInputImmagine.files?.[0];


        if (!file) {
          return;
        }


        nascondiErrorePubblicazione();


        /*
         * Controlli effettuati SUBITO,
         * senza effettuare alcun upload.
         */

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          mostraErrorePubblicazione([
            "Il file selezionato non è un'immagine."
          ]);

          fileInputImmagine.value =
            "";

          return;
        }


        if (
          file.size >
          IMAGEKIT_MAX_FILE_SIZE
        ) {

          mostraErrorePubblicazione([
            "L'immagine supera il limite di 25 MB."
          ]);

          fileInputImmagine.value =
            "";

          return;
        }


        /*
         * Salviamo il File solamente in memoria.
         *
         * NON viene ancora mandato a ImageKit.
         */

        fileImmagineNotizia =
          file;


        immagineNotizia =
          "";

        nomeImmagineNotizia =
          file.name;


        console.log(
          "Immagine selezionata, upload rimandato al salvataggio:",
          file.name
        );


        mostraBoxImmagine(
          nomeImmagineNotizia
        );


        mostraMessaggioPubblicazione(
          "Immagine selezionata correttamente."
        );
      }
    );
  }


  /* ====================================================== */
  /* PULISCI CAMPI NOTIZIA */
  /* ====================================================== */

  function pulisciCampiNotizia() {

    inputTitoloNotizia.value =
      "";

    inputTestoNotizia.value =
      "";

    inputGiorno.value =
      "";

    inputMese.value =
      "";

    inputAnno.value =
      "";


    /*
     * Azzeriamo anche il File locale.
     */

    fileImmagineNotizia =
      null;

    immagineNotizia =
      "";

    nomeImmagineNotizia =
      "";


    if (
      fileInputImmagine
    ) {

      fileInputImmagine.value =
        "";
    }


    nascondiBoxImmagine();


    aggiornaLayoutNotizia();
  }


  /* ====================================================== */
  /* SALVA NOTIZIA IN FIRESTORE */
  /* ====================================================== */

  async function salvaNotizia(
    pubblicata
  ) {

    const errori =
      validaPubblicazione();


    if (
      errori.length > 0
    ) {

      mostraErrorePubblicazione(
        errori
      );


      aggiornaLayoutNotizia();


      return false;
    }


    if (
      caricamentoImmagineInCorso
    ) {

      mostraErrorePubblicazione([
        "Attendi il completamento del caricamento dell'immagine."
      ]);


      aggiornaLayoutNotizia();


      return false;
    }


    const giorno =
      Number(
        inputGiorno.value.trim()
      );

    const mese =
      Number(
        inputMese.value.trim()
      );

    const anno =
      Number(
        inputAnno.value.trim()
      );


    const dataNotizia =
      new Date(
        anno,
        mese - 1,
        giorno
      );


    const pulsante =
      pubblicata
        ? pulsantePubblica
        : pulsanteSalvaBozza;


    if (
      pulsante
    ) {

      pulsante.style.pointerEvents =
        "none";

      pulsante.style.opacity =
        "0.65";
    }


    try {

      /*
       * ====================================================
       * UPLOAD IMAGEKIT
       * ====================================================
       *
       * L'immagine viene caricata SOLO ADESSO.
       *
       * Quindi:
       *
       * - se l'utente sostituisce un'immagine prima di
       *   salvare, quella vecchia NON è mai stata caricata;
       *
       * - se l'utente rimuove l'immagine, non viene caricato
       *   nulla;
       *
       * - se non seleziona immagini, non viene effettuato
       *   nessun upload.
       */

      immagineNotizia =
        "";


      if (
        fileImmagineNotizia
      ) {

        caricamentoImmagineInCorso =
          true;


        aggiornaStatoPulsanteImmagini();


        mostraMessaggioPubblicazione(
          "Caricamento immagine..."
        );


        immagineNotizia =
          await caricaImmagineSuImageKit(
            fileImmagineNotizia
          );


        console.log(
          "Immagine caricata su ImageKit:",
          immagineNotizia
        );
      }


      /* ================================================== */
      /* DATI NOTIZIA */
      /* ================================================== */

      const datiNotizia = {

        titolo:
          inputTitoloNotizia.value.trim(),


        testo:
          inputTestoNotizia.value.trim(),


        data:
          Timestamp.fromDate(
            dataNotizia
          ),


        immagine:
          immagineNotizia || "",


        pubblicata:
          pubblicata === true,
      };


      /* ================================================== */
      /* FIRESTORE */
      /* ================================================== */

      const riferimento =
        await addDoc(
          collection(
            db,
            COLLECTION_NEWS
          ),
          datiNotizia
        );


      console.log(
        `Notizia ${
          pubblicata
            ? "pubblicata"
            : "salvata come bozza"
        }:`,
        riferimento.id
      );


      mostraMessaggioPubblicazione(
        pubblicata
          ? "Notizia pubblicata correttamente."
          : "Notizia salvata come bozza correttamente."
      );


      pulisciCampiNotizia();


      return true;


    } catch (error) {

      console.error(
        "Errore salvataggio notizia:",
        error
      );


      mostraErrorePubblicazione([
        error.message ||
          "Impossibile salvare la notizia."
      ]);


      aggiornaLayoutNotizia();


      return false;


    } finally {

      caricamentoImmagineInCorso =
        false;


      aggiornaStatoPulsanteImmagini();


      if (
        pulsante
      ) {

        pulsante.style.pointerEvents =
          "auto";

        pulsante.style.opacity =
          "1";
      }
    }
  }


  /* ====================================================== */
  /* PULSANTE PUBBLICA */
  /* ====================================================== */

  pulsantePubblica.addEventListener(
    "click",
    async (event) => {

      event.preventDefault();


      await salvaNotizia(
        true
      );
    }
  );


  /* ====================================================== */
  /* PULSANTE SALVA COME BOZZA */
  /* ====================================================== */

  if (
    pulsanteSalvaBozza
  ) {

    pulsanteSalvaBozza.addEventListener(
      "click",
      async (event) => {

        event.preventDefault();


        await salvaNotizia(
          false
        );
      }
    );
  }


  /* ====================================================== */
  /* CAMBIO INPUT */
  /* ====================================================== */

  inputTitoloNotizia.addEventListener(
    "input",
    () => {

      nascondiErrorePubblicazione();

      aggiornaLayoutNotizia();
    }
  );


  inputTestoNotizia.addEventListener(
    "input",
    () => {

      nascondiErrorePubblicazione();

      aggiornaLayoutNotizia();
    }
  );


  /* ====================================================== */
  /* RESIZE OBSERVER */
  /* ====================================================== */

  if (
    "ResizeObserver" in window
  ) {

    const osservatoreTextarea =
      new ResizeObserver(
        () => {

          aggiornaLayoutNotizia();
        }
      );


    osservatoreTextarea.observe(
      inputTitoloNotizia
    );


    osservatoreTextarea.observe(
      inputTestoNotizia
    );
  }


  /* ====================================================== */
  /* DATA: ENTER */
  /* ====================================================== */

  inputGiorno.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();


        inputMese.focus();
      }
    }
  );


  inputMese.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();


        inputAnno.focus();
      }
    }
  );


  /* ====================================================== */
  /* ACCESSO */
  /* ====================================================== */

  async function effettuaAccesso() {

    console.log(
      "Tentativo di accesso..."
    );


    nascondiErrore();


    const nomeUtente =
      inputNomeUtente.value.trim();


    const password =
      inputPassword.value;


    if (
      nomeUtente === ""
    ) {

      mostraErrore(
        "Inserisci il nome utente."
      );


      inputNomeUtente.focus();


      return;
    }


    if (
      password === ""
    ) {

      mostraErrore(
        "Inserisci la password."
      );


      inputPassword.focus();


      return;
    }


    pulsanteEntra.disabled =
      true;


    pulsanteEntra.style.pointerEvents =
      "none";


    pulsanteEntra.style.opacity =
      "0.7";


    try {

      const risposta =
        await fetch(
          URL_WORKER_LOGIN,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                username:
                  nomeUtente,

                password:
                  password,
              }),
          }
        );


      let dati;


      try {

        dati =
          await risposta.json();

      } catch {

        dati = {};
      }


      if (
        !risposta.ok ||
        !dati.ok ||
        !dati.token
      ) {

        mostraErrore(
          dati.errore ||
            "Nome utente o password non corretti."
        );


        inputPassword.focus();


        return;
      }


      console.log(
        "Custom Token Firebase ricevuto."
      );


      await signInWithCustomToken(
        auth,
        dati.token
      );


      console.log(
        "Autenticazione Firebase riuscita."
      );


    } catch (error) {

      console.error(
        "Errore durante l'accesso:",
        error
      );


      if (
        error.code ===
        "auth/invalid-custom-token"
      ) {

        mostraErrore(
          "Il token di autenticazione non è valido."
        );


      } else if (
        error.code ===
        "auth/custom-token-mismatch"
      ) {

        mostraErrore(
          "Il token appartiene a un progetto Firebase diverso."
        );


      } else {

        mostraErrore(
          "Impossibile effettuare l'accesso."
        );
      }


    } finally {

      pulsanteEntra.disabled =
        false;


      pulsanteEntra.style.pointerEvents =
        "auto";


      pulsanteEntra.style.opacity =
        "1";
    }
  }


  /* ====================================================== */
  /* STATO AUTENTICAZIONE */
  /* ====================================================== */

  onAuthStateChanged(
    auth,
    async (user) => {

      console.log(
        "Stato autenticazione:",
        user
          ? "AUTENTICATO"
          : "NON AUTENTICATO"
      );


      if (user) {

        pannelloAccesso.style.display =
          "none";


        pannelloAmministratore.style.display =
          "block";


        mostraSezione(
          sezioneImpostazioni
        );


        await caricaStatoPagine();


      } else {

        pannelloAccesso.style.display =
          "block";


        pannelloAmministratore.style.display =
          "none";
      }
    }
  );


  /* ====================================================== */
  /* PULSANTE ENTRA */
  /* ====================================================== */

  pulsanteEntra.addEventListener(
    "click",
    (event) => {

      event.preventDefault();


      effettuaAccesso();
    }
  );


  inputNomeUtente.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();


        effettuaAccesso();
      }
    }
  );


  inputPassword.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();


        effettuaAccesso();
      }
    }
  );


  inputNomeUtente.addEventListener(
    "input",
    () => {

      nascondiErrore();
    }
  );


  inputPassword.addEventListener(
    "input",
    () => {

      nascondiErrore();
    }
  );


  /* ====================================================== */
  /* INIZIALIZZAZIONE */
  /* ====================================================== */

  aggiornaLayoutNotizia();


  mostraSezione(
    sezioneImpostazioni
  );


  if (
    document.fonts
  ) {

    document.fonts.ready.then(
      () => {

        aggiornaLayoutNotizia();
      }
    );
  }

});
