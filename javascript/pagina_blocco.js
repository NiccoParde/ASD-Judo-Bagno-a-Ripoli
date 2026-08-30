import {
  collection,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

// ======================================================
// IDENTIFICAZIONE PAGINA
// ======================================================

const nomePagina = document.body.dataset.pagina;

if (!nomePagina) {
  console.warn("Nessun data-pagina trovato nel body.");
} else {
  // ====================================================
  // CREA OVERLAY
  // ====================================================

  const overlay = document.createElement("div");

  overlay.className = "pagina_manutenzione";

  // ====================================================
  // CONTENITORE
  // ====================================================

  const contenitore = document.createElement("div");

  contenitore.className = "contenuto_manutenzione";

  // ====================================================
  // TESTO
  // ====================================================

  const testo = document.createElement("div");

  testo.className = "testo_manutenzione";

  testo.textContent = "Pagina in manutenzione";

  // ====================================================
  // LOADER
  // ====================================================

  const loader = document.createElement("div");

  loader.className = "loader_manutenzione";

  // ====================================================
  // ASSEMBLAGGIO
  // ====================================================

  contenitore.appendChild(testo);

  contenitore.appendChild(loader);

  overlay.appendChild(contenitore);

  document.body.appendChild(overlay);

  // ====================================================
  // FIRESTORE
  // ====================================================

  const riferimento = doc(db, "blocco_pagine", nomePagina);

  // ====================================================
  // LISTENER TEMPO REALE
  // ====================================================

  onSnapshot(
    riferimento,
    (snapshot) => {
      const dati = snapshot.exists() ? snapshot.data() : {};

      const bloccata = dati.bloccata === true;

      if (bloccata) {
        overlay.classList.add("visibile");

        document.body.classList.add("pagina_bloccata");
      } else {
        overlay.classList.remove("visibile");

        document.body.classList.remove("pagina_bloccata");
      }
    },

    (error) => {
      console.error("Errore controllo manutenzione:", error);

      // In caso di errore non nascondiamo
      // la pagina. Il sito rimane disponibile.

      overlay.classList.remove("visibile");

      document.body.classList.remove("pagina_bloccata");
    },
  );
}
