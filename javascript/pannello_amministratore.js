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
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";


const URL_WORKER_LOGIN =
  "https://imagekit-auth.judobagnoaripoli.workers.dev/login";

const COLLECTION_BLOCCO_PAGINE =
  "blocco_pagine";


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


  const pannelloCreazioneNotizia =
    document.querySelector(
      ".pannello_creazione_notizia"
    );

  const pannelloNotizie =
    document.querySelector(
      ".pannello_notizie"
    );


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

  pannelloAccesso.style.display = "none";
  pannelloAmministratore.style.display = "none";


  /* ====================================================== */
  /* ERRORI ACCESSO */
  /* ====================================================== */

  function mostraErrore(messaggio) {

    errore.textContent = messaggio;
    errore.style.display = "block";

  }


  function nascondiErrore() {

    errore.textContent = "";
    errore.style.display = "none";

  }


  /* ====================================================== */
  /* ERRORI PUBBLICAZIONE */
  /* ====================================================== */

  function mostraErrorePubblicazione(messaggi) {

    if (!errorePubblicazione) {
      return;
    }


    if (!messaggi || messaggi.length === 0) {

      errorePubblicazione.textContent = "";

      errorePubblicazione.classList.remove(
        "visibile"
      );

      return;

    }


    /*
     * Ogni errore viene messo
     * su una riga separata.
     */

    errorePubblicazione.innerHTML =
      messaggi
        .map(
          (messaggio) =>
            `<div>${escapeHTML(messaggio)}</div>`
        )
        .join("");


    errorePubblicazione.classList.add(
      "visibile"
    );

  }


  function nascondiErrorePubblicazione() {

    if (!errorePubblicazione) {
      return;
    }

    errorePubblicazione.textContent = "";

    errorePubblicazione.classList.remove(
      "visibile"
    );

  }


  /*
   * Protegge il testo degli errori
   * prima di inserirlo con innerHTML.
   */

  function escapeHTML(testo) {

    return String(testo)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* ====================================================== */
  /* MOSTRA PASSWORD */
  /* ====================================================== */

  pulsanteMostraPassword.addEventListener(
    "click",
    () => {

      inputPassword.type = "text";

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

  function aggiornaSelettore(pagina) {

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


  /* ====================================================== */
  /* MOSTRA SEZIONE */
  /* ====================================================== */

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

      window.scrollTo(0, 0);

      return;
    }


    if (sezione === sezioneEventi) {

      sezioneEventi.style.display = "block";

      aggiornaSelettore("eventi");

      window.scrollTo(0, 0);

    }

  }


  selettoreImpostazioni.addEventListener(
    "click",
    () => {
      mostraSezione(sezioneImpostazioni);
    }
  );


  selettoreNews.addEventListener(
    "click",
    () => {
      mostraSezione(sezioneNews);
    }
  );


  selettoreEventi.addEventListener(
    "click",
    () => {
      mostraSezione(sezioneEventi);
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


      risultati.forEach((documento) => {

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

      });


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

    if (!elementoPagina || !pulsante) {
      return;
    }


    const pagina =
      elementoPagina.dataset.pagina;


    if (!pagina) {
      return;
    }


    const statoAttuale =
      pulsante.classList.contains("attivo");


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
          bloccata: nuovoStato,
        },
        {
          merge: true,
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
    .querySelectorAll("[data-pagina]")
    .forEach((elementoPagina) => {

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

    });


  /* ====================================================== */
  /* CAMPI NUMERICI */
  /* ====================================================== */

  function mantieniSoloNumeri(elemento) {

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


    mantieniSoloNumeri(elemento);


    if (
      elemento.value.length > massimo
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
  /* AUTO-ESPANSIONE DEI TEXTAREA */
  /* ====================================================== */

  function adattaCampoTesto(elemento) {

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

      {
        elemento:
          document.querySelector(
            ".pulsante_carica_immagini"
          ),
        top:
          "26.6146vw",
      },

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
    /* ELEMENTI SOTTO IL TESTO */
    /* ================================================== */

    const pulsanteSalvaBozza =
      document.querySelector(
        ".pulsante_salva_bozza"
      );


    if (pulsanteSalvaBozza) {

      pulsanteSalvaBozza.style.top =
        `calc(63.3854vw + ${spostamentoTotale}px)`;

    }


    if (pulsantePubblica) {

      pulsantePubblica.style.top =
        `calc(63.3854vw + ${spostamentoTotale}px)`;

    }


    /* ================================================== */
    /* ERRORE PUBBLICAZIONE */
    /* ================================================== */

    /*
     * Anche il messaggio deve seguire
     * l'espansione della casella di testo.
     */

    if (errorePubblicazione) {

      errorePubblicazione.style.top =
        `calc(60.15vw + ${spostamentoTotale}px)`;

    }


    /* ================================================== */
    /* ALTEZZA PANNELLO CREAZIONE */
    /* ================================================== */

    pannelloCreazioneNotizia.style.height =
      `calc(67.7604vw + ${spostamentoTotale}px)`;


    /* ================================================== */
    /* PANNELLO NOTIZIE */
    /* ================================================== */

    pannelloNotizie.style.top =
      `calc(92.44vw + ${spostamentoTotale}px)`;


    /* ================================================== */
    /* ALTEZZA SEZIONE NEWS */
    /* ================================================== */

    sezioneNews.style.minHeight =
      `calc(162.6042vw + ${spostamentoTotale}px)`;

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


    /*
     * Tutti i campi devono essere presenti.
     */

    if (
      giorno === "" ||
      mese === "" ||
      anno === ""
    ) {
      return false;
    }


    /*
     * Controlliamo il numero di cifre.
     */

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


    /*
     * Controlli di base.
     */

    if (
      annoNumero < 1 ||
      meseNumero < 1 ||
      meseNumero > 12 ||
      giornoNumero < 1 ||
      giornoNumero > 31
    ) {
      return false;
    }


    /*
     * Controllo reale del calendario.
     *
     * Questo rende non valide,
     * per esempio:
     *
     * 31/02/2026
     * 31/04/2026
     * 29/02/2025
     *
     */

    const data =
      new Date(
        annoNumero,
        meseNumero - 1,
        giornoNumero
      );


    return (
      data.getFullYear() === annoNumero &&
      data.getMonth() === meseNumero - 1 &&
      data.getDate() === giornoNumero
    );

  }


  /* ====================================================== */
  /* VALIDAZIONE PUBBLICAZIONE */
  /* ====================================================== */

  function validaPubblicazione() {

    const errori = [];


    /*
     * TITOLO
     */

    if (
      inputTitoloNotizia.value.trim() === ""
    ) {

      errori.push(
        "Inserisci il titolo della notizia."
      );

    }


    /*
     * TESTO
     */

    if (
      inputTestoNotizia.value.trim() === ""
    ) {

      errori.push(
        "Inserisci il testo della notizia."
      );

    }


    /*
     * DATA
     */

    if (!dataValida()) {

      errori.push(
        "Inserisci una data valida."
      );

    }


    return errori;

  }


  /* ====================================================== */
  /* PULSANTE PUBBLICA */
  /* ====================================================== */

  pulsantePubblica.addEventListener(
    "click",
    (event) => {

      event.preventDefault();


      const errori =
        validaPubblicazione();


      /*
       * Se ci sono errori:
       * li mostriamo e NON facciamo
       * alcuna pubblicazione.
       */

      if (errori.length > 0) {

        mostraErrorePubblicazione(
          errori
        );

        aggiornaLayoutNotizia();

        return;

      }


      /*
       * Per ora non succede nulla:
       * la pubblicazione vera e propria
       * verrà aggiunta successivamente.
       */

      nascondiErrorePubblicazione();

      console.log(
        "Validazione pubblicazione superata."
      );

    }
  );


  /* ====================================================== */
  /* CAMBIO INPUT: NASCONDE ERRORE */
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

  if ("ResizeObserver" in window) {

    const osservatoreTextarea =
      new ResizeObserver(() => {

        aggiornaLayoutNotizia();

      });


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

      if (event.key === "Enter") {

        event.preventDefault();

        inputMese.focus();

      }

    }
  );


  inputMese.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

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


    if (nomeUtente === "") {

      mostraErrore(
        "Inserisci il nome utente."
      );

      inputNomeUtente.focus();

      return;

    }


    if (password === "") {

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
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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

      if (event.key === "Enter") {

        event.preventDefault();

        effettuaAccesso();

      }

    }
  );


  inputPassword.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

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


  if (document.fonts) {

    document.fonts.ready.then(() => {

      aggiornaLayoutNotizia();

    });

  }

});
