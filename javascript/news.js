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
// CONFIGURAZIONE
// ======================================================

const MASSIMO_NEWS_VISIBILI = 3;

// ======================================================
// DISTANZA NEWS
// ======================================================
//
// Altezza card:
// 16.04vw
//
// Spazio richiesto:
// 56px
//
// 56 / 1920 * 100
// = 2.91667vw
//
// Distanza totale tra i TOP:
// 16.04 + 2.91667
// = 18.95667vw
// ======================================================

const DISTANZA_NEWS = 18.95667;

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

  // ==================================================
  // PROVIAMO IL TESTO COMPLETO
  // ==================================================

  elemento.textContent = testoCompleto;

  if (elemento.scrollHeight <= elemento.clientHeight + 1) {
    return;
  }

  // ==================================================
  // RICERCA BINARIA SUI CARATTERI
  // ==================================================

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

  // ==================================================
  // CERCHIAMO L'ULTIMO SPAZIO
  // ==================================================

  if (!migliore) {
    elemento.textContent = suffisso;

    return;
  }

  let base = migliore.substring(0, migliore.length - suffisso.length).trim();

  const ultimoSpazio = base.lastIndexOf(" ");

  // ==================================================
  // EVITIAMO PAROLE SPEZZATE
  // ==================================================

  if (ultimoSpazio > 0) {
    base = base.substring(0, ultimoSpazio).trim();
  }

  let risultato = base + suffisso;

  elemento.textContent = risultato;

  // ==================================================
  // PROVIAMO A RECUPERARE ALTRO SPAZIO
  // ==================================================

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

  // ==================================================
  // CONTROLLO FINALE
  // ==================================================

  elemento.textContent = risultato;
}

// ======================================================
// CARICAMENTO NEWS
// ======================================================

async function caricaNews() {
  try {
    const newsRef = collection(db, "news");

    const q = query(newsRef, orderBy("data", "desc"));

    const snapshot = await getDocs(q);

    elencoNews = [];

    snapshot.forEach((documento) => {
      const dati = documento.data();

      if (dati.pubblicata === true) {
        /*
                        SUPPORTIAMO ENTRAMBI I NOMI:

                        image
                        immagine
                    */

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

  // ==================================================
  // PULIZIA
  // ==================================================

  sezione2.querySelectorAll(".notizia_1").forEach((elemento) => {
    elemento.remove();
  });

  // ==================================================
  // MASSIMO 3 NEWS
  // ==================================================

  const newsDaMostrare = elencoNews.slice(0, MASSIMO_NEWS_VISIBILI);

  // ==================================================
  // CREAZIONE
  // ==================================================

  newsDaMostrare.forEach((news, indice) => {
    const notiziaPiccola = document.createElement("div");

    notiziaPiccola.className = "notizia_1";

    notiziaPiccola.id = `notiziaPiccola_${indice}`;

    // ==================================================
    // SFONDO
    // ==================================================

    const sfondo = document.createElement("div");

    sfondo.className = "sfondo_notizia_1";

    // ==================================================
    // IMMAGINE
    // ==================================================

    const immagine = document.createElement("div");

    immagine.className = "immagine_notizia_1";

    /*
                Se c'è un'immagine:
                la visualizziamo.

                Se non c'è:
                lasciamo semplicemente
                lo spazio vuoto.
            */

    if (news.immagine) {
      immagine.style.backgroundImage = `url("${news.immagine}")`;
    } else {
      immagine.style.backgroundImage = "none";
    }

    // ==================================================
    // DATA
    // ==================================================

    const data = document.createElement("span");

    data.className = "data_notizia_1";

    data.textContent = formattaData(news.data);

    // ==================================================
    // TITOLO
    // ==================================================

    const titolo = document.createElement("span");

    titolo.className = "titolo_notizia_1";

    // ==================================================
    // TESTO
    // ==================================================

    const testo = document.createElement("span");

    testo.className = "testo_notizia_1";

    const testoPulito = news.testo
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    // ==================================================
    // ASSEMBLAGGIO
    // ==================================================

    notiziaPiccola.appendChild(sfondo);

    notiziaPiccola.appendChild(immagine);

    notiziaPiccola.appendChild(data);

    notiziaPiccola.appendChild(titolo);

    notiziaPiccola.appendChild(testo);

    // ==================================================
    // CLICK
    // ==================================================

    notiziaPiccola.addEventListener("click", () => {
      indiceNewsAperta = indice;

      apriNotizia(indiceNewsAperta);
    });

    // ==================================================
    // INSERIMENTO
    // ==================================================

    sezione2.appendChild(notiziaPiccola);

    // ==================================================
    // ADATTAMENTO TESTI
    // ==================================================

    requestAnimationFrame(() => {
      adattaTesto(titolo, news.titolo, " [...]");

      adattaTesto(testo, testoPulito, " [...]");

      aggiornaAltezzaSezione2();
    });
  });

  posizionaNews();

  requestAnimationFrame(() => {
    aggiornaAltezzaSezione2();
  });
}

// ======================================================
// POSIZIONAMENTO NEWS
// ======================================================

function posizionaNews() {
  if (!sezione2) {
    return;
  }

  const news = sezione2.querySelectorAll(".notizia_1");

  news.forEach((newsElement, indice) => {
    /*
                NEWS 1:
                0vw

                NEWS 2:
                18.95667vw

                NEWS 3:
                37.91334vw
            */

    newsElement.style.top = `${indice * DISTANZA_NEWS}vw`;
  });
}

// ======================================================
// PREPARAZIONE FOCUS
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

  pulsanteEsci.id = "pulsanteEsci";

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
  // EVENTO ESCI
  // ==================================================

  pulsanteEsci.addEventListener("click", (event) => {
    event.stopPropagation();

    chiudiNotizia();
  });

  // ==================================================
  // EVENTO DESTRA
  // ==================================================

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

  // ==================================================
  // EVENTO SINISTRA
  // ==================================================

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

  // ==================================================
  // CLICK SU SFONDO
  // ==================================================

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
// AGGIORNA FOCUS
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
  // CONTROLLO IMMAGINE
  // ==================================================

  const senzaImmagine = !news.immagine || news.immagine.trim() === "";

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
  // IMMAGINE
  // ==================================================

  if (immagine) {
    if (senzaImmagine) {
      /*
                Nessuna immagine:
                eliminiamo completamente
                lo spazio dell'immagine
                tramite CSS.
            */

      immagine.style.backgroundImage = "none";
    } else {
      immagine.style.backgroundImage = `url("${news.immagine}")`;
    }
  }

  // ==================================================
  // PULSANTI SINISTRA / DESTRA
  // ==================================================

  if (pulsanteDestra) {
    pulsanteDestra.style.display = senzaImmagine ? "none" : "";
  }

  if (pulsanteSinistra) {
    pulsanteSinistra.style.display = senzaImmagine ? "none" : "";
  }

  // ==================================================
  // AGGIORNAMENTO ALTEZZA
  // ==================================================

  requestAnimationFrame(() => {
    aggiornaAltezzaNotizia();
  });
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

  // ==================================================
  // ALTEZZA REALE DEL TESTO
  // ==================================================

  const altezzaRealeTesto = testoNotizia.scrollHeight;

  // ==================================================
  // FINE DEL TESTO
  // ==================================================

  const fineTesto = testoNotizia.offsetTop + altezzaRealeTesto;

  /*
        50px:

        50 / 1920 * 100
        = 2.60417vw
    */

  const spazioFinale = (2.60417 * window.innerWidth) / 100;

  const altezzaNotizia = fineTesto + spazioFinale;

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

  // 20px = 1.04167vw

  sezione2.style.height = `calc(${altezzaMassima}px + 1.04167vw)`;
}

// ======================================================
// RESIZE
// ======================================================

window.addEventListener("load", () => {
  posizionaNews();

  requestAnimationFrame(() => {
    document.querySelectorAll(".notizia_1").forEach((card, indice) => {
      const news = elencoNews[indice];

      if (!news) {
        return;
      }

      const titolo = card.querySelector(".titolo_notizia_1");

      const testo = card.querySelector(".testo_notizia_1");

      const testoPulito = news.testo
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      adattaTesto(titolo, news.titolo, " [...]");

      adattaTesto(testo, testoPulito, " [...]");
    });

    aggiornaAltezzaNotizia();

    aggiornaAltezzaSezione2();
  });
});

// ======================================================
// RESIZE FINESTRA
// ======================================================

let resizeTimer;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    posizionaNews();

    document.querySelectorAll(".notizia_1").forEach((card, indice) => {
      const news = elencoNews[indice];

      if (!news) {
        return;
      }

      const titolo = card.querySelector(".titolo_notizia_1");

      const testo = card.querySelector(".testo_notizia_1");

      const testoPulito = news.testo
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      adattaTesto(titolo, news.titolo, " [...]");

      adattaTesto(testo, testoPulito, " [...]");
    });

    aggiornaAltezzaNotizia();

    aggiornaAltezzaSezione2();
  }, 50);
});

// ======================================================
// RESIZE OBSERVER
// ======================================================

const osservatore = new ResizeObserver(() => {
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
    requestAnimationFrame(() => {
      document.querySelectorAll(".notizia_1").forEach((card, indice) => {
        const news = elencoNews[indice];

        if (!news) {
          return;
        }

        const titolo = card.querySelector(".titolo_notizia_1");

        const testo = card.querySelector(".testo_notizia_1");

        const testoPulito = news.testo
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/\s+/g, " ")
          .trim();

        adattaTesto(titolo, news.titolo, " [...]");

        adattaTesto(testo, testoPulito, " [...]");
      });

      aggiornaAltezzaNotizia();

      aggiornaAltezzaSezione2();
    });
  });
}

// ======================================================
// AVVIO
// ======================================================

caricaNews();
