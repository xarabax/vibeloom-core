import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "")

const MAX_FREE_CALLS = 4;

const discoverySchema = {
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            title: { type: SchemaType.STRING, description: "Nome del caso d'uso specifico (es. Efficienza Acquisizione Clienti)" },
            area: { type: SchemaType.STRING, description: "Area aziendale (es. Difesa della Cassa, Ottimizzazione Ricavi)" },
            economic_impact: { type: SchemaType.STRING, description: "Stima economica dell'impatto o del recupero (es. -15.000 €/anno o +20% conversion rate)" },
            urgency: { type: SchemaType.STRING, description: "Bassa, Media o Alta" },
            urgency_rationale: { type: SchemaType.STRING, description: "Il motivo dell'urgenza es: 'Sanguinamento cassa attivo' o 'Ottimizzazione strutturale'" },
            tech_stack: { 
                type: SchemaType.ARRAY, 
                items: { type: SchemaType.STRING },
                description: "Lista di software necessari (es. HubSpot, n8n, API LLM)" 
            },
            workflow: { type: SchemaType.STRING, description: "Flusso operativo (es. Lead -> CRM -> API -> Report)" },
            estimated_time: { type: SchemaType.STRING, description: "Tempo stimato di implementazione (es. 2 settimane)" },
            why_it_matters: { type: SchemaType.STRING, description: "Breve spiegazione del problema risolto (1 riga max)" }
        },
        required: ["title", "area", "economic_impact", "urgency", "urgency_rationale", "tech_stack", "workflow", "estimated_time", "why_it_matters"]
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        
        const currentCalls = (user.privateMetadata.api_calls as number) || 0;
        const isPremium = user.privateMetadata.is_premium === true;
        
        // PAYWALL BLOCK
        if (!isPremium && currentCalls >= MAX_FREE_CALLS) {
            return NextResponse.json({ error: "PAYWALL_ACTIVE" }, { status: 403 })
        }

        const body = await req.json()
        const { text, fileText, fileName } = body

        if (!text && !fileText) {
            return NextResponse.json({ error: "Dati non forniti" }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "Sei l'AI Decision & Adoption Engine di VibeLoom. Il tuo obiettivo è analizzare il business dell'utente e generare ESATTAMENTE 3 diagnosi operativo-tecniche usando il formato JSON. Sii telegrafico, spietato e ultra-operativo.",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: discoverySchema as any
            }
        })

        const prompt = `Analizza l'operatività dell'utente ed estrai 3 diagnosi in stile "Decision Engine".
        
TESTO UTENTE:
${text || "Nessun testo esplicito."}

${fileName ? `DOCUMENTO ALLEGATO: ${fileName}` : ""}
${fileText ? `CONTENUTO DOCUMENTO ESTRATTO:\n${fileText.substring(0, 15000)}` : ""}

Obiettivo: Genera 3 priorità. Non dare spunti vaghi. Usa lo schema per indicare: Impatto Economico Reale (usa cifre), Urgenza, Stack Tecnologico Reale (nomi dei software SaaS, integrazioni custom), Workflow Operativo (con frecce \`->\`) e Tempi stimati. Questo non è un piano marketing, è una prescrizione tecnica.`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        let cleanText = responseText.trim()
        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.substring(7)
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.substring(3)
        }
        if (cleanText.endsWith("```")) {
            cleanText = cleanText.substring(0, cleanText.length - 3)
        }
        cleanText = cleanText.trim()

        const opportunities = JSON.parse(cleanText)
        // SCALA IL CREDITO SOLO SE NON E' PREMIUM
        if (!isPremium) {
            await client.users.updateUserMetadata(userId, {
                privateMetadata: {
                    api_calls: currentCalls + 1
                }
            });
        }

        return NextResponse.json({ opportunities })
        
    } catch (error: any) {
        console.error("[Discovery API] Errore critico:", error)
        
        // Risposta Mock di Fallback per prevenire crash totali
        const mockOpps = [
            {
                title: "Inefficienza nel processo di acquisizione clienti", area: "Difesa della Cassa",
                economic_impact: "-15.000 €/anno", urgency: "Alta", urgency_rationale: "Perdita immediata di lead caldi.",
                tech_stack: ["HubSpot (CRM)", "n8n (orchestrazione)", "API LLM (analisi)"],
                workflow: "Lead -> CRM -> trigger n8n -> API LLM -> Report Slack",
                estimated_time: "2 settimane", why_it_matters: "Lead persi e bassi tassi di conversione sui follow-up."
            },
            {
                title: "Caos nella riconciliazione delle fatture", area: "Difesa della Cassa",
                economic_impact: "Spreco di 20h/settimana", urgency: "Media", urgency_rationale: "Automazione strutturale, processo comunque funzionante.",
                tech_stack: ["Google Drive", "Make.com", "OCR API di Google"],
                workflow: "Fattura PDF -> Watcher Drive -> Make -> OCR -> ERP / Fogli Google",
                estimated_time: "1 settimana", why_it_matters: "Lavoro manuale ad altissimo tasso di errori umani."
            },
            {
                title: "Assistenza clienti dispersiva su WhatsApp/Email", area: "Ottimizzazione Ricavi",
                economic_impact: "-12% di ordini chiusi", urgency: "Alta", urgency_rationale: "Clienti abbandonati che passano alla concorrenza.",
                tech_stack: ["Voiceflow o Botpress", "WhatsApp API", "Knowledge Base RAG"],
                workflow: "Messaggio WA -> Botpress -> RAG Database aziendale -> Risposta WA -> Passaggio operatore",
                estimated_time: "3 settimane", why_it_matters: "Risposte lente che disincentivano le vendite immediate."
            }
        ]

        return NextResponse.json({ 
            error: "Impossibile generare le opportunità in tempo reale.", 
            debugInfo: error instanceof Error ? error.message : String(error),
            opportunities: mockOpps,
            mock: true 
        }, { status: 200 })
    }
}
