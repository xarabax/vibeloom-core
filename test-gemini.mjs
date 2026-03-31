// test-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Assumiamo che il file .env.local esista, parsiamolo alla buona
const envFile = fs.readFileSync(".env.local", "utf8");
let key = "";
const match = envFile.match(/(?:GOOGLE_GENAI_API_KEY|GEMINI_API_KEY)=(.+)/);
if (match) {
    key = match[1].trim();
}

if (!key) {
    console.error("No API key found in .env.local");
    process.exit(1);
}

const WIZARD_PROMPT = `Agisci come un team di consulenti senior (stile Deloitte / PwC) specializzati in trasformazione digitale, AI e ottimizzazione dei processi per PMI.

OBIETTIVO:
Non produrre un report lungo, ma costruire un’esperienza GUIDATA step-by-step, come un wizard interattivo, che accompagna l’utente nella creazione di un piano di digitalizzazione e introduzione dell’AI.

⚠️ REGOLA FONDAMENTALE:
Evita lunghi blocchi di testo. Rispondi sempre in modalità:
- step sequenziali
- domande guidate
- scelte multiple
- checklist operative
- output sintetici e azionabili

STILE RISPOSTA:
- sintetico, strutturato, orientato all’azione
IMPORTANTE: GUIDA TU LA CONVERSAZIONE CHIEDENDO I DATI NECESSARI UNO STEP ALLA VOLTA, NON RISPONDERE CON L'INTERO FLUSSO IN UNA SOLA VOLTA!`;

async function run() {
    console.log("Starting Gemini API test...");
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: WIZARD_PROMPT });

        const history = [
             {
                role: "user",
                parts: [{ text: "[Apertura Nuova Sessione VibeLoom]" }]
            }
        ];
        
        const chat = model.startChat({ history });

        const goalMsg = "**Obiettivo Tecnico:** Implementazione di [Digitalizzazione Pratiche NPO Specialistiche] nell'area [Automazione Processi].\\n\\nAzione richiesta: Istruiscimi step-by-step.";
        console.log("Sending message...");
        const result = await chat.sendMessage(goalMsg);
        const text = result.response.text();
        
        console.log("==== GEMINI RESPONSE ====");
        console.log(text);
        console.log("=========================");
    } catch (err) {
        console.error("GEMINI ERROR:", err);
    }
}

run();
