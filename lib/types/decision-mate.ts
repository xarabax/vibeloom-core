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

/** Dati di contesto per Step 3 (campi opzionali tranne pmPersonality) */
export interface ContextData {
    /** Target audience principale (opzionale) */
    targetAudience?: string
    
    /** Lista degli stakeholder coinvolti (opzionale) */
    stakeholders?: string[]
    
    /** Modello di business (opzionale, default: SaaS) */
    businessModel?: BusinessModel
    
    /** Obiettivo primario - la "Stella Polare" della decisione (opzionale) */
    primaryGoal?: PrimaryGoal
    
    /** Vincoli e limitazioni (opzionale) */
    constraints?: string[]
    
    /** Personalità/stile del PM (richiesto) */
    pmPersonality: PMPersonality
}

// === STEP 4: ADVISOR SELECTION (Assemblaggio del Board) ===

/** ID degli advisor disponibili */
export type AdvisorId = "sniper" | "vc" | "guardian" | "mentor"

/** Configurazione completa di un Advisor */
export interface AdvisorConfig {
    id: AdvisorId
    title: string           // Nome distintivo (es. "The Sniper")
    role: string            // Ruolo funzionale (es. "Efficienza Radicale")
    description: string     // Descrizione in prima persona - voce dell'advisor
    iconName: string        // Nome icona Lucide React
    colorClasses: string    // Classi Tailwind per sfondo, bordo, testo
    badge: string           // Badge che identifica il focus anti-bias
}

/** Dati di output dello step Advisor Selection */
export interface BrainstormData {
    /** Advisor selezionati (1-3) */
    selectedAdvisors: AdvisorId[]
    
    /** Domanda specifica che l'utente vuole esplorare (opzionale) */
    focusQuestion?: string
}

// Alias per retrocompatibilità
export type AIRole = AdvisorId

/**
 * ADVISORS - Il Board di esperti AI
 * 
 * Testi studiati per ridurre i bias cognitivi (metodo Girardiano).
 * Ogni advisor parla in prima persona per creare connessione emotiva.
 */
export const ADVISORS: AdvisorConfig[] = [
    {
        id: "sniper",
        title: "Sniper",
        role: "Efficienza",
        description: "Odio la complessità. Il mio compito è tagliare tutto ciò che non è essenziale per l'MVP. Se non serve a fatturare subito, per me è no.",
        iconName: "Crosshair",
        colorClasses: "bg-stone-800 border-stone-600 text-stone-100",
        badge: "Anti-Overengineering"
    },
    {
        id: "vc",
        title: "VC",
        role: "Scalabilità",
        description: "Cerco l'Unicorno. Se la tua idea è copiabile o ha margini bassi, la distruggerò. Voglio vedere il vantaggio sleale (Moat) e il x100.",
        iconName: "TrendingUp",
        colorClasses: "bg-emerald-950 border-emerald-800 text-emerald-100",
        badge: "Anti-Commodity"
    },
    {
        id: "guardian",
        title: "Guardian",
        role: "Rischio & Compliance",
        description: "Vedo problemi ovunque. Faccio il pre-mortem del tuo progetto: GDPR, sicurezza, costi nascosti e lock-in. Ti salvo dal disastro.",
        iconName: "ShieldAlert",
        colorClasses: "bg-blue-950 border-blue-900 text-blue-100",
        badge: "Anti-Optimism"
    },
    {
        id: "mentor",
        title: "Mentor",
        role: "Visione Strategica",
        description: "Guardo il quadro d'insieme. Bilancio le critiche feroci degli altri per trovare la strada sostenibile a lungo termine.",
        iconName: "Scale",
        colorClasses: "bg-purple-950 border-purple-900 text-purple-100",
        badge: "Sintesi"
    }
]

/** Helper per ottenere un advisor per ID */
export function getAdvisorById(id: AdvisorId): AdvisorConfig | undefined {
    return ADVISORS.find(a => a.id === id)
}

/** Mappa advisor ID -> Agent Role per il backend */
export const ADVISOR_TO_AGENT_ROLE: Record<AdvisorId, string> = {
    sniper: "The Sniper",
    vc: "The VC Analyst",
    guardian: "The Guardian",
    mentor: "The Mentor"
}

// === SELEZIONE SCENARI ===

/** ID degli scenari predefiniti */
export type ScenarioChoice = "A" | "B" | "C"

/** Scenario custom definito dall'utente */
export interface CustomScenarioChoice {
    /** ID univoco (generato) */
    id: string
    /** Nome dello scenario */
    title: string
    /** Descrizione breve */
    description: string
    /** Advisor sponsor (opzionale) */
    advisorId?: AdvisorId
}

/** Selezione scenario: predefinito o custom */
export type SelectedScenario = 
    | { type: "preset"; id: ScenarioChoice }
    | { type: "custom"; custom: CustomScenarioChoice }

/** Dati di output dalla selezione scenari */
export interface ScenarioSelectionData {
    /** Scenari selezionati per l'esplorazione */
    selectedScenarios: SelectedScenario[]
}

// === STATO WIZARD ===

/** Step del wizard Decision Mate (Versione 2.0) */
export type DecisionMateStep = 
    | "lobby"              // Nuova Home: Audit vs Custom
    | "board-assembly"     // Scelta agenti visiva
    | "session"            // Chat room & upload
    | "flowchart"          // Mappa visiva scenari
    | "execution"          // Generazione verdetto e asset

/** Stato completo del wizard */
export interface DecisionMateState {
    currentStep: DecisionMateStep
    problem: string
    marketData: MarketData | null
    contextData: ContextData | null
    brainstormData: BrainstormData | null
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

/** Valida se i ContextData sono sufficienti per procedere (campi opzionali) */
export function isContextDataComplete(data: Partial<ContextData>): data is ContextData {
    // Solo pmPersonality è richiesto per garantire che lo stile decisionale sia definito
    // Gli altri campi sono opzionali ma verranno usati se presenti
    return !!(
        data.pmPersonality &&
        data.pmPersonality.riskTolerance &&
        data.pmPersonality.focus &&
        data.pmPersonality.decisionStyle
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
