/**
 * Impact Calculator - Sistema di calcolo dinamico Pro/Contro
 * 
 * Ogni assunzione e rischio ha un impatto sui punteggi dello scenario.
 * Quando l'utente modifica i parametri, i pro/contro vengono ricalcolati.
 */

import type { TimelineStep, Scenario, ScenarioId } from "@/lib/types/scenario-explorer"

// ============================================================================
// TIPI
// ============================================================================

/**
 * Impatto di un singolo tag sui punteggi
 */
export interface TagImpact {
    /** Impatto su velocità (-20 a +20) */
    speed: number
    /** Impatto su rischio (-20 a +20, positivo = più rischioso) */
    risk: number
    /** Impatto su scalabilità (-20 a +20) */
    scalability: number
    /** Impatto su costo stimato (moltiplicatore, es. 1.2 = +20%) */
    cost_multiplier: number
}

/**
 * Pro/Contro calcolati dinamicamente
 */
export interface DynamicProsCons {
    pros: string[]
    cons: string[]
    warnings: string[]  // Alert specifici basati su combinazioni rischiose
    confidence_score: number  // 0-100, quanto siamo sicuri della valutazione
}

/**
 * Risultato del calcolo completo
 */
export interface ScenarioEvaluation {
    scenario_id: ScenarioId
    adjusted_scores: {
        speed: number
        risk: number
        scalability: number
        cost: number
    }
    pros_cons: DynamicProsCons
    delta_from_original: {
        speed: number
        risk: number
        scalability: number
        cost_percent: number
    }
}

// ============================================================================
// DATABASE IMPATTI - Assunzioni
// ============================================================================

/**
 * Impatti delle assunzioni sui punteggi.
 * Chiave = label dell'assunzione (case-insensitive match)
 */
export const ASSUMPTION_IMPACTS: Record<string, TagImpact> = {
    // === SNIPER ASSUMPTIONS ===
    "cac < 50€": {
        speed: 5,
        risk: -5,
        scalability: 10,
        cost_multiplier: 0.9
    },
    "cac < 100€": {
        speed: 3,
        risk: -3,
        scalability: 5,
        cost_multiplier: 0.95
    },
    "payback < 3 months": {
        speed: 10,
        risk: -10,
        scalability: 5,
        cost_multiplier: 0.85
    },
    "team available": {
        speed: 15,
        risk: -5,
        scalability: 0,
        cost_multiplier: 0.9
    },
    "team disponibile": {
        speed: 15,
        risk: -5,
        scalability: 0,
        cost_multiplier: 0.9
    },
    "mvp in 30 days": {
        speed: 20,
        risk: 5,
        scalability: -5,
        cost_multiplier: 0.8
    },
    "mvp in 30 giorni": {
        speed: 20,
        risk: 5,
        scalability: -5,
        cost_multiplier: 0.8
    },
    
    // === GUARDIAN ASSUMPTIONS ===
    "no legal blockers": {
        speed: 5,
        risk: -15,
        scalability: 5,
        cost_multiplier: 0.95
    },
    "tech stack stable": {
        speed: 0,
        risk: -10,
        scalability: 10,
        cost_multiplier: 0.9
    },
    "tech stack ready": {
        speed: 10,
        risk: -5,
        scalability: 5,
        cost_multiplier: 0.9
    },
    "budget approved": {
        speed: 10,
        risk: -10,
        scalability: 0,
        cost_multiplier: 1.0
    },
    "budget approvato": {
        speed: 10,
        risk: -10,
        scalability: 0,
        cost_multiplier: 1.0
    },
    "regulatory ok": {
        speed: 5,
        risk: -20,
        scalability: 10,
        cost_multiplier: 0.9
    },
    
    // === VC ASSUMPTIONS ===
    "viral loop > 1.2": {
        speed: -5,
        risk: 10,
        scalability: 25,
        cost_multiplier: 1.2
    },
    "competitor ignore us": {
        speed: 10,
        risk: -5,
        scalability: 5,
        cost_multiplier: 1.0
    },
    "market timing ok": {
        speed: 5,
        risk: -10,
        scalability: 15,
        cost_multiplier: 1.0
    },
    "network effects possibili": {
        speed: -10,
        risk: 5,
        scalability: 30,
        cost_multiplier: 1.3
    },
    "funding disponibile": {
        speed: 5,
        risk: 5,
        scalability: 20,
        cost_multiplier: 1.5
    }
}

// ============================================================================
// DATABASE IMPATTI - Rischi
// ============================================================================

/**
 * Impatti dei rischi sui punteggi.
 * I rischi generalmente aumentano il risk score e riducono altri punteggi.
 */
export const RISK_IMPACTS: Record<string, TagImpact> = {
    // === SNIPER RISKS ===
    "low adoption": {
        speed: 0,
        risk: 15,
        scalability: -10,
        cost_multiplier: 1.0
    },
    "feature creep": {
        speed: -15,
        risk: 10,
        scalability: -5,
        cost_multiplier: 1.3
    },
    "tech debt": {
        speed: 5,
        risk: 10,
        scalability: -15,
        cost_multiplier: 1.2
    },
    "scaling issues": {
        speed: 0,
        risk: 15,
        scalability: -20,
        cost_multiplier: 1.4
    },
    
    // === GUARDIAN RISKS ===
    "data breach": {
        speed: 0,
        risk: 25,
        scalability: -10,
        cost_multiplier: 1.5
    },
    "platform lock-in": {
        speed: 0,
        risk: 15,
        scalability: -15,
        cost_multiplier: 1.3
    },
    "regulatory change": {
        speed: -5,
        risk: 20,
        scalability: -10,
        cost_multiplier: 1.4
    },
    "team burnout": {
        speed: -10,
        risk: 15,
        scalability: -5,
        cost_multiplier: 1.2
    },
    "compliance gdpr": {
        speed: -10,
        risk: 15,
        scalability: -5,
        cost_multiplier: 1.3
    },
    
    // === VC RISKS ===
    "runway depletion": {
        speed: 0,
        risk: 25,
        scalability: -20,
        cost_multiplier: 1.0
    },
    "competitor react": {
        speed: -5,
        risk: 15,
        scalability: -10,
        cost_multiplier: 1.1
    },
    "cashflow negative": {
        speed: 0,
        risk: 20,
        scalability: -5,
        cost_multiplier: 1.2
    },
    "cashflow negativo": {
        speed: 0,
        risk: 20,
        scalability: -5,
        cost_multiplier: 1.2
    },
    "churn elevato": {
        speed: 0,
        risk: 15,
        scalability: -15,
        cost_multiplier: 1.1
    },
    "execution risk altissimo": {
        speed: -10,
        risk: 25,
        scalability: -10,
        cost_multiplier: 1.5
    }
}

// ============================================================================
// REGOLE COMBINAZIONI RISCHIOSE
// ============================================================================

interface WarningRule {
    /** Condizioni: almeno uno di questi rischi presenti */
    risks: string[]
    /** Condizioni: nessuna di queste assunzioni presente */
    missing_assumptions: string[]
    /** Warning da mostrare */
    warning: string
    /** Severità */
    severity: "low" | "medium" | "high"
}

const WARNING_RULES: WarningRule[] = [
    {
        risks: ["cashflow negativo", "cashflow negative", "runway depletion"],
        missing_assumptions: ["budget approvato", "budget approved", "funding disponibile"],
        warning: "Alto rischio finanziario senza budget confermato",
        severity: "high"
    },
    {
        risks: ["data breach", "compliance gdpr"],
        missing_assumptions: ["no legal blockers", "regulatory ok"],
        warning: "Rischi legali non mitigati da validazione compliance",
        severity: "high"
    },
    {
        risks: ["tech debt", "scaling issues"],
        missing_assumptions: ["tech stack stable", "tech stack ready"],
        warning: "Debito tecnico potenziale senza stack validato",
        severity: "medium"
    },
    {
        risks: ["team burnout"],
        missing_assumptions: ["team available", "team disponibile"],
        warning: "Rischio burnout senza capacità team confermata",
        severity: "medium"
    },
    {
        risks: ["competitor react"],
        missing_assumptions: ["competitor ignore us", "market timing ok"],
        warning: "Vulnerabile alla reazione dei competitor",
        severity: "low"
    }
]

// ============================================================================
// FUNZIONI DI CALCOLO
// ============================================================================

/**
 * Normalizza un label per il matching
 */
function normalizeLabel(label: string): string {
    return label.toLowerCase().trim()
}

/**
 * Trova l'impatto di un tag (assunzione o rischio)
 */
function findImpact(label: string, impactDb: Record<string, TagImpact>): TagImpact | null {
    const normalized = normalizeLabel(label)
    
    // Match esatto
    if (impactDb[normalized]) {
        return impactDb[normalized]
    }
    
    // Match parziale (contiene)
    for (const key of Object.keys(impactDb)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return impactDb[key]
        }
    }
    
    return null
}

/**
 * Calcola i punteggi adjusted per uno scenario
 */
export function calculateAdjustedScores(scenario: Scenario): ScenarioEvaluation["adjusted_scores"] {
    let speedDelta = 0
    let riskDelta = 0
    let scalabilityDelta = 0
    let costMultiplier = 1.0
    
    // Processa tutti gli step
    for (const step of scenario.steps) {
        // Impatto assunzioni
        for (const assumption of step.assumptions) {
            const impact = findImpact(assumption, ASSUMPTION_IMPACTS)
            if (impact) {
                speedDelta += impact.speed
                riskDelta += impact.risk
                scalabilityDelta += impact.scalability
                costMultiplier *= impact.cost_multiplier
            }
        }
        
        // Impatto rischi
        for (const risk of step.risks) {
            const impact = findImpact(risk, RISK_IMPACTS)
            if (impact) {
                speedDelta += impact.speed
                riskDelta += impact.risk
                scalabilityDelta += impact.scalability
                costMultiplier *= impact.cost_multiplier
            }
        }
    }
    
    // Calcola punteggi finali (clamped 0-100)
    const clamp = (val: number) => Math.max(0, Math.min(100, val))
    
    return {
        speed: clamp(scenario.speed_score + speedDelta),
        risk: clamp(scenario.risk_score + riskDelta),
        scalability: clamp(scenario.scalability_score + scalabilityDelta),
        cost: Math.round(scenario.total_cost_estimation * costMultiplier)
    }
}

/**
 * Genera pro/contro dinamici basati sui punteggi
 */
export function generateDynamicProsCons(
    scenario: Scenario,
    adjustedScores: ScenarioEvaluation["adjusted_scores"]
): DynamicProsCons {
    const pros: string[] = []
    const cons: string[] = []
    const warnings: string[] = []
    
    // Raccogli tutti i rischi e assunzioni
    const allRisks = scenario.steps.flatMap(s => s.risks.map(normalizeLabel))
    const allAssumptions = scenario.steps.flatMap(s => s.assumptions.map(normalizeLabel))
    
    // === GENERA PRO ===
    if (adjustedScores.speed >= 80) {
        pros.push("Velocità di esecuzione eccellente")
    } else if (adjustedScores.speed >= 60) {
        pros.push("Buona velocità di go-to-market")
    }
    
    if (adjustedScores.risk <= 30) {
        pros.push("Profilo di rischio conservativo")
    } else if (adjustedScores.risk <= 50) {
        pros.push("Rischi gestibili con mitigazione")
    }
    
    if (adjustedScores.scalability >= 80) {
        pros.push("Altissimo potenziale di scala")
    } else if (adjustedScores.scalability >= 60) {
        pros.push("Buona scalabilità a medio termine")
    }
    
    if (adjustedScores.cost < scenario.total_cost_estimation * 0.9) {
        pros.push(`Costo ridotto del ${Math.round((1 - adjustedScores.cost / scenario.total_cost_estimation) * 100)}%`)
    }
    
    // Pro specifici da assunzioni
    if (allAssumptions.some(a => a.includes("team"))) {
        pros.push("Team già disponibile per l'esecuzione")
    }
    if (allAssumptions.some(a => a.includes("budget") || a.includes("funding"))) {
        pros.push("Finanziamento già assicurato")
    }
    if (allAssumptions.some(a => a.includes("mvp"))) {
        pros.push("MVP realizzabile in tempi rapidi")
    }
    
    // === GENERA CONTRO ===
    if (adjustedScores.speed <= 30) {
        cons.push("Tempi di esecuzione molto lunghi")
    } else if (adjustedScores.speed <= 50) {
        cons.push("Velocità sotto la media di mercato")
    }
    
    if (adjustedScores.risk >= 80) {
        cons.push("Profilo di rischio molto elevato")
    } else if (adjustedScores.risk >= 60) {
        cons.push("Rischi significativi da monitorare")
    }
    
    if (adjustedScores.scalability <= 30) {
        cons.push("Scalabilità limitata")
    } else if (adjustedScores.scalability <= 50) {
        cons.push("Potenziale di scala moderato")
    }
    
    if (adjustedScores.cost > scenario.total_cost_estimation * 1.2) {
        cons.push(`Costo aumentato del ${Math.round((adjustedScores.cost / scenario.total_cost_estimation - 1) * 100)}%`)
    }
    
    // Contro specifici da rischi
    if (allRisks.some(r => r.includes("burnout"))) {
        cons.push("Rischio di esaurimento del team")
    }
    if (allRisks.some(r => r.includes("compliance") || r.includes("gdpr"))) {
        cons.push("Complessità regolatoria da gestire")
    }
    if (allRisks.some(r => r.includes("competitor"))) {
        cons.push("Pressione competitiva attesa")
    }
    
    // === GENERA WARNING ===
    for (const rule of WARNING_RULES) {
        const hasRisk = rule.risks.some(r => 
            allRisks.some(ar => ar.includes(r) || r.includes(ar))
        )
        const missingAssumption = !rule.missing_assumptions.some(a => 
            allAssumptions.some(aa => aa.includes(a) || a.includes(aa))
        )
        
        if (hasRisk && missingAssumption) {
            warnings.push(rule.warning)
        }
    }
    
    // === CALCOLA CONFIDENCE ===
    // Più assunzioni = meno confidence (più dipendenze)
    // Più rischi senza mitigazione = meno confidence
    const assumptionPenalty = Math.min(allAssumptions.length * 5, 30)
    const riskPenalty = Math.min(allRisks.length * 8, 40)
    const warningPenalty = warnings.length * 10
    
    const confidence_score = Math.max(20, 100 - assumptionPenalty - riskPenalty - warningPenalty)
    
    return {
        pros: pros.slice(0, 5),  // Max 5 pro
        cons: cons.slice(0, 5),  // Max 5 contro
        warnings: warnings.slice(0, 3),  // Max 3 warning
        confidence_score
    }
}

/**
 * Valuta uno scenario completo
 */
export function evaluateScenario(scenario: Scenario): ScenarioEvaluation {
    const adjustedScores = calculateAdjustedScores(scenario)
    const pros_cons = generateDynamicProsCons(scenario, adjustedScores)
    
    return {
        scenario_id: scenario.id as any,
        adjusted_scores: adjustedScores,
        pros_cons,
        delta_from_original: {
            speed: adjustedScores.speed - scenario.speed_score,
            risk: adjustedScores.risk - scenario.risk_score,
            scalability: adjustedScores.scalability - scenario.scalability_score,
            cost_percent: Math.round((adjustedScores.cost / scenario.total_cost_estimation - 1) * 100)
        }
    }
}

/**
 * Valuta tutti gli scenari e restituisce comparazione
 */
export function evaluateAllScenarios(scenarios: Scenario[]): ScenarioEvaluation[] {
    return scenarios.map(evaluateScenario)
}
