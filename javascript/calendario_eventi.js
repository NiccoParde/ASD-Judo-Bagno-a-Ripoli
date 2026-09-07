/**
 * Logica interattiva del Calendario Eventi - A.S.D. Judo Bagno a Ripoli
 *
 * Funzionalità:
 * - Integrazione dinamica Firestore (collection "eventi")
 * - Visualizzazione dinamica di mese e anno corrente
 * - Navigazione con frecce sinistra (mese precedente) e destra (mese successivo)
 * - Allineamento settimane da Lunedì a Domenica
 * - Stili celle conformi al design Figma:
 *   - Celle normali del mese corrente
 *   - Giorni di altri mesi adiacenti
 *   - Giorno corrente / Oggi (cella piena scura, come il 9 in Figma)
 *   - Eventi passati (cerchio grigio, come il 7 in Figma)
 *   - Eventi futuri (cerchio scuro, come il 24 in Figma)
 * - Click su qualsiasi giorno con eventi per aprire il popup anteprima dettagliato
 */

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const COLLECTION_EVENTI = "eventi";

document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM del calendario
  const elementoMeseAnno = document.getElementById("calendarioMeseAnno");
  const elementoGriglia = document.getElementById("calendarioGriglia");
  const btnMesePrecedente = document.getElementById("btnMesePrecedente");
  const btnMeseSuccessivo = document.getElementById("btnMeseSuccessivo");

  // Elementi DOM popup anteprima
  const offuscamentoAnteprimaEvento = document.getElementById(
    "offuscamentoAnteprimaEvento",
  );
  const btnChiudiAnteprimaEvento = document.getElementById(
    "btnChiudiAnteprimaEvento",
  );
  const contenutoAnteprimaEventi = document.getElementById(
    "contenutoAnteprimaEventi",
  );

  if (!elementoMeseAnno || !elementoGriglia) {
    return;
  }

  // Nomi dei mesi in italiano
  const NOMI_MESI = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  // Data odierna reale
  const dataOggi = new Date();
  const oggiGiorno = dataOggi.getDate();
  const oggiMese = dataOggi.getMonth();
  const oggiAnno = dataOggi.getFullYear();

  // Stato di navigazione visualizzato
  let annoVisualizzato = oggiAnno;
  let meseVisualizzato = oggiMese;

  // Elenco eventi caricati da Firestore
  let elencoEventi = [];

  /**
   * Formatta una data in chiave stringa 'YYYY-MM-DD'
   */
  function formattaDataChiave(anno, mese, giorno) {
    const mm = String(mese + 1).padStart(2, "0");
    const dd = String(giorno).padStart(2, "0");
    return `${anno}-${mm}-${dd}`;
  }

  /**
   * Raggruppa gli eventi pubblicati per data 'YYYY-MM-DD'
   */
  function mappaEventiPerData(lista) {
    const mappa = new Map();

    lista.forEach((ev) => {
      let chiave = ev.dataStringa;

      if (!chiave && ev.anno && ev.mese && ev.giorno) {
        chiave = formattaDataChiave(ev.anno, ev.mese - 1, ev.giorno);
      } else if (!chiave && ev.data && ev.data.toDate) {
        const d = ev.data.toDate();
        chiave = formattaDataChiave(d.getFullYear(), d.getMonth(), d.getDate());
      }

      if (chiave) {
        if (!mappa.has(chiave)) {
          mappa.set(chiave, []);
        }
        mappa.get(chiave).push(ev);
      }
    });

    return mappa;
  }

  /**
   * Carica gli eventi pubblicati da Firestore
   */
  async function caricaEventiDaFirestore() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_EVENTI));
      const caricati = [];

      snapshot.forEach((documento) => {
        const dati = documento.data();
        if (dati.pubblicata === true) {
          caricati.push({
            id: documento.id,
            ...dati,
          });
        }
      });

      // Ordina gli eventi per data crescente
      caricati.sort((a, b) => {
        const tA = a.data?.toDate ? a.data.toDate().getTime() : 0;
        const tB = b.data?.toDate ? b.data.toDate().getTime() : 0;
        return tA - tB;
      });

      elencoEventi = caricati;
      renderCalendario();
    } catch (errore) {
      console.warn(
        "Avviso: impossibile caricare gli eventi da Firestore (verificare le regole di sicurezza):",
        errore,
      );
    }
  }

  /**
   * Genera e renderizza i giorni del calendario per il mese visualizzato
   */
  function renderCalendario() {
    // 1. Intestazione mese e anno
    elementoMeseAnno.textContent = `${NOMI_MESI[meseVisualizzato]} ${annoVisualizzato}`;

    // 2. Calcoli giorni mese corrente e mese precedente
    const primoGiornoMese = new Date(annoVisualizzato, meseVisualizzato, 1);
    const giornoInizioSettimana = (primoGiornoMese.getDay() + 6) % 7;

    const totGiorniMeseCorrente = new Date(
      annoVisualizzato,
      meseVisualizzato + 1,
      0,
    ).getDate();
    const totGiorniMesePrecedente = new Date(
      annoVisualizzato,
      meseVisualizzato,
      0,
    ).getDate();

    // 3. Determina se servono 5 o 6 righe per visualizzare tutte le settimane
    const totGiorniDaMostrare = giornoInizioSettimana + totGiorniMeseCorrente;
    const totCelle = totGiorniDaMostrare > 35 ? 42 : 35;
    const numeroRighe = totCelle / 7;

    elementoGriglia.style.setProperty("--numero-righe", numeroRighe);

    // Mappa eventi per ricerca rapida O(1)
    const mappaEventi = mappaEventiPerData(elencoEventi);
    const frammento = document.createDocumentFragment();

    // Data odierna normalizzata a mezzanotte per confronto passato/futuro
    const mezzanotteOggi = new Date(oggiAnno, oggiMese, oggiGiorno).getTime();

    // 4. Genera giorni del mese precedente
    const annoMesePrec = meseVisualizzato === 0 ? annoVisualizzato - 1 : annoVisualizzato;
    const mesePrec = meseVisualizzato === 0 ? 11 : meseVisualizzato - 1;

    for (let i = giornoInizioSettimana - 1; i >= 0; i--) {
      const giornoNum = totGiorniMesePrecedente - i;
      const dataChiave = formattaDataChiave(annoMesePrec, mesePrec, giornoNum);
      const eventiCella = mappaEventi.get(dataChiave) || [];

      const cella = creaCellaGiorno({
        numero: giornoNum,
        tipo: "altro-mese",
        anno: annoMesePrec,
        mese: mesePrec,
        eventi: eventiCella,
      });
      frammento.appendChild(cella);
    }

    // 5. Genera giorni del mese corrente
    for (let g = 1; g <= totGiorniMeseCorrente; g++) {
      const isOggi =
        annoVisualizzato === oggiAnno &&
        meseVisualizzato === oggiMese &&
        g === oggiGiorno;

      const dataChiave = formattaDataChiave(annoVisualizzato, meseVisualizzato, g);
      const eventiCella = mappaEventi.get(dataChiave) || [];
      const haEventi = eventiCella.length > 0;

      let tipoCella = "normale";
      if (isOggi) {
        tipoCella = "oggi";
      } else if (haEventi) {
        const dataCella = new Date(
          annoVisualizzato,
          meseVisualizzato,
          g,
        ).getTime();
        tipoCella = dataCella < mezzanotteOggi ? "evento-passato" : "evento-futuro";
      }

      const cella = creaCellaGiorno({
        numero: g,
        tipo: tipoCella,
        anno: annoVisualizzato,
        mese: meseVisualizzato,
        eventi: eventiCella,
        haEventi: haEventi,
      });
      frammento.appendChild(cella);
    }

    // 6. Genera giorni del mese successivo per completare la griglia
    const celleRimanenti =
      totCelle - (giornoInizioSettimana + totGiorniMeseCorrente);
    const annoMeseSucc = meseVisualizzato === 11 ? annoVisualizzato + 1 : annoVisualizzato;
    const meseSucc = meseVisualizzato === 11 ? 0 : meseVisualizzato + 1;

    for (let g = 1; g <= celleRimanenti; g++) {
      const dataChiave = formattaDataChiave(annoMeseSucc, meseSucc, g);
      const eventiCella = mappaEventi.get(dataChiave) || [];

      const cella = creaCellaGiorno({
        numero: g,
        tipo: "altro-mese",
        anno: annoMeseSucc,
        mese: meseSucc,
        eventi: eventiCella,
      });
      frammento.appendChild(cella);
    }

    // Sostituisce il contenuto della griglia
    elementoGriglia.innerHTML = "";
    elementoGriglia.appendChild(frammento);
  }

  /**
   * Crea un elemento DOM per una cella del calendario
   */
  function creaCellaGiorno({ numero, tipo, anno, mese, eventi, haEventi }) {
    const div = document.createElement("div");
    div.className = "calendario_cella";
    div.setAttribute("role", "gridcell");

    const nomeMese = NOMI_MESI[mese];
    div.setAttribute("aria-label", `${numero} ${nomeMese} ${anno}`);

    // Assegnazione classi ed elementi decorativi in base al tipo
    if (tipo === "altro-mese") {
      div.classList.add("calendario_cella--altro-mese");
    } else if (tipo === "oggi") {
      // Cella piena scura come giorno 9
      div.classList.add("calendario_cella--oggi");
      div.setAttribute("aria-current", "date");
    } else if (tipo === "evento-passato") {
      // Cerchio grigio come giorno 7
      div.classList.add("calendario_cella--evento-passato");
      const cerchio = document.createElement("span");
      cerchio.className = "decorazione_cerchio";
      cerchio.setAttribute("aria-hidden", "true");
      div.appendChild(cerchio);
    } else if (tipo === "evento-futuro") {
      // Cerchio scuro come giorno 24
      div.classList.add("calendario_cella--evento-futuro");
      const cerchio = document.createElement("span");
      cerchio.className = "decorazione_cerchio";
      cerchio.setAttribute("aria-hidden", "true");
      div.appendChild(cerchio);
    }

    // Se ci sono eventi associati a questa data
    if (eventi && eventi.length > 0) {
      div.classList.add("calendario_cella--con-evento");
      const titoli = eventi.map((e) => e.titolo || "Evento").join(" • ");
      div.title = `${titoli} (Clicca per dettagli)`;

      // Click per aprire l'anteprima
      div.addEventListener("click", () => {
        apriAnteprimaEventi(eventi, numero, mese, anno);
      });
    }

    // Numero del giorno
    const spanNumero = document.createElement("span");
    spanNumero.className = "numero_giorno";
    spanNumero.textContent = numero;
    div.appendChild(spanNumero);

    return div;
  }

  /**
   * Apre il popup anteprima con tutti gli eventi del giorno selezionato
   */
  function apriAnteprimaEventi(eventiGiorno, giorno, mese, anno) {
    if (!offuscamentoAnteprimaEvento || !contenutoAnteprimaEventi) {
      return;
    }

    contenutoAnteprimaEventi.innerHTML = "";

    eventiGiorno.forEach((evento) => {
      const card = document.createElement("div");
      card.className = "evento_anteprima_card";

      // Blocco data a sinistra
      const dataBox = document.createElement("div");
      dataBox.className = "evento_anteprima_data_box";

      const spanGiorno = document.createElement("span");
      spanGiorno.className = "evento_anteprima_giorno";
      spanGiorno.textContent = giorno;

      const spanMeseAnno = document.createElement("span");
      spanMeseAnno.className = "evento_anteprima_mese_anno";
      spanMeseAnno.textContent = `${NOMI_MESI[mese].toUpperCase()} ${anno}`;

      const badgeOrario = document.createElement("span");
      badgeOrario.className = "evento_anteprima_badge_orario";
      if (evento.tuttoIlGiorno) {
        badgeOrario.textContent = "Tutto il giorno";
      } else if (evento.oraInizio && evento.oraFine) {
        badgeOrario.textContent = `${evento.oraInizio} - ${evento.oraFine}`;
      } else if (evento.oraInizio) {
        badgeOrario.textContent = `Dalle ${evento.oraInizio}`;
      } else {
        badgeOrario.textContent = "Orario non spec.";
      }

      dataBox.appendChild(spanGiorno);
      dataBox.appendChild(spanMeseAnno);
      dataBox.appendChild(badgeOrario);

      // Blocco dettagli a destra
      const corpo = document.createElement("div");
      corpo.className = "evento_anteprima_corpo";

      if (evento.tag) {
        const badgeTipo = document.createElement("span");
        badgeTipo.className = "evento_anteprima_badge_tipo";
        badgeTipo.textContent = evento.tag;
        corpo.appendChild(badgeTipo);
      }

      const titolo = document.createElement("h2");
      titolo.className = "evento_anteprima_titolo";
      titolo.textContent = evento.titolo || "Senza titolo";

      const separatore = document.createElement("div");
      separatore.className = "evento_anteprima_separatore";

      const descrizione = document.createElement("div");
      descrizione.className = "evento_anteprima_descrizione";
      descrizione.textContent =
        evento.descrizione || "Nessuna descrizione disponibile.";

      corpo.appendChild(titolo);
      corpo.appendChild(separatore);
      corpo.appendChild(descrizione);

      card.appendChild(dataBox);
      card.appendChild(corpo);

      contenutoAnteprimaEventi.appendChild(card);
    });

    // Mostra popup con transizione fluida
    offuscamentoAnteprimaEvento.style.display = "flex";
    requestAnimationFrame(() => {
      offuscamentoAnteprimaEvento.classList.add("attivo");
      offuscamentoAnteprimaEvento.setAttribute("aria-hidden", "false");
      document.body.classList.add("anteprima_evento_aperta");
    });
  }

  /**
   * Chiude il popup anteprima
   */
  function chiudiAnteprimaEventi() {
    if (!offuscamentoAnteprimaEvento) {
      return;
    }

    offuscamentoAnteprimaEvento.classList.remove("attivo");
    offuscamentoAnteprimaEvento.setAttribute("aria-hidden", "true");
    document.body.classList.remove("anteprima_evento_aperta");

    setTimeout(() => {
      offuscamentoAnteprimaEvento.style.display = "none";
      if (contenutoAnteprimaEventi) {
        contenutoAnteprimaEventi.innerHTML = "";
      }
    }, 250);
  }

  // Chiusura con click sul pulsante "X"
  if (btnChiudiAnteprimaEvento) {
    btnChiudiAnteprimaEvento.addEventListener("click", chiudiAnteprimaEventi);
  }

  // Chiusura con click all'esterno (sull'overlay scuro)
  if (offuscamentoAnteprimaEvento) {
    offuscamentoAnteprimaEvento.addEventListener("click", (e) => {
      if (e.target === offuscamentoAnteprimaEvento) {
        chiudiAnteprimaEventi();
      }
    });
  }

  // Chiusura con tasto Esc
  window.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      offuscamentoAnteprimaEvento &&
      offuscamentoAnteprimaEvento.classList.contains("attivo")
    ) {
      chiudiAnteprimaEventi();
    }
  });

  /**
   * Naviga al mese precedente o successivo
   * @param {number} direzione -1 per mese precedente, +1 per mese successivo
   */
  function cambiaMese(direzione) {
    meseVisualizzato += direzione;

    if (meseVisualizzato < 0) {
      meseVisualizzato = 11;
      annoVisualizzato--;
    } else if (meseVisualizzato > 11) {
      meseVisualizzato = 0;
      annoVisualizzato++;
    }

    renderCalendario();
  }

  // Event listener pulsanti freccia
  if (btnMesePrecedente) {
    btnMesePrecedente.addEventListener("click", () => cambiaMese(-1));
  }

  if (btnMeseSuccessivo) {
    btnMeseSuccessivo.addEventListener("click", () => cambiaMese(1));
  }

  // Supporto per navigazione tramite tastiera (frecce sinistra/destra)
  window.addEventListener("keydown", (e) => {
    if (
      offuscamentoAnteprimaEvento &&
      offuscamentoAnteprimaEvento.classList.contains("attivo")
    ) {
      return;
    }

    if (
      document.activeElement &&
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      return;
    }

    if (e.key === "ArrowLeft") {
      cambiaMese(-1);
    } else if (e.key === "ArrowRight") {
      cambiaMese(1);
    }
  });

  // Rendering iniziale
  renderCalendario();

  // Caricamento eventi da Firestore
  caricaEventiDaFirestore();
});
