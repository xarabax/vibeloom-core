import { NextResponse } from "next/server"
import { createAIProvider } from "@/lib/ai/factory"
import { rateLimit } from "@/lib/rate-limit"
import { analyzeRequestSchema, fileSchema } from "@/lib/validations/analyze"
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/cache"

// Timeout per la chiamata AI (60 secondi)
const AI_TIMEOUT_MS = 60000

/**
 * POST /api/analyze
 * 
 * Analizza documenti rispetto a un goal usando AI (Gemini/Claude).
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
        const goal = formData.get("goal") as string
        const files = formData.getAll("files") as File[]

        console.log(`[API] Analyze request - Goal: "${goal.slice(0, 50)}..." - Files: ${files.length}`)

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

        if (processedFiles.length === 0) {
            return NextResponse.json(
                { error: "At least one valid file is required" },
                { status: 400 }
            )
        }

        // === 5. CHECK CACHE ===
        const cachedResult = await getCachedAnalysis(goal, processedFiles)
        if (cachedResult) {
            console.log("[API] Returning cached result")
            return NextResponse.json({
                ...cachedResult,
                _cached: true  // Flag per debug (opzionale)
            })
        }

        // === 6. AI PROCESSING (con timeout) ===
        const provider = createAIProvider()

        // Crea promise con timeout
        const analysisPromise = provider.analyze(goal, processedFiles)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("AI analysis timed out after 60 seconds")), AI_TIMEOUT_MS)
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

        // === 7. SALVA IN CACHE ===
        await setCachedAnalysis(goal, processedFiles, result)

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

// Next.js 16+ usa route segment config
// Per file grandi, configurare in next.config.js o usare streaming
