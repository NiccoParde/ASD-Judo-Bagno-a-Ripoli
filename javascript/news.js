import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

// ======================================================
// ELEMENTI PRINCIPALI
// ======================================================

const sezione2 = document.querySelector(".sezione_2");
const notiziaFocus = document.getElementById("notiziaFocus");

// ======================================================
// VARIABILI
// ======================================================

let elencoNews = [];
let indiceNewsAperta = 0;

// ======================================================
// FORMATTAZIONE DATA
// ======================================================

function formattaData(timestamp) {
  if (!timestamp) {
    return "";
  }

  let data;

  // Timestamp Firestore
  if (typeof timestamp.toDate === "function") {
    data = timestamp.toDate();
  }

  // Data JS
  else if (timestamp instanceof Date) {
    data = timestamp;
  }

  // Altri formati
  else {
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

// ======================================================
// CARICAMENTO NEWS DA FIRESTORE
// ======================================================

async function caricaNews() {
  try {
    const newsRef = collection(db, "news");

    const q = query(newsRef, orderBy("data", "desc"));

    const snapshot = await getDocs(q);

    elencoNews = [];

    snapshot.forEach((documento) => {
      const dati = documento.data();

      // Mostra solo quelle pubblicate
      if (dati.pubblicata === true) {
        elencoNews.push({
          id: documento.id,
          titolo: dati.titolo || "",
          testo: dati.testo || "",
          data: dati.data || null,
          immagine: dati.immagine || "",
        });
      }
    });

    console.log("News caricate:", elencoNews);

    creaNewsPiccole();

    if (elencoNews.length > 0) {
      preparaFocus();
    }

    aggiornaAltezzaSezione2();
  } catch (error) {
    console.error("Errore nel caricamento delle news:", error);
  }
}

// ======================================================
// CREAZIONE NEWS PICCOLE
// ======================================================

function creaNewsPiccole() {
  if (!sezione2) {
    return;
  }

  // Elimina eventuali vecchie news generate
  sezione2.querySelectorAll(".notizia_1").forEach((elemento) => {
    elemento.remove();
  });

  elencoNews.forEach((news, indice) => {
    const notiziaPiccola = document.createElement("div");

    notiziaPiccola.className = "notizia_1";

    notiziaPiccola.id = `notiziaPiccola_${indice}`;

    // --------------------------------------------------
    // SFONDO
    // --------------------------------------------------

    const sfondo = document.createElement("div");

    sfondo.className = "sfondo_notizia_1";

    // --------------------------------------------------
    // IMMAGINE
    // --------------------------------------------------

    const immagine = document.createElement("div");

    immagine.className = "immagine_notizia_1";

    if (news.immagine) {
      immagine.style.backgroundImage = `url("${news.immagine}")`;
    }

    // --------------------------------------------------
    // DATA
    // --------------------------------------------------

    const data = document.createElement("span");

    data.className = "data_notizia_1";

    data.textContent = formattaData(news.data);

    // --------------------------------------------------
    // TITOLO
    // --------------------------------------------------

    const titolo = document.createElement("span");

    titolo.className = "titolo_notizia_1";

    titolo.textContent = news.titolo;

    // --------------------------------------------------
    // TESTO
    // --------------------------------------------------

    const testo = document.createElement("span");

    testo.className = "testo_notizia_1";

    // Puliamo il testo proveniente da Firebase
    const testoPulito = news.testo
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    // --------------------------------------------------
    // SALVIAMO IL TESTO ORIGINALE
    // --------------------------------------------------

    testo.dataset.testoCompleto = testoPulito;

    // --------------------------------------------------
    // FUNZIONE PER ADATTARE IL TESTO
    // --------------------------------------------------

    function adattaTestoAnteprima() {
      const suffisso = " [...]";

      // Nessun testo
      if (!testoPulito) {
        testo.textContent = "";

        return;
      }

      // ------------------------------------------------
      // FUNZIONE DI CONTROLLO
      // ------------------------------------------------

      function entraNellaBox(contenuto) {
        testo.textContent = contenuto;

        return testo.scrollHeight <= testo.clientHeight + 1;
      }

      // ------------------------------------------------
      // PROVIAMO PRIMA IL TESTO COMPLETO
      // ------------------------------------------------

      if (entraNellaBox(testoPulito)) {
        return;
      }

      // ------------------------------------------------
      // DIVIDIAMO IN PAROLE
      // ------------------------------------------------

      const parole = testoPulito.split(/\s+/);

      let migliore = "";

      // ------------------------------------------------
      // AGGIUNGIAMO LE PAROLE UNA ALLA VOLTA
      // ------------------------------------------------

      for (let i = 0; i < parole.length; i++) {
        const candidatoBase = (migliore ? migliore + " " : "") + parole[i];

        const candidato = candidatoBase + suffisso;

        // ----------------------------------------------
        // SE LA PAROLA INTERA ENTRA
        // ----------------------------------------------

        if (entraNellaBox(candidato)) {
          migliore = candidatoBase;
        }

        // ----------------------------------------------
        // SE NON ENTRA
        // PROVIAMO CARATTERE PER CARATTERE
        // ----------------------------------------------
        else {
          const testoPrima = migliore ? migliore + " " : "";

          let parteParola = "";

          for (let j = 0; j < parole[i].length; j++) {
            const candidatoParziale =
              testoPrima + parole[i].substring(0, j + 1) + suffisso;

            if (entraNellaBox(candidatoParziale)) {
              parteParola = parole[i].substring(0, j + 1);
            } else {
              break;
            }
          }

          // --------------------------------------------
          // ABBIAMO TROVATO PARTE DELLA PAROLA
          // --------------------------------------------

          if (parteParola) {
            migliore = testoPrima + parteParola;
          }

          break;
        }
      }

      // ------------------------------------------------
      // RISULTATO FINALE
      // ------------------------------------------------

      if (migliore) {
        testo.textContent = migliore.trim() + suffisso;
      } else {
        testo.textContent = suffisso;
      }
    }

    // --------------------------------------------------
    // INSERIMENTO
    // --------------------------------------------------

    notiziaPiccola.appendChild(sfondo);

    notiziaPiccola.appendChild(immagine);

    notiziaPiccola.appendChild(data);

    notiziaPiccola.appendChild(titolo);

    notiziaPiccola.appendChild(testo);

    // --------------------------------------------------
    // CLICK
    // --------------------------------------------------

    notiziaPiccola.addEventListener("click", () => {
      indiceNewsAperta = indice;

      apriNotizia(indiceNewsAperta);
    });

    // --------------------------------------------------
    // INSERIMENTO NELLA SEZIONE
    // --------------------------------------------------

    sezione2.appendChild(notiziaPiccola);

    // --------------------------------------------------
    // PRIMO CALCOLO
    // --------------------------------------------------

    requestAnimationFrame(() => {
      adattaTestoAnteprima();

      aggiornaAltezzaSezione2();
    });

    // --------------------------------------------------
    // RESIZE DELLA SINGOLA CARD
    // --------------------------------------------------

    const osservatoreCard = new ResizeObserver(() => {
      adattaTestoAnteprima();

      aggiornaAltezzaSezione2();
    });

    osservatoreCard.observe(notiziaPiccola);
  });

  posizionaNews();
}

// ======================================================
// POSIZIONAMENTO DELLE NEWS
// ======================================================

function posizionaNews() {
  if (!sezione2) {
    return;
  }

  const news = sezione2.querySelectorAll(".notizia_1");

  const distanza = 17.5;

  news.forEach((newsElement, indice) => {
    newsElement.style.top = `${indice * distanza}vw`;
  });
}

// ======================================================
// CREAZIONE / PREPARAZIONE FOCUS
// ======================================================

function preparaFocus() {
  if (!notiziaFocus) {
    return;
  }

  notiziaFocus.innerHTML = "";

  // ----------------------------------------------------
  // SFONDO SCURO
  // ----------------------------------------------------

  const offuscamento = document.createElement("div");

  offuscamento.className = "offuscamento_background";

  // ----------------------------------------------------
  // NOTIZIA GRANDE
  // ----------------------------------------------------

  const notizia = document.createElement("div");

  notizia.className = "notizia";

  // ----------------------------------------------------
  // SFONDO BIANCO
  // ----------------------------------------------------

  const sfondo = document.createElement("div");

  sfondo.className = "sfondo_notizia";

  // ----------------------------------------------------
  // IMMAGINE
  // ----------------------------------------------------

  const immagine = document.createElement("div");

  immagine.className = "immagine_notizia";

  // ----------------------------------------------------
  // DATA
  // ----------------------------------------------------

  const data = document.createElement("span");

  data.className = "data_notizia";

  data.id = "dataNotizia";

  // ----------------------------------------------------
  // TITOLO
  // ----------------------------------------------------

  const titolo = document.createElement("span");

  titolo.className = "titolo_notizia";

  titolo.id = "titoloNotizia";

  // ----------------------------------------------------
  // TESTO
  // ----------------------------------------------------

  const testo = document.createElement("span");

  testo.className = "testo_notizia";

  testo.id = "testoNotizia";

  // ====================================================
  // PULSANTE ESCI
  // ====================================================

  const pulsanteEsci = document.createElement("div");

  pulsanteEsci.className = "pulsante_esci";

  pulsanteEsci.id = "pulsanteEsci";

  const sfondoEsci = document.createElement("div");

  sfondoEsci.className = "sfondo_pulsante_esci";

  const iconaEsci = document.createElement("div");

  iconaEsci.className = "icona_pulsante_esci";

  pulsanteEsci.appendChild(sfondoEsci);

  pulsanteEsci.appendChild(iconaEsci);

  // ====================================================
  // PULSANTE DESTRA
  // ====================================================

  const pulsanteDestra = document.createElement("div");

  pulsanteDestra.className = "pulsante_scorri_destra";

  const sfondoDestra = document.createElement("div");

  sfondoDestra.className = "sfondo_pulsante_scorri_destra";

  const iconaDestra = document.createElement("div");

  iconaDestra.className = "icona_pulsante_scorri_destra";

  pulsanteDestra.appendChild(sfondoDestra);

  pulsanteDestra.appendChild(iconaDestra);

  // ====================================================
  // PULSANTE SINISTRA
  // ====================================================

  const pulsanteSinistra = document.createElement("div");

  pulsanteSinistra.className = "pulsante_scorri_sinistra";

  const sfondoSinistra = document.createElement("div");

  sfondoSinistra.className = "sfondo_pulsante_scorri_sinistra";

  const iconaSinistra = document.createElement("div");

  iconaSinistra.className = "icona_pulsante_scorri_sinistra";

  pulsanteSinistra.appendChild(sfondoSinistra);

  pulsanteSinistra.appendChild(iconaSinistra);

  // ====================================================
  // ASSEMBLAGGIO
  // ====================================================

  notizia.appendChild(sfondo);

  notizia.appendChild(immagine);

  notizia.appendChild(data);

  notizia.appendChild(titolo);

  notizia.appendChild(testo);

  notizia.appendChild(pulsanteEsci);

  notizia.appendChild(pulsanteDestra);

  notizia.appendChild(pulsanteSinistra);

  notiziaFocus.appendChild(offuscamento);

  notiziaFocus.appendChild(notizia);

  // ====================================================
  // EVENTI
  // ====================================================

  pulsanteEsci.addEventListener("click", (event) => {
    event.stopPropagation();

    chiudiNotizia();
  });

  // ----------------------------------------------------
  // DESTRA
  // ----------------------------------------------------

  pulsanteDestra.addEventListener("click", (event) => {
    event.stopPropagation();

    if (elencoNews.length === 0) {
      return;
    }

    indiceNewsAperta++;

    if (indiceNewsAperta >= elencoNews.length) {
      indiceNewsAperta = 0;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  });

  // ----------------------------------------------------
  // SINISTRA
  // ----------------------------------------------------

  pulsanteSinistra.addEventListener("click", (event) => {
    event.stopPropagation();

    if (elencoNews.length === 0) {
      return;
    }

    indiceNewsAperta--;

    if (indiceNewsAperta < 0) {
      indiceNewsAperta = elencoNews.length - 1;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  });

  // ----------------------------------------------------
  // CLICK SFONDO
  // ----------------------------------------------------

  offuscamento.addEventListener("click", () => {
    chiudiNotizia();
  });

  aggiornaNotiziaFocus(0);
}

// ======================================================
// APERTURA NOTIZIA
// ======================================================

function apriNotizia(indice) {
  if (!notiziaFocus) {
    return;
  }

  indiceNewsAperta = indice;

  aggiornaNotiziaFocus(indiceNewsAperta);

  notiziaFocus.scrollTop = 0;

  notiziaFocus.classList.add("aperta");

  document.body.classList.add("popup_aperto");
}

// ======================================================
// CHIUSURA NOTIZIA
// ======================================================

function chiudiNotizia() {
  if (!notiziaFocus) {
    return;
  }

  notiziaFocus.classList.remove("aperta");

  document.body.classList.remove("popup_aperto");
}

// ======================================================
// AGGIORNA CONTENUTO FOCUS
// ======================================================

function aggiornaNotiziaFocus(indice) {
  const news = elencoNews[indice];

  if (!news) {
    return;
  }

  const data = document.getElementById("dataNotizia");

  const titolo = document.getElementById("titoloNotizia");

  const testo = document.getElementById("testoNotizia");

  const immagine = notiziaFocus.querySelector(".immagine_notizia");

  // ----------------------------------------------------
  // DATA
  // ----------------------------------------------------

  if (data) {
    data.textContent = formattaData(news.data);
  }

  // ----------------------------------------------------
  // TITOLO
  // ----------------------------------------------------

  if (titolo) {
    titolo.textContent = news.titolo;
  }

  // ----------------------------------------------------
  // TESTO
  // ----------------------------------------------------

  if (testo) {
    testo.innerHTML = news.testo || "";
  }

  // ----------------------------------------------------
  // IMMAGINE
  // ----------------------------------------------------

  if (immagine) {
    if (news.immagine) {
      immagine.style.background = `url("${news.immagine}") center center / cover no-repeat`;
    } else {
      immagine.style.background = "none";
    }
  }

  aggiornaAltezzaNotizia();
}

// ======================================================
// ALTEZZA NOTIZIA FOCUS
// ======================================================

function aggiornaAltezzaNotizia() {
  const notizia = notiziaFocus?.querySelector(".notizia");

  const testoNotizia = notiziaFocus?.querySelector(".testo_notizia");

  if (!notizia || !testoNotizia) {
    return;
  }

  // ----------------------------------------------------
  // ALTEZZA REALE DEL TESTO
  // ----------------------------------------------------

  const altezzaRealeTesto = testoNotizia.scrollHeight;

  // ----------------------------------------------------
  // POSIZIONE FINALE DEL TESTO
  // ----------------------------------------------------

  const fineTesto = testoNotizia.offsetTop + altezzaRealeTesto;

  // ----------------------------------------------------
  // 50px = 2.60417vw
  // ----------------------------------------------------

  const altezzaNotizia = fineTesto + (2.60417 * window.innerWidth) / 100;

  notizia.style.height = `${altezzaNotizia}px`;
}

// ======================================================
// ALTEZZA SEZIONE 2
// ======================================================

function aggiornaAltezzaSezione2() {
  if (!sezione2) {
    return;
  }

  const news = sezione2.querySelectorAll(".notizia_1");

  if (news.length === 0) {
    sezione2.style.height = "0px";

    return;
  }

  let altezzaMassima = 0;

  news.forEach((newsElement) => {
    const fondoNews = newsElement.offsetTop + newsElement.offsetHeight;

    if (fondoNews > altezzaMassima) {
      altezzaMassima = fondoNews;
    }
  });

  // 20px rispetto alla reference 1920px
  sezione2.style.height = `calc(${altezzaMassima}px + 1.04167vw)`;
}

// ======================================================
// RICALCOLO DI TUTTE LE ANTEPRIME
// ======================================================
//
// Questa funzione forza il ricalcolo del testo
// di tutte le news quando cambia la dimensione
// della pagina o vengono caricati i font.
//

function ricalcolaAnteprime() {
  if (!sezione2) {
    return;
  }

  const news = sezione2.querySelectorAll(".notizia_1");

  news.forEach((notiziaElement) => {
    const testo = notiziaElement.querySelector(".testo_notizia_1");

    if (!testo) {
      return;
    }

    const testoCompleto = testo.dataset.testoCompleto;

    if (!testoCompleto) {
      return;
    }

    const suffisso = " [...]";

    // ----------------------------------------------
    // CONTROLLO
    // ----------------------------------------------

    function entraNellaBox(contenuto) {
      testo.textContent = contenuto;

      return testo.scrollHeight <= testo.clientHeight + 1;
    }

    // ----------------------------------------------
    // TESTO COMPLETO
    // ----------------------------------------------

    if (entraNellaBox(testoCompleto)) {
      return;
    }

    // ----------------------------------------------
    // PAROLE
    // ----------------------------------------------

    const parole = testoCompleto.split(/\s+/);

    let migliore = "";

    // ----------------------------------------------
    // RICERCA MASSIMO CONTENUTO
    // ----------------------------------------------

    for (let i = 0; i < parole.length; i++) {
      const candidatoBase = (migliore ? migliore + " " : "") + parole[i];

      const candidato = candidatoBase + suffisso;

      // --------------------------------------------
      // PAROLA INTERA
      // --------------------------------------------

      if (entraNellaBox(candidato)) {
        migliore = candidatoBase;

        continue;
      }

      // --------------------------------------------
      // PARTE DELLA PAROLA
      // --------------------------------------------

      const testoPrima = migliore ? migliore + " " : "";

      let parteParola = "";

      for (let j = 0; j < parole[i].length; j++) {
        const candidatoParziale =
          testoPrima + parole[i].substring(0, j + 1) + suffisso;

        if (entraNellaBox(candidatoParziale)) {
          parteParola = parole[i].substring(0, j + 1);
        } else {
          break;
        }
      }

      if (parteParola) {
        migliore = testoPrima + parteParola;
      }

      break;
    }

    // ----------------------------------------------
    // RISULTATO
    // ----------------------------------------------

    if (migliore) {
      testo.textContent = migliore.trim() + suffisso;
    } else {
      testo.textContent = suffisso;
    }
  });

  // Aggiorniamo anche l'altezza
  aggiornaAltezzaSezione2();
}

// ======================================================
// RESIZE
// ======================================================

window.addEventListener("load", () => {
  posizionaNews();

  // Aspettiamo un frame per permettere
  // al browser di applicare dimensioni e font
  requestAnimationFrame(() => {
    ricalcolaAnteprime();

    aggiornaAltezzaNotizia();

    aggiornaAltezzaSezione2();
  });
});

// ======================================================
// RESIZE FINESTRA
// ======================================================

let resizeTimer;

window.addEventListener("resize", () => {
  posizionaNews();

  // Evita centinaia di ricalcoli durante
  // il trascinamento della finestra
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    ricalcolaAnteprime();

    aggiornaAltezzaNotizia();

    aggiornaAltezzaSezione2();
  }, 50);
});

// ======================================================
// RESIZE OBSERVER SEZIONE 2
// ======================================================

const osservatore = new ResizeObserver(() => {
  // Non richiamiamo direttamente
  // ricalcolaAnteprime() qui perché
  // modificare il testo può modificare
  // a sua volta la sezione causando
  // un ciclo di ResizeObserver.

  aggiornaAltezzaNotizia();

  aggiornaAltezzaSezione2();
});

if (sezione2) {
  osservatore.observe(sezione2);
}

// ======================================================
// FONT
// ======================================================

if (document.fonts) {
  document.fonts.ready.then(() => {
    // Aspettiamo che il browser abbia
    // applicato realmente il font
    requestAnimationFrame(() => {
      ricalcolaAnteprime();

      aggiornaAltezzaNotizia();

      aggiornaAltezzaSezione2();
    });
  });
}

// ======================================================
// AVVIO
// ======================================================

caricaNews();
