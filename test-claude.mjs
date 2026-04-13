// test-claude.mjs
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

// Assumiamo che il file .env.local esista, parsiamolo alla buona
const envFile = fs.readFileSync(".env.local", "utf8");
let key = "";
const match = envFile.match(/ANTHROPIC_API_KEY=(.+)/);
if (match) {
    key = match[1].split(' ')[0].trim(); // Extra cleanup for robustness
}

if (!key) {
    console.error("No ANTHROPIC_API_KEY found in .env.local");
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
    console.log("Starting Claude API test...");
    try {
        const client = new Anthropic({ apiKey: key });
        
        console.log("Sending message to Claude (3.5 Sonnet)...");
        const message = await client.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            system: WIZARD_PROMPT,
            messages: [
                {
                    role: "user",
                    content: "Implementazione di [Digitalizzazione Pratiche NPO Specialistiche] nell'area [Automazione Processi].\n\nAzione richiesta: Istruiscimi step-by-step."
                }
            ],
        });

        console.log("==== CLAUDE RESPONSE ====");
        if (message.content[0].type === 'text') {
            console.log(message.content[0].text);
        } else {
            console.log(JSON.stringify(message.content, null, 2));
        }
        console.log("=========================");
    } catch (err) {
        console.error("CLAUDE ERROR:", err);
    }
}

run();
