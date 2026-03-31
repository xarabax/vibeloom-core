"use client"

/**
 * VibeLoom Wizard - Decision Board
 * 
 * Flusso completo in 9 step:
 * 1. Problem → Input del dilemma
 * 2. Market → Dati di mercato (upload o AI)
 * 3. Context → Contesto e attori
 * 4. Brainstorm → Assembla il Board
 * 5. Analysis → Analisi con agenti paralleli
 * 6. Decision Board → Verdetti iniziali (3 card)
 * 7. Discussion → Chat + Selezione Scenari
 * 8. Scenario Builder → Costruisci flussi guidati
 * 9. Verdict → Verdetto finale
 */

import { useState, useCallback } from "react"

// Step Components
import { StepGoal } from "@/components/wizard/step-goal"
import { StepMarket } from "@/components/wizard/step-market"
import { StepContext } from "@/components/wizard/step-context"
import { StepBrainstorm } from "@/components/wizard/step-brainstorm"
import { StepAnalysis } from "@/components/wizard/step-analysis"
import { StepDecisionBoard } from "@/components/wizard/step-decision-board"
import { StepDiscussion } from "@/components/wizard/step-discussion"
import { StepScenarioBuilder } from "@/components/wizard/step-scenario-builder"
import { StepVerdict } from "@/components/wizard/step-verdict"

// Types
import type {
    MarketData,
    ContextData,
    BrainstormData,
    DecisionMateStep,
    SelectedScenario
} from "@/lib/types/decision-mate"
import type {
    DecisionBoardResult,
    AgentAnalysis,
    AgentRole
} from "@/lib/ai/services/decision-board"
import type { Scenario } from "@/lib/types/scenario-explorer"

// Re-export per compatibilità
export type WizardStep = DecisionMateStep
export type UploadedFile = File

/**
 * Decision Mate Wizard
 * 
 * Orchestratore principale del flusso decisionale.
 */
export function VibeLoomWizard() {
    // === STATO WIZARD ===
    const [currentStep, setCurrentStep] = useState<DecisionMateStep>("problem")

    // Step 1: Problem
    const [problem, setProblem] = useState("")

    // Step 2: Market Data
    const [marketData, setMarketData] = useState<MarketData | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

    // Step 3: Context & Actors
    const [contextData, setContextData] = useState<ContextData | null>(null)

    // Step 4: Brainstorming
    const [brainstormData, setBrainstormData] = useState<BrainstormData | null>(null)

    // Step 5-6: Decision Board Result
    const [decisionBoardResult, setDecisionBoardResult] = useState<DecisionBoardResult | null>(null)

    // Step 7: Selected Scenarios
    const [selectedScenarios, setSelectedScenarios] = useState<SelectedScenario[]>([])

    // Step 8: Built Scenarios
    const [builtScenarios, setBuiltScenarios] = useState<Scenario[]>([])

    // Step 9: Final Verdict Scenario
    const [finalScenario, setFinalScenario] = useState<Scenario | null>(null)
    // Legacy: Selected Agent (for historical tracking)
    const [selectedAgent, setSelectedAgent] = useState<AgentAnalysis | null>(null)

    // === HANDLERS STEP 1: PROBLEM ===
    const handleProblemSubmit = useCallback((problemText: string) => {
        setProblem(problemText)
        setCurrentStep("market")
    }, [])

    // === HANDLERS STEP 2: MARKET DATA ===
    const handleMarketComplete = useCallback((data: MarketData) => {
        setMarketData(data)
        if (data.files) {
            setUploadedFiles(data.files)
        }
        setCurrentStep("context")
    }, [])

    const handleMarketBack = useCallback(() => {
        setCurrentStep("problem")
    }, [])

    // === HANDLERS STEP 3: CONTEXT ===
    const handleContextComplete = useCallback((data: ContextData) => {
        setContextData(data)
        setCurrentStep("brainstorm")
    }, [])

    const handleContextBack = useCallback(() => {
        setCurrentStep("market")
    }, [])

    // === HANDLERS STEP 4: BRAINSTORMING ===
    const handleBrainstormComplete = useCallback((data: BrainstormData) => {
        setBrainstormData(data)
        setCurrentStep("analysis")
    }, [])

    const handleBrainstormBack = useCallback(() => {
        setCurrentStep("context")
    }, [])

    // === HANDLERS STEP 5: ANALYSIS ===
    const handleAnalysisComplete = useCallback((result: DecisionBoardResult) => {
        setDecisionBoardResult(result)
        setCurrentStep("decision-board")
    }, [])

    // === HANDLERS STEP 6: DECISION BOARD ===
    const handleSelectScenario = useCallback(() => {
        setCurrentStep("discussion")
    }, [])

    const handleDecisionBoardBack = useCallback(() => {
        setCurrentStep("brainstorm")
    }, [])

    const handleDecisionBoardRetry = useCallback(() => {
        setDecisionBoardResult(null)
        setCurrentStep("analysis")
    }, [])

    // === HANDLERS STEP 7: DISCUSSION ===
    const handleDiscussionComplete = useCallback((scenarios: SelectedScenario[]) => {
        setSelectedScenarios(scenarios)
        setCurrentStep("scenario-builder")
    }, [])

    const handleDiscussionBack = useCallback(() => {
        setCurrentStep("decision-board")
    }, [])

    // === HANDLERS STEP 8: SCENARIO BUILDER ===
    const handleScenarioBuilderComplete = useCallback((scenarios: Scenario[]) => {
        setBuiltScenarios(scenarios)
        // Se l'utente ha costruito più scenari, per ora prendiamo il primo come "Final Verdict"
        // In futuro potremmo aggiungere uno step intermedio di selezione se ne ha creati n > 1
        if (scenarios.length > 0) {
            setFinalScenario(scenarios[0])
        }

        setCurrentStep("verdict")
    }, [])

    const handleScenarioBuilderBack = useCallback(() => {
        setCurrentStep("discussion")
    }, [])

    // === RESET ===
    const handleReset = useCallback(() => {
        setCurrentStep("problem")
        setProblem("")
        setMarketData(null)
        setContextData(null)
        setBrainstormData(null)
        setUploadedFiles([])
        setDecisionBoardResult(null)
        setSelectedScenarios([])
        setBuiltScenarios([])
        setFinalScenario(null)
        setSelectedAgent(null)
    }, [])

    // === RENDER ===
    return (
        <main className="min-h-screen w-full bg-background text-foreground">
            {/* Step 1: Problem Input */}
            {currentStep === "problem" && (
                <StepGoal onSubmit={handleProblemSubmit} />
            )}

            {/* Step 2: Market Data */}
            {currentStep === "market" && (
                <StepMarket
                    problem={problem}
                    onComplete={handleMarketComplete}
                    onBack={handleMarketBack}
                />
            )}

            {/* Step 3: Context & Actors */}
            {currentStep === "context" && (
                <StepContext
                    problem={problem}
                    onComplete={handleContextComplete}
                    onBack={handleContextBack}
                />
            )}

            {/* Step 4: Brainstorming - Selezione Ruoli AI */}
            {currentStep === "brainstorm" && (
                <StepBrainstorm
                    problem={problem}
                    onComplete={handleBrainstormComplete}
                    onBack={handleBrainstormBack}
                />
            )}

            {/* Step 5: AI Analysis (3 agenti paralleli) */}
            {currentStep === "analysis" && (
                <StepAnalysis
                    goal={problem}
                    files={uploadedFiles}
                    marketData={marketData}
                    contextData={contextData}
                    brainstormData={brainstormData}
                    onComplete={handleAnalysisComplete}
                />
            )}

            {/* Step 6: Decision Board - Verdetti iniziali */}
            {currentStep === "decision-board" && decisionBoardResult && (
                <StepDecisionBoard
                    results={decisionBoardResult.agents_analysis}
                    onSelectScenario={handleSelectScenario}
                    onBack={handleDecisionBoardBack}
                    onRetry={handleDecisionBoardRetry}
                />
            )}

            {/* Step 7: Discussion - Chat + Selezione Scenari */}
            {currentStep === "discussion" && decisionBoardResult && brainstormData && (
                <StepDiscussion
                    problem={problem}
                    selectedAdvisors={brainstormData.selectedAdvisors}
                    initialAnalyses={decisionBoardResult.agents_analysis}
                    onComplete={handleDiscussionComplete}
                    onBack={handleDiscussionBack}
                />
            )}

            {/* Step 8: Scenario Builder - Costruisci Flussi */}
            {currentStep === "scenario-builder" && brainstormData && selectedScenarios.length > 0 && (
                <StepScenarioBuilder
                    problem={problem}
                    selectedScenarios={selectedScenarios}
                    selectedAdvisors={brainstormData.selectedAdvisors}
                    onComplete={handleScenarioBuilderComplete}
                    onBack={handleScenarioBuilderBack}
                />
            )}

            {/* Step 9: Verdict - Verdetto Finale (EXECUTIVE SUMMARY) */}
            {currentStep === "verdict" && (
                <StepVerdict
                    goal={problem}
                    selectedScenario={finalScenario || {
                        // MOCK FALLBACK per rendere l'UI navigabile anche senza dati reali
                        id: "mock-verdict",
                        title: "Strategia Ibrida: Crescita Sostenibile",
                        subtitle: "Un approccio bilanciato",
                        description: "",
                        color_classes: { bg: "", border: "", text: "", accent: "" },
                        icon_name: "Target",
                        steps: [
                            {
                                id: "1", phase: "Immediate", action: "Validazione MVP", description: "Lancia landing page e raccogli 50 email",
                                assumptions: ["CAC < 10€"], risks: [], evidence_level: "High", reversibility: "High (Type 2)", time_to_signal: "1 week", is_checkpoint: false
                            },
                            {
                                id: "2", phase: "Short-term", action: "Assumi Tech Lead", description: "Trova un CTO part-time per sviluppare il core",
                                assumptions: [], risks: ["Equity dilution"], evidence_level: "Medium", reversibility: "Low (Type 1)", time_to_signal: "1 month", is_checkpoint: false
                            }
                        ],
                        outcome: { title: "Successo", probability: 80, upside: "", downside: "" },
                        total_cost_estimation: 0,
                        speed_score: 0, risk_score: 0, scalability_score: 0,
                        user_cons: ["Richiede molto tempo founder", "Mercato affollato"],
                        user_pros: ["Marginalità alta"]
                    }}
                    onReset={handleReset}
                />
            )}
        </main>
    )
}
