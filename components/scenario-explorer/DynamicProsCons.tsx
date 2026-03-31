"use client"

/**
 * DynamicProsCons - Visualizza Pro/Contro calcolati dinamicamente
 * 
 * Si aggiorna quando l'utente modifica assunzioni e rischi negli step.
 */

import React, { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ThumbsUp,
    ThumbsDown,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
    Gauge
} from "lucide-react"
import type { Scenario } from "@/lib/types/scenario-explorer"
import { evaluateScenario, type ScenarioEvaluation } from "@/lib/scenario-engine/impact-calculator"

// ============================================================================
// PROPS
// ============================================================================

interface DynamicProsConsProps {
    scenario: Scenario
    showDelta?: boolean  // Mostra variazioni rispetto all'originale
    compact?: boolean    // Versione compatta per inline
}

// ============================================================================
// DELTA INDICATOR
// ============================================================================

function DeltaIndicator({ value, label, inverse = false }: { 
    value: number, 
    label: string,
    inverse?: boolean  // Se true, valori negativi sono buoni (es. costo)
}) {
    const isPositive = inverse ? value < 0 : value > 0
    const isNegative = inverse ? value > 0 : value < 0
    const isNeutral = value === 0
    
    return (
        <div className={`
            flex items-center gap-1 px-2 py-1 rounded-md text-xs
            ${isPositive ? "bg-emerald-950/50 text-emerald-400" : ""}
            ${isNegative ? "bg-red-950/50 text-red-400" : ""}
            ${isNeutral ? "bg-muted/50 text-muted-foreground" : ""}
        `}>
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isNeutral && <Minus className="w-3 h-3" />}
            <span>{label}: {value > 0 ? "+" : ""}{value}</span>
        </div>
    )
}

// ============================================================================
// CONFIDENCE GAUGE
// ============================================================================

function ConfidenceGauge({ score }: { score: number }) {
    const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"
    const bgColor = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
    
    return (
        <div className="flex items-center gap-2">
            <Gauge className={`w-4 h-4 ${color}`} />
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all ${bgColor}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={`text-xs font-medium ${color}`}>{score}%</span>
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DynamicProsCons({ 
    scenario, 
    showDelta = true,
    compact = false 
}: DynamicProsConsProps) {
    // Calcola valutazione dinamica
    const evaluation = useMemo(() => evaluateScenario(scenario), [scenario])
    
    const { pros_cons, delta_from_original, adjusted_scores } = evaluation
    
    // Controlla se ci sono cambiamenti significativi
    const hasChanges = Object.values(delta_from_original).some(v => Math.abs(v) > 0)
    
    if (compact) {
        return (
            <div className="space-y-2">
                {/* Mini Pro/Contro */}
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1 text-emerald-400">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{pros_cons.pros.length} Pro</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                        <ThumbsDown className="w-3 h-3" />
                        <span>{pros_cons.cons.length} Contro</span>
                    </div>
                    {pros_cons.warnings.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-400">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{pros_cons.warnings.length} Alert</span>
                        </div>
                    )}
                </div>
                
                {/* Confidence */}
                <ConfidenceGauge score={pros_cons.confidence_score} />
            </div>
        )
    }
    
    return (
        <motion.div
            layout
            className="space-y-4 p-4 bg-card/50 rounded-xl border border-border/50"
        >
            {/* Header con Confidence */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                    Valutazione Dinamica
                </h4>
                <div className="w-32">
                    <ConfidenceGauge score={pros_cons.confidence_score} />
                </div>
            </div>
            
            {/* Delta Scores (se ci sono cambiamenti) */}
            {showDelta && hasChanges && (
                <div className="flex flex-wrap gap-2">
                    <DeltaIndicator 
                        value={delta_from_original.speed} 
                        label="Speed" 
                    />
                    <DeltaIndicator 
                        value={delta_from_original.risk} 
                        label="Risk" 
                        inverse={true}  // Meno rischio è meglio
                    />
                    <DeltaIndicator 
                        value={delta_from_original.scalability} 
                        label="Scale" 
                    />
                    {delta_from_original.cost_percent !== 0 && (
                        <DeltaIndicator 
                            value={delta_from_original.cost_percent} 
                            label="Costo" 
                            inverse={true}  // Meno costo è meglio
                        />
                    )}
                </div>
            )}
            
            {/* Warnings */}
            <AnimatePresence>
                {pros_cons.warnings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5"
                    >
                        {pros_cons.warnings.map((warning, idx) => (
                            <div 
                                key={idx}
                                className="flex items-center gap-2 px-3 py-2 bg-amber-950/30 border border-amber-700/30 rounded-lg"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span className="text-xs text-amber-200">{warning}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Pro/Contro Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* PRO */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Pro</span>
                    </div>
                    <ul className="space-y-1.5">
                        {pros_cons.pros.length > 0 ? (
                            pros_cons.pros.map((pro, idx) => (
                                <li 
                                    key={idx}
                                    className="text-xs text-muted-foreground pl-5 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500/50"
                                >
                                    {pro}
                                </li>
                            ))
                        ) : (
                            <li className="text-xs text-muted-foreground italic">
                                Nessun pro identificato
                            </li>
                        )}
                    </ul>
                </div>
                
                {/* CONTRO */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-red-400">
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Contro</span>
                    </div>
                    <ul className="space-y-1.5">
                        {pros_cons.cons.length > 0 ? (
                            pros_cons.cons.map((con, idx) => (
                                <li 
                                    key={idx}
                                    className="text-xs text-muted-foreground pl-5 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500/50"
                                >
                                    {con}
                                </li>
                            ))
                        ) : (
                            <li className="text-xs text-muted-foreground italic">
                                Nessun contro identificato
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </motion.div>
    )
}
