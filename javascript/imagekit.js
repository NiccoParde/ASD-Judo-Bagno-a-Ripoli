// ======================================================
// CONFIGURAZIONE IMAGEKIT
// ======================================================

const IMAGEKIT_PUBLIC_KEY = "public_XGdQD6vo7Mo9P0AsfeKrHkJoXh8=";

const IMAGEKIT_AUTHENTICATION_ENDPOINT =
  "https://imagekit-auth.judobagnoaripoli.workers.dev";

// ======================================================
// OTTIENI PARAMETRI AUTENTICAZIONE
// ======================================================

async function ottieniAutenticazioneImageKit() {
  const risposta = await fetch(IMAGEKIT_AUTHENTICATION_ENDPOINT);

  if (!risposta.ok) {
    throw new Error("Impossibile ottenere l'autenticazione ImageKit.");
  }

  const dati = await risposta.json();

  if (!dati.token || !dati.signature || !dati.expire) {
    throw new Error("Risposta ImageKit non valida.");
  }

  return dati;
}

async function testImageKit() {
  try {
    const autenticazione = await ottieniAutenticazioneImageKit();

    console.log("Autenticazione ImageKit:", autenticazione);
  } catch (errore) {
    console.error("Errore ImageKit:", errore);
  }
}

testImageKit();
