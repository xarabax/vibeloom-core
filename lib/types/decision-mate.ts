/**
 * Decision Mate - Definizioni dei Tipi
 * 
 * Struttura dati per il flusso decisionale:
 * Problema → Dati di Mercato → Contesto e Attori → Analisi → Verdetto
 */

// === STEP 1: INPUT PROBLEMA ===

export interface ProblemData {
    description: string
    createdAt: Date
}

// === STEP 2: DATI DI MERCATO ===

export type MarketDataSource = "upload" | "ai-generated"

export interface MarketData {
    /** Fonte dei dati: upload manuale o generato dall'AI */
    source: MarketDataSource
    
    /** File caricati dall'utente (se source === "upload") */
    files?: File[]
    
    /** Contenuto testuale estratto dai file */
    fileContents?: string[]
    
    /** Riassunto di mercato generato dall'AI (se source === "ai-generated") */
    aiSummary?: string
    
    /** Timestamp della generazione */
    generatedAt?: Date
}

// === STEP 3: CONTESTO E ATTORI ===

/** Modelli di business supportati */
export type BusinessModel = 
    | "SaaS"
    | "E-commerce"
    | "Service"
    | "Marketplace"
    | "Agency"
    | "Subscription"
    | "Freemium"
    | "Other"

/** Obiettivi primari (Stella Polare) */
export type PrimaryGoal = 
    | "profit"      // Massimizzare profitto
    | "growth"      // Massimizzare crescita
    | "retention"   // Massimizzare retention clienti
    | "speed"       // Velocità di esecuzione
    | "quality"     // Qualità del prodotto/servizio

/** Focus del PM */
export type PMFocus = "tech" | "business" | "balanced"

/** Stile decisionale del PM */
export type DecisionStyle = "data-driven" | "intuitive" | "collaborative"

/** Personalità del PM - influenza come l'AI genera raccomandazioni */
export interface PMPersonality {
    /** Tolleranza al rischio (1 = conservativo, 5 = aggressivo) */
    riskTolerance: 1 | 2 | 3 | 4 | 5
    
    /** Focus principale: tech vs business */
    focus: PMFocus
    
    /** Stile decisionale preferito */
    decisionStyle: DecisionStyle
}

/** Dati di contesto completi per Step 3 */
export interface ContextData {
    /** Target audience principale */
    targetAudience: string
    
    /** Lista degli stakeholder coinvolti */
    stakeholders: string[]
    
    /** Modello di business */
    businessModel: BusinessModel
    
    /** Obiettivo primario - la "Stella Polare" della decisione */
    primaryGoal: PrimaryGoal
    
    /** Vincoli e limitazioni (es: "Budget < 5k", "No external hiring") */
    constraints: string[]
    
    /** Personalità/stile del PM */
    pmPersonality: PMPersonality
}

// === STATO WIZARD ===

/** Step del wizard Decision Mate */
export type DecisionMateStep = 
    | "problem"     // Step 1: Input problema
    | "market"      // Step 2: Dati di mercato
    | "context"     // Step 3: Contesto e Attori
    | "analysis"    // Step 4: Analisi AI
    | "verdict"     // Step 5: Risultati

/** Stato completo del wizard */
export interface DecisionMateState {
    currentStep: DecisionMateStep
    problem: string
    marketData: MarketData | null
    contextData: ContextData | null
}

// === HELPER FUNCTIONS ===

/** Labels in italiano per gli Obiettivi Primari */
export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
    profit: "💰 Profitto",
    growth: "📈 Crescita",
    retention: "🔄 Retention",
    speed: "⚡ Velocità",
    quality: "✨ Qualità"
}

/** Labels in italiano per i Modelli di Business */
export const BUSINESS_MODEL_LABELS: Record<BusinessModel, string> = {
    SaaS: "SaaS (Software as a Service)",
    "E-commerce": "E-commerce",
    Service: "Servizi Professionali",
    Marketplace: "Marketplace/Piattaforma",
    Agency: "Agenzia/Consulenza",
    Subscription: "Abbonamento",
    Freemium: "Freemium",
    Other: "Altro"
}

/** Labels per la Tolleranza al Rischio */
export const RISK_TOLERANCE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: "Molto Conservativo",
    2: "Conservativo",
    3: "Bilanciato",
    4: "Aggressivo",
    5: "Molto Aggressivo"
}

/** Valida se i ContextData sono completi */
export function isContextDataComplete(data: Partial<ContextData>): data is ContextData {
    return !!(
        data.targetAudience?.trim() &&
        data.stakeholders && data.stakeholders.length > 0 &&
        data.businessModel &&
        data.primaryGoal &&
        data.pmPersonality
    )
}

/** Crea un oggetto ContextData vuoto con defaults */
export function createEmptyContextData(): Partial<ContextData> {
    return {
        targetAudience: "",
        stakeholders: [],
        businessModel: "SaaS",
        primaryGoal: "growth",
        constraints: [],
        pmPersonality: {
            riskTolerance: 3,
            focus: "balanced",
            decisionStyle: "data-driven"
        }
    }
}
