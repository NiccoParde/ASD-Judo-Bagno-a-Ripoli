// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

import {
  signInWithCustomToken,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

// ======================================================
// CONFIGURAZIONE
// ======================================================

const URL_WORKER_LOGIN = "https://imagekit-auth.judobagnoaripoli.workers.dev/login";

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
  // EFFETTUA ACCESSO
  // ==================================================

  async function effettuaAccesso() {
    console.log("Tentativo di accesso...");

    // ================================================
    // RESET ERRORE
    // ================================================

    nascondiErrore();

    // ================================================
    // RECUPERA DATI
    // ================================================

    const nomeUtente = inputNomeUtente.value.trim();

    const password = inputPassword.value;

    // ================================================
    // CONTROLLA CAMPI
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
    // BLOCCA TEMPORANEAMENTE IL PULSANTE
    // ================================================

    pulsanteEntra.disabled = true;

    pulsanteEntra.style.pointerEvents = "none";

    pulsanteEntra.style.opacity = "0.7";

    try {
      // ==============================================
      // CHIAMATA AL CLOUDFLARE WORKER
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
      // TENTA A LEGGERE JSON
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
      // CUSTOM TOKEN RICEVUTO
      // ==============================================

      console.log("Custom Token Firebase ricevuto.");

      // ==============================================
      // LOGIN FIREBASE
      // ==============================================

      await signInWithCustomToken(auth, dati.token);

      console.log("Autenticazione Firebase riuscita.");

      // ==============================================
      // IL CAMBIO DI PANNELLO VIENE GESTITO
      // DA onAuthStateChanged() QUI SOTTO
      // ==============================================
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
        mostraErrore(
          "Impossibile effettuare l'accesso. Controlla la connessione.",
        );
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
  // CONTROLLO STATO AUTENTICAZIONE
  // ==================================================

  onAuthStateChanged(auth, (user) => {
    console.log(
      "Stato autenticazione:",
      user ? "AUTENTICATO" : "NON AUTENTICATO",
    );

    // ==============================================
    // UTENTE AUTENTICATO
    // ==============================================

    if (user) {
      pannelloAccesso.style.display = "none";

      pannelloAmministratore.style.display = "block";

      nascondiErrore();

      return;
    }

    // ==============================================
    // UTENTE NON AUTENTICATO
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
  // NASCONDE ERRORE QUANDO SCRIVI
  // ==================================================

  inputNomeUtente.addEventListener("input", () => {
    nascondiErrore();
  });

  inputPassword.addEventListener("input", () => {
    nascondiErrore();
  });
});
