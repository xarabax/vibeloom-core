import { NextResponse } from "next/server"
import { createAIProvider } from "@/lib/ai/factory"
import { rateLimit } from "@/lib/rate-limit"
import { analyzeRequestSchema, fileSchema } from "@/lib/validations/analyze"
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/cache"
import type { ContextData } from "@/lib/types/decision-mate"

// Timeout per la chiamata AI (90 secondi - aumentato per analisi più complesse)
const AI_TIMEOUT_MS = 90000

/**
 * POST /api/analyze
 * 
 * Analizza documenti rispetto a un goal usando AI (Gemini/Claude).
 * Supporta: problema, market summary, context data, file uploads.
 * Implementa: rate limiting, validazione, caching, timeout.
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

        // === 2. PARSE FORMDATA ===
        const formData = await req.formData()
        
        // Step 1: Problema/Goal
        const goal = formData.get("goal") as string
        
        // Step 2: Market Summary (opzionale, da AI auto-generate)
        const marketSummary = formData.get("marketSummary") as string | null
        
        // Step 3: Context Data (opzionale, JSON serializzato)
        const contextDataRaw = formData.get("contextData") as string | null
        let contextData: ContextData | null = null
        if (contextDataRaw) {
            try {
                contextData = JSON.parse(contextDataRaw) as ContextData
            } catch (e) {
                console.warn("[API] Failed to parse contextData:", e)
            }
        }
        
        // Step 2: Files
        const files = formData.getAll("files") as File[]

        console.log(`[API] Analyze request:`)
        console.log(`  - Goal: "${goal.slice(0, 50)}..."`)
        console.log(`  - Market Summary: ${marketSummary ? 'Yes (' + marketSummary.length + ' chars)' : 'No'}`)
        console.log(`  - Context Data: ${contextData ? 'Yes' : 'No'}`)
        console.log(`  - Files: ${files.length}`)

        // === 3. VALIDAZIONE GOAL ===
        const goalValidation = analyzeRequestSchema.safeParse({ goal })
        if (!goalValidation.success) {
            return NextResponse.json(
                { error: `Invalid goal: ${goalValidation.error.errors[0].message}` },
                { status: 400 }
            )
        }

        // === 4. PROCESSA FILES ===
        const processedFiles: { content: string; mimeType: string }[] = []

        for (const file of files) {
            // Validazione file
            const fileValidation = fileSchema.safeParse({
                name: file.name,
                type: file.type,
                size: file.size
            })

            if (!fileValidation.success) {
                return NextResponse.json(
                    { error: `Invalid file "${file.name}": ${fileValidation.error.errors[0].message}` },
                    { status: 400 }
                )
            }

            // Estrai contenuto testuale
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            let textContent = ""

            // PDF
            if (file.type === "application/pdf") {
                try {
                    const pdf = require("pdf-parse")
                    const data = await pdf(buffer)
                    textContent = data.text
                    console.log(`[API] Parsed PDF: ${file.name} (${textContent.length} chars)`)
                } catch (e) {
                    console.error(`[API] PDF parse error for ${file.name}:`, e)
                    return NextResponse.json(
                        { error: `Failed to parse PDF: ${file.name}` },
                        { status: 500 }
                    )
                }
            }
            // DOCX
            else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                try {
                    const mammoth = require("mammoth")
                    const result = await mammoth.extractRawText({ buffer })
                    textContent = result.value
                    console.log(`[API] Parsed DOCX: ${file.name} (${textContent.length} chars)`)
                } catch (e) {
                    console.error(`[API] DOCX parse error for ${file.name}:`, e)
                    return NextResponse.json(
                        { error: `Failed to parse DOCX: ${file.name}` },
                        { status: 500 }
                    )
                }
            }
            // Excel / CSV
            else if (
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel" ||
                file.type === "text/csv"
            ) {
                try {
                    const XLSX = require("xlsx")
                    const workbook = XLSX.read(buffer, { type: "buffer" })
                    textContent = workbook.SheetNames
                        .map((sheetName: string) => {
                            const sheet = workbook.Sheets[sheetName]
                            return `[Sheet: ${sheetName}]\n${XLSX.utils.sheet_to_csv(sheet)}`
                        })
                        .join("\n\n")
                    console.log(`[API] Parsed Excel/CSV: ${file.name} (${textContent.length} chars)`)
                } catch (e) {
                    console.error(`[API] Excel/CSV parse error for ${file.name}:`, e)
                    return NextResponse.json(
                        { error: `Failed to parse Excel/CSV: ${file.name}` },
                        { status: 500 }
                    )
                }
            }
            // Plain text
            else {
                textContent = buffer.toString("utf-8")
                console.log(`[API] Read text file: ${file.name} (${textContent.length} chars)`)
            }

            processedFiles.push({
                content: textContent,
                mimeType: "text/plain"
            })
        }

        // === 5. AGGIUNGI MARKET SUMMARY COME "DOCUMENTO" ===
        if (marketSummary) {
            processedFiles.push({
                content: `[AI-Generated Market Analysis]\n\n${marketSummary}`,
                mimeType: "text/plain"
            })
            console.log(`[API] Added market summary as document`)
        }

        // Se non ci sono file E non c'è market summary, usa un documento placeholder
        if (processedFiles.length === 0) {
            processedFiles.push({
                content: "[No documents provided - Analysis based on goal and context only]",
                mimeType: "text/plain"
            })
            console.log(`[API] No files - using placeholder document`)
        }

        // === 6. COSTRUISCI CONTESTO ARRICCHITO ===
        const enrichedContext = buildEnrichedContext(contextData)
        const enrichedGoal = enrichedContext 
            ? `${goal}\n\n--- DECISION CONTEXT ---\n${enrichedContext}`
            : goal

        console.log(`[API] Enriched goal length: ${enrichedGoal.length} chars`)

        // === 7. CHECK CACHE ===
        const cachedResult = await getCachedAnalysis(enrichedGoal, processedFiles)
        if (cachedResult) {
            console.log("[API] Returning cached result")
            return NextResponse.json({
                ...cachedResult,
                _cached: true
            })
        }

        // === 8. AI PROCESSING (con timeout) ===
        const provider = createAIProvider()

        const analysisPromise = provider.analyze(enrichedGoal, processedFiles)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("AI analysis timed out after 90 seconds")), AI_TIMEOUT_MS)
        })

        let result
        try {
            result = await Promise.race([analysisPromise, timeoutPromise]) as Awaited<typeof analysisPromise>
        } catch (timeoutError) {
            console.error("[API] AI timeout:", timeoutError)
            return NextResponse.json(
                { error: "Analysis timed out. Please try with smaller documents or try again later." },
                { status: 504 }
            )
        }

        // === 9. SALVA IN CACHE ===
        await setCachedAnalysis(enrichedGoal, processedFiles, result)

        console.log(`[API] Analysis complete - Mock: ${result.isMock || false}`)

        return NextResponse.json(result)

    } catch (error) {
        console.error("[API] Unexpected error:", error)
        return NextResponse.json(
            { 
                error: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                details: process.env.NODE_ENV === "development" ? String(error) : undefined
            },
            { status: 500 }
        )
    }
}

/**
 * Costruisce un contesto arricchito dal ContextData
 * Questo viene aggiunto al goal per guidare l'AI
 */
function buildEnrichedContext(contextData: ContextData | null): string | null {
    if (!contextData) return null

    const lines: string[] = []

    // Primary Goal (Stella Polare)
    const goalLabels: Record<string, string> = {
        profit: "Maximize Profit",
        growth: "Maximize Growth",
        retention: "Customer Retention",
        speed: "Speed to Market",
        quality: "Product Quality"
    }
    lines.push(`🎯 PRIMARY OBJECTIVE (North Star): ${goalLabels[contextData.primaryGoal] || contextData.primaryGoal}`)
    lines.push(`   → ALL recommendations must align with this objective.`)
    lines.push("")

    // Business Model
    lines.push(`🏢 BUSINESS MODEL: ${contextData.businessModel}`)
    lines.push("")

    // Target Audience
    if (contextData.targetAudience) {
        lines.push(`👥 TARGET AUDIENCE: ${contextData.targetAudience}`)
        lines.push("")
    }

    // Stakeholders
    if (contextData.stakeholders.length > 0) {
        lines.push(`📋 KEY STAKEHOLDERS:`)
        contextData.stakeholders.forEach((s, i) => {
            lines.push(`   ${i + 1}. ${s}`)
        })
        lines.push(`   → Consider how each stakeholder might view this decision.`)
        lines.push("")
    }

    // Constraints (CRITICAL)
    if (contextData.constraints.length > 0) {
        lines.push(`⚠️ HARD CONSTRAINTS (Non-negotiable):`)
        contextData.constraints.forEach((c, i) => {
            lines.push(`   ${i + 1}. ${c}`)
        })
        lines.push(`   → Any scenario violating these constraints must be marked as NOT RECOMMENDED.`)
        lines.push("")
    }

    // PM Personality
    const riskLabels = ["Very Conservative", "Conservative", "Balanced", "Aggressive", "Very Aggressive"]
    const riskLabel = riskLabels[contextData.pmPersonality.riskTolerance - 1] || "Balanced"
    
    lines.push(`🧠 DECISION-MAKER PROFILE:`)
    lines.push(`   - Risk Tolerance: ${riskLabel} (${contextData.pmPersonality.riskTolerance}/5)`)
    lines.push(`   - Primary Focus: ${contextData.pmPersonality.focus}`)
    lines.push(`   - Decision Style: ${contextData.pmPersonality.decisionStyle}`)
    lines.push("")

    // Instructions based on risk tolerance
    if (contextData.pmPersonality.riskTolerance <= 2) {
        lines.push(`📌 NOTE: Decision-maker is CONSERVATIVE. Prioritize low-risk options. Highlight potential downsides clearly.`)
    } else if (contextData.pmPersonality.riskTolerance >= 4) {
        lines.push(`📌 NOTE: Decision-maker is AGGRESSIVE. Don't shy away from bold recommendations if justified by data.`)
    }

    return lines.join("\n")
}
