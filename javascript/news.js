import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

async function caricaNews() {
    try {
        const newsRef = collection(db, "news");

        const q = query(
            newsRef,
            where("pubblicata", "==", true),
            orderBy("data", "desc")
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