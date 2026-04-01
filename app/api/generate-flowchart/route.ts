import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { NextResponse } from "next/server"

export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "")

const scenarioSchema = {
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            id: { type: SchemaType.STRING, description: "A unique short id (e.g. s1, s2, s3)" },
            type: { type: SchemaType.STRING, description: "Conservativo, Bilanciato, o Aggressivo" },
            title: { type: SchemaType.STRING, description: "Un titolo neuromarketing accattivante e breve (max 5 parole)" },
            description: { type: SchemaType.STRING, description: "Descrizione sintetica (2 righe) della strategia, evidenziando il beneficio principale." },
            riskLevel: { type: SchemaType.STRING, description: "Basso, Medio, o Alto" },
            investment: { type: SchemaType.STRING, description: "Stima di costo o effort: Basso, Medio, o Alto" },
            timeline: { type: SchemaType.STRING, description: "Stima temporale: es. 1 Settimana, 1 Mese, 3 Mesi" }
        },
        required: ["id", "type", "title", "description", "riskLevel", "investment", "timeline"]
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { messages, goal } = body

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messaggi non forniti" }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "Sei il Master Strategist del Board. Il tuo compito è leggere la trascrizione della riunione e sintetizzare ESATTAMENTE 3 scenari strategici azionabili (Conservativo, Bilanciato, Aggressivo).",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: scenarioSchema as any
            }
        })

        // Format history into a single structured transcript for the AI
        let transcript = `Obiettivo Focus: ${goal || "Non specificato"}\n\nTRASCRIZIONE DEL BOARD:\n---\n`
        for (const msg of messages) {
            if (msg.sender !== "system") {
                transcript += `[${msg.sender.toUpperCase()}]: ${msg.text}\n`
            }
        }
        transcript += `\n---\nBase sui dati emersi in questa discussione, elabora i 3 scenari finali da presentare al CEO.`

        const result = await model.generateContent(transcript)
        const responseText = result.response.text()
        
        const scenarios = JSON.parse(responseText)
        
        return NextResponse.json({ scenarios })
        
    } catch (error: any) {
        console.error("[Flowchart API] Errore critico:", error)
        
        // Risposta Mock di Fallback per prevenire crash totali
        const mockScenarios = [
            {
                id: "mock1", type: "Conservativo", title: "Difesa del Core Business",
                description: "Minimizza i rischi e ottimizza i flussi esistenti prima di esplorare nuove tecnologie.",
                riskLevel: "Basso", investment: "Basso", timeline: "Rapida"
            },
            {
                id: "mock2", type: "Bilanciato", title: "Automazione Ibrida Progressiva",
                description: "Introduzione graduale dell'AI in reparti chiave per testarne l'efficacia senza sconvolgere l'azienda.",
                riskLevel: "Medio", investment: "Medio", timeline: "3 Mesi"
            },
            {
                id: "mock3", type: "Aggressivo", title: "Disruption e Acquisizione Mercato",
                description: "Investimento massivo in nuovi asset per bruciare la concorrenza sul tempo.",
                riskLevel: "Alto", investment: "Alto", timeline: "6-12 Mesi"
            }
        ]

        return NextResponse.json({ 
            error: "Impossibile generare gli scenari in tempo reale.", 
            scenarios: mockScenarios,
            mock: true 
        }, { status: 200 }) // Status 200 per far comunque proseguire la UI con i mock
    }
}
