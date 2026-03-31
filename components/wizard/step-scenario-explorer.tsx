"use client"

/**
 * StepScenarioExplorer - Step 7: Navigazione Strategica
 * 
 * Wrapper che integra ScenarioExplorerPage nel wizard.
 * Genera scenari mock basati sul contesto del dilemma.
 */

import React, { useMemo } from "react"
import { ScenarioExplorerPage } from "@/components/scenario-explorer"
import type { StrategyState, Scenario, TimelineStep } from "@/lib/types/scenario-explorer"
import { createDefaultWeights, createEmptyExpandedState } from "@/lib/types/scenario-explorer"
import type { BrainstormData, AdvisorId } from "@/lib/types/decision-mate"
import type { AgentAnalysis } from "@/lib/ai/services/decision-board"

// ============================================================================
// PROPS
// ============================================================================

interface StepScenarioExplorerProps {
    /** Il problema/dilemma originale */
    problem: string
    /** Dati del brainstorming (advisor selezionati) */
    brainstormData: BrainstormData
    /** Risultati del Decision Board */
    agentAnalyses: AgentAnalysis[]
    /** Callback per procedere */
    onComplete: (state: StrategyState) => void
    /** Callback per tornare indietro */
    onBack: () => void
}

// ============================================================================
// SCENARIO GENERATOR (Mock)
// ============================================================================

/**
 * Genera scenari mock basati sugli advisor selezionati.
 * In produzione, questi verrebbero generati dall'AI.
 */
function generateMockScenarios(
    problem: string,
    advisors: AdvisorId[],
    analyses: AgentAnalysis[]
): [Scenario, Scenario, Scenario] {
    // Scenario A: Approccio Sniper (veloce, pragmatico)
    const scenarioA: Scenario = {
        id: "A",
        advisor_sponsor_id: advisors.includes("sniper") ? "sniper" : advisors[0],
        title: "Lancio Rapido MVP",
        subtitle: "Move fast, validate faster",
        description: "Costruisci il minimo necessario per validare l'idea con clienti reali. Zero complessità, massima velocità di apprendimento.",
        color_classes: {
            bg: "bg-stone-800",
            border: "border-stone-600",
            text: "text-stone-100",
            accent: "text-stone-400"
        },
        icon_name: "Crosshair",
        steps: [
            {
                id: "a-1",
                phase: "Immediate",
                action: "Landing Page + Waitlist",
                description: "Crea una landing page semplice che spiega il valore. Raccogli email per validare l'interesse.",
                assumptions: ["Problema validato", "Target raggiungibile online"],
                risks: ["Vanity metrics", "Bias di conferma"],
                evidence_level: "Low",
                reversibility: "High (Type 2)",
                time_to_signal: "1 week",
                is_checkpoint: false,
                cost_estimate: "€0-500",
                effort: "low"
            },
            {
                id: "a-2",
                phase: "Short-term",
                action: "MVP Funzionale",
                description: "Costruisci solo la feature core. Niente extra, niente \"nice to have\".",
                assumptions: ["Team disponibile", "Tech stack chiaro"],
                risks: ["Feature creep", "Tech debt"],
                evidence_level: "Medium",
                reversibility: "High (Type 2)",
                time_to_signal: "1 month",
                is_checkpoint: true,
                cost_estimate: "€2k-5k",
                effort: "high"
            },
            {
                id: "a-3",
                phase: "Long-term",
                action: "Scale o Pivot",
                description: "Basandoti sui dati, decidi se scalare o cambiare direzione.",
                assumptions: ["Metriche chiare", "Budget per scale"],
                risks: ["Sunk cost fallacy", "Competitor più veloci"],
                evidence_level: "Medium",
                reversibility: "Low (Type 1)",
                time_to_signal: "3 months",
                is_checkpoint: true,
                cost_estimate: "€10k+",
                effort: "high"
            }
        ],
        outcome: {
            title: "Validazione Veloce",
            probability: 40,
            upside: "Product-market fit in 3 mesi, primi clienti paganti",
            downside: "Pivot necessario, €5-10k investiti"
        },
        total_cost_estimation: 15000,
        speed_score: 95,
        risk_score: 60,
        scalability_score: 50
    }
    
    // Scenario B: Approccio Guardian (prudente, validato)
    const scenarioB: Scenario = {
        id: "B",
        advisor_sponsor_id: advisors.includes("guardian") ? "guardian" : advisors[0],
        title: "Validazione Metodica",
        subtitle: "Measure twice, cut once",
        description: "Validazione approfondita prima di costruire. Customer discovery, competitor analysis, compliance check.",
        color_classes: {
            bg: "bg-blue-950",
            border: "border-blue-800",
            text: "text-blue-100",
            accent: "text-blue-400"
        },
        icon_name: "ShieldCheck",
        steps: [
            {
                id: "b-1",
                phase: "Immediate",
                action: "Customer Discovery",
                description: "20+ interviste con potenziali clienti. Valida problema, soluzione, willingness to pay.",
                assumptions: ["Accesso al target", "Tempo per interviste"],
                risks: ["Bias di selezione", "Domande leading"],
                evidence_level: "High",
                reversibility: "High (Type 2)",
                time_to_signal: "3 weeks",
                is_checkpoint: false,
                cost_estimate: "€500-1k",
                effort: "medium"
            },
            {
                id: "b-2",
                phase: "Short-term",
                action: "Competitor & Compliance Audit",
                description: "Analizza i competitor in dettaglio. Verifica GDPR, requisiti legali, costi nascosti.",
                assumptions: ["Dati competitor accessibili"],
                risks: ["Paralysis by analysis"],
                evidence_level: "High",
                reversibility: "High (Type 2)",
                time_to_signal: "2 weeks",
                is_checkpoint: false,
                cost_estimate: "€1k-2k",
                effort: "medium"
            },
            {
                id: "b-3",
                phase: "Long-term",
                action: "Build con Fondamenta Solide",
                description: "Costruisci solo dopo validazione completa. Architettura scalabile, compliant by design.",
                assumptions: ["Validazione positiva", "Budget confermato"],
                risks: ["Over-engineering", "Competitor più veloci"],
                evidence_level: "High",
                reversibility: "Low (Type 1)",
                time_to_signal: "6 months",
                is_checkpoint: true,
                cost_estimate: "€20k-50k",
                effort: "high"
            }
        ],
        outcome: {
            title: "Fondamenta Solide",
            probability: 60,
            upside: "Business sostenibile, rischi mitigati, crescita stabile",
            downside: "6+ mesi per lanciare, competitor potrebbe anticipare"
        },
        total_cost_estimation: 35000,
        speed_score: 30,
        risk_score: 25,
        scalability_score: 80
    }
    
    // Scenario C: Approccio VC (scalabile, ambizioso)
    const scenarioC: Scenario = {
        id: "C",
        advisor_sponsor_id: advisors.includes("vc") ? "vc" : advisors[0],
        title: "Platform Play",
        subtitle: "Think bigger, build moat",
        description: "Non costruire un prodotto, costruisci una piattaforma. Punta agli effetti di rete e al vantaggio competitivo difendibile.",
        color_classes: {
            bg: "bg-emerald-950",
            border: "border-emerald-800",
            text: "text-emerald-100",
            accent: "text-emerald-400"
        },
        icon_name: "TrendingUp",
        steps: [
            {
                id: "c-1",
                phase: "Immediate",
                action: "Market Mapping",
                description: "Identifica i gap del mercato, i potential acquirers, le partnership strategiche.",
                assumptions: ["Mercato mappabile", "Gap esistenti"],
                risks: ["Mercato saturo", "Timing sbagliato"],
                evidence_level: "Medium",
                reversibility: "High (Type 2)",
                time_to_signal: "2 weeks",
                is_checkpoint: false,
                cost_estimate: "€1k-2k",
                effort: "low"
            },
            {
                id: "c-2",
                phase: "Short-term",
                action: "Build Moat Strategy",
                description: "Definisci cosa ti rende non copiabile: dati, network effects, IP, brand.",
                assumptions: ["Moat identificabile", "Risorse per costruirlo"],
                risks: ["Moat non difendibile", "Costi troppo alti"],
                evidence_level: "Low",
                reversibility: "High (Type 2)",
                time_to_signal: "1 month",
                is_checkpoint: true,
                cost_estimate: "€5k-10k",
                effort: "medium"
            },
            {
                id: "c-3",
                phase: "Long-term",
                action: "Scale + Funding Round",
                description: "Con traction dimostrata, raccogli capitale per accelerare. Punta al x10.",
                assumptions: ["Traction solida", "VC interessati"],
                risks: ["Dilution eccessiva", "Burn rate alto"],
                evidence_level: "Low",
                reversibility: "Low (Type 1)",
                time_to_signal: "1 year",
                is_checkpoint: true,
                cost_estimate: "€100k+",
                effort: "high"
            }
        ],
        outcome: {
            title: "Unicorn Potential",
            probability: 15,
            upside: "Exit miliardaria, market leader, legacy",
            downside: "Fallimento totale, burn €200k+, 2 anni persi"
        },
        total_cost_estimation: 150000,
        speed_score: 20,
        risk_score: 90,
        scalability_score: 100
    }
    
    return [scenarioA, scenarioB, scenarioC]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StepScenarioExplorer({
    problem,
    brainstormData,
    agentAnalyses,
    onComplete,
    onBack
}: StepScenarioExplorerProps) {
    // Genera scenari mock
    const initialState = useMemo<StrategyState>(() => {
        const scenarios = generateMockScenarios(
            problem,
            brainstormData.selectedAdvisors,
            agentAnalyses
        )
        
        return {
            session_id: `session-${Date.now()}`,
            dilemma_id: `dilemma-${Date.now()}`,
            scenarios,
            active_weights: createDefaultWeights(),
            expanded_nodes: createEmptyExpandedState(),
            active_view: "swimlanes",
            snapshots: [],
            updated_at: new Date().toISOString()
        }
    }, [problem, brainstormData.selectedAdvisors, agentAnalyses])
    
    // Tronca il problema per il titolo
    const dilemmaTitle = problem.length > 60 
        ? problem.substring(0, 60) + "..." 
        : problem
    
    return (
        <ScenarioExplorerPage
            initialState={initialState}
            dilemmaTitle={dilemmaTitle}
            onBack={onBack}
            onContinue={onComplete}
        />
    )
}
