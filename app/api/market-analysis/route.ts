import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { rateLimit } from "@/lib/rate-limit"

/**
 * POST /api/market-analysis
 * 
 * Genera un'analisi di mercato rapida basata sul problema/obiettivo dell'utente.
 * Usa Gemini per fare una ricerca di contesto.
 */
export async function POST(req: Request) {
    try {
        // === 1. RATE LIMITING ===
        const ip = req.headers.get("x-forwarded-for") || "unknown"
        const limitResult = rateLimit(ip)

        if (limitResult && "success" in limitResult && !limitResult.success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            )
        }

        // === 2. PARSE BODY ===
        const body = await req.json()
        const { problem } = body

        if (!problem || typeof problem !== "string" || problem.length < 10) {
            return NextResponse.json(
                { error: "Invalid problem statement. Minimum 10 characters required." },
                { status: 400 }
            )
        }

        // === 3. CHECK API KEY ===
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY
        
        if (!apiKey) {
            // Mock response se non c'è API key
            console.log("[Market Analysis] No API key - returning mock summary")
            return NextResponse.json({
                summary: `[MOCK] Market Analysis for: "${problem.slice(0, 50)}..."\n\n` +
                    "This is a simulated market analysis. Key findings would include:\n" +
                    "• Market size and growth trends\n" +
                    "• Key competitors and their positioning\n" +
                    "• Target customer segments\n" +
                    "• Potential risks and opportunities\n\n" +
                    "To get real AI-powered analysis, please configure your GOOGLE_GENAI_API_KEY.",
                isMock: true
            })
        }

        // === 4. GENERATE MARKET ANALYSIS ===
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7
            }
        })

        const prompt = `You are a strategic market analyst. Based on the following problem/objective, provide a concise market context summary.

PROBLEM/OBJECTIVE:
${problem}

Provide a brief (max 300 words) market analysis covering:
1. **Market Overview**: Size, growth rate, key trends
2. **Competitive Landscape**: Main players and their positioning  
3. **Target Segments**: Who are the ideal customers
4. **Key Risks**: Main challenges and threats
5. **Opportunities**: Potential advantages and openings

Be specific and actionable. Use bullet points where appropriate.
If you don't have specific data, make educated estimates based on industry knowledge.

Output in plain text format, no markdown headers.`

        console.log("[Market Analysis] Generating analysis for:", problem.slice(0, 50) + "...")

        const result = await model.generateContent(prompt)
        const summary = result.response.text()

        console.log("[Market Analysis] Generated summary:", summary.slice(0, 100) + "...")

        return NextResponse.json({
            summary,
            isMock: false
        })

    } catch (error) {
        console.error("[Market Analysis] Error:", error)
        
        // Fallback mock in caso di errore
        return NextResponse.json({
            summary: "Unable to generate market analysis at this time. Please upload your own market data or try again later.",
            isMock: true,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}
