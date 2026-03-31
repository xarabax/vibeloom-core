/**
 * Struttura standard di un Blueprint compatibile con architetture di automazione
 * o system integrators.
 */
export interface BlueprintSchema {
    vibeloom_version: string
    generated_at: string
    project_goal: string
    recommended_tools: string[]
    triggers: {
        id: string
        app: string
        event: string
    }[]
    actions: {
        id: string
        step_order: number
        app: string
        action: string
        payload_structure: Record<string, string>
    }[]
    ai_generated_copy?: {
        email_sequences?: string[]
        ad_copy?: string[]
    }
}

/**
 * Genera un file JSON scaricabile dal browser contenente il Blueprint Esecutivo.
 */
export function downloadBlueprintJSON(data: BlueprintSchema, filename: string = "vibeloom-automation-blueprint.json") {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    
    // Creazione dinamica link per il download
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    
    // Simulazione click e pulizia
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
