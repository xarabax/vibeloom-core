"use client"

import { useState, useEffect } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import type { AnalysisResult } from "@/lib/ai/types"
import type { MarketData, ContextData } from "@/lib/types/decision-mate"

interface StepAnalysisProps {
    /** Problema/obiettivo dallo Step 1 */
    goal: string
    /** File caricati (opzionali, da Step 2) */
    files: File[]
    /** Dati di mercato dallo Step 2 */
    marketData: MarketData | null
    /** Dati di contesto dallo Step 3 */
    contextData: ContextData | null
    /** Callback quando l'analisi è completata */
    onComplete: (result: AnalysisResult) => void
}

/**
 * Step 4: Analisi AI
 * 
 * Invia tutti i dati raccolti (problema, market data, context) all'API
 * e mostra un'animazione di progresso mentre l'AI elabora.
 */
export function StepAnalysis({ 
    goal, 
    files, 
    marketData, 
    contextData, 
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

                // === COSTRUISCI FORMDATA CON TUTTI I DATI ===
                const formData = new FormData()
                
                // Step 1: Problema
                formData.append("goal", goal)
                
                // Step 2: Market Data
                if (marketData) {
                    if (marketData.source === "ai-generated" && marketData.aiSummary) {
                        formData.append("marketSummary", marketData.aiSummary)
                    }
                    // I file sono già in `files`
                }
                
                // Step 2: Files
                files.forEach((file) => {
                    formData.append("files", file)
                })
                
                // Step 3: Context Data (serializzato come JSON)
                if (contextData) {
                    formData.append("contextData", JSON.stringify(contextData))
                }

                setProgress(10)
                setStatusMessage("Invio al motore AI...")

                // === CHIAMATA API ===
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    body: formData,
                })

                setProgress(50)
                setStatusMessage("L'AI sta analizzando la tua decisione...")

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}))
                    throw new Error(errData.error || "Analisi fallita a causa di un errore del server.")
                }

                const result = await response.json()

                setProgress(100)
                setStatusMessage("Analisi completata!")
                
                // Piccolo delay per mostrare il completamento
                setTimeout(() => {
                    onComplete(result)
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
    }, [goal, files, marketData, contextData, onComplete, retryCount, error])

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
            
            {/* Context summary */}
            {contextData && (
                <p className="text-muted-foreground/60 font-sans text-xs mb-8 max-w-md text-center">
                    Ottimizzazione per <span className="text-accent">{
                        contextData.primaryGoal === "profit" ? "profitto" :
                        contextData.primaryGoal === "growth" ? "crescita" :
                        contextData.primaryGoal === "retention" ? "retention" :
                        contextData.primaryGoal === "speed" ? "velocità" :
                        "qualità"
                    }</span>
                    {contextData.constraints.length > 0 && (
                        <> con {contextData.constraints.length} vincol{contextData.constraints.length > 1 ? 'i' : 'o'}</>
                    )}
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
