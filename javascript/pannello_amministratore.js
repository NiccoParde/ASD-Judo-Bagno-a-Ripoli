// ======================================================
// CREDENZIALI TEMPORANEE DI TEST
// ======================================================

const UTENTE_TEST = "admin";

const PASSWORD_TEST = "admin123";

// ======================================================
// AVVIO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js caricato correttamente.");

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

  pannelloAccesso.style.display = "block";

  pannelloAmministratore.style.display = "none";

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
  // EFFETTUA ACCESSO
  // ==================================================

  function effettuaAccesso() {
    console.log("Tentativo di accesso...");

    // ================================================
    // NASCONDE EVENTUALE ERRORE
    // ================================================

    nascondiErrore();

    // ================================================
    // RECUPERA VALORI
    // ================================================

    const nomeUtente = inputNomeUtente.value.trim();

    const password = inputPassword.value;

    console.log("Nome utente inserito:", nomeUtente);

    // ================================================
    // NOME UTENTE VUOTO
    // ================================================

    if (nomeUtente === "") {
      mostraErrore("Inserisci il nome utente.");

      inputNomeUtente.focus();

      return;
    }

    // ================================================
    // PASSWORD VUOTA
    // ================================================

    if (password === "") {
      mostraErrore("Inserisci la password.");

      inputPassword.focus();

      return;
    }

    // ================================================
    // CONTROLLO CREDENZIALI
    // ================================================

    if (nomeUtente !== UTENTE_TEST || password !== PASSWORD_TEST) {
      console.log("Credenziali errate.");

      mostraErrore("Nome utente o password non corretti.");

      inputPassword.focus();

      return;
    }

    // ================================================
    // ACCESSO RIUSCITO
    // ================================================

    console.log("ACCESSO RIUSCITO!");

    // ================================================
    // NASCONDE LOGIN
    // ================================================

    pannelloAccesso.style.display = "none";

    // ================================================
    // MOSTRA PANNELLO AMMINISTRATORE
    // ================================================

    pannelloAmministratore.style.display = "block";
  }

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
