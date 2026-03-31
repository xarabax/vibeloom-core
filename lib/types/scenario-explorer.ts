/**
 * Scenario Explorer - Tipi e Strutture Dati
 * 
 * Sistema di navigazione strategica basato su dati strutturati (Decision-Grade Data).
 * Permette di confrontare scenari alternativi con metriche precise.
 * 
 * Concetti chiave:
 * - TimelineStep: Singola azione in una timeline (può essere un bivio)
 * - StepBranch: Diramazione da un bivio
 * - Scenario: Una strada completa (predefinita o custom)
 * - CustomScenario: Scenario definito dall'utente
 * - StrategyState: Stato globale con pesi e snapshot
 */

import type { AdvisorId } from "./decision-mate"

// ============================================================================
// ENUMS E TIPI BASE
// ============================================================================

/**
 * Livello di evidenza a supporto di una decisione
 * - Low: Intuizione, nessun dato
 * - Medium: Alcuni dati, benchmark di settore
 * - High: Dati propri, test validati
 */
export type EvidenceLevel = "Low" | "Medium" | "High"

/**
 * Reversibilità della decisione (Framework Bezos)
 * - Type 2 (High): Porta a due vie, possiamo tornare indietro
 * - Type 1 (Low): Porta a una via, decisione irreversibile
 */
export type Reversibility = "High (Type 2)" | "Low (Type 1)"

/**
 * Fase temporale dello step
 */
export type TimelinePhase = "Immediate" | "Short-term" | "Long-term"

/**
 * ID degli scenari predefiniti
 */
export type ScenarioId = "A" | "B" | "C"

/**
 * ID scenario (può essere predefinito o custom)
 */
export type AnyScenarioId = ScenarioId | `custom-${string}`

// ============================================================================
// TIMELINE STEP - Il cuore del sistema
// ============================================================================

/**
 * Singolo step nella timeline di uno scenario.
 * Contiene metadati decisionali precisi per confronto e analisi.
 */
export interface TimelineStep {
    /** ID univoco dello step */
    id: string
    
    /** Fase temporale */
    phase: TimelinePhase
    
    /** Titolo breve dell'azione */
    action: string
    
    /** Descrizione dettagliata (visibile quando espanso) */
    description?: string
    
    // === CAMPI DECISION-GRADE ===
    
    /**
     * Assunzioni chiave su cui si basa questo step.
     * Es: ["CAC < 50€", "Conversion > 2%", "Team disponibile"]
     */
    assumptions: string[]
    
    /**
     * Rischi specifici di questo step.
     * Es: ["Compliance GDPR", "Cashflow negativo", "Competitor reaction"]
     */
    risks: string[]
    
    /**
     * Livello di evidenza a supporto.
     * Quanto siamo sicuri che funzionerà?
     */
    evidence_level: EvidenceLevel
    
    /**
     * Reversibilità: possiamo tornare indietro?
     * Type 2 = reversibile, Type 1 = irreversibile
     */
    reversibility: Reversibility
    
    /**
     * Tempo per avere un segnale chiaro.
     * Es: "2 weeks", "1 month", "3 months"
     */
    time_to_signal: string
    
    // === UI & NAVIGATION ===
    
    /**
     * Se true, questo è un "Decision Node" (bivio).
     * Richiede una scelta esplicita prima di procedere.
     */
    is_checkpoint: boolean
    
    /**
     * Costo stimato di questo step.
     * Es: "€5k-10k", "€0", "€50k+"
     */
    cost_estimate?: string
    
    /**
     * Effort richiesto.
     */
    effort?: "low" | "medium" | "high"
    
    /**
     * Dipendenze: quali step devono completarsi prima.
     */
    depends_on?: string[]
    
    // === BIVIO / DIRAMAZIONI ===
    
    /**
     * Se true, questo step è un bivio con diramazioni.
     */
    is_fork?: boolean
    
    /**
     * Diramazioni possibili (solo se is_fork = true).
     * Max 3 branch per step.
     */
    branches?: StepBranch[]
}

// ============================================================================
// STEP BRANCH - Diramazione da un bivio
// ============================================================================

/**
 * Una diramazione da un bivio decisionale.
 * Rappresenta un percorso alternativo con i suoi step.
 */
export interface StepBranch {
    /** ID univoco del branch */
    id: string
    
    /** Condizione che attiva questo branch */
    condition: string  // Es: "Se funziona", "Se fallisce", "Se il budget aumenta"
    
    /** Probabilità stimata (0-100) */
    probability?: number
    
    /** Step che seguono in questo branch */
    steps: TimelineStep[]
    
    /** Pro di questo percorso (definiti dall'utente) */
    user_pros?: string[]
    
    /** Contro di questo percorso (definiti dall'utente) */
    user_cons?: string[]
}

// ============================================================================
// SCENARIO - Una delle 3 strade
// ============================================================================

/**
 * Outcome finale dello scenario.
 */
export interface ScenarioOutcome {
    /** Titolo dell'outcome */
    title: string
    
    /** Probabilità stimata (0-100) */
    probability: number
    
    /** Best case scenario */
    upside: string
    
    /** Worst case scenario */
    downside: string
}

/**
 * Uno scenario alternativo.
 * Rappresenta una "strada" completa con tutti i suoi step.
 */
export interface Scenario {
    /** ID univoco: A, B, C o custom-xxx */
    id: ScenarioId | string
    
    /** Quale advisor propone/sponsorizza questo scenario (opzionale per custom) */
    advisor_sponsor_id?: AdvisorId
    
    /** Se true, è uno scenario creato dall'utente */
    is_custom?: boolean
    
    /** Titolo dello scenario */
    title: string
    
    /** Sottotitolo/filosofia */
    subtitle: string
    
    /** Descrizione estesa */
    description: string
    
    /** Colore tema (Tailwind classes) */
    color_classes: {
        bg: string
        border: string
        text: string
        accent: string
    }
    
    /** Nome icona Lucide */
    icon_name: string
    
    /** Sequenza di step della timeline */
    steps: TimelineStep[]
    
    /** Outcome finale */
    outcome: ScenarioOutcome
    
    // === METRICHE AGGREGATE ===
    
    /** Stima costo totale in € */
    total_cost_estimation: number
    
    /** Score velocità di esecuzione (0-100, 100 = più veloce) */
    speed_score: number
    
    /** Score rischio (0-100, 100 = più rischioso) */
    risk_score: number
    
    /** Score scalabilità (0-100, 100 = più scalabile) */
    scalability_score: number
    
    // === PRO/CONTRO DEFINITI DALL'UTENTE ===
    
    /** Pro aggiuntivi definiti dall'utente */
    user_pros?: string[]
    
    /** Contro aggiuntivi definiti dall'utente */
    user_cons?: string[]
}

/**
 * Scenario custom creato dall'utente.
 * Versione semplificata usata per la creazione.
 */
export interface CustomScenarioInput {
    /** Nome dello scenario */
    title: string
    
    /** Descrizione breve */
    description: string
    
    /** Advisor sponsor (opzionale) */
    advisor_id?: AdvisorId
}

// ============================================================================
// USER STATE - Pesi e preferenze
// ============================================================================

/**
 * Pesi assegnati dall'utente ai 3 scenari.
 * La somma deve essere sempre 100.
 */
export interface ScenarioWeights {
    A: number  // 0-100
    B: number  // 0-100
    C: number  // 0-100
}

/**
 * Stato di espansione dei nodi timeline.
 * Traccia quali step sono espansi per ogni scenario.
 */
export interface ExpandedNodesState {
    A: string[]  // Array di step IDs espansi
    B: string[]
    C: string[]
}

/**
 * Snapshot salvato dall'utente.
 * Permette di salvare e riprendere configurazioni diverse.
 */
export interface StrategySnapshot {
    /** ID univoco */
    id: string
    
    /** Nome dato dall'utente */
    name: string
    
    /** Pesi salvati */
    weights: ScenarioWeights
    
    /** Nodi espansi salvati */
    expanded_nodes: ExpandedNodesState
    
    /** Note libere */
    notes?: string
    
    /** Timestamp creazione */
    created_at: string
}

/**
 * Vista attiva nello Scenario Explorer.
 */
export type ScenarioExplorerView = "swimlanes" | "comparison" | "hybrid"

/**
 * Stato globale dello Scenario Explorer.
 */
export interface StrategyState {
    /** ID sessione */
    session_id: string
    
    /** ID del dilemma originale */
    dilemma_id: string
    
    /** I 3 scenari generati */
    scenarios: [Scenario, Scenario, Scenario]
    
    /** Pesi correnti */
    active_weights: ScenarioWeights
    
    /** Nodi espansi correnti */
    expanded_nodes: ExpandedNodesState
    
    /** Vista attiva */
    active_view: ScenarioExplorerView
    
    /** Snapshot salvati */
    snapshots: StrategySnapshot[]
    
    /** Timestamp ultima modifica */
    updated_at: string
}

// ============================================================================
// PRESET CHIPS - Per guided inputs
// ============================================================================

/**
 * Chip preset per assunzioni comuni.
 */
export const ASSUMPTION_PRESETS = [
    "CAC < €50",
    "CAC < €100",
    "Conversion > 2%",
    "Conversion > 5%",
    "Team disponibile",
    "Budget approvato",
    "Tech stack ready",
    "Market timing OK",
    "No competitor diretti",
    "Regulatory OK",
    "Partnership confirmed",
    "MVP in 30 giorni"
] as const

/**
 * Chip preset per rischi comuni.
 */
export const RISK_PRESETS = [
    "Compliance GDPR",
    "Cashflow negativo",
    "Competitor reaction",
    "Tech debt",
    "Team burnout",
    "Vendor lock-in",
    "Pricing pressure",
    "Churn elevato",
    "Scaling issues",
    "Security breach",
    "Legal exposure",
    "Market shift"
] as const

/**
 * Opzioni per time to signal.
 */
export const TIME_TO_SIGNAL_OPTIONS = [
    "1 week",
    "2 weeks",
    "1 month",
    "2 months",
    "3 months",
    "6 months",
    "1 year"
] as const

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Crea pesi bilanciati di default.
 */
export function createDefaultWeights(): ScenarioWeights {
    return { A: 34, B: 33, C: 33 }
}

/**
 * Crea stato espansione vuoto.
 */
export function createEmptyExpandedState(): ExpandedNodesState {
    return { A: [], B: [], C: [] }
}

/**
 * Valida che i pesi sommino a 100.
 */
export function validateWeights(weights: ScenarioWeights): boolean {
    return weights.A + weights.B + weights.C === 100
}

/**
 * Ribilancia i pesi quando uno cambia.
 * @param changed - Quale peso è cambiato
 * @param newValue - Nuovo valore (0-100)
 * @param current - Pesi correnti
 * @returns Nuovi pesi bilanciati
 */
export function rebalanceWeights(
    changed: ScenarioId,
    newValue: number,
    current: ScenarioWeights
): ScenarioWeights {
    // Clamp new value
    const clamped = Math.max(0, Math.min(100, newValue))
    const remaining = 100 - clamped
    
    // Get the other two scenarios
    const others = (["A", "B", "C"] as ScenarioId[]).filter(id => id !== changed)
    const [other1, other2] = others
    
    // Calculate current total of others
    const othersTotal = current[other1] + current[other2]
    
    if (othersTotal === 0) {
        // Split equally if both are 0
        return {
            ...current,
            [changed]: clamped,
            [other1]: Math.floor(remaining / 2),
            [other2]: Math.ceil(remaining / 2)
        } as ScenarioWeights
    }
    
    // Proportional distribution
    const ratio1 = current[other1] / othersTotal
    const ratio2 = current[other2] / othersTotal
    
    return {
        ...current,
        [changed]: clamped,
        [other1]: Math.floor(remaining * ratio1),
        [other2]: Math.ceil(remaining * ratio2)
    } as ScenarioWeights
}

/**
 * Calcola colore in base al livello di evidenza.
 */
export function getEvidenceLevelColor(level: EvidenceLevel): string {
    switch (level) {
        case "High": return "text-emerald-400 bg-emerald-950/50"
        case "Medium": return "text-amber-400 bg-amber-950/50"
        case "Low": return "text-red-400 bg-red-950/50"
    }
}

/**
 * Calcola colore in base alla reversibilità.
 */
export function getReversibilityColor(rev: Reversibility): string {
    return rev === "High (Type 2)" 
        ? "text-blue-400 bg-blue-950/50"
        : "text-orange-400 bg-orange-950/50"
}
