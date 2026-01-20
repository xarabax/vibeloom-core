/**
 * VibeLoom PDF Export
 * 
 * Genera un report PDF dall'analisi strategica.
 * Usa html2canvas per catturare il DOM e jspdf per generare il PDF.
 * 
 * NOTA: Richiede le dipendenze:
 * npm install html2canvas jspdf
 */

import type { AnalysisResult } from "@/lib/ai/types"

// Tipi per le librerie (verranno caricate dinamicamente)
type Html2Canvas = typeof import("html2canvas").default
type JsPDF = typeof import("jspdf").jsPDF

/**
 * Esporta un elemento DOM come PDF
 * @param elementId - ID dell'elemento da catturare
 * @param filename - Nome del file PDF (senza estensione)
 */
export async function exportElementToPDF(
    elementId: string, 
    filename: string = "vibeloom-report"
): Promise<void> {
    try {
        // Carica librerie dinamicamente (code splitting)
        const [html2canvasModule, jspdfModule] = await Promise.all([
            import("html2canvas"),
            import("jspdf")
        ])

        const html2canvas = html2canvasModule.default
        const { jsPDF } = jspdfModule

        const element = document.getElementById(elementId)
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`)
        }

        // Cattura elemento come canvas
        const canvas = await html2canvas(element, {
            scale: 2,  // Alta risoluzione
            useCORS: true,
            backgroundColor: "#080808",  // Match background
            logging: false,
        })

        // Calcola dimensioni PDF
        const imgWidth = 210  // A4 width in mm
        const pageHeight = 297  // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight

        // Crea PDF
        const pdf = new jsPDF("p", "mm", "a4")
        let position = 0

        // Aggiungi immagine (multi-page se necessario)
        pdf.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight
        )
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            )
            heightLeft -= pageHeight
        }

        // Salva PDF
        pdf.save(`${filename}.pdf`)

    } catch (error) {
        console.error("[Export PDF] Error:", error)
        throw error
    }
}

/**
 * Genera PDF programmaticamente dai dati (senza cattura DOM)
 * Più controllo sul layout ma più complesso
 */
export async function generateAnalysisPDF(
    goal: string,
    result: AnalysisResult,
    filename: string = "vibeloom-analysis"
): Promise<void> {
    try {
        const { jsPDF } = await import("jspdf")
        
        const pdf = new jsPDF("p", "mm", "a4")
        const pageWidth = pdf.internal.pageSize.getWidth()
        const margin = 20
        let y = margin

        // === HEADER ===
        pdf.setFontSize(24)
        pdf.setTextColor(160, 82, 45)  // Accent color
        pdf.text("VibeLoom", margin, y)
        y += 8
        
        pdf.setFontSize(10)
        pdf.setTextColor(115, 115, 115)
        pdf.text("Strategic Decision Report", margin, y)
        y += 15

        // === GOAL ===
        pdf.setFontSize(12)
        pdf.setTextColor(229, 229, 229)
        pdf.text("GOAL", margin, y)
        y += 7
        
        pdf.setFontSize(14)
        pdf.setTextColor(255, 255, 255)
        const goalLines = pdf.splitTextToSize(goal, pageWidth - margin * 2)
        pdf.text(goalLines, margin, y)
        y += goalLines.length * 6 + 10

        // === RISK SCORE ===
        if (typeof result.riskScore === "number") {
            pdf.setFontSize(10)
            pdf.setTextColor(115, 115, 115)
            pdf.text("RISK SCORE", margin, y)
            y += 7

            // Colore basato sul rischio
            if (result.riskScore <= 25) pdf.setTextColor(34, 197, 94)
            else if (result.riskScore <= 50) pdf.setTextColor(234, 179, 8)
            else if (result.riskScore <= 75) pdf.setTextColor(249, 115, 22)
            else pdf.setTextColor(239, 68, 68)

            pdf.setFontSize(32)
            pdf.text(result.riskScore.toString(), margin, y)
            y += 15
        }

        // === STRATEGIC INSIGHT ===
        pdf.setFontSize(10)
        pdf.setTextColor(115, 115, 115)
        pdf.text("STRATEGIC INSIGHT", margin, y)
        y += 7

        pdf.setFontSize(11)
        pdf.setTextColor(229, 229, 229)
        const insightLines = pdf.splitTextToSize(result.strategicInsight, pageWidth - margin * 2)
        pdf.text(insightLines, margin, y)
        y += insightLines.length * 5 + 10

        // === KEY METRICS ===
        pdf.setFontSize(10)
        pdf.setTextColor(115, 115, 115)
        pdf.text("KEY METRICS", margin, y)
        y += 7

        pdf.setFontSize(11)
        pdf.setTextColor(229, 229, 229)
        pdf.text(`Growth Potential: ${result.keyMetrics.growthPotential}`, margin, y)
        y += 5
        pdf.text(`Optimal Window: ${result.keyMetrics.optimalWindow}`, margin, y)
        y += 5
        pdf.text(`Risk Level: ${result.keyMetrics.riskLevel}`, margin, y)
        y += 15

        // === ACTION SCENARIOS ===
        pdf.setFontSize(10)
        pdf.setTextColor(115, 115, 115)
        pdf.text("ACTION SCENARIOS", margin, y)
        y += 10

        for (const scenario of result.actionScenarios) {
            // Check if need new page
            if (y > 260) {
                pdf.addPage()
                y = margin
            }

            // Scenario header
            pdf.setFontSize(12)
            if (scenario.recommended) {
                pdf.setTextColor(160, 82, 45)
                pdf.text("★ RECOMMENDED", margin, y)
            } else {
                pdf.setTextColor(115, 115, 115)
                pdf.text("ALTERNATIVE", margin, y)
            }
            y += 6

            // Title
            pdf.setFontSize(14)
            pdf.setTextColor(255, 255, 255)
            pdf.text(scenario.title, margin, y)
            y += 7

            // Description
            pdf.setFontSize(10)
            pdf.setTextColor(200, 200, 200)
            const descLines = pdf.splitTextToSize(scenario.description, pageWidth - margin * 2)
            pdf.text(descLines, margin, y)
            y += descLines.length * 4 + 5

            // Meta
            pdf.setFontSize(9)
            pdf.setTextColor(115, 115, 115)
            pdf.text(`Timeline: ${scenario.timeline} | Investment: ${scenario.investment} | Return: ${scenario.returnPotential}`, margin, y)
            y += 12
        }

        // === BOTTOM LINE ===
        if (result.bottomLine) {
            if (y > 270) {
                pdf.addPage()
                y = margin
            }

            pdf.setFontSize(10)
            pdf.setTextColor(115, 115, 115)
            pdf.text("BOTTOM LINE", margin, y)
            y += 7

            pdf.setFontSize(12)
            pdf.setTextColor(160, 82, 45)
            const bottomLines = pdf.splitTextToSize(result.bottomLine, pageWidth - margin * 2)
            pdf.text(bottomLines, margin, y)
        }

        // === FOOTER ===
        const pageCount = pdf.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i)
            pdf.setFontSize(8)
            pdf.setTextColor(80, 80, 80)
            pdf.text(
                `Generated by VibeLoom | Page ${i} of ${pageCount} | ${new Date().toLocaleDateString()}`,
                margin,
                290
            )
        }

        // Salva
        pdf.save(`${filename}.pdf`)

    } catch (error) {
        console.error("[Generate PDF] Error:", error)
        throw error
    }
}

/**
 * Verifica se le dipendenze PDF sono disponibili
 */
export async function checkPDFDependencies(): Promise<boolean> {
    try {
        await import("jspdf")
        return true
    } catch {
        return false
    }
}
