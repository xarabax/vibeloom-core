import jsPDF from "jspdf"
import html2canvas from "html2canvas"

/**
 * Genera un file PDF acquisendo un elemento DOM tramite ID.
 * Utilizza html2canvas per il rendering ad alta fedeltà e jsPDF per l'imballaggio A4.
 */
export async function generateExecutiveBoardPDF(elementId: string, filename: string = "VibeLoom-Verbale.pdf"): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
        console.error(`[PDF Service] Elemento con ID ${elementId} non trovato.`)
        return
    }

    try {
        // Forza l'elemento ad essere visibile per il rendering (se era hidden) ma fuori schermo
        const originalStyle = element.style.cssText
        element.style.position = 'absolute'
        element.style.left = '-9999px'
        element.style.top = '-9999px'
        element.style.display = 'block'
        
        const canvas = await html2canvas(element, {
            scale: 2, // Migliora la qualità dei testi
            useCORS: true,
            logging: false,
            backgroundColor: "#1c1917" // Dark mode base (stone-900)
        })

        // Ripristina lo stile originale
        element.style.cssText = originalStyle

        const imgData = canvas.toDataURL("image/jpeg", 1.0)
        
        // Formato A4
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        // Se il canvas è più lungo di una pagina A4, potremmo voler multi-pagina,
        // ma per il verbale esecutivo sintetico una singola pagina scalata/ottimizzata è spesso l'ideale
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight)
        pdf.save(filename)
    } catch (error) {
        console.error("[PDF Service] Errore durante la generazione:", error)
        throw new Error("Impossibile generare il PDF")
    }
}
