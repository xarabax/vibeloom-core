"use client"

import { useState, useEffect } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import type { MarketData, ContextData, BrainstormData } from "@/lib/types/decision-mate"
import type { DecisionBoardResult } from "@/lib/ai/services/decision-board"

interface StepAnalysisProps {
    /** Problema/obiettivo dallo Step 1 */
    goal: string
    /** File caricati (opzionali, da Step 2) */
    files: File[]
    /** Dati di mercato dallo Step 2 */
    marketData: MarketData | null
    /** Dati di contesto dallo Step 3 */
    contextData: ContextData | null
    /** Dati di brainstorming dallo Step 4 */
    brainstormData: BrainstormData | null
    /** Callback quando l'analisi è completata */
    onComplete: (result: DecisionBoardResult) => void
}

/**
 * Step 5: Analisi AI (Decision Board)
 * 
 * Invia il dilemma all'API Decision Board che esegue 3 agenti AI in parallelo.
 * Mostra un'animazione di progresso mentre gli agenti elaborano.
 */
export function StepAnalysis({ 
    goal, 
    files, 
    marketData, 
    contextData,
    brainstormData,
    onComplete 
}: StepAnalysisProps) {
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)
    const [statusMessage, setStatusMessage] = useState("Inizializzazione analisi...")

    useEffect(() => {
        const analyze = async () => {
            try {
                setError(null)
                setProgress(0)
                setStatusMessage("Preparazione dati...")

                // === COSTRUISCI IL DILEMMA ARRICCHITO ===
                let dilemma = goal

                // Aggiungi contesto dal market data
                if (marketData?.aiSummary) {
                    dilemma += `\n\nContesto di mercato:\n${marketData.aiSummary}`
                }

                // Aggiungi contesto dal context data
                if (contextData) {
                    const contextParts: string[] = []
                    if (contextData.targetAudience) {
                        contextParts.push(`Target: ${contextData.targetAudience}`)
                    }
                    if (contextData.businessModel) {
                        contextParts.push(`Business Model: ${contextData.businessModel}`)
                    }
                    if (contextData.primaryGoal) {
                        contextParts.push(`Obiettivo primario: ${contextData.primaryGoal}`)
                    }
                    if (contextData.constraints && contextData.constraints.length > 0) {
                        contextParts.push(`Vincoli: ${contextData.constraints.join(", ")}`)
                    }
                    if (contextParts.length > 0) {
                        dilemma += `\n\nContesto decisionale:\n${contextParts.join("\n")}`
                    }
                }

                // Aggiungi focus question dal brainstorming
                if (brainstormData?.focusQuestion) {
                    dilemma += `\n\nDomanda specifica del Board:\n${brainstormData.focusQuestion}`
                }

                setProgress(10)
                setStatusMessage("Invio al motore AI...")

                // === CHIAMATA API DECISION BOARD ===
                // Passa gli advisor selezionati per ottenere analisi solo da quelli
                const selectedAdvisors = brainstormData?.selectedAdvisors || ["sniper", "guardian", "vc"]
                
                const response = await fetch("/api/decision-board", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                        dilemma,
                        advisors: selectedAdvisors 
                    }),
                })

                setProgress(50)
                setStatusMessage("I 3 advisor stanno analizzando...")

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}))
                    throw new Error(errData.error || "Analisi fallita a causa di un errore del server.")
                }

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Errore durante l'analisi")
                }

                setProgress(100)
                setStatusMessage("Analisi completata!")
                
                // Piccolo delay per mostrare il completamento
                setTimeout(() => {
                    onComplete(result.data)
                }, 800)

            } catch (error) {
                console.error("Errore analisi:", error)
                setError(error instanceof Error ? error.message : "Si è verificato un errore imprevisto")
            }
        }

        // Progress visivo mentre aspettiamo
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev < 30) return prev + 2
                if (prev < 60) return prev + 1
                if (prev < 90) return prev + 0.5
                return prev
            })
        }, 150)

        if (!error) {
            analyze()
        }

        return () => clearInterval(interval)
    }, [goal, files, marketData, contextData, brainstormData, onComplete, retryCount, error])

    // === ERROR STATE ===
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4 text-center">
                    Analisi Interrotta
                </h2>
                <p className="text-muted-foreground font-sans text-center max-w-md mb-8">
                    {error}
                </p>
                <button
                    onClick={() => {
                        setError(null)
                        setRetryCount(c => c + 1)
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-background rounded hover:opacity-90 transition-opacity font-sans text-sm uppercase tracking-widest"
                >
                    <RotateCcw className="w-4 h-4" />
                    Riprova Analisi
                </button>
            </div>
        )
    }

    // === LOADING STATE ===
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
            {/* Weaving Animation */}
            <div className="relative w-64 h-64 mb-12">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-45deg)" }}>
                    {/* Horizontal lines */}
                    {[...Array(12)].map((_, i) => (
                        <line
                            key={`h-${i}`}
                            x1="0"
                            y1={8 + i * 7}
                            x2="100"
                            y2={8 + i * 7}
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="text-border"
                            style={{
                                strokeDasharray: "100",
                                strokeDashoffset: 100 - progress,
                                transition: "stroke-dashoffset 0.15s ease-out",
                            }}
                        />
                    ))}
                    {/* Vertical lines */}
                    {[...Array(12)].map((_, i) => (
                        <line
                            key={`v-${i}`}
                            x1={8 + i * 7}
                            y1="0"
                            x2={8 + i * 7}
                            y2="100"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="text-accent"
                            style={{
                                strokeDasharray: "100",
                                strokeDashoffset: 100 - progress,
                                transition: "stroke-dashoffset 0.15s ease-out",
                                transitionDelay: `${i * 30}ms`,
                            }}
                        />
                    ))}
                </svg>
            </div>

            <p className="font-serif text-2xl md:text-3xl text-foreground mb-4">
                Tessitura degli insight...
            </p>

            <p className="text-muted-foreground font-sans text-sm mb-2">
                {statusMessage}
            </p>
            
            {/* Board summary */}
            {brainstormData && brainstormData.selectedAdvisors && brainstormData.selectedAdvisors.length > 0 && (
                <p className="text-muted-foreground/60 font-sans text-xs mb-8 max-w-md text-center">
                    Il tuo Board: <span className="text-accent">
                        {brainstormData.selectedAdvisors.map(id => 
                            id === "sniper" ? "The Sniper" :
                            id === "vc" ? "The VC" :
                            id === "guardian" ? "The Guardian" :
                            "The Mentor"
                        ).join(" + ")}
                    </span>
                </p>
            )}

            {/* Progress bar */}
            <div className="w-64 h-px bg-border relative overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-accent transition-all duration-150"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="mt-4 text-muted-foreground font-sans text-xs tabular-nums">
                {Math.round(progress)}%
            </p>
        </div>
    )
}
