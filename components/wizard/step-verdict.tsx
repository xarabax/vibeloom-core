"use client"

/**
 * Step Verdict - Executive Summary
 * 
 * Versione finale testuale, pulita e professionale.
 * Mostra la strategia approvata come un documento "ready to share".
 */

import { useState } from "react"
import { 
    Download, 
    Share2,
    RotateCcw,
    CheckSquare,
    AlertTriangle,
    Lightbulb,
    FileText,
    Send
} from "lucide-react"
import type { Scenario } from "@/lib/types/scenario-explorer"
import type { AgentAnalysis } from "@/lib/ai/services/decision-board"

// ============================================================================
// PROPS
// ============================================================================

interface StepVerdictProps {
    /** Problema originale */
    goal: string
    /** Scenario approvato dal builder */
    selectedScenario: Scenario
    /** Agent analysis originale (opzionale, per mantenere contesto storico) */
    originalAgentAnalysis?: AgentAnalysis
    /** Tutti i risultati degli agenti (opzionale) */
    allAgents?: AgentAnalysis[]
    /** Callback per reset wizard */
    onReset: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepVerdict({ 
    goal, 
    selectedScenario,
    onReset 
}: StepVerdictProps) {
    const [exporting, setExporting] = useState(false)
    const [sending, setSending] = useState(false)

    // Estrai azioni dalle prime fasi (Immediate + Short-term)
    const actionPlan = selectedScenario.steps
        .filter(s => s.phase === "Immediate" || s.phase === "Short-term")
        .slice(0, 6) // Max 6 item per pulizia

    // Aggrega rischi e assunzioni da tutti gli step + quelli globali utente
    // (De-duplicazione semplice tramite Set)
    const allRisks = Array.from(new Set([
        ...(selectedScenario.user_cons || []),
        ...selectedScenario.steps.flatMap(s => s.risks)
    ])).slice(0, 5)

    const allAssumptions = Array.from(new Set([
        ...(selectedScenario.user_pros || []), // Usiamo i pro come proxy per "buone *assunzioni* che devono avverarsi"? O meglio solo assumptions
        ...selectedScenario.steps.flatMap(s => s.assumptions)
    ])).slice(0, 5)

    // Gestione Export PDF (simulato)
    const handleExportPDF = async () => {
        setExporting(true)
        // Simulazione delay
        await new Promise(r => setTimeout(r, 1500))
        window.print()
        setExporting(false)
    }

    // Gestione Invia al Team (simulato)
    const handleSendToTeam = async () => {
        setSending(true)
        await new Promise(r => setTimeout(r, 1000))
        alert("Report inviato al team con successo!")
        setSending(false)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background animate-in fade-in duration-500">
            {/* Header Executive */}
            <div className="border-b border-border bg-card/30">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-start justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                    Strategia Approvata
                                </span>
                                <span className="text-muted-foreground text-xs uppercase tracking-widest">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
                                {selectedScenario.title}
                            </h1>
                            <p className="text-muted-foreground font-sans max-w-2xl text-lg">
                                Risposta strategica al dilemma: <span className="text-foreground italic">"{goal}"</span>
                            </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="
                                    flex items-center gap-2 px-4 py-2 rounded-lg
                                    bg-muted/50 text-foreground border border-border
                                    hover:bg-muted transition-colors text-sm font-medium
                                    disabled:opacity-50
                                "
                            >
                                <Download className={`w-4 h-4 ${exporting ? "animate-bounce" : ""}`} />
                                {exporting ? "Esportazione..." : "PDF"}
                            </button>
                            <button
                                onClick={handleSendToTeam}
                                disabled={sending}
                                className="
                                    flex items-center gap-2 px-4 py-2 rounded-lg
                                    bg-foreground text-background
                                    hover:bg-foreground/90 transition-colors text-sm font-medium
                                    disabled:opacity-50
                                "
                            >
                                <Send className={`w-4 h-4 ${sending ? "animate-pulse" : ""}`} />
                                {sending ? "Invio..." : "Invia al Team"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - 2 Columns */}
            <div className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
                
                {/* SX: Action Plan */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-foreground">
                            <CheckSquare className="w-5 h-5 text-accent" />
                            <h2 className="font-serif text-2xl">Action Plan Immediato</h2>
                        </div>
                        
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="divide-y divide-border">
                                {actionPlan.length > 0 ? (
                                    actionPlan.map((step, idx) => (
                                        <div key={idx} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors group">
                                            <div className="mt-1 w-5 h-5 rounded border border-muted-foreground/30 flex items-center justify-center group-hover:border-accent transition-colors">
                                                <div className="w-3 h-3 rounded-sm bg-transparent group-hover:bg-accent/20" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-foreground text-base">
                                                    {step.action}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                    {step.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                                        {step.phase === "Immediate" ? "Subito" : "Entro 3 mesi"}
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                        Owner: TBD
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        Nessuna azione definita per il breve termine.
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-muted/20 border-t border-border text-center">
                                <span className="text-xs text-muted-foreground">
                                    + {Math.max(0, selectedScenario.steps.length - actionPlan.length)} altre azioni a lungo termine
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-muted/20 border border-border text-center">
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Timeline</div>
                            <div className="text-xl font-serif text-foreground">t+3 Mesi</div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/20 border border-border text-center">
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Budget</div>
                            <div className="text-xl font-serif text-foreground">€15k</div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/20 border border-border text-center">
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Confidence</div>
                            <div className="text-xl font-serif text-emerald-500">High</div>
                        </div>
                    </div>
                </div>

                {/* DX: Guardrails (Risks & Assumptions) */}
                <div className="space-y-8">
                    
                    {/* Premortem / Rischi */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            <h3 className="font-serif text-xl">Premortem (Rischi)</h3>
                        </div>
                        <ul className="space-y-3">
                            {allRisks.length > 0 ? (
                                allRisks.map((risk, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                                        <span>{risk}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-muted-foreground italic">Nessun rischio evidenziato.</li>
                            )}
                        </ul>
                    </div>

                    {/* Assunzioni Chiave */}
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-blue-500">
                            <Lightbulb className="w-5 h-5" />
                            <h3 className="font-serif text-xl">Assunzioni Chiave</h3>
                        </div>
                        <ul className="space-y-3">
                            {allAssumptions.length > 0 ? (
                                allAssumptions.map((ass, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                        <span>{ass}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-muted-foreground italic">Nessuna assunzione chiare.</li>
                            )}
                        </ul>
                    </div>
                    
                    {/* Document details */}
                    <div className="p-4 rounded-xl bg-muted/10 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">Formato</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Questo verdetto è generato automaticamente basandosi sullo scenario <strong>{selectedScenario.id}</strong>.
                        </p>
                    </div>

                </div>
            </div>
            
            {/* Footer Reset */}
            <div className="py-8 text-center border-t border-border mt-auto">
                <button
                    onClick={onReset}
                    className="
                        inline-flex items-center gap-2 px-6 py-3
                        text-muted-foreground hover:text-foreground transition-colors
                        font-sans text-sm
                    "
                >
                    <RotateCcw className="w-4 h-4" />
                    Inizia nuoava analisi
                </button>
            </div>
        </div>
    )
}

