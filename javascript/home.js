import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

// ======================================================
// ELEMENTI PRINCIPALI HOME
// ======================================================

const pannelloNews = document.querySelector(".pannello_notizie_sezione_3");

const testoNotizieAssenti = document.querySelector(".testo_notizie_assenti");

const notiziaFocus = document.getElementById("notiziaFocus");

// ======================================================
// VARIABILI
// ======================================================

let elencoNews = [];

let indiceNewsAperta = 0;

// Massimo 3 news nella Home
const MASSIMO_NEWS_HOME = 3;

function ottieniNewsVisibiliHome() {
  return elencoNews.slice(0, MASSIMO_NEWS_HOME);
}

// ======================================================
// FORMATTAZIONE DATA
// ======================================================

function formattaData(timestamp) {
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

// ======================================================
// PULIZIA TESTO HTML
// ======================================================

function pulisciTestoHTML(testo) {
  if (!testo) {
    return "";
  }

  const contenitore = document.createElement("div");

  contenitore.innerHTML = testo;

  return (contenitore.textContent || contenitore.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

// ======================================================
// PERCORSO IMMAGINE
// ======================================================

function percorsoImmagineNews(immagine) {
  if (!immagine) {
    return "";
  }

  const valore = String(immagine).trim();

  if (!valore) {
    return "";
  }

  // Se Firestore contiene già
  // ./assets/news/...
  if (valore.startsWith("./assets/news/")) {
    return valore;
  }

  // Se contiene /assets/news/...
  if (valore.startsWith("/assets/news/")) {
    return `.${valore}`;
  }

  // Se contiene solo il nome del file
  // esempio: foto1.jpg
  return `./assets/news/${valore}`;
}

// ======================================================
// ADATTAMENTO TESTO
// ======================================================

function adattaTesto(elemento, testoCompleto, suffisso = " [...]") {
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

  let risultato = base + suffisso;

  elemento.textContent = risultato;

  let indice = base.length;

  while (indice < testoCompleto.length) {
    const candidato = testoCompleto.substring(0, indice + 1).trim() + suffisso;

    elemento.textContent = candidato;

    if (elemento.scrollHeight <= elemento.clientHeight + 1) {
      risultato = candidato;

      indice++;
    } else {
      break;
    }
  }

  elemento.textContent = risultato;
}

// ======================================================
// CARICAMENTO NEWS
// ======================================================

async function caricaNewsHome() {
  if (!pannelloNews) {
    return;
  }

  try {
    // ==================================================
    // FIRESTORE
    // ==================================================

    const newsRef = collection(db, "news");

    const q = query(newsRef, orderBy("data", "desc"));

    const snapshot = await getDocs(q);

    // ==================================================
    // RESET
    // ==================================================

    elencoNews = [];

    // ==================================================
    // LETTURA
    // ==================================================

    snapshot.forEach((documento) => {
      const dati = documento.data();

      // Solo news pubblicate
      if (dati.pubblicata === true) {
        const immagine = dati.image ?? dati.immagine ?? "";

        elencoNews.push({
          id: documento.id,

          titolo: dati.titolo || "",

          testo: dati.testo || "",

          data: dati.data || null,

          immagine: typeof immagine === "string" ? immagine.trim() : "",
        });
      }
    });

    console.log("News Home:", elencoNews);

    // ==================================================
    // CREA LE PRIME 3
    // ==================================================

    creaNewsHome();

    // ==================================================
    // PREPARA POPUP
    // ==================================================

    if (elencoNews.length > 0 && notiziaFocus) {
      preparaFocus();
    }
  } catch (error) {
    console.error("Errore caricamento news Home:", error);

    if (testoNotizieAssenti) {
      testoNotizieAssenti.textContent = "Impossibile caricare le notizie.";

      testoNotizieAssenti.style.display = "block";
    }
  }
}

// ======================================================
// CREA NEWS NEL PANNELLO HOME
// ======================================================

function creaNewsHome() {
  if (!pannelloNews) {
    return;
  }

  // ==================================================
  // RIMUOVE EVENTUALI CARD PRECEDENTI
  // ==================================================

  pannelloNews.querySelectorAll(".notizia_piccola").forEach((elemento) => {
    elemento.remove();
  });

  // ==================================================
  // NESSUNA NEWS
  // ==================================================

  if (elencoNews.length === 0) {
    if (testoNotizieAssenti) {
      testoNotizieAssenti.textContent =
        "Non è ancora stata pubblicata nessuna notizia...";

      testoNotizieAssenti.style.display = "block";
    }

    return;
  }

  // ==================================================
  // CI SONO NEWS
  // ==================================================

  if (testoNotizieAssenti) {
    testoNotizieAssenti.style.display = "none";
  }

  // ==================================================
  // SOLO LE PRIME 3
  // ==================================================

  const newsDaMostrare = elencoNews.slice(0, MASSIMO_NEWS_HOME);

  // ==================================================
  // CREAZIONE CARD
  // ==================================================

  newsDaMostrare.forEach((news, indice) => {
    // ================================================
    // CARD
    // ================================================

    const notiziaPiccola = document.createElement("div");

    notiziaPiccola.className = "notizia_piccola";

    notiziaPiccola.id = `homeNotiziaPiccola_${indice}`;

    // ================================================
    // SENZA IMMAGINE
    // ================================================

    if (!news.immagine) {
      notiziaPiccola.classList.add("senza_immagine");
    }

    // ================================================
    // SFONDO
    // ================================================

    const sfondo = document.createElement("div");

    sfondo.className = "sfondo_notizia_piccola";

    // ================================================
    // IMMAGINE
    // ================================================

    const immagine = document.createElement("div");

    immagine.className = "immagine_notizia_piccola";

    const srcImmagine = percorsoImmagineNews(news.immagine);

    if (srcImmagine) {
      immagine.style.backgroundImage = `url("${srcImmagine}")`;
    } else {
      immagine.style.backgroundImage = "none";
    }

    // ================================================
    // DATA
    // ================================================

    const data = document.createElement("span");

    data.className = "data_notizia_piccola";

    data.textContent = formattaData(news.data);

    // ================================================
    // TITOLO
    // ================================================

    const titolo = document.createElement("span");

    titolo.className = "titolo_notizia_piccola";

    // ================================================
    // TESTO
    // ================================================

    const testo = document.createElement("span");

    testo.className = "testo_notizia_piccola";

    const testoPulito = pulisciTestoHTML(news.testo);

    // ================================================
    // ASSEMBLAGGIO
    // ================================================

    notiziaPiccola.appendChild(sfondo);

    notiziaPiccola.appendChild(immagine);

    notiziaPiccola.appendChild(data);

    notiziaPiccola.appendChild(titolo);

    notiziaPiccola.appendChild(testo);

    // ================================================
    // TESTO
    // ================================================

    requestAnimationFrame(() => {
      adattaTesto(titolo, news.titolo, " [...]");

      adattaTesto(testo, testoPulito, " [...]");
    });

    // ================================================
    // CLICK CARD
    // ================================================

    notiziaPiccola.addEventListener("click", () => {
      indiceNewsAperta = indice;

      apriNotizia(indice);
    });

    // ================================================
    // INSERIMENTO
    // ================================================

    pannelloNews.appendChild(notiziaPiccola);
  });
}

// ======================================================
// PREPARAZIONE POPUP
// ======================================================

function preparaFocus() {
  if (!notiziaFocus) {
    return;
  }

  notiziaFocus.innerHTML = "";

  // ==================================================
  // OFFUSCAMENTO
  // ==================================================

  const offuscamento = document.createElement("div");

  offuscamento.className = "offuscamento_background";

  // ==================================================
  // NOTIZIA
  // ==================================================

  const notizia = document.createElement("div");

  notizia.className = "notizia";

  // ==================================================
  // SFONDO
  // ==================================================

  const sfondo = document.createElement("div");

  sfondo.className = "sfondo_notizia";

  // ==================================================
  // IMMAGINE
  // ==================================================

  const immagine = document.createElement("div");

  immagine.className = "immagine_notizia";

  // ==================================================
  // DATA
  // ==================================================

  const data = document.createElement("span");

  data.className = "data_notizia";

  data.id = "dataNotizia";

  // ==================================================
  // TITOLO
  // ==================================================

  const titolo = document.createElement("span");

  titolo.className = "titolo_notizia";

  titolo.id = "titoloNotizia";

  // ==================================================
  // TESTO
  // ==================================================

  const testo = document.createElement("span");

  testo.className = "testo_notizia";

  testo.id = "testoNotizia";

  // ==================================================
  // PULSANTE ESCI
  // ==================================================

  const pulsanteEsci = document.createElement("div");

  pulsanteEsci.className = "pulsante_esci";

  const sfondoEsci = document.createElement("div");

  sfondoEsci.className = "sfondo_pulsante_esci";

  const iconaEsci = document.createElement("div");

  iconaEsci.className = "icona_pulsante_esci";

  pulsanteEsci.appendChild(sfondoEsci);

  pulsanteEsci.appendChild(iconaEsci);

  // ==================================================
  // PULSANTE DESTRA
  // ==================================================

  const pulsanteDestra = document.createElement("div");

  pulsanteDestra.className = "pulsante_scorri_destra";

  const sfondoDestra = document.createElement("div");

  sfondoDestra.className = "sfondo_pulsante_scorri_destra";

  const iconaDestra = document.createElement("div");

  iconaDestra.className = "icona_pulsante_scorri_destra";

  pulsanteDestra.appendChild(sfondoDestra);

  pulsanteDestra.appendChild(iconaDestra);

  // ==================================================
  // PULSANTE SINISTRA
  // ==================================================

  const pulsanteSinistra = document.createElement("div");

  pulsanteSinistra.className = "pulsante_scorri_sinistra";

  const sfondoSinistra = document.createElement("div");

  sfondoSinistra.className = "sfondo_pulsante_scorri_sinistra";

  const iconaSinistra = document.createElement("div");

  iconaSinistra.className = "icona_pulsante_scorri_sinistra";

  pulsanteSinistra.appendChild(sfondoSinistra);

  pulsanteSinistra.appendChild(iconaSinistra);

  // ==================================================
  // ASSEMBLAGGIO
  // ==================================================

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

  // ==================================================
  // ESCI
  // ==================================================

  pulsanteEsci.addEventListener("click", (event) => {
    event.stopPropagation();

    chiudiNotizia();
  });

  // ==================================================
  // DESTRA
  // ==================================================

  pulsanteDestra.addEventListener("click", (event) => {
    event.stopPropagation();

    const newsVisibili = ottieniNewsVisibiliHome();

    if (newsVisibili.length <= 1) {
      return;
    }

    indiceNewsAperta++;

    if (indiceNewsAperta >= newsVisibili.length) {
      indiceNewsAperta = 0;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  });

  // ==================================================
  // SINISTRA
  // ==================================================

  pulsanteSinistra.addEventListener("click", (event) => {
    event.stopPropagation();

    const newsVisibili = ottieniNewsVisibiliHome();

    if (newsVisibili.length <= 1) {
      return;
    }

    indiceNewsAperta--;

    if (indiceNewsAperta < 0) {
      indiceNewsAperta = newsVisibili.length - 1;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  });

  // ==================================================
  // CLICK SFONDO
  // ==================================================

  offuscamento.addEventListener("click", () => {
    chiudiNotizia();
  });

  aggiornaNotiziaFocus(0);
}

// ======================================================
// APRI NOTIZIA
// ======================================================

function apriNotizia(indice) {
  if (!notiziaFocus) {
    return;
  }

  if (!elencoNews[indice]) {
    return;
  }

  indiceNewsAperta = indice;

  aggiornaNotiziaFocus(indice);

  notiziaFocus.scrollTop = 0;

  notiziaFocus.classList.add("aperta");

  document.body.classList.add("popup_aperto");
}

// ======================================================
// CHIUDI NOTIZIA
// ======================================================

function chiudiNotizia() {
  if (!notiziaFocus) {
    return;
  }

  notiziaFocus.classList.remove("aperta");

  document.body.classList.remove("popup_aperto");
}

// ======================================================
// AGGIORNA POPUP
// ======================================================

function aggiornaNotiziaFocus(indice) {
  const newsVisibili = ottieniNewsVisibiliHome();

  const news = newsVisibili[indice];
  if (!news) {
    return;
  }

  const data = notiziaFocus.querySelector("#dataNotizia");

  const titolo = notiziaFocus.querySelector("#titoloNotizia");

  const testo = notiziaFocus.querySelector("#testoNotizia");

  const immagine = notiziaFocus.querySelector(".immagine_notizia");

  const notizia = notiziaFocus.querySelector(".notizia");

  const pulsanteDestra = notiziaFocus.querySelector(".pulsante_scorri_destra");

  const pulsanteSinistra = notiziaFocus.querySelector(
    ".pulsante_scorri_sinistra",
  );

  // ==================================================
  // DATA
  // ==================================================

  if (data) {
    data.textContent = formattaData(news.data);
  }

  // ==================================================
  // TITOLO
  // ==================================================

  if (titolo) {
    titolo.textContent = news.titolo;
  }

  // ==================================================
  // TESTO
  // ==================================================

  if (testo) {
    testo.innerHTML = news.testo || "";
  }

  // ==================================================
  // IMMAGINE
  // ==================================================

  const srcImmagine = percorsoImmagineNews(news.immagine);

  const senzaImmagine = !srcImmagine;

  if (immagine) {
    if (senzaImmagine) {
      immagine.style.backgroundImage = "none";
    } else {
      immagine.style.backgroundImage = `url("${srcImmagine}")`;
    }
  }

  // ==================================================
  // CLASSE SENZA IMMAGINE
  // ==================================================

  if (notizia) {
    if (senzaImmagine) {
      notizia.classList.add("notizia_senza_immagine");
    } else {
      notizia.classList.remove("notizia_senza_immagine");
    }
  }

  // ==================================================
  // FRECCE
  // ==================================================

  // Le frecce spariscono quando
  // nella Home c'è una sola news.

  if (elencoNews.length <= 1) {
    if (pulsanteDestra) {
      pulsanteDestra.style.display = "none";
    }

    if (pulsanteSinistra) {
      pulsanteSinistra.style.display = "none";
    }
  } else {
    if (pulsanteDestra) {
      pulsanteDestra.style.display = "";
    }

    if (pulsanteSinistra) {
      pulsanteSinistra.style.display = "";
    }
  }

  // ==================================================
  // AGGIORNA ALTEZZA
  // ==================================================

  requestAnimationFrame(() => {
    aggiornaAltezzaNotizia();
  });
}

// ======================================================
// ALTEZZA POPUP
// ======================================================

function aggiornaAltezzaNotizia() {
  const notizia = notiziaFocus?.querySelector(".notizia");

  const testoNotizia = notiziaFocus?.querySelector(".testo_notizia");

  if (!notizia || !testoNotizia) {
    return;
  }

  const altezzaRealeTesto = testoNotizia.scrollHeight;

  const fineTesto = testoNotizia.offsetTop + altezzaRealeTesto;

  const spazioFinale = (2.60417 * window.innerWidth) / 100;

  const altezzaNotizia = fineTesto + spazioFinale;

  notizia.style.height = `${altezzaNotizia}px`;
}

// ======================================================
// RESIZE
// ======================================================

let resizeTimer;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    creaNewsHome();

    aggiornaAltezzaNotizia();
  }, 50);
});

// ======================================================
// FONT
// ======================================================

if (document.fonts) {
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      creaNewsHome();

      aggiornaAltezzaNotizia();
    });
  });
}

// ======================================================
// TASTIERA
// ======================================================

window.addEventListener("keydown", (event) => {
  // ESC
  if (event.key === "Escape") {
    chiudiNotizia();
  }

  // DESTRA
  if (
    event.key === "ArrowRight" &&
    notiziaFocus?.classList.contains("aperta")
  ) {
    if (elencoNews.length <= 1) {
      return;
    }

    indiceNewsAperta++;

    if (indiceNewsAperta >= elencoNews.length) {
      indiceNewsAperta = 0;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  }

  // SINISTRA
  if (event.key === "ArrowLeft" && notiziaFocus?.classList.contains("aperta")) {
    if (elencoNews.length <= 1) {
      return;
    }

    indiceNewsAperta--;

    if (indiceNewsAperta < 0) {
      indiceNewsAperta = elencoNews.length - 1;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  }
});

// ======================================================
// AVVIO
// ======================================================

caricaNewsHome();
