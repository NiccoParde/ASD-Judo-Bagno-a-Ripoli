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

const inputRicerca = document.querySelector(".input_barra_di_ricerca");

const pulsanteCaricaAltro = document.querySelector(".pulsante_carica_altro");

// ======================================================
// VARIABILI
// ======================================================

let elencoNews = [];

let risultatiRicerca = [];

let indiceNewsAperta = 0;

let numeroNewsVisibili = 3;

let ricercaAttiva = false;

let testoRicercaCorrente = "";

// ======================================================
// CONFIGURAZIONE
// ======================================================

const MASSIMO_NEWS_PER_CARICAMENTO = 3;

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
// ESCAPE HTML
// ======================================================

function escapeHTML(testo) {
  return String(testo)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ======================================================
// ESCAPE REGEX
// ======================================================

function escapeRegex(testo) {
  return testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ======================================================
// NORMALIZZAZIONE RICERCA
// ======================================================

function normalizzaRicerca(testo) {
  return String(testo || "")
    .toLocaleLowerCase("it-IT")
    .trim();
}

// ======================================================
// EVIDENZIAZIONE TESTO
// ======================================================

function evidenziaTesto(testo, queryRicerca) {
  if (!testo) {
    return "";
  }

  if (!queryRicerca) {
    return escapeHTML(testo);
  }

  const regex = new RegExp(escapeRegex(queryRicerca), "gi");

  let risultato = "";

  let ultimaPosizione = 0;

  let corrispondenza;

  while ((corrispondenza = regex.exec(testo)) !== null) {
    risultato += escapeHTML(
      testo.substring(ultimaPosizione, corrispondenza.index),
    );

    risultato += `<mark class="evidenzia_ricerca">${escapeHTML(corrispondenza[0])}</mark>`;

    ultimaPosizione = corrispondenza.index + corrispondenza[0].length;

    if (corrispondenza[0].length === 0) {
      regex.lastIndex++;
    }
  }

  risultato += escapeHTML(testo.substring(ultimaPosizione));

  return risultato;
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
  // TESTO COMPLETO
  // ==================================================

  elemento.textContent = testoCompleto;

  if (elemento.scrollHeight <= elemento.clientHeight + 1) {
    return;
  }

  // ==================================================
  // RICERCA BINARIA
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
  // NESSUN RISULTATO
  // ==================================================

  if (!migliore) {
    elemento.textContent = suffisso;

    return;
  }

  // ==================================================
  // ULTIMO SPAZIO
  // ==================================================

  let base = migliore.substring(0, migliore.length - suffisso.length).trim();

  const ultimoSpazio = base.lastIndexOf(" ");

  // ==================================================
  // EVITA PAROLE SPEZZATE
  // ==================================================

  if (ultimoSpazio > 0) {
    base = base.substring(0, ultimoSpazio).trim();
  }

  let risultato = base + suffisso;

  elemento.textContent = risultato;

  // ==================================================
  // RECUPERO SPAZIO RIMANENTE
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
  // RISULTATO FINALE
  // ==================================================

  elemento.textContent = risultato;
}

// ======================================================
// ADATTAMENTO TESTO DURANTE RICERCA
// ======================================================

function adattaTestoRicerca(
  elemento,
  testoCompleto,
  queryRicerca,
  suffisso = " [...]",
  parteRilevanteInCima = false,
) {
  if (!elemento) {
    return;
  }

  if (!testoCompleto) {
    elemento.textContent = "";

    return;
  }

  const query = normalizzaRicerca(queryRicerca);

  const testoNormalizzato = normalizzaRicerca(testoCompleto);

  const posizione = testoNormalizzato.indexOf(query);

  // ==================================================
  // PORTA IN ALTO LA PARTE RILEVANTE
  // ==================================================

  if (posizione >= 0 && parteRilevanteInCima) {
    const testoDaMostrare = testoCompleto.substring(posizione);

    adattaTesto(elemento, testoDaMostrare, suffisso);

    const risultatoVisibile = elemento.textContent;

    elemento.innerHTML = evidenziaTesto(risultatoVisibile, queryRicerca);

    return;
  }

  // ==================================================
  // COMPORTAMENTO NORMALE
  // ==================================================

  adattaTesto(elemento, testoCompleto, suffisso);

  const risultatoVisibile = elemento.textContent;

  if (query && normalizzaRicerca(risultatoVisibile).includes(query)) {
    elemento.innerHTML = evidenziaTesto(risultatoVisibile, queryRicerca);
  }
}

// ======================================================
// CALCOLO RILEVANZA
// ======================================================

function calcolaRilevanza(news, queryRicerca, indiceOriginale) {
  const query = normalizzaRicerca(queryRicerca);

  if (!query) {
    return 0;
  }

  const titolo = normalizzaRicerca(news.titolo);

  const data = normalizzaRicerca(formattaData(news.data));

  const testo = normalizzaRicerca(pulisciTestoHTML(news.testo));

  let punteggio = 0;

  // ==================================================
  // TITOLO
  // ==================================================

  if (titolo.includes(query)) {
    punteggio += 1000;

    if (titolo.startsWith(query)) {
      punteggio += 500;
    }

    if (titolo === query) {
      punteggio += 1000;
    }

    let posizione = 0;

    let conteggio = 0;

    while ((posizione = titolo.indexOf(query, posizione)) !== -1) {
      conteggio++;

      posizione += query.length;
    }

    punteggio += conteggio * 100;
  }

  // ==================================================
  // DATA
  // ==================================================

  if (data.includes(query)) {
    punteggio += 800;

    if (data === query) {
      punteggio += 1000;
    }
  }

  // ==================================================
  // TESTO
  // ==================================================

  if (testo.includes(query)) {
    punteggio += 100;

    if (testo.startsWith(query)) {
      punteggio += 150;
    }

    let posizione = 0;

    let conteggio = 0;

    while ((posizione = testo.indexOf(query, posizione)) !== -1) {
      conteggio++;

      posizione += query.length;
    }

    punteggio += conteggio * 20;
  }

  // ==================================================
  // PARITÀ:
  // NEWS PIÙ RECENTE PRIMA
  // ==================================================

  punteggio += (elencoNews.length - indiceOriginale) / 100000;

  return punteggio;
}

// ======================================================
// CARICAMENTO NEWS
// ======================================================

async function caricaNews() {
  try {
    const newsRef = collection(db, "news");

    const q = query(newsRef, orderBy("data", "desc"));

    const snapshot = await getDocs(q);

    // ==================================================
    // RESET
    // ==================================================

    elencoNews = [];

    // ==================================================
    // LETTURA DOCUMENTI
    // ==================================================

    snapshot.forEach((documento) => {
      const dati = documento.data();

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

    console.log("News caricate:", elencoNews);

    // ==================================================
    // RESET RICERCA
    // ==================================================

    ricercaAttiva = false;

    risultatiRicerca = [];

    testoRicercaCorrente = "";

    numeroNewsVisibili = MASSIMO_NEWS_PER_CARICAMENTO;

    indiceNewsAperta = 0;

    if (inputRicerca) {
      inputRicerca.value = "";
    }

    // ==================================================
    // CREAZIONE
    // ==================================================

    creaNewsPiccole();

    aggiornaTestoNotizieAssenti();

    aggiornaPulsanteCaricaAltro();

    // ==================================================
    // FOCUS
    // ==================================================

    if (elencoNews.length > 0) {
      preparaFocus();
    }
  } catch (error) {
    console.error("Errore nel caricamento delle news:", error);
  }
}

// ======================================================
// GESTIONE TESTO NEWS ASSENTI
// ======================================================

function aggiornaTestoNotizieAssenti() {
  if (!sezione2) {
    return;
  }

  const testoAssente = sezione2.querySelector(".testo_notizie_assenti");

  if (!testoAssente) {
    return;
  }

  // ==================================================
  // NESSUNA NEWS PUBBLICATA
  // ==================================================

  if (elencoNews.length === 0) {
    testoAssente.textContent = "Non ci sono notizie pubblicate.";

    testoAssente.style.display = "block";

    sezione2.style.height = "53.43vw";

    return;
  }

  // ==================================================
  // RICERCA SENZA RISULTATI
  // ==================================================

  if (ricercaAttiva && risultatiRicerca.length === 0) {
    testoAssente.textContent = "Nessuna notizia trovata.";

    testoAssente.style.display = "block";

    sezione2.style.height = "53.43vw";

    return;
  }

  // ==================================================
  // CI SONO RISULTATI
  // ==================================================

  testoAssente.style.display = "none";
}

// ======================================================
// LISTA CORRENTE
// ======================================================

function ottieniListaCorrente() {
  if (ricercaAttiva) {
    return risultatiRicerca.map((risultato) => risultato.news);
  }

  return elencoNews;
}

// ======================================================
// CREAZIONE NEWS PICCOLE
// ======================================================

function creaNewsPiccole() {
  if (!sezione2) {
    return;
  }

  // ==================================================
  // RIMUOVI VECCHIE CARD
  // ==================================================

  sezione2.querySelectorAll(".notizia_piccola").forEach((elemento) => {
    elemento.remove();
  });

  // ==================================================
  // AGGIORNA PLACEHOLDER
  // ==================================================

  aggiornaTestoNotizieAssenti();

  // ==================================================
  // LISTA DA MOSTRARE
  // ==================================================

  const lista = ricercaAttiva
    ? risultatiRicerca
    : elencoNews.map((news, indiceOriginale) => ({
        news,
        indiceOriginale,
      }));

  const newsDaMostrare = lista.slice(0, numeroNewsVisibili);

  // ==================================================
  // CREAZIONE CARD
  // ==================================================

  newsDaMostrare.forEach((elementoNews, indiceVisuale) => {
    const news = elementoNews.news;

    const indiceOriginale = elementoNews.indiceOriginale;

    // ==================================================
    // CARD
    // ==================================================

    const notiziaPiccola = document.createElement("div");

    notiziaPiccola.className = "notizia_piccola";

    notiziaPiccola.id = `notiziaPiccola_${indiceVisuale}`;

    // ==================================================
    // SENZA IMMAGINE
    // ==================================================

    if (!news.immagine) {
      notiziaPiccola.classList.add("senza_immagine");
    }

    // ==================================================
    // SFONDO
    // ==================================================

    const sfondo = document.createElement("div");

    sfondo.className = "sfondo_notizia_piccola";

    // ==================================================
    // IMMAGINE
    // ==================================================

    const immagine = document.createElement("div");

    immagine.className = "immagine_notizia_piccola";

    if (news.immagine) {
      immagine.style.backgroundImage = `url("${news.immagine}")`;
    } else {
      immagine.style.backgroundImage = "none";
    }

    // ==================================================
    // DATA
    // ==================================================

    const data = document.createElement("span");

    data.className = "data_notizia_piccola";

    const dataFormattata = formattaData(news.data);

    // ==================================================
    // TITOLO
    // ==================================================

    const titolo = document.createElement("span");

    titolo.className = "titolo_notizia_piccola";

    // ==================================================
    // TESTO
    // ==================================================

    const testo = document.createElement("span");

    testo.className = "testo_notizia_piccola";

    const testoPulito = pulisciTestoHTML(news.testo);

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
      if (ricercaAttiva) {
        const indiceRisultato = risultatiRicerca.findIndex(
          (risultato) => risultato.indiceOriginale === indiceOriginale,
        );

        if (indiceRisultato >= 0) {
          indiceNewsAperta = indiceRisultato;

          apriNotizia(indiceRisultato);
        }
      } else {
        indiceNewsAperta = indiceOriginale;

        apriNotizia(indiceOriginale);
      }
    });

    // ==================================================
    // INSERIMENTO
    // ==================================================

    sezione2.appendChild(notiziaPiccola);

    // ==================================================
    // ADATTAMENTO TESTI
    // ==================================================

    requestAnimationFrame(() => {
      if (ricercaAttiva && testoRicercaCorrente) {
        // DATA

        data.innerHTML = evidenziaTesto(dataFormattata, testoRicercaCorrente);

        // TITOLO

        adattaTestoRicerca(
          titolo,
          news.titolo,
          testoRicercaCorrente,
          " [...]",
          true,
        );

        // TESTO

        adattaTestoRicerca(
          testo,
          testoPulito,
          testoRicercaCorrente,
          " [...]",
          true,
        );
      } else {
        // DATA

        data.textContent = dataFormattata;

        // TITOLO

        adattaTesto(titolo, news.titolo, " [...]");

        // TESTO

        adattaTesto(testo, testoPulito, " [...]");
      }

      aggiornaAltezzaSezione2();
    });
  });

  aggiornaAltezzaSezione2();

  aggiornaPulsanteCaricaAltro();
}

// ======================================================
// ESEGUE RICERCA
// ======================================================

function eseguiRicerca() {
  const queryRicerca = inputRicerca ? inputRicerca.value.trim() : "";

  testoRicercaCorrente = queryRicerca;

  // ==================================================
  // RICERCA VUOTA
  // ==================================================

  if (!queryRicerca) {
    ricercaAttiva = false;

    risultatiRicerca = [];

    numeroNewsVisibili = MASSIMO_NEWS_PER_CARICAMENTO;

    indiceNewsAperta = 0;

    creaNewsPiccole();

    aggiornaTestoNotizieAssenti();

    aggiornaPulsanteCaricaAltro();

    return;
  }

  // ==================================================
  // ATTIVA RICERCA
  // ==================================================

  ricercaAttiva = true;

  numeroNewsVisibili = MASSIMO_NEWS_PER_CARICAMENTO;

  risultatiRicerca = elencoNews
    .map((news, indiceOriginale) => {
      return {
        news,

        indiceOriginale,

        punteggio: calcolaRilevanza(news, queryRicerca, indiceOriginale),
      };
    })
    .filter((risultato) => risultato.punteggio > 0)
    .sort((a, b) => {
      if (b.punteggio !== a.punteggio) {
        return b.punteggio - a.punteggio;
      }

      return a.indiceOriginale - b.indiceOriginale;
    });

  indiceNewsAperta = 0;

  // ==================================================
  // RICREA NEWS
  // ==================================================

  creaNewsPiccole();

  aggiornaTestoNotizieAssenti();

  aggiornaPulsanteCaricaAltro();

  aggiornaAltezzaSezione2();
}

// ======================================================
// EVENTI BARRA DI RICERCA
// ======================================================

if (inputRicerca) {
  // ==================================================
  // RICERCA LIVE
  // ==================================================

  inputRicerca.addEventListener("input", () => {
    eseguiRicerca();
  });

  // ==================================================
  // INVIO
  // ==================================================

  inputRicerca.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      eseguiRicerca();
    }

    // ==============================================
    // ESCAPE = CANCELLA RICERCA
    // ==============================================

    if (event.key === "Escape") {
      inputRicerca.value = "";

      eseguiRicerca();

      inputRicerca.blur();
    }
  });
}

// ======================================================
// ALTEZZA SEZIONE 2
// ======================================================

function aggiornaAltezzaSezione2() {
  if (!sezione2) {
    return;
  }

  // ==================================================
  // NESSUNA NEWS PUBBLICATA
  // ==================================================

  if (elencoNews.length === 0) {
    sezione2.style.height = "53.43vw";

    return;
  }

  // ==================================================
  // RICERCA SENZA RISULTATI
  // ==================================================

  if (ricercaAttiva && risultatiRicerca.length === 0) {
    sezione2.style.height = "53.43vw";

    return;
  }

  // ==================================================
  // CARD PRESENTI
  // ==================================================

  const news = sezione2.querySelectorAll(".notizia_piccola");

  if (news.length === 0) {
    sezione2.style.height = "0px";

    return;
  }

  let altezzaTotale = 0;

  news.forEach((newsElement) => {
    altezzaTotale += newsElement.offsetHeight;

    const stile = getComputedStyle(newsElement);

    const margine = parseFloat(stile.marginBottom) || 0;

    altezzaTotale += margine;
  });

  sezione2.style.height = `${altezzaTotale}px`;
}

// ======================================================
// PULSANTE CARICA ALTRO
// ======================================================

function aggiornaPulsanteCaricaAltro() {
  if (!pulsanteCaricaAltro) {
    return;
  }

  const totale = ricercaAttiva ? risultatiRicerca.length : elencoNews.length;

  if (totale > 3 && numeroNewsVisibili < totale) {
    pulsanteCaricaAltro.style.display = "block";
  } else {
    pulsanteCaricaAltro.style.display = "none";
  }
}

// ======================================================
// CLICK CARICA ALTRO
// ======================================================

if (pulsanteCaricaAltro) {
  pulsanteCaricaAltro.addEventListener("click", () => {
    const totale = ricercaAttiva ? risultatiRicerca.length : elencoNews.length;

    if (numeroNewsVisibili >= totale) {
      return;
    }

    numeroNewsVisibili += MASSIMO_NEWS_PER_CARICAMENTO;

    if (numeroNewsVisibili > totale) {
      numeroNewsVisibili = totale;
    }

    creaNewsPiccole();

    aggiornaPulsanteCaricaAltro();

    aggiornaAltezzaSezione2();
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

    const lista = ottieniListaCorrente();

    if (lista.length === 0) {
      return;
    }

    indiceNewsAperta++;

    if (indiceNewsAperta >= lista.length) {
      indiceNewsAperta = 0;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  });

  // ==================================================
  // SINISTRA
  // ==================================================

  pulsanteSinistra.addEventListener("click", (event) => {
    event.stopPropagation();

    const lista = ottieniListaCorrente();

    if (lista.length === 0) {
      return;
    }

    indiceNewsAperta--;

    if (indiceNewsAperta < 0) {
      indiceNewsAperta = lista.length - 1;
    }

    aggiornaNotiziaFocus(indiceNewsAperta);
  });

  // ==================================================
  // SFONDO
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

  const lista = ottieniListaCorrente();

  if (!lista[indice]) {
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
  const lista = ottieniListaCorrente();

  const news = lista[indice];

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
  // IMMAGINE
  // ==================================================

  const senzaImmagine = !news.immagine || news.immagine.trim() === "";

  // ==================================================
  // CLASSE
  // ==================================================

  if (notizia) {
    if (senzaImmagine) {
      notizia.classList.add("notizia_senza_immagine");
    } else {
      notizia.classList.remove("notizia_senza_immagine");
    }
  }

  // ==================================================
  // BACKGROUND
  // ==================================================

  if (immagine) {
    if (senzaImmagine) {
      immagine.style.backgroundImage = "none";
    } else {
      immagine.style.backgroundImage = `url("${news.immagine}")`;
    }
  }

  // ==================================================
  // PULSANTI
  // ==================================================

  if (pulsanteDestra) {
    pulsanteDestra.style.display = senzaImmagine ? "none" : "";
  }

  if (pulsanteSinistra) {
    pulsanteSinistra.style.display = senzaImmagine ? "none" : "";
  }

  // ==================================================
  // ALTEZZA
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

  const altezzaRealeTesto = testoNotizia.scrollHeight;

  const fineTesto = testoNotizia.offsetTop + altezzaRealeTesto;

  const spazioFinale = (2.60417 * window.innerWidth) / 100;

  const altezzaNotizia = fineTesto + spazioFinale;

  notizia.style.height = `${altezzaNotizia}px`;
}

// ======================================================
// LOAD
// ======================================================

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    document.querySelectorAll(".notizia_piccola").forEach((card, indice) => {
      const lista = ricercaAttiva
        ? risultatiRicerca
        : elencoNews.map((news, indiceOriginale) => ({
            news,
            indiceOriginale,
          }));

      const elementoNews = lista[indice];

      if (!elementoNews) {
        return;
      }

      const news = elementoNews.news;

      const titolo = card.querySelector(".titolo_notizia_piccola");

      const testo = card.querySelector(".testo_notizia_piccola");

      const testoPulito = pulisciTestoHTML(news.testo);

      if (ricercaAttiva && testoRicercaCorrente) {
        adattaTestoRicerca(
          titolo,
          news.titolo,
          testoRicercaCorrente,
          " [...]",
          true,
        );

        adattaTestoRicerca(
          testo,
          testoPulito,
          testoRicercaCorrente,
          " [...]",
          true,
        );
      } else {
        adattaTesto(titolo, news.titolo, " [...]");

        adattaTesto(testo, testoPulito, " [...]");
      }
    });

    aggiornaAltezzaNotizia();

    aggiornaAltezzaSezione2();

    aggiornaPulsanteCaricaAltro();
  });
});

// ======================================================
// RESIZE
// ======================================================

let resizeTimer;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    /*
                        Ricrea le card così il testo
                        viene ricalcolato con la
                        nuova larghezza.
                    */

    creaNewsPiccole();

    aggiornaAltezzaNotizia();

    aggiornaAltezzaSezione2();

    aggiornaPulsanteCaricaAltro();
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
      creaNewsPiccole();

      aggiornaAltezzaNotizia();

      aggiornaAltezzaSezione2();

      aggiornaPulsanteCaricaAltro();
    });
  });
}

// ======================================================
// AVVIO
// ======================================================

caricaNews();
