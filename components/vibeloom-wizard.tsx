"use client"

import { useState, useCallback } from "react"
import { StepGoal } from "@/components/wizard/step-goal"
import { StepMarket } from "@/components/wizard/step-market"
import { StepContext } from "@/components/wizard/step-context"
import { StepAnalysis } from "@/components/wizard/step-analysis"
import { StepVerdict } from "@/components/wizard/step-verdict"

import { AnalysisResult } from "@/lib/ai/types"
import type { MarketData, ContextData, DecisionMateStep } from "@/lib/types/decision-mate"

// Re-export tipi per compatibilità
export type WizardStep = DecisionMateStep
export type UploadedFile = File
export type { AnalysisResult }

/**
 * Decision Mate Wizard
 * 
 * Flusso: Problem → Market Data → Context → Analysis → Verdict
 */
export function VibeLoomWizard() {
    // === STATO WIZARD ===
    const [currentStep, setCurrentStep] = useState<DecisionMateStep>("problem")
    
    // Step 1: Problem
    const [problem, setProblem] = useState("")
    
    // Step 2: Market Data
    const [marketData, setMarketData] = useState<MarketData | null>(null)
    
    // Step 3: Context & Actors
    const [contextData, setContextData] = useState<ContextData | null>(null)
    
    // Step 4-5: Analysis Result (legacy, per compatibilità con StepAnalysis/StepVerdict)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

    // === HANDLERS STEP 1: PROBLEM ===
    const handleProblemSubmit = useCallback((problemText: string) => {
        setProblem(problemText)
        setCurrentStep("market")
    }, [])

    // === HANDLERS STEP 2: MARKET DATA ===
    const handleMarketComplete = useCallback((data: MarketData) => {
        setMarketData(data)
        // Salva i file per compatibilità con StepAnalysis
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
        setCurrentStep("analysis")
    }, [])

    const handleContextBack = useCallback(() => {
        setCurrentStep("market")
    }, [])

    // === HANDLERS STEP 4: ANALYSIS ===
    const handleAnalysisComplete = useCallback((result: AnalysisResult) => {
        setAnalysisResult(result)
        setCurrentStep("verdict")
    }, [])

    // === RESET ===
    const handleReset = useCallback(() => {
        setCurrentStep("problem")
        setProblem("")
        setMarketData(null)
        setContextData(null)
        setUploadedFiles([])
        setAnalysisResult(null)
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
            
            {/* Step 4: AI Analysis */}
            {currentStep === "analysis" && (
                <StepAnalysis 
                    goal={problem} 
                    files={uploadedFiles}
                    marketData={marketData}
                    contextData={contextData}
                    onComplete={handleAnalysisComplete} 
                />
            )}
            
            {/* Step 5: Results/Verdict */}
            {currentStep === "verdict" && analysisResult && (
                <StepVerdict
                    goal={problem}
                    uploadedFiles={uploadedFiles.map((f) => f.name)}
                    result={analysisResult}
                    onReset={handleReset}
                />
            )}
        </main>
    )
}
