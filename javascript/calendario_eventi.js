/**
 * Logica interattiva del Calendario Eventi - A.S.D. Judo Bagno a Ripoli
 *
 * Funzionalità:
 * - Visualizzazione dinamica di mese e anno corrente
 * - Navigazione con frecce sinistra (mese precedente) e destra (mese successivo)
 * - Allineamento settimane da Lunedì a Domenica
 * - Stili celle conformi al design Figma:
 *   - Celle normali del mese corrente (es. come il 3)
 *   - Giorni di altri mesi adiacenti (es. come il 31)
 *   - Giorno corrente / Oggi (es. come il 9, cella piena scura)
 *   - Eventi passati (es. come il 7, cerchio grigio)
 *   - Eventi futuri (es. come il 24, cerchio scuro)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementi DOM
  const elementoMeseAnno = document.getElementById('calendarioMeseAnno');
  const elementoGriglia = document.getElementById('calendarioGriglia');
  const btnMesePrecedente = document.getElementById('btnMesePrecedente');
  const btnMeseSuccessivo = document.getElementById('btnMeseSuccessivo');

  if (!elementoMeseAnno || !elementoGriglia) {
    return;
  }

  // Nomi dei mesi in italiano
  const NOMI_MESI = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre'
  ];

  // Data odierna reale
  const dataOggi = new Date();
  const oggiGiorno = dataOggi.getDate();
  const oggiMese = dataOggi.getMonth();
  const oggiAnno = dataOggi.getFullYear();

  // Stato di navigazione visualizzato (inizialmente mese ed anno correnti)
  let annoVisualizzato = oggiAnno;
  let meseVisualizzato = oggiMese;

  /**
   * Registro eventi del calendario (predisposto per future integrazioni Firestore/Pannello Amministratore).
   * Formato elementi: { data: 'YYYY-MM-DD', titolo: 'Nome evento', descrizione: '' }
   */
  let eventi = [];

  /**
   * Formatta una data in stringa 'YYYY-MM-DD'
   */
  function formattaDataChiave(anno, mese, giorno) {
    const mm = String(mese + 1).padStart(2, '0');
    const dd = String(giorno).padStart(2, '0');
    return `${anno}-${mm}-${dd}`;
  }

  /**
   * Genera e renderizza i giorni del calendario per il mese visualizzato
   */
  function renderCalendario() {
    // 1. Aggiorna l'intestazione mese e anno
    elementoMeseAnno.textContent = `${NOMI_MESI[meseVisualizzato]} ${annoVisualizzato}`;

    // 2. Calcoli giorni mese corrente e mese precedente
    const primoGiornoMese = new Date(annoVisualizzato, meseVisualizzato, 1);
    // Indice giorno della settimana (Lunedì = 0 ... Domenica = 6)
    const giornoInizioSettimana = (primoGiornoMese.getDay() + 6) % 7;

    const totGiorniMeseCorrente = new Date(
      annoVisualizzato,
      meseVisualizzato + 1,
      0
    ).getDate();
    const totGiorniMesePrecedente = new Date(
      annoVisualizzato,
      meseVisualizzato,
      0
    ).getDate();

    // 3. Determina se servono 5 o 6 righe per visualizzare tutte le settimane del mese
    const totGiorniDaMostrare = giornoInizioSettimana + totGiorniMeseCorrente;
    const totCelle = totGiorniDaMostrare > 35 ? 42 : 35;
    const numeroRighe = totCelle / 7;

    elementoGriglia.style.setProperty('--numero-righe', numeroRighe);

    // Mappa eventi per ricerca rapida O(1)
    const mappaEventi = new Map();
    eventi.forEach((ev) => {
      if (ev && ev.data) {
        mappaEventi.set(ev.data, ev);
      }
    });

    const frammento = document.createDocumentFragment();

    // 4. Genera giorni del mese precedente
    for (let i = giornoInizioSettimana - 1; i >= 0; i--) {
      const giornoNum = totGiorniMesePrecedente - i;
      const cella = creaCellaGiorno({
        numero: giornoNum,
        tipo: 'altro-mese',
        anno: meseVisualizzato === 0 ? annoVisualizzato - 1 : annoVisualizzato,
        mese: meseVisualizzato === 0 ? 11 : meseVisualizzato - 1
      });
      frammento.appendChild(cella);
    }

    // Data odierna normalizzata a mezzanotte per confronto eventi passati/futuri
    const mezzanotteOggi = new Date(oggiAnno, oggiMese, oggiGiorno).getTime();

    // 5. Genera giorni del mese corrente
    for (let g = 1; g <= totGiorniMeseCorrente; g++) {
      const isOggi =
        annoVisualizzato === oggiAnno &&
        meseVisualizzato === oggiMese &&
        g === oggiGiorno;

      const dataChiave = formattaDataChiave(annoVisualizzato, meseVisualizzato, g);
      const eventoAssociato = mappaEventi.get(dataChiave);

      let tipoCella = 'normale';
      if (isOggi) {
        tipoCella = 'oggi';
      } else if (eventoAssociato) {
        const dataCella = new Date(
          annoVisualizzato,
          meseVisualizzato,
          g
        ).getTime();
        tipoCella = dataCella < mezzanotteOggi ? 'evento-passato' : 'evento-futuro';
      }

      const cella = creaCellaGiorno({
        numero: g,
        tipo: tipoCella,
        anno: annoVisualizzato,
        mese: meseVisualizzato,
        evento: eventoAssociato
      });
      frammento.appendChild(cella);
    }

    // 6. Genera giorni del mese successivo per completare la griglia
    const celleRimanenti = totCelle - (giornoInizioSettimana + totGiorniMeseCorrente);
    for (let g = 1; g <= celleRimanenti; g++) {
      const cella = creaCellaGiorno({
        numero: g,
        tipo: 'altro-mese',
        anno: meseVisualizzato === 11 ? annoVisualizzato + 1 : annoVisualizzato,
        mese: meseVisualizzato === 11 ? 0 : meseVisualizzato + 1
      });
      frammento.appendChild(cella);
    }

    // Sostituisce il contenuto della griglia
    elementoGriglia.innerHTML = '';
    elementoGriglia.appendChild(frammento);
  }

  /**
   * Crea un elemento DOM per una cella del calendario
   */
  function creaCellaGiorno({ numero, tipo, anno, mese, evento }) {
    const div = document.createElement('div');
    div.className = 'calendario_cella';
    div.setAttribute('role', 'gridcell');

    const nomeMese = NOMI_MESI[mese];
    div.setAttribute('aria-label', `${numero} ${nomeMese} ${anno}`);

    // Assegnazione classi ed elementi decorativi in base al tipo
    if (tipo === 'altro-mese') {
      div.classList.add('calendario_cella--altro-mese');
    } else if (tipo === 'oggi') {
      // Cella piena scura come giorno 9
      div.classList.add('calendario_cella--oggi');
      div.setAttribute('aria-current', 'date');
    } else if (tipo === 'evento-passato') {
      // Cerchio grigio come giorno 7
      div.classList.add('calendario_cella--evento-passato');
      const cerchio = document.createElement('span');
      cerchio.className = 'decorazione_cerchio';
      cerchio.setAttribute('aria-hidden', 'true');
      div.appendChild(cerchio);
    } else if (tipo === 'evento-futuro') {
      // Cerchio scuro come giorno 24
      div.classList.add('calendario_cella--evento-futuro');
      const cerchio = document.createElement('span');
      cerchio.className = 'decorazione_cerchio';
      cerchio.setAttribute('aria-hidden', 'true');
      div.appendChild(cerchio);
    }

    // Informazioni per tooltip o accessibilità se presente evento
    if (evento && evento.titolo) {
      div.title = evento.titolo;
    }

    // Numero del giorno
    const spanNumero = document.createElement('span');
    spanNumero.className = 'numero_giorno';
    spanNumero.textContent = numero;
    div.appendChild(spanNumero);

    return div;
  }

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
    btnMesePrecedente.addEventListener('click', () => cambiaMese(-1));
  }

  if (btnMeseSuccessivo) {
    btnMeseSuccessivo.addEventListener('click', () => cambiaMese(1));
  }

  // Supporto opzionale per navigazione tramite tastiera (frecce sinistra/destra)
  window.addEventListener('keydown', (e) => {
    // Naviga solo se il focus è sui pulsanti o non è in un campo input
    if (
      document.activeElement &&
      ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
    ) {
      return;
    }

    if (e.key === 'ArrowLeft') {
      cambiaMese(-1);
    } else if (e.key === 'ArrowRight') {
      cambiaMese(1);
    }
  });

  /**
   * API globale per impostare eventi dinamici (utile per future connessioni a Firebase/Firestore)
   */
  window.impostaEventiCalendario = function (nuoviEventi) {
    if (Array.isArray(nuoviEventi)) {
      eventi = nuoviEventi;
      renderCalendario();
    }
  };

  // Rendering iniziale
  renderCalendario();
});
