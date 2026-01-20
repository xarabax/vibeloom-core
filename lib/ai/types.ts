/**
 * VibeLoom AI Types
 * 
 * Definizioni TypeScript per l'output dell'analisi strategica AI.
 */

// === NODI DEL FLOWCHART ===

export type NodeType = "origin" | "document" | "convergence" | "scenario"

export interface FlowchartNode {
    id: string
    type: NodeType
    label: string
    description?: string
    sourceRef?: string          // Riferimento al documento sorgente (es. "p.5")
    recommended?: boolean       // Solo per type: "scenario"
    riskLevel?: "Low" | "Medium" | "High"  // Solo per type: "scenario"
}

export interface FlowchartConnection {
    from: string
    to: string
}

// === FATTORI DI RISCHIO ===

export interface RiskFactor {
    factor: string
    severity: "Low" | "Medium" | "High" | "Critical"
    mitigation: string
}

// === SCENARI D'AZIONE ===

export interface ActionScenario {
    title: string
    description: string
    timeline: string
    investment: "Low" | "Moderate" | "High"
    risk: string
    returnPotential: string
    recommended: boolean
    keyActions?: string[]       // Azioni concrete con owner/deadline
    dealBreakers?: string[]     // Condizioni che invaliderebbero lo scenario
}

// === RIFERIMENTI AI DOCUMENTI SORGENTE ===

export interface SourceReference {
    documentName: string
    keyFindings: string[]
    pageReferences?: string[]
    reliability: "High" | "Medium" | "Low"
    notes?: string
}

// === KEY METRICS ===

export interface KeyMetrics {
    growthPotential: string
    optimalWindow: string
    riskLevel: "Low" | "Medium" | "High"
    investmentRequired?: string         // Stima investimento
    probabilityOfSuccess?: string       // Probabilità successo
}

// === RISULTATO ANALISI COMPLETO ===

export interface AnalysisResult {
    // Core insight
    strategicInsight: string
    
    // Risk assessment (0-100)
    riskScore?: number
    riskFactors?: RiskFactor[]
    
    // Metrics chiave
    keyMetrics: KeyMetrics
    
    // Flowchart data (per rendering dinamico)
    nodes?: FlowchartNode[]
    connections?: FlowchartConnection[]
    
    // Scenari d'azione
    actionScenarios: ActionScenario[]
    
    // Trust Layer - riferimenti ai documenti
    sourceReferences?: SourceReference[]
    
    // Analisi critica
    blindSpots?: string[]       // Informazioni mancanti
    bottomLine?: string         // Verdetto finale in una frase
    
    // Flag per dati simulati
    isMock?: boolean
}

// === AI ADAPTER INTERFACE ===

export interface AIAdapter {
    analyze(
        goal: string, 
        files: { content: string; mimeType: string }[]
    ): Promise<AnalysisResult>
}

// === HELPER TYPES ===

/**
 * Calcola il colore del risk score
 */
export function getRiskScoreColor(score: number): string {
    if (score <= 25) return "text-green-500"
    if (score <= 50) return "text-yellow-500"
    if (score <= 75) return "text-orange-500"
    return "text-red-500"
}

/**
 * Calcola il label del risk score
 */
export function getRiskScoreLabel(score: number): string {
    if (score <= 25) return "Low Risk"
    if (score <= 50) return "Moderate Risk"
    if (score <= 75) return "High Risk"
    return "Critical Risk"
}
