"use client"

/**
 * Step Decision Board
 * 
 * Visualizza i risultati dei 3 agenti AI come card verticali.
 * L'utente può selezionare uno scenario per procedere al verdetto finale.
 * 
 * Wrapper che integra DecisionResultCards nel flusso wizard.
 */

import React from "react"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { DecisionResultCards } from "@/components/decision-board/DecisionResultCards"
import type { AgentAnalysis, AgentRole } from "@/lib/ai/services/decision-board"

// ============================================================================
// PROPS
// ============================================================================

interface StepDecisionBoardProps {
    /** Risultati dell'analisi dei 3 agenti */
    results: AgentAnalysis[]
    /** Callback quando l'utente seleziona uno scenario */
    onSelectScenario: (role: AgentRole) => void
    /** Callback per tornare indietro */
    onBack?: () => void
    /** Callback per ripetere l'analisi */
    onRetry?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepDecisionBoard({ 
    results, 
    onSelectScenario, 
    onBack,
    onRetry 
}: StepDecisionBoardProps) {
    // Verifica se ci sono errori (tutti gli agenti hanno score 0)
    const hasErrors = results.every(r => r.score === 0)

    return (
        <div className="min-h-screen flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header con navigazione */}
            <div className="px-6 pt-8 pb-4 flex justify-between items-center max-w-6xl mx-auto w-full">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="
                            flex items-center gap-2 px-4 py-2 
                            border border-border text-foreground/70
                            font-sans text-xs uppercase tracking-widest 
                            hover:border-accent hover:text-foreground
                            transition-colors rounded
                        "
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Indietro
                    </button>
                )}
                
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="
                            flex items-center gap-2 px-4 py-2 
                            border border-border text-foreground/70
                            font-sans text-xs uppercase tracking-widest 
                            hover:border-accent hover:text-foreground
                            transition-colors rounded ml-auto
                        "
                    >
                        <RefreshCw className="w-3 h-3" />
                        Rianalizza
                    </button>
                )}
            </div>

            {/* Error state */}
            {hasErrors ? (
                <div className="flex-1 flex items-center justify-center px-6">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="font-serif text-xl text-foreground mb-3">
                            Analisi non riuscita
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Si è verificato un errore durante l'analisi. 
                            Potrebbe essere un problema temporaneo con l'API.
                        </p>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="
                                    px-6 py-3 bg-accent text-background
                                    font-sans text-sm uppercase tracking-widest 
                                    hover:bg-accent/90 transition-colors rounded
                                "
                            >
                                Riprova
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* Decision Board Cards */
                <DecisionResultCards 
                    results={results}
                    onSelectAgent={onSelectScenario}
                />
            )}

            {/* Step indicator */}
            <div className="px-6 pb-8 text-center">
                <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest">
                    Passo 6 di 9 — Decision Board
                </p>
            </div>
        </div>
    )
}
