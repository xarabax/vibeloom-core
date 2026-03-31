"use client"

import { useState, useCallback } from "react"
import { StepLobby } from "./wizard/step-lobby"
import { StepDiscovery } from "./wizard/step-discovery"
import { StepBoardSession } from "./wizard/step-board-session"
import { StepFlowchart } from "./wizard/step-flowchart"
import { StepExecution } from "./wizard/step-execution"
import type { AdvisorId } from "@/lib/types/decision-mate"

export type WizardStep = "lobby" | "discovery" | "session" | "flowchart" | "execution"

export function VibeLoomWizard() {
    // Stato Globale del Flusso
    const [currentStep, setCurrentStep] = useState<WizardStep>("lobby")
    
    // Fase 1: Discovery Input
    const [discoveryInput, setDiscoveryInput] = useState<{ text: string; fileText: string; fileName: string } | null>(null)
    
    // Fase 2 -> 3: Handoff verso Premium
    const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
    const [goal, setGoal] = useState<string>("")
    const [selectedAdvisors, setSelectedAdvisors] = useState<AdvisorId[]>(["vc", "guardian", "sniper"]) // Default 3 for premium
    
    // Fase 3 -> 4: Chat History
    const [sessionMessages, setSessionMessages] = useState<any[]>([])
    
    // Fase 4 -> 5: Scenario Scelto
    const [selectedScenario, setSelectedScenario] = useState<any>(null)

    // === HANDLERS ===

    // 1. Dalla Lobby (Input Iniziale)
    const handleLobbySubmit = useCallback((text: string, fileText: string, fileName: string) => {
        setDiscoveryInput({ text, fileText, fileName })
        setCurrentStep("discovery")
    }, [])

    // 2. Dalla Discovery (Scelta Opportunità -> Handoff Premium)
    const handleOpportunitySelect = useCallback((opportunity: any) => {
        setSelectedOpportunity(opportunity)
        setGoal(`**Obiettivo Tecnico:** Implementazione di [${opportunity.title}] nell'area [${opportunity.area}].\n\n**Impatto Economico e ROI stimato:** ${opportunity.economic_impact}\n\n**Urgenza:** ${opportunity.urgency} (${opportunity.urgency_rationale})\n\n**Stack Tecnologico proposto:** ${opportunity.tech_stack?.join(", ")}\n\n**Workflow previsto:** ${opportunity.workflow}\n\n**Gap Operativo:** ${opportunity.why_it_matters}\n\n*Azione richiesta al Board:* Istruiscimi step-by-step su come procedere con le implementazioni, i costi e l'architettura.`)
        setCurrentStep("session")
    }, [])

    const handleDiscoveryBack = useCallback(() => {
        setCurrentStep("lobby")
    }, [])

    // 3. Dalla Session (Chat Premium Completata)
    const handleSessionComplete = useCallback((messages: any[]) => {
        setSessionMessages(messages)
        setCurrentStep("flowchart")
    }, [])

    // 4. Dal Flowchart (Scenario Scelto)
    const handleFlowchartComplete = useCallback((scenario: any) => {
        setSelectedScenario(scenario)
        setCurrentStep("execution")
    }, [])

    const handleFlowchartBack = useCallback(() => {
        setCurrentStep("session")
    }, [])

    const handleExecutionBack = useCallback(() => {
        setCurrentStep("flowchart")
    }, [])

    // 5. Reset Globale
    const handleReset = useCallback(() => {
        setCurrentStep("lobby")
        setDiscoveryInput(null)
        setGoal("")
        setSessionMessages([])
        setSelectedScenario(null)
        setSelectedOpportunity(null)
    }, [])

    // === INTERFACCIA WIZARD ===
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 overflow-y-auto">
                {currentStep === "lobby" && (
                    <StepLobby onSubmit={handleLobbySubmit} />
                )}

                {currentStep === "discovery" && discoveryInput && (
                    <StepDiscovery 
                        input={discoveryInput}
                        onSelectOpportunity={handleOpportunitySelect}
                        onBack={handleDiscoveryBack}
                    />
                )}

                {currentStep === "session" && (
                    <StepBoardSession 
                        mode="custom"
                        goal={goal}
                        selectedAdvisors={selectedAdvisors}
                        onComplete={handleSessionComplete}
                    />
                )}

                {currentStep === "flowchart" && (
                    <StepFlowchart
                        messages={sessionMessages}
                        goal={goal}
                        onComplete={handleFlowchartComplete}
                        onBack={handleFlowchartBack}
                    />
                )}

                {currentStep === "execution" && (
                    <StepExecution 
                        goal={goal}
                        scenario={selectedScenario}
                        onReset={handleReset} 
                    />
                )}
            </main>
        </div>
    )
}
