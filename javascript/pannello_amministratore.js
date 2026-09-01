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

import {
  auth,
  db,
} from "./firebase-config.js";


const URL_WORKER_LOGIN =
  "https://imagekit-auth.judobagnoaripoli.workers.dev/login";


const COLLECTION_BLOCCO_PAGINE =
  "blocco_pagine";


document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "pannello_amministratore.js caricato correttamente."
    );


    const pannelloAccesso =
      document.getElementById(
        "pannelloAccesso"
      );

    const pannelloAmministratore =
      document.getElementById(
        "pannelloAmministratore"
      );

    const inputNomeUtente =
      document.getElementById(
        "inputNomeUtente"
      );

    const inputPassword =
      document.getElementById(
        "inputPassword"
      );

    const pulsanteEntra =
      document.getElementById(
        "pulsanteEntra"
      );

    const pulsanteMostraPassword =
      document.getElementById(
        "pulsanteMostraPassword"
      );

    const errore =
      document.getElementById(
        "erroreAccesso"
      );


    const selettoreImpostazioni =
      document.getElementById(
        "selettoreImpostazioni"
      );

    const selettoreNews =
      document.getElementById(
        "selettoreNews"
      );

    const selettoreEventi =
      document.getElementById(
        "selettoreEventi"
      );


    const sezioneImpostazioni =
      document.getElementById(
        "sezioneImpostazioni"
      );

    const sezioneNews =
      document.getElementById(
        "sezioneNews"
      );

    const sezioneEventi =
      document.getElementById(
        "sezioneEventi"
      );


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
      !sezioneEventi
    ) {

      console.error(
        "Uno o più elementi HTML non sono stati trovati."
      );

      return;
    }


    pannelloAccesso.style.display =
      "none";

    pannelloAmministratore.style.display =
      "none";


    function mostraErrore(
      messaggio
    ) {

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


      // ==================================================
      // IMPOSTAZIONI
      // ==================================================

      if (
        pagina === "impostazioni"
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


      // ==================================================
      // NEWS
      // ==================================================

      if (
        pagina === "news"
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


      // ==================================================
      // EVENTI
      // ==================================================

      if (
        pagina === "eventi"
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
            query(
              riferimento
            )
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

          dati =
            {};
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


    mostraSezione(
      sezioneImpostazioni
    );

  }
);
