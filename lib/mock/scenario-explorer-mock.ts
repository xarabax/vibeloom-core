/**
 * Mock Data per Scenario Explorer
 * 
 * Dati realistici per testing UI senza chiamate AI.
 */

import type { Scenario, StrategyState, TimelineStep } from "@/lib/types/scenario-explorer"
import { createDefaultWeights, createEmptyExpandedState } from "@/lib/types/scenario-explorer"

// ============================================================================
// SCENARIO A: "Lancio Aggressivo" - Sponsorizzato da The Sniper
// ============================================================================

const SCENARIO_A_STEPS: TimelineStep[] = [
    {
        id: "a-1",
        phase: "Immediate",
        action: "MVP Brutale in 2 Settimane",
        description: "Costruisci la versione più semplice possibile. Una landing page con Stripe integrato. Niente backend complesso, niente feature secondarie. Solo il core value proposition.",
        assumptions: ["Team disponibile", "Tech stack ready", "MVP in 30 giorni"],
        risks: ["Tech debt", "Team burnout"],
        evidence_level: "Medium",
        reversibility: "High (Type 2)",
        time_to_signal: "2 weeks",
        is_checkpoint: false,
        cost_estimate: "€0-2k",
        effort: "high"
    },
    {
        id: "a-2",
        phase: "Short-term",
        action: "Paid Acquisition Blitz",
        description: "€5k di budget ads concentrato in 4 settimane. Facebook, Google, LinkedIn. A/B test aggressivo sulle creatività. Obiettivo: 100 trial signup.",
        assumptions: ["CAC < €50", "Budget approvato", "Conversion > 2%"],
        risks: ["Cashflow negativo", "CAC troppo alto"],
        evidence_level: "Low",
        reversibility: "High (Type 2)",
        time_to_signal: "1 month",
        is_checkpoint: true,
        cost_estimate: "€5k",
        effort: "medium"
    },
    {
        id: "a-3",
        phase: "Long-term",
        action: "Scale or Kill",
        description: "Se CAC < €50 e conversion > 2%, scala il budget 5x. Se no, pivot o shutdown. Nessuna via di mezzo.",
        assumptions: ["Market timing OK", "Unit economics validati"],
        risks: ["Competitor reaction", "Scaling issues"],
        evidence_level: "Low",
        reversibility: "Low (Type 1)",
        time_to_signal: "3 months",
        is_checkpoint: true,
        cost_estimate: "€25k+",
        effort: "high"
    }
]

const SCENARIO_A: Scenario = {
    id: "A",
    advisor_sponsor_id: "sniper",
    title: "Lancio Aggressivo",
    subtitle: "Move fast, break things",
    description: "Velocità massima. MVP in 2 settimane, validazione pagata in 4 settimane, decisione binaria (scale o kill) al mese 3. Zero complessità, zero over-engineering.",
    color_classes: {
        bg: "bg-stone-800",
        border: "border-stone-600",
        text: "text-stone-100",
        accent: "text-stone-400"
    },
    icon_name: "Crosshair",
    steps: SCENARIO_A_STEPS,
    outcome: {
        title: "First Mover Advantage",
        probability: 35,
        upside: "Market leader in 6 mesi, €500k ARR",
        downside: "Burnout team, €30k bruciati, shutdown"
    },
    total_cost_estimation: 32000,
    speed_score: 95,
    risk_score: 75,
    scalability_score: 60
}

// ============================================================================
// SCENARIO B: "Validazione Prudente" - Sponsorizzato da The Guardian
// ============================================================================

const SCENARIO_B_STEPS: TimelineStep[] = [
    {
        id: "b-1",
        phase: "Immediate",
        action: "Customer Discovery Sprint",
        description: "30 interviste in 3 settimane. Nessun codice. Solo conversazioni con potenziali clienti. Obiettivo: validare il problema e il willingness to pay.",
        assumptions: ["Target audience accessibile", "Tempo per interviste"],
        risks: ["Bias di conferma", "Sample non rappresentativo"],
        evidence_level: "Medium",
        reversibility: "High (Type 2)",
        time_to_signal: "3 weeks",
        is_checkpoint: false,
        cost_estimate: "€500",
        effort: "medium"
    },
    {
        id: "b-2",
        phase: "Short-term",
        action: "Concierge MVP",
        description: "Servizio manuale per 10 clienti. Niente software, tutto fatto a mano. Obiettivo: validare che pagano e che il servizio funziona.",
        assumptions: ["Conversion > 5%", "Price point validato"],
        risks: ["Non scala", "Team burnout"],
        evidence_level: "High",
        reversibility: "High (Type 2)",
        time_to_signal: "2 months",
        is_checkpoint: true,
        cost_estimate: "€2k",
        effort: "high"
    },
    {
        id: "b-3",
        phase: "Long-term",
        action: "Build Incrementale",
        description: "Solo dopo validazione completa, costruisci il software. Feature per feature, rilascio ogni 2 settimane. Niente big bang.",
        assumptions: ["Revenue ricorrente", "Churn < 5%"],
        risks: ["Competitor più veloce", "Market shift"],
        evidence_level: "High",
        reversibility: "Low (Type 1)",
        time_to_signal: "6 months",
        is_checkpoint: true,
        cost_estimate: "€15k",
        effort: "high"
    }
]

const SCENARIO_B: Scenario = {
    id: "B",
    advisor_sponsor_id: "guardian",
    title: "Validazione Prudente",
    subtitle: "Measure twice, cut once",
    description: "Validazione rigorosa prima di costruire. Customer discovery, concierge MVP, poi build incrementale. Più lento ma più sicuro.",
    color_classes: {
        bg: "bg-blue-950",
        border: "border-blue-800",
        text: "text-blue-100",
        accent: "text-blue-400"
    },
    icon_name: "ShieldCheck",
    steps: SCENARIO_B_STEPS,
    outcome: {
        title: "Sustainable Growth",
        probability: 55,
        upside: "Product-market fit solido, €200k ARR in 12 mesi",
        downside: "Troppo lento, competitor vince il mercato"
    },
    total_cost_estimation: 17500,
    speed_score: 40,
    risk_score: 30,
    scalability_score: 75
}

// ============================================================================
// SCENARIO C: "Pivot Strategico" - Sponsorizzato da The VC
// ============================================================================

const SCENARIO_C_STEPS: TimelineStep[] = [
    {
        id: "c-1",
        phase: "Immediate",
        action: "Market Intelligence Deep Dive",
        description: "Analisi competitiva profonda. Chi sta vincendo, perché, e dove sono i gap. Identifica il 'wedge' - l'angolo non servito dai competitor.",
        assumptions: ["Dati di mercato accessibili", "Gap identificabile"],
        risks: ["Analisi troppo lunga", "Paralysis by analysis"],
        evidence_level: "Medium",
        reversibility: "High (Type 2)",
        time_to_signal: "2 weeks",
        is_checkpoint: false,
        cost_estimate: "€1k",
        effort: "low"
    },
    {
        id: "c-2",
        phase: "Short-term",
        action: "Partnership/Acquisition Hunt",
        description: "Invece di costruire, cerca di acquisire o fare partnership con player esistenti. Compra l'accesso al mercato invece di costruirlo.",
        assumptions: ["Target disponibili", "Budget per M&A"],
        risks: ["Pricing troppo alto", "Integration issues"],
        evidence_level: "Low",
        reversibility: "Low (Type 1)",
        time_to_signal: "3 months",
        is_checkpoint: true,
        cost_estimate: "€50k-200k",
        effort: "medium"
    },
    {
        id: "c-3",
        phase: "Long-term",
        action: "Platform Play",
        description: "Costruisci una piattaforma, non un prodotto. API-first, marketplace, effetti di rete. Punta al x100, non al x2.",
        assumptions: ["Network effects possibili", "Funding disponibile"],
        risks: ["Execution risk altissimo", "Capitale necessario"],
        evidence_level: "Low",
        reversibility: "Low (Type 1)",
        time_to_signal: "1 year",
        is_checkpoint: true,
        cost_estimate: "€200k+",
        effort: "high"
    }
]

const SCENARIO_C: Scenario = {
    id: "C",
    advisor_sponsor_id: "vc",
    title: "Pivot Strategico",
    subtitle: "Think bigger, play longer",
    description: "Non competere sul campo dei competitor. Cambia le regole del gioco. Partnership, acquisizioni, platform play. Alto rischio, alto rendimento.",
    color_classes: {
        bg: "bg-emerald-950",
        border: "border-emerald-800",
        text: "text-emerald-100",
        accent: "text-emerald-400"
    },
    icon_name: "TrendingUp",
    steps: SCENARIO_C_STEPS,
    outcome: {
        title: "Market Disruption",
        probability: 20,
        upside: "Unicorno, €10M+ funding, market leader",
        downside: "€200k+ bruciati, 2 anni persi, failure totale"
    },
    total_cost_estimation: 251000,
    speed_score: 25,
    risk_score: 90,
    scalability_score: 95
}

// ============================================================================
// STATO MOCK COMPLETO
// ============================================================================

export const MOCK_STRATEGY_STATE: StrategyState = {
    session_id: "mock-session-001",
    dilemma_id: "mock-dilemma-001",
    scenarios: [SCENARIO_A, SCENARIO_B, SCENARIO_C],
    active_weights: createDefaultWeights(),
    expanded_nodes: createEmptyExpandedState(),
    active_view: "swimlanes",
    snapshots: [],
    updated_at: new Date().toISOString()
}

/**
 * Genera uno stato mock per un dilemma specifico.
 */
export function generateMockStrategyState(dilemmaId: string): StrategyState {
    return {
        ...MOCK_STRATEGY_STATE,
        session_id: `session-${Date.now()}`,
        dilemma_id: dilemmaId,
        updated_at: new Date().toISOString()
    }
}
