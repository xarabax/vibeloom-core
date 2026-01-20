import { NextResponse } from "next/server"
import { createAIProvider } from "@/lib/ai/factory"
import { rateLimit } from "@/lib/rate-limit"
import { analyzeRequestSchema, fileSchema } from "@/lib/validations/analyze"

export async function POST(req: Request) {
    try {
        // 1. Rate Limiting
        const ip = req.headers.get("x-forwarded-for") || "unknown"
        const limitParams = rateLimit(ip)

        if (limitParams && 'success' in limitParams && !limitParams.success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            )
        }

        // 2. Parse FormData
        const formData = await req.formData()

        const goal = formData.get("goal") as string
        const files = formData.getAll("files") as File[]

        // 3. Validation
        const goalValidation = analyzeRequestSchema.safeParse({ goal })
        if (!goalValidation.success) {
            return NextResponse.json({ error: "Invalid goal provided" }, { status: 400 })
        }

        const processedFiles: { content: string; mimeType: string }[] = []

        for (const file of files) {
            const fileValidation = fileSchema.safeParse({
                name: file.name,
                type: file.type,
                size: file.size
            })

            if (!fileValidation.success) {
                return NextResponse.json(
                    { error: `Invalid file: ${file.name}. ${fileValidation.error.errors[0].message}` },
                    { status: 400 }
                )
            }

            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            let textContent = ""

            if (file.type === "application/pdf") {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const pdf = require("pdf-parse")
                    const data = await pdf(buffer)
                    textContent = data.text
                } catch (e) {
                    console.error("PDF Parsing error:", e)
                    return NextResponse.json({ error: "Failed to parse PDF file" }, { status: 500 })
                }
            } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const mammoth = require("mammoth")
                    const result = await mammoth.extractRawText({ buffer: buffer })
                    textContent = result.value
                } catch (e) {
                    console.error("DOCX Parsing error:", e)
                    return NextResponse.json({ error: "Failed to parse DOCX file" }, { status: 500 })
                }
            } else if (
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel" ||
                file.type === "text/csv"
            ) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const XLSX = require("xlsx")
                    const workbook = XLSX.read(buffer, { type: 'buffer' })

                    // Extract text from all sheets
                    textContent = workbook.SheetNames.map((sheetName: string) => {
                        const sheet = workbook.Sheets[sheetName]
                        return `Sheet: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}`
                    }).join("\n\n")
                } catch (e) {
                    console.error("Excel/CSV Parsing error:", e)
                    return NextResponse.json({ error: "Failed to parse Excel/CSV file" }, { status: 500 })
                }
            } else {
                textContent = buffer.toString("utf-8")
            }

            processedFiles.push({
                content: textContent,
                mimeType: "text/plain"
            })
        }

        if (processedFiles.length === 0) {
            return NextResponse.json({ error: "At least one valid file is required" }, { status: 400 })
        }

        // 4. AI Processing (via Factory)
        const provider = createAIProvider()
        const result = await provider.analyze(goal, processedFiles)

        return NextResponse.json(result)

    } catch (error) {
        console.error("Analysis Error:", error)
        return NextResponse.json(
            { error: `Failed to process analysis request: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}
