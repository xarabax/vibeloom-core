"use client"

import { useState, useCallback } from "react"
import { StepGoal } from "@/components/wizard/step-goal"
import { StepFeeding } from "@/components/wizard/step-feeding"
import { StepAnalysis } from "@/components/wizard/step-analysis"
import { StepVerdict } from "@/components/wizard/step-verdict"

import { AnalysisResult } from "@/lib/ai/types"

export type WizardStep = "goal" | "feeding" | "analysis" | "verdict"

export type UploadedFile = File

export type { AnalysisResult }

export function VibeLoomWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("goal")
  const [goal, setGoal] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleGoalSubmit = useCallback((goalText: string) => {
    setGoal(goalText)
    setCurrentStep("feeding")
  }, [])

  const handleFeedingComplete = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files)
    setCurrentStep("analysis")
  }, [])

  const handleAnalysisComplete = useCallback((result: AnalysisResult) => {
    setAnalysisResult(result)
    setCurrentStep("verdict")
  }, [])

  const handleReset = useCallback(() => {
    setCurrentStep("goal")
    setGoal("")
    setUploadedFiles([])
    setAnalysisResult(null)
  }, [])

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      {currentStep === "goal" && <StepGoal onSubmit={handleGoalSubmit} />}
      {currentStep === "feeding" && <StepFeeding goal={goal} onComplete={handleFeedingComplete} />}
      {currentStep === "analysis" && (
        <StepAnalysis goal={goal} files={uploadedFiles} onComplete={handleAnalysisComplete} />
      )}
      {currentStep === "verdict" && analysisResult && (
        <StepVerdict
          goal={goal}
          uploadedFiles={uploadedFiles.map((f) => f.name)}
          result={analysisResult}
          onReset={handleReset}
        />
      )}
    </main>
  )
}
