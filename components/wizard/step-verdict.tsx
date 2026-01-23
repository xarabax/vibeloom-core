"use client"

import { useState } from "react"
import { ArrowRight, RotateCcw, AlertTriangle, Download, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { StrategyFlowchart } from "@/components/wizard/strategy-flowchart"
import type { AnalysisResult, FlowchartNode } from "@/lib/ai/types"
import { getRiskScoreColor, getRiskScoreLabel } from "@/lib/ai/types"

interface StepVerdictProps {
    goal: string
    uploadedFiles?: string[]
    result: AnalysisResult
    onReset: () => void
}

export function StepVerdict({ goal, uploadedFiles = [], result, onReset }: StepVerdictProps) {
    const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null)
    const [showSources, setShowSources] = useState(false)
    const [showBlindSpots, setShowBlindSpots] = useState(false)

    const dossierNames =
        uploadedFiles.length > 0
            ? uploadedFiles.slice(0, 2).map((f) => f.replace(/\.[^/.]+$/, "").slice(0, 12))
            : ["Documento", "Dati"]

    // Handler per click sui nodi del flowchart (Trust Layer)
    const handleNodeClick = (node: FlowchartNode) => {
        setSelectedNode(node)
    }

    // Funzione per esportare in PDF
    const [exporting, setExporting] = useState(false)
    
    const handleExportPDF = async () => {
        try {
            setExporting(true)
            const { generateAnalysisPDF } = await import("@/lib/export-pdf")
            await generateAnalysisPDF(goal, result, `decision-mate-${Date.now()}`)
        } catch (error) {
            console.error("Esportazione fallita:", error)
            // Fallback: usa stampa browser
            alert("Esportazione PDF non disponibile. Usa Cmd+P per stampare.")
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="px-6 py-8 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-1">Analisi Completata</p>
                        <h1 className="font-serif text-xl md:text-2xl text-foreground">{goal}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm disabled:opacity-50"
                        >
                            <Download className={`w-4 h-4 ${exporting ? "animate-pulse" : ""}`} strokeWidth={1.5} />
                            {exporting ? "Esportazione..." : "Esporta"}
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
                        >
                            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                            Nuova Analisi
                        </button>
                    </div>
                </div>
            </div>

            {/* Mock Data Warning */}
            {result.isMock && (
                <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <p className="font-sans text-xs text-yellow-500 uppercase tracking-widest">
                        Modalità Simulazione (Dati Mock)
                    </p>
                </div>
            )}

            {/* Risk Score Banner (se disponibile) */}
            {typeof result.riskScore === "number" && (
                <div className="px-6 py-4 border-b border-border bg-secondary/20">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className={`font-serif text-4xl ${getRiskScoreColor(result.riskScore)}`}>
                                    {result.riskScore}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Indice di Rischio</p>
                            </div>
                            <div className="h-12 w-px bg-border" />
                            <div>
                                <p className={`font-sans text-sm font-medium ${getRiskScoreColor(result.riskScore)}`}>
                                    {getRiskScoreLabel(result.riskScore)}
                                </p>
                                {result.bottomLine && (
                                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                                        {result.bottomLine}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Risk Factors Preview */}
                        {result.riskFactors && result.riskFactors.length > 0 && (
                            <div className="hidden md:flex items-center gap-2">
                                {result.riskFactors.slice(0, 3).map((rf, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-1 text-xs rounded ${
                                            rf.severity === "Critical" ? "bg-red-500/20 text-red-400" :
                                            rf.severity === "High" ? "bg-orange-500/20 text-orange-400" :
                                            rf.severity === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                            "bg-green-500/20 text-green-400"
                                        }`}
                                    >
                                        {rf.factor.slice(0, 20)}...
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Flowchart Dinamico */}
            <div className="border-b border-border">
                <StrategyFlowchart 
                    goal={goal} 
                    dossiers={dossierNames}
                    nodes={result.nodes}
                    connections={result.connections}
                    onNodeClick={handleNodeClick}
                />
            </div>

            {/* Node Detail Panel (Trust Layer) */}
            {selectedNode && (
                <div className="px-6 py-4 bg-accent/5 border-b border-accent/20 animate-in slide-in-from-top-2 duration-300">
                    <div className="max-w-4xl mx-auto flex items-start justify-between">
                        <div>
                            <p className="text-xs text-accent uppercase tracking-widest mb-1">
                                {selectedNode.type === "origin" ? "Origine" :
                                 selectedNode.type === "document" ? "Documento" :
                                 selectedNode.type === "convergence" ? "Convergenza" :
                                 "Scenario"}
                            </p>
                            <h3 className="font-serif text-lg text-foreground">{selectedNode.label}</h3>
                            {selectedNode.description && (
                                <p className="text-sm text-muted-foreground mt-1">{selectedNode.description}</p>
                            )}
                            {selectedNode.sourceRef && (
                                <p className="text-xs text-accent mt-2 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Fonte: {selectedNode.sourceRef}
                                </p>
                            )}
                        </div>
                        <button 
                            onClick={() => setSelectedNode(null)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Split Panels */}
            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Left Panel - Strategic Insight */}
                <div className="flex-1 p-6 lg:p-12 lg:border-r border-border">
                    <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-6">Insight Strategico</p>

                    <div className="space-y-6">
                        <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
                            {result.strategicInsight}
                        </p>

                        {/* Key Metrics */}
                        <div className="pt-6 border-t border-border">
                            <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-4">Metriche Chiave</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="font-serif text-2xl text-accent">{result.keyMetrics.growthPotential}</p>
                                    <p className="font-sans text-xs text-muted-foreground">Potenziale di Crescita</p>
                                </div>
                                <div>
                                    <p className="font-serif text-2xl text-foreground">{result.keyMetrics.optimalWindow}</p>
                                    <p className="font-sans text-xs text-muted-foreground">Finestra Ottimale</p>
                                </div>
                                <div>
                                    <p className="font-serif text-2xl text-foreground">{result.keyMetrics.riskLevel}</p>
                                    <p className="font-sans text-xs text-muted-foreground">Livello di Rischio</p>
                                </div>
                                {result.keyMetrics.investmentRequired && (
                                    <div>
                                        <p className="font-serif text-2xl text-foreground">{result.keyMetrics.investmentRequired}</p>
                                        <p className="font-sans text-xs text-muted-foreground">Investimento</p>
                                    </div>
                                )}
                                {result.keyMetrics.probabilityOfSuccess && (
                                    <div>
                                        <p className="font-serif text-2xl text-accent">{result.keyMetrics.probabilityOfSuccess}</p>
                                        <p className="font-sans text-xs text-muted-foreground">Probabilità di Successo</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Source References (Collapsible) */}
                        {result.sourceReferences && result.sourceReferences.length > 0 && (
                            <div className="pt-6 border-t border-border">
                                <button
                                    onClick={() => setShowSources(!showSources)}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    <span className="font-sans text-xs uppercase tracking-widest">
                                        Riferimenti alle Fonti ({result.sourceReferences.length})
                                    </span>
                                </button>
                                {showSources && (
                                    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                        {result.sourceReferences.map((ref, idx) => (
                                            <div key={idx} className="p-3 bg-secondary/30 border border-border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-sans text-sm text-foreground">{ref.documentName}</p>
                                                    <span className={`text-xs px-2 py-0.5 ${
                                                        ref.reliability === "High" ? "bg-green-500/20 text-green-400" :
                                                        ref.reliability === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                                        "bg-red-500/20 text-red-400"
                                                    }`}>
                                                        {ref.reliability === "High" ? "Alta" : ref.reliability === "Medium" ? "Media" : "Bassa"} Affidabilità
                                                    </span>
                                                </div>
                                                <ul className="list-disc list-inside text-xs text-muted-foreground">
                                                    {ref.keyFindings.map((finding, i) => (
                                                        <li key={i}>{finding}</li>
                                                    ))}
                                                </ul>
                                                {ref.pageReferences && (
                                                    <p className="text-xs text-accent mt-2">Pagine: {ref.pageReferences.join(", ")}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Blind Spots (Collapsible) */}
                        {result.blindSpots && result.blindSpots.length > 0 && (
                            <div className="pt-6 border-t border-border">
                                <button
                                    onClick={() => setShowBlindSpots(!showBlindSpots)}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showBlindSpots ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    <span className="font-sans text-xs uppercase tracking-widest">
                                        ⚠️ Punti Ciechi ({result.blindSpots.length})
                                    </span>
                                </button>
                                {showBlindSpots && (
                                    <ul className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                        {result.blindSpots.map((spot, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <span className="text-yellow-500">•</span>
                                                {spot}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Action Scenarios */}
                <div className="flex-1 p-6 lg:p-12 bg-secondary/30">
                    <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-6">Scenari d'Azione</p>

                    <div className="space-y-6">
                        {result.actionScenarios.map((scenario, idx) => (
                            <div 
                                key={idx} 
                                className={`w-full text-left border bg-background p-6 transition-colors ${
                                    scenario.recommended ? "border-accent" : "border-border hover:border-muted-foreground"
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`font-sans text-xs uppercase tracking-widest ${
                                        scenario.recommended ? "text-accent" : "text-muted-foreground"
                                    }`}>
                                        {scenario.recommended ? "★ Raccomandato" : "Alternativa"}
                                    </span>
                                    <ArrowRight
                                        className="w-4 h-4 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <h3 className="font-serif text-xl text-foreground mb-2">{scenario.title}</h3>
                                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                                    {scenario.description}
                                </p>
                                
                                {/* Key Actions */}
                                {scenario.keyActions && scenario.keyActions.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Azioni Chiave</p>
                                        <ul className="space-y-1">
                                            {scenario.keyActions.map((action, i) => (
                                                <li key={i} className="text-xs text-foreground flex items-center gap-2">
                                                    <span className="text-accent">→</span> {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Deal Breakers */}
                                {scenario.dealBreakers && scenario.dealBreakers.length > 0 && (
                                    <div className="mt-3 p-2 bg-red-500/5 border border-red-500/20">
                                        <p className="text-xs text-red-400 uppercase tracking-widest mb-1">⚠️ Deal Breaker</p>
                                        {scenario.dealBreakers.map((db, i) => (
                                            <p key={i} className="text-xs text-red-300">{db}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-4">
                                    <span className="font-sans text-xs text-muted-foreground">Timeline: {scenario.timeline}</span>
                                    <span className="font-sans text-xs text-muted-foreground">•</span>
                                    <span className="font-sans text-xs text-muted-foreground">Investimento: {scenario.investment}</span>
                                    <span className="font-sans text-xs text-muted-foreground">•</span>
                                    <span className="font-sans text-xs text-muted-foreground">Ritorno: {scenario.returnPotential}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
