import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

async function caricaNews() {
  try {
    const newsRef = collection(db, "news");

    const q = query(
      newsRef,
      where("pubblicata", "==", true),
      orderBy("data", "desc"),
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (error) {
    console.error("Errore nel caricamento delle news:", error);
  }
}

caricaNews();

const notiziaPiccola = document.getElementById("notiziaPiccola");

const notiziaFocus = document.getElementById("notiziaFocus");

const pulsanteEsci = document.getElementById("pulsanteEsci");

const notizia = document.querySelector(".notizia");

const testoNotizia = document.getElementById("testoNotizia");

function aggiornaAltezzaNotizia() {
  const fineTesto = testoNotizia.offsetTop + testoNotizia.offsetHeight;

  notizia.style.height = `calc(${fineTesto}px + 2.60417vw)`;
}

window.addEventListener("load", function () {
  aggiornaAltezzaNotizia();
});

window.addEventListener("resize", function () {
  aggiornaAltezzaNotizia();
});

const osservatore = new ResizeObserver(function () {
  aggiornaAltezzaNotizia();
});

osservatore.observe(testoNotizia);

if (document.fonts) {
  document.fonts.ready.then(function () {
    aggiornaAltezzaNotizia();
  });
}

notiziaPiccola.addEventListener("click", function () {
  notiziaPiccola.classList.add("pressione");

  setTimeout(function () {
    notiziaPiccola.classList.remove("pressione");

    aggiornaAltezzaNotizia();

    notiziaFocus.scrollTop = 0;

    notiziaFocus.classList.add("aperta");

    document.body.classList.add("popup_aperto");
  }, 120);
});

pulsanteEsci.addEventListener("click", function (event) {
  event.stopPropagation();

  notiziaFocus.classList.remove("aperta");

  document.body.classList.remove("popup_aperto");
});
