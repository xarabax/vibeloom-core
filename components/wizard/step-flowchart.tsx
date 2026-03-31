"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, GitBranch, Shield, Zap, Target, Loader2, CheckCircle2 } from "lucide-react"

export interface Scenario {
    id: string
    type: "Conservativo" | "Bilanciato" | "Aggressivo" | string
    title: string
    description: string
    riskLevel: string
    investment: string
    timeline: string
}

interface StepFlowchartProps {
    messages?: any[]
    goal?: string
    onComplete: (selectedScenario: Scenario) => void
    onBack: () => void
}

export function StepFlowchart({ messages = [], goal = "", onComplete, onBack }: StepFlowchartProps) {
    const [scenarios, setScenarios] = useState<Scenario[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const fetched = useRef(false)

    useEffect(() => {
        if (fetched.current) return
        fetched.current = true

        const generateFlowchart = async () => {
            try {
                const res = await fetch("/api/generate-flowchart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages, goal })
                })
                const data = await res.json()
                
                if (data.scenarios) {
                    setScenarios(data.scenarios)
                    if (data.mock) setError("Rete instabile. Visualizzazione di scenari standard.")
                } else {
                    throw new Error("Formato json inaspettato dal server")
                }
            } catch (err) {
                console.error(err)
                setError("Impossibile contattare l'intelligenza artificiale.")
            } finally {
                setIsLoading(false)
            }
        }

        generateFlowchart()
    }, [messages, goal])

    const getIconForType = (type: string) => {
        const t = type.toLowerCase()
        if (t.includes('conservativo')) return <Shield className="w-6 h-6" />
        if (t.includes('aggressivo')) return <Zap className="w-6 h-6" />
        return <Target className="w-6 h-6" />
    }

    const getColorForType = (type: string, isSelected: boolean) => {
        const t = type.toLowerCase()
        if (t.includes('conservativo')) {
            return isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500/30 hover:border-blue-500/60 bg-card/60'
        }
        if (t.includes('aggressivo')) {
            return isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500/30 hover:border-orange-500/60 bg-card/60'
        }
        return isSelected ? 'border-primary bg-primary/10' : 'border-primary/30 hover:border-primary/60 bg-card/60'
    }

    const handleConfirm = () => {
        if (!selectedId) return
        const selectedScenario = scenarios.find(s => s.id === selectedId)
        if (selectedScenario) {
            onComplete(selectedScenario)
        }
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-[70vh] max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in zoom-in-95 duration-700">
            
            {/* Header */}
            <div className="text-center space-y-4 w-full max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <GitBranch className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    La Mappa Decisionali
                </h1>
                <p className="text-lg text-muted-foreground">
                    Il Board ha sintetizzato la riunione in 3 strade strategiche. Seleziona l'approccio che vuoi trasformare nel Verbale Esecutivo.
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm font-medium px-4 py-2 rounded-md">
                    ⚠️ {error}
                </div>
            )}

            {/* Scenarios Grid */}
            <div className={`w-full ${isLoading ? 'min-h-[300px] flex items-center justify-center' : 'grid md:grid-cols-3 gap-6'} mt-8`}>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <h3 className="text-xl font-medium text-muted-foreground">Analisi incrociata delle opinioni in corso...</h3>
                    </div>
                ) : (
                    scenarios.map((scenario) => {
                        const isSelected = selectedId === scenario.id;
                        
                        return (
                            <div 
                                key={scenario.id}
                                onClick={() => setSelectedId(scenario.id)}
                                className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden group flex flex-col ${getColorForType(scenario.type, isSelected)}`}
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute top-4 right-4 text-primary bg-background rounded-full">
                                        <CheckCircle2 className="w-6 h-6 fill-primary text-background" />
                                    </div>
                                )}
                                
                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center space-x-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                            {getIconForType(scenario.type)}
                                            <span className="font-semibold uppercase tracking-wider text-sm">{scenario.type}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold leading-tight">{scenario.title}</h3>
                                        <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                                            {scenario.description}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-auto space-y-3 pt-6 border-t border-border/50">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Rischio</span>
                                            <span className="font-bold flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    scenario.riskLevel.toLowerCase().includes('alto') ? 'bg-red-500' :
                                                    scenario.riskLevel.toLowerCase().includes('medi') ? 'bg-yellow-500' : 'bg-green-500'
                                                }`} />
                                                {scenario.riskLevel}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Investimento</span>
                                            <span className="font-bold">{scenario.investment}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Time to Market</span>
                                            <span className="font-bold">{scenario.timeline}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full pt-12 max-w-4xl mx-auto gap-4">
                <Button variant="ghost" onClick={onBack} className="w-full md:w-auto h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Torna al Board
                </Button>
                <Button 
                    size="lg" 
                    onClick={handleConfirm}
                    disabled={!selectedId || isLoading}
                    className="w-full md:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20"
                >
                    Genera Verbale Esecutivo <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    )
}
