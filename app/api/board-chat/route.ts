import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { AUDIT_PROMPTS } from "@/lib/ai/prompts/audit-presets"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { rateLimit } from "@/lib/rate-limit"

const MAX_FREE_CALLS = 4;
export const maxDuration = 60;
export const preferredRegion = 'iad1'; // Force US execution to avoid EU 403 blocks on GCP Free Tier

interface ChatMessage {
    sender: "user" | "model" | "system"
    text: string
}

export async function POST(req: NextRequest) {
    // === RATE LIMITING ===
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const limitResult = rateLimit(ip)
    if (limitResult && "success" in limitResult && !limitResult.success) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

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
            }, { status: 503 })
        }

        const genAI = new GoogleGenerativeAI(key)

        // Costruzione del System Prompt
        let systemInstruction = `Sei un Board of AI Advisors altamente tecnico (CTO, Automation Engineers, AI Solution Architects).\nObiettivo della sessione utente: ${goal}\n\n`

        const langRule = language === 'en' ? "ALWAYS respond in English." : "Rispondi SEMPRE in italiano."

        if (presetType === "marketing") {
            systemInstruction += AUDIT_PROMPTS.marketing
            systemInstruction += `\nRegole d'oro: ${langRule} Genera sempre un PIANO OPERATIVO CHIARO a step (Fase 1, Fase 2, Fase 3...). Sii didattico.`
        } else if (presetType === "tech") {
            systemInstruction += AUDIT_PROMPTS.tech
            systemInstruction += `\nRegole d'oro: ${langRule} Genera sempre un PIANO OPERATIVO CHIARO a step (Fase 1, Fase 2, Fase 3...). Sii didattico.`
        } else if (presetType === "finance") {
            systemInstruction += AUDIT_PROMPTS.finance
            systemInstruction += `\nRegole d'oro: ${langRule} Genera sempre un PIANO OPERATIVO CHIARO a step (Fase 1, Fase 2, Fase 3...). Sii didattico.`
        } else {
            systemInstruction += AUDIT_PROMPTS.wizard
            systemInstruction += `\nRegole d'oro: ${langRule}`
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        })

        // Trasformazione storico messaggi nel formato Gemini
        // Filtriamo i messaggi di sistema dalla UI che romperebbero la validazione "user"/"model"
        const filteredMessages = (messages as ChatMessage[]).filter((m) => m.sender !== "system")

        if (filteredMessages.length === 0) {
            return NextResponse.json({ text: "Pronto ad ascoltare." })
        }

        const formattedHistory = filteredMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
        }))

        // Rimuoviamo l'ultimo per usarlo come input attivo
        const lastMessage = formattedHistory.pop()

        // FIX Gemini API: l'history non può iniziare con "model".
        if (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
            formattedHistory.unshift({
                role: "user",
                parts: [{ text: "[Apertura Nuova Sessione VibeLoom]" }]
            })
        }

        const chat = model.startChat({ history: formattedHistory })
        const result = await chat.sendMessage(lastMessage!.parts[0].text)
        const responseText = result.response.text()

        if (!responseText) {
            throw new Error("Gemini ha restituito un body vuoto o bloccato dai filtri.")
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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Impossibile contattare l'advisor."
        console.error("[Board Chat API] Errore:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
