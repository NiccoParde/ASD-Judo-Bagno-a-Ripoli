export default {
    async fetch(request, env) {

        const url = new URL(request.url);

        // ==================================================
        // CORS
        // ==================================================

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers":
                        "Content-Type, Authorization",
                },
            });
        }

        // ==================================================
        // LOGIN
        // ==================================================

        if (url.pathname === "/login") {

            if (request.method !== "POST") {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Metodo non consentito",
                    },
                    405,
                );
            }

            if (
                !env.ADMIN_USERNAME ||
                !env.ADMIN_PASSWORD ||
                !env.FIREBASE_CLIENT_EMAIL ||
                !env.FIREBASE_PRIVATE_KEY
            ) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Configurazione autenticazione incompleta",
                    },
                    500,
                );
            }

            let body;

            try {
                body = await request.json();
            } catch {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "JSON non valido",
                    },
                    400,
                );
            }

            const username =
                typeof body?.username === "string"
                    ? body.username.trim()
                    : "";

            const password =
                typeof body?.password === "string"
                    ? body.password
                    : "";

            if (!username || !password) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Inserisci nome utente e password",
                    },
                    400,
                );
            }

            if (
                username !== env.ADMIN_USERNAME ||
                password !== env.ADMIN_PASSWORD
            ) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Nome utente o password non corretti",
                    },
                    401,
                );
            }

            try {

                const token = await creaCustomToken(
                    "admin",
                    env.FIREBASE_CLIENT_EMAIL,
                    env.FIREBASE_PRIVATE_KEY,
                );

                return rispostaJSON(
                    {
                        ok: true,
                        token,
                    },
                    200,
                    {
                        "Cache-Control": "no-store",
                    },
                );

            } catch (error) {

                console.error(
                    "Errore creazione token Firebase:",
                    error,
                );

                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Errore interno del server",
                    },
                    500,
                );
            }
        }

        // ==================================================
        // CANCELLAZIONE IMAGEKIT
        // ==================================================

        if (url.pathname === "/imagekit/delete") {

            if (request.method !== "POST") {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Metodo non consentito",
                    },
                    405,
                );
            }

            if (!env.IMAGEKIT_PRIVATE_KEY) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore:
                            "IMAGEKIT_PRIVATE_KEY non configurata",
                    },
                    500,
                );
            }

            const projectId =
                typeof env.FIREBASE_PROJECT_ID === "string" && env.FIREBASE_PROJECT_ID.trim()
                    ? env.FIREBASE_PROJECT_ID.trim()
                    : "asd-judo-bagno-a-ripoli";

            // ----------------------------------------------
            // AUTORIZZAZIONE FIREBASE
            // ----------------------------------------------

            const authorization =
                request.headers.get("Authorization") || "";

            if (!authorization.startsWith("Bearer ")) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Autenticazione richiesta.",
                    },
                    401,
                );
            }

            const idToken =
                authorization.substring("Bearer ".length).trim();

            if (!idToken) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Token Firebase mancante.",
                    },
                    401,
                );
            }

            try {

                const tokenVerificato =
                    await verificaFirebaseIdToken(
                        idToken,
                        projectId,
                    );

                // Il nostro account amministratore
                // viene creato con UID "admin".
                if (tokenVerificato.uid !== "admin") {
                    return rispostaJSON(
                        {
                            ok: false,
                            errore: "Utente non autorizzato.",
                        },
                        403,
                    );
                }

            } catch (error) {

                console.error(
                    "Errore verifica token Firebase:",
                    error,
                );

                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Autenticazione non valida: " + (error.message || "token non valido."),
                    },
                    401,
                );
            }

            // ----------------------------------------------
            // BODY
            // ----------------------------------------------

            let body;

            try {
                body = await request.json();
            } catch {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "JSON non valido.",
                    },
                    400,
                );
            }

            // ----------------------------------------------
            // CANCELLAZIONE SOTTOCARTELLA
            // ----------------------------------------------

            const folderPath =
                typeof body?.folderPath === "string"
                    ? body.folderPath.trim()
                    : "";

            if (folderPath) {
                const folderPathPulito = folderPath.replace(/\/+$/, "");

                // Sicurezza: permettiamo solo la cancellazione di sottocartelle dentro /news/
                if (!folderPathPulito.startsWith("/news/") || folderPathPulito === "/news") {
                    return rispostaJSON(
                        {
                            ok: false,
                            errore: "Percorso cartella non valido o non consentito.",
                        },
                        400,
                    );
                }

                try {
                    const autenticazione = btoa(`${env.IMAGEKIT_PRIVATE_KEY}:`);

                    const rispostaImageKit = await fetch(
                        "https://api.imagekit.io/v1/folder/",
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Basic ${autenticazione}`,
                                "Accept": "application/json",
                            },
                            body: JSON.stringify({
                                folderPath: folderPathPulito,
                            }),
                        },
                    );

                    if (rispostaImageKit.status === 204 || rispostaImageKit.status === 200) {
                        return rispostaJSON(
                            {
                                ok: true,
                                folderPath: folderPathPulito,
                            },
                            200,
                        );
                    }

                    if (rispostaImageKit.status === 404) {
                        return rispostaJSON(
                            {
                                ok: true,
                                folderPath: folderPathPulito,
                                nonTrovata: true,
                            },
                            200,
                        );
                    }

                    const testoRisposta = await rispostaImageKit.text();
                    let datiImageKit = {};
                    try {
                        datiImageKit = testoRisposta ? JSON.parse(testoRisposta) : {};
                    } catch {
                        datiImageKit = {};
                    }

                    return rispostaJSON(
                        {
                            ok: false,
                            errore:
                                datiImageKit.message ||
                                datiImageKit.error ||
                                "ImageKit non ha potuto eliminare la cartella.",
                        },
                        rispostaImageKit.status || 500,
                    );
                } catch (error) {
                    console.error("Errore chiamata API ImageKit per cartella:", error);
                    return rispostaJSON(
                        {
                            ok: false,
                            errore: "Errore durante la cancellazione della cartella su ImageKit.",
                        },
                        500,
                    );
                }
            }

            let fileIds = [];

            if (typeof body?.fileId === "string") {
                fileIds = [body.fileId.trim()];
            }

            if (Array.isArray(body?.fileIds)) {
                fileIds = body.fileIds
                    .filter(
                        (fileId) =>
                            typeof fileId === "string",
                    )
                    .map((fileId) => fileId.trim());
            }

            fileIds = [
                ...new Set(
                    fileIds.filter((fileId) => fileId.length > 0),
                ),
            ];

            if (fileIds.length === 0) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore: "Nessun fileId specificato.",
                    },
                    400,
                );
            }

            if (fileIds.length > 100) {
                return rispostaJSON(
                    {
                        ok: false,
                        errore:
                            "È possibile eliminare massimo 100 immagini alla volta.",
                    },
                    400,
                );
            }

            // ----------------------------------------------
            // CHIAMATA IMAGEKIT
            // ----------------------------------------------

            try {

                const autenticazione =
                    btoa(
                        `${env.IMAGEKIT_PRIVATE_KEY}:`,
                    );

                const rispostaImageKit = await fetch(
                    "https://api.imagekit.io/v1/files/batch/deleteByFileIds",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Basic ${autenticazione}`,

                            "Accept":
                                "application/json",
                        },

                        body: JSON.stringify({
                            fileIds,
                        }),
                    },
                );

                const testoRisposta =
                    await rispostaImageKit.text();

                let datiImageKit = {};

                try {
                    datiImageKit =
                        testoRisposta
                            ? JSON.parse(testoRisposta)
                            : {};
                } catch {
                    datiImageKit = {};
                }

                if (!rispostaImageKit.ok) {

                    console.error(
                        "Errore ImageKit cancellazione:",
                        rispostaImageKit.status,
                        datiImageKit,
                    );

                    return rispostaJSON(
                        {
                            ok: false,
                            errore:
                                datiImageKit.message ||
                                datiImageKit.error ||
                                "ImageKit non ha potuto eliminare il file.",
                        },
                        rispostaImageKit.status || 500,
                    );
                }

                return rispostaJSON(
                    {
                        ok: true,
                        fileIds,
                    },
                    200,
                );

            } catch (error) {

                console.error(
                    "Errore chiamata API ImageKit:",
                    error,
                );

                return rispostaJSON(
                    {
                        ok: false,
                        errore:
                            "Errore durante la cancellazione su ImageKit.",
                    },
                    500,
                );
            }
        }

        // ==================================================
        // AUTENTICAZIONE IMAGEKIT
        // ==================================================

        if (request.method !== "GET") {
            return rispostaJSON(
                {
                    errore: "Metodo non consentito",
                },
                405,
            );
        }

        if (!env.IMAGEKIT_PRIVATE_KEY) {
            return rispostaJSON(
                {
                    errore:
                        "IMAGEKIT_PRIVATE_KEY non configurata",
                },
                500,
            );
        }

        if (!env.IMAGEKIT_PUBLIC_KEY) {
            return rispostaJSON(
                {
                    errore:
                        "IMAGEKIT_PUBLIC_KEY non configurata",
                },
                500,
            );
        }

        const token = crypto.randomUUID();

        const expire =
            Math.floor(Date.now() / 1000) +
            30 * 60;

        const stringaDaFirmare =
            token + expire;

        const encoder =
            new TextEncoder();

        const chiave =
            await crypto.subtle.importKey(
                "raw",
                encoder.encode(
                    env.IMAGEKIT_PRIVATE_KEY,
                ),
                {
                    name: "HMAC",
                    hash: "SHA-1",
                },
                false,
                ["sign"],
            );

        const firma =
            await crypto.subtle.sign(
                "HMAC",
                chiave,
                encoder.encode(
                    stringaDaFirmare,
                ),
            );

        const bytes =
            new Uint8Array(firma);

        const signature =
            Array.from(bytes)
                .map((byte) =>
                    byte
                        .toString(16)
                        .padStart(2, "0"),
                )
                .join("");

        return rispostaJSON(
            {
                token,
                expire,
                signature,
                publicKey:
                    env.IMAGEKIT_PUBLIC_KEY,
            },
            200,
            {
                "Cache-Control":
                    "no-store",
            },
        );
    },
};


// ======================================================
// RISPOSTA JSON
// ======================================================

function rispostaJSON(
    dati,
    status = 200,
    headersExtra = {},
) {

    return new Response(
        JSON.stringify(dati),
        {
            status,

            headers: {
                "Content-Type":
                    "application/json",

                "Access-Control-Allow-Origin":
                    "*",

                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization",

                ...headersExtra,
            },
        },
    );
}


// ======================================================
// BASE64 URL
// ======================================================

function base64UrlEncode(value) {

    let bytes;

    if (value instanceof Uint8Array) {
        bytes = value;
    } else {
        bytes =
            new TextEncoder().encode(value);
    }

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}


// ======================================================
// BASE64 URL DECODE
// ======================================================

function base64UrlDecode(value) {

    let base64 =
        value
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    while (base64.length % 4 !== 0) {
        base64 += "=";
    }

    const binary =
        atob(base64);

    const bytes =
        new Uint8Array(
            binary.length,
        );

    for (
        let i = 0;
        i < binary.length;
        i++
    ) {
        bytes[i] =
            binary.charCodeAt(i);
    }

    return bytes;
}


// ======================================================
// IMPORTA PRIVATE KEY FIREBASE
// ======================================================

async function importaPrivateKey(
    privateKeyPem,
) {

    const pem =
        privateKeyPem.replace(
            /\\n/g,
            "\n",
        );

    const base64 =
        pem
            .replace(
                "-----BEGIN PRIVATE KEY-----",
                "",
            )
            .replace(
                "-----END PRIVATE KEY-----",
                "",
            )
            .replace(
                /\s/g,
                "",
            );

    const binary =
        atob(base64);

    const bytes =
        new Uint8Array(
            binary.length,
        );

    for (
        let i = 0;
        i < binary.length;
        i++
    ) {
        bytes[i] =
            binary.charCodeAt(i);
    }

    return crypto.subtle.importKey(
        "pkcs8",
        bytes.buffer,
        {
            name:
                "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        false,
        ["sign"],
    );
}


// ======================================================
// CREA CUSTOM TOKEN FIREBASE
// ======================================================

async function creaCustomToken(
    uid,
    clientEmail,
    privateKeyPem,
) {

    const ora =
        Math.floor(
            Date.now() / 1000,
        );

    const header = {
        alg: "RS256",
        typ: "JWT",
    };

    const payload = {
        iss: clientEmail,

        sub: clientEmail,

        aud:
            "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",

        iat: ora,

        exp: ora + 3600,

        uid: uid,

        admin: true,
    };

    const encodedHeader =
        base64UrlEncode(
            JSON.stringify(header),
        );

    const encodedPayload =
        base64UrlEncode(
            JSON.stringify(payload),
        );

    const unsignedToken =
        `${encodedHeader}.${encodedPayload}`;

    const privateKey =
        await importaPrivateKey(
            privateKeyPem,
        );

    const signature =
        await crypto.subtle.sign(
            {
                name:
                    "RSASSA-PKCS1-v1_5",
            },
            privateKey,
            new TextEncoder().encode(
                unsignedToken,
            ),
        );

    const encodedSignature =
        base64UrlEncode(
            new Uint8Array(signature),
        );

    return `${unsignedToken}.${encodedSignature}`;
}


// ======================================================
// VERIFICA FIREBASE ID TOKEN (TRAMITE GOOGLE JWKS)
// ======================================================

let firebaseJwkCache = null;
let firebaseJwkCacheScadenza = 0;

async function ottieniFirebaseJwks() {
    const ora = Date.now();

    if (firebaseJwkCache && ora < firebaseJwkCacheScadenza) {
        return firebaseJwkCache;
    }

    const risposta = await fetch(
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
        {
            cf: {
                cacheTtl: 3600,
                cacheEverything: true,
            },
        },
    );

    if (!risposta.ok) {
        throw new Error("Impossibile recuperare i certificati JWK di Firebase.");
    }

    const dati = await risposta.json();
    const keys = Array.isArray(dati?.keys) ? dati.keys : [];

    const cacheControl = risposta.headers.get("Cache-Control") || "";
    const match = cacheControl.match(/max-age=(\d+)/);
    const maxAge = match ? Number(match[1]) * 1000 : 3600000;

    firebaseJwkCache = keys;
    firebaseJwkCacheScadenza = ora + maxAge;

    return keys;
}

async function verificaFirebaseIdToken(idToken, projectId) {
    const targetProjectId = (projectId || "asd-judo-bagno-a-ripoli").trim();

    const parti = idToken.split(".");
    if (parti.length !== 3) {
        throw new Error("JWT non valido.");
    }

    let header;
    let payload;

    try {
        header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parti[0])));
        payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parti[1])));
    } catch {
        throw new Error("Impossibile decodificare il token JWT.");
    }

    if (header.alg !== "RS256" || !header.kid) {
        throw new Error("Header JWT non valido.");
    }

    const ora = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp <= ora) {
        throw new Error("Token Firebase scaduto.");
    }

    if (!payload.iat || payload.iat > ora + 300) {
        throw new Error("Token Firebase non ancora valido.");
    }

    if (payload.aud !== targetProjectId) {
        throw new Error(`Audience Firebase non valida: atteso ${targetProjectId}, ricevuto ${payload.aud}`);
    }

    if (payload.iss !== `https://securetoken.google.com/${targetProjectId}`) {
        throw new Error("Issuer Firebase non valido.");
    }

    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
        throw new Error("UID Firebase non valido.");
    }

    let keys = await ottieniFirebaseJwks();
    let jwkKey = keys.find((k) => k.kid === header.kid);

    if (!jwkKey) {
        firebaseJwkCache = null;
        firebaseJwkCacheScadenza = 0;
        keys = await ottieniFirebaseJwks();
        jwkKey = keys.find((k) => k.kid === header.kid);

        if (!jwkKey) {
            throw new Error("Chiave pubblica Firebase non trovata.");
        }
    }

    const publicKey = await crypto.subtle.importKey(
        "jwk",
        jwkKey,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        false,
        ["verify"],
    );

    const firma = base64UrlDecode(parti[2]);
    const datiDaVerificare = new TextEncoder().encode(`${parti[0]}.${parti[1]}`);

    const valido = await crypto.subtle.verify(
        {
            name: "RSASSA-PKCS1-v1_5",
        },
        publicKey,
        firma,
        datiDaVerificare,
    );

    if (!valido) {
        throw new Error("Firma del token Firebase non valida.");
    }

    return {
        uid: payload.sub,
        payload,
    };
}