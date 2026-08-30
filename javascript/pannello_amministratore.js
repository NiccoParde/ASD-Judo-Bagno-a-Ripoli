// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

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

// ======================================================
// CONFIGURAZIONE CLOUDFLARE WORKER
// ======================================================

const URL_WORKER_LOGIN =
  "https://imagekit-auth.judobagnoaripoli.workers.dev/login";

// ======================================================
// COLLECTION FIRESTORE
// ======================================================

const COLLECTION_BLOCCO_PAGINE = "blocco_pagine";

// ======================================================
// AVVIO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("pannello_amministratore.js caricato correttamente.");

  // ==================================================
  // ELEMENTI
  // ==================================================

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

  // ==================================================
  // CONTROLLO ELEMENTI
  // ==================================================

  if (
    !pannelloAccesso ||
    !pannelloAmministratore ||
    !inputNomeUtente ||
    !inputPassword ||
    !pulsanteEntra ||
    !pulsanteMostraPassword ||
    !errore
  ) {
    console.error("Uno o più elementi HTML non sono stati trovati.");

    return;
  }

  // ==================================================
  // STATO INIZIALE
  // ==================================================

  pannelloAccesso.style.display = "none";

  pannelloAmministratore.style.display = "none";

  // ==================================================
  // MOSTRA ERRORE
  // ==================================================

  function mostraErrore(messaggio) {
    errore.textContent = messaggio;

    errore.style.display = "block";
  }

  // ==================================================
  // NASCONDE ERRORE
  // ==================================================

  function nascondiErrore() {
    errore.textContent = "";

    errore.style.display = "none";
  }

  // ==================================================
  // MOSTRA PASSWORD
  // ==================================================

  pulsanteMostraPassword.addEventListener("click", () => {
    console.log("Pulsante mostra password cliccato.");

    inputPassword.type = "text";

    pulsanteMostraPassword.setAttribute("aria-label", "Password mostrata");

    pulsanteMostraPassword.setAttribute("title", "Password mostrata");
  });

  // ==================================================
  // AGGIORNA ASPETTO PULSANTE
  // ==================================================

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

  // ==================================================
  // CARICA STATO PAGINE
  // ==================================================

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

        const bloccata = dati.bloccata === true;

        aggiornaAspettoPulsante(pulsante, bloccata);
      });

      console.log("Stato pagine caricato.");
    } catch (error) {
      console.error("Errore caricamento stato pagine:", error);
    }
  }

  // ==================================================
  // CAMBIA STATO PAGINA
  // ==================================================

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

    // ================================================
    // BLOCCA DOPPIO CLICK
    // ================================================

    pulsante.style.pointerEvents = "none";

    try {
      console.log(`Modifica pagina: ${pagina}`);

      // ==============================================
      // RIFERIMENTO FIRESTORE
      // ==============================================

      const riferimento = doc(db, COLLECTION_BLOCCO_PAGINE, pagina);

      // ==============================================
      // SALVA STATO
      // ==============================================

      await setDoc(
        riferimento,
        {
          bloccata: nuovoStato,
        },
        {
          merge: true,
        },
      );

      // ==============================================
      // AGGIORNA GRAFICA
      // ==============================================

      aggiornaAspettoPulsante(pulsante, nuovoStato);

      console.log(`Pagina ${pagina}: ${nuovoStato ? "BLOCCATA" : "SBLOCCATA"}`);
    } catch (error) {
      console.error("Errore modifica stato pagina:", error);

      mostraErrore("Impossibile modificare lo stato della pagina.");
    } finally {
      pulsante.style.pointerEvents = "auto";
    }
  }

  // ==================================================
  // COLLEGA PULSANTI BLOCCA
  // ==================================================

  document.querySelectorAll("[data-pagina]").forEach((elementoPagina) => {
    const pulsante = elementoPagina.querySelector(".pulsante_blocca");

    if (!pulsante) {
      return;
    }

    pulsante.addEventListener("click", () => {
      cambiaStatoPagina(elementoPagina, pulsante);
    });
  });

  // ==================================================
  // EFFETTUA ACCESSO
  // ==================================================

  async function effettuaAccesso() {
    console.log("Tentativo di accesso...");

    nascondiErrore();

    // ================================================
    // VALORI
    // ================================================

    const nomeUtente = inputNomeUtente.value.trim();

    const password = inputPassword.value;

    // ================================================
    // CAMPI VUOTI
    // ================================================

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

    // ================================================
    // DISABILITA PULSANTE
    // ================================================

    pulsanteEntra.disabled = true;

    pulsanteEntra.style.pointerEvents = "none";

    pulsanteEntra.style.opacity = "0.7";

    try {
      // ==============================================
      // CHIAMATA CLOUDFLARE
      // ==============================================

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

      // ==============================================
      // RISPOSTA JSON
      // ==============================================

      let dati;

      try {
        dati = await risposta.json();
      } catch {
        dati = {};
      }

      // ==============================================
      // LOGIN FALLITO
      // ==============================================

      if (!risposta.ok || !dati.ok || !dati.token) {
        console.log("Login rifiutato.");

        mostraErrore(dati.errore || "Nome utente o password non corretti.");

        inputPassword.focus();

        return;
      }

      // ==============================================
      // CUSTOM TOKEN
      // ==============================================

      console.log("Custom Token Firebase ricevuto.");

      // ==============================================
      // LOGIN FIREBASE
      // ==============================================

      await signInWithCustomToken(auth, dati.token);

      console.log("Autenticazione Firebase riuscita.");
    } catch (error) {
      console.error("Errore durante l'accesso:", error);

      // ==============================================
      // ERRORI FIREBASE
      // ==============================================

      if (error.code === "auth/invalid-custom-token") {
        mostraErrore("Il token di autenticazione non è valido.");
      } else if (error.code === "auth/custom-token-mismatch") {
        mostraErrore("Il token appartiene a un progetto Firebase diverso.");
      } else {
        mostraErrore("Impossibile effettuare l'accesso.");
      }
    } finally {
      // ==============================================
      // RIATTIVA PULSANTE
      // ==============================================

      pulsanteEntra.disabled = false;

      pulsanteEntra.style.pointerEvents = "auto";

      pulsanteEntra.style.opacity = "1";
    }
  }

  // ==================================================
  // STATO AUTENTICAZIONE
  // ==================================================

  onAuthStateChanged(auth, async (user) => {
    console.log(
      "Stato autenticazione:",
      user ? "AUTENTICATO" : "NON AUTENTICATO",
    );

    // ==============================================
    // AUTENTICATO
    // ==============================================

    if (user) {
      pannelloAccesso.style.display = "none";

      pannelloAmministratore.style.display = "block";

      nascondiErrore();

      // ============================================
      // CARICA STATO BLOCCHI
      // ============================================

      await caricaStatoPagine();

      return;
    }

    // ==============================================
    // NON AUTENTICATO
    // ==============================================

    pannelloAccesso.style.display = "block";

    pannelloAmministratore.style.display = "none";
  });

  // ==================================================
  // CLICK ENTRA
  // ==================================================

  pulsanteEntra.addEventListener("click", (event) => {
    event.preventDefault();

    effettuaAccesso();
  });

  // ==================================================
  // ENTER NOME UTENTE
  // ==================================================

  inputNomeUtente.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      effettuaAccesso();
    }
  });

  // ==================================================
  // ENTER PASSWORD
  // ==================================================

  inputPassword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      effettuaAccesso();
    }
  });

  // ==================================================
  // RIMUOVE ERRORE QUANDO SCRIVI
  // ==================================================

  inputNomeUtente.addEventListener("input", () => {
    nascondiErrore();
  });

  inputPassword.addEventListener("input", () => {
    nascondiErrore();
  });
});
