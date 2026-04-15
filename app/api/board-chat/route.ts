import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { AUDIT_PROMPTS } from "@/lib/ai/prompts/audit-presets"
import { auth, clerkClient } from "@clerk/nextjs/server"

const MAX_FREE_CALLS = 4;

export async function POST(req: NextRequest) {
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
        const { messages, goal, presetType, language } = body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Nessun messaggio fornito" }, { status: 400 })
        }

        const key = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
        if (!key) {
            return NextResponse.json({ 
                error: "API Key mancante", 
                mock: true, 
                text: "⚠️ Nessuna chiave API configurata per Gemini. [MOCK] Certo, procediamo con questa strategia. Continua a fornirmi dettagli." 
            }, { status: 200 })
        }

        const genAI = new GoogleGenerativeAI(key)

        // Costruzione del System Prompt
        let systemInstruction = `Sei un Board of AI Advisors altamente tecnico (CTO, Automation Engineers, AI Solution Architects).\nObiettivo della sessione utente: ${goal}\n\n`
        
        const langRule = language === 'en' ? "ALWAYS respond in English." : "Rispondi SEMPRE in italiano."

        if (presetType === "marketing") {
            systemInstruction += AUDIT_PROMPTS.marketing
            systemInstruction += `\nRegole d'oro: ${langRule} Genera sempre un PIANO OPERATIVO CHIARO a step (Fase 1, Fase 2, Fase 3...). Sii didattico.`
        }
        else if (presetType === "tech") {
            systemInstruction += AUDIT_PROMPTS.tech
            systemInstruction += `\nRegole d'oro: ${langRule} Genera sempre un PIANO OPERATIVO CHIARO a step (Fase 1, Fase 2, Fase 3...). Sii didattico.`
        }
        else if (presetType === "finance") {
            systemInstruction += AUDIT_PROMPTS.finance
            systemInstruction += `\nRegole d'oro: ${langRule} Genera sempre un PIANO OPERATIVO CHIARO a step (Fase 1, Fase 2, Fase 3...). Sii didattico.`
        }
        else {
            systemInstruction += AUDIT_PROMPTS.wizard
            systemInstruction += `\nRegole d'oro: ${langRule}`
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: systemInstruction 
        })

        // Trasformazione dello storico messaggi nel formato Gemini
        // Eliminiamo eventuali messaggi di sistema finti dalla UI che potrebbero rompere la validazione "user"/"model"
        const filteredMessages = messages.filter((m: any) => m.sender !== "system")
        
        if (filteredMessages.length === 0) {
             return NextResponse.json({ text: "Pronto ad ascoltare." })
        }

        const formattedHistory = filteredMessages.map((m: any) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
        }))

        // Rimuoviamo l'ultimo per usarlo come input attivo
        const lastMessage = formattedHistory.pop()

        // FIX Gemini API: L'history non può iniziare con "model".
        // Dato che l'app saluta l'utente (model), dobbiamo pre-iniettare un finto messaggio "user".
        if (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
            formattedHistory.unshift({
                role: "user",
                parts: [{ text: "[Apertura Nuova Sessione VibeLoom]" }]
            })
        }

        const chat = model.startChat({
            history: formattedHistory
        })

        const result = await chat.sendMessage(lastMessage.parts[0].text)
        
        console.log("=== GEMINI RAW RESULT ===");
        console.dir(result.response, { depth: null });
        console.log("=========================");

        const responseText = result.response.text()

        if (!responseText) {
             throw new Error("Gemini ha restituito un Body di solo formato o bloccato dai filtri.")
        }

        // SCALA IL CREDITO SOLO SE NON PREMIUM
        if (!isPremium) {
            await client.users.updateUserMetadata(userId, {
                privateMetadata: {
                    api_calls: currentCalls + 1
                }
            });
        }

        return NextResponse.json({ text: responseText })

    } catch (error: any) {
        console.error("[Board Chat API] Errore:", error)
        return NextResponse.json({ error: error.message || "Impossibile contattare l'advisor." }, { status: 500 })
    }
}
