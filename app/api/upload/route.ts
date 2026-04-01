import { NextRequest, NextResponse } from "next/server"
const pdfParse = require("pdf-parse")
import mammoth from "mammoth"
import * as xlsx from "xlsx"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        
        if (!file) {
            return NextResponse.json({ error: "Nessun file fornito" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        let extractedText = ""

        try {
            // PDF Parsing
            if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
                const data = await pdfParse(buffer)
                extractedText = data.text
            } 
            // Word (DOCX) Parsing
            else if (file.type.includes("wordprocessingml") || file.name.toLowerCase().endsWith(".docx")) {
                const data = await mammoth.extractRawText({ buffer })
                extractedText = data.value
            } 
            // Excel/CSV Parsing
            else if (file.name.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
                const workbook = xlsx.read(buffer, { type: "buffer" })
                extractedText = workbook.SheetNames.map(sheetName => {
                    const sheet = workbook.Sheets[sheetName]
                    return `[FOGLIO EXCEL: ${sheetName}]\n` + xlsx.utils.sheet_to_csv(sheet)
                }).join("\n\n")
            } 
            // Fallback Testo semplice
            else {
                extractedText = buffer.toString("utf-8")
            }
        } catch (parseError) {
            console.error("[Upload API] Parsing error:", parseError)
            return NextResponse.json({ error: "Il file è corrotto o il formato non è supportato dall'estrattore testuale." }, { status: 422 })
        }

        // Limitiamo la quantità di testo per non sforare i limiti dei token di base
        const MAX_CHARS = 100000 // Circa 25.000 tokens
        if (extractedText.length > MAX_CHARS) {
            extractedText = extractedText.substring(0, MAX_CHARS) + "\n\n[...TESTO TRONCATO PER LIMITE DI LETTURA...]"
        }

        return NextResponse.json({ 
            success: true, 
            filename: file.name,
            text: extractedText,
            preview: extractedText.substring(0, 200) + "..."
        })

    } catch (error) {
        console.error("[Upload API] Critical error:", error)
        return NextResponse.json({ error: "Errore interno durante il caricamento del documento." }, { status: 500 })
    }
}
