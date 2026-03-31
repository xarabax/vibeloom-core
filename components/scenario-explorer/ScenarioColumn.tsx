"use client"

/**
 * ScenarioColumn - Colonna verticale (Swimlane) per uno scenario
 * 
 * Contiene:
 * - Header con titolo, advisor sponsor, score
 * - Timeline verticale con nodi espandibili
 * - Outcome card in fondo
 */

import React from "react"
import { motion } from "framer-motion"
import {
    Crosshair,
    ShieldCheck,
    TrendingUp,
    Scale,
    Target,
    Zap,
    AlertTriangle,
    Gauge,
    type LucideIcon
} from "lucide-react"
import type { Scenario, ScenarioId } from "@/lib/types/scenario-explorer"
import type { AdvisorId } from "@/lib/types/decision-mate"
import { TimelineNode } from "./TimelineNode"
import { DynamicProsCons } from "./DynamicProsCons"

// ============================================================================
// ICON MAPPING
// ============================================================================

// Helper per formattazione numeri consistente (evita hydration mismatch)
function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const ADVISOR_ICONS: Record<AdvisorId, LucideIcon> = {
    sniper: Crosshair,
    vc: TrendingUp,
    guardian: ShieldCheck,
    mentor: Scale
}

const ADVISOR_NAMES: Record<AdvisorId, string> = {
    sniper: "The Sniper",
    vc: "The VC",
    guardian: "The Guardian",
    mentor: "The Mentor"
}

// ============================================================================
// PROPS
// ============================================================================

interface ScenarioColumnProps {
    scenario: Scenario
    weight: number  // 0-100
    expandedNodes: string[]
    onToggleNode: (nodeId: string) => void
    isActive?: boolean
    /** Callback quando le assunzioni di uno step cambiano */
    onStepAssumptionsChange?: (stepId: string, newAssumptions: string[]) => void
    /** Callback quando i rischi di uno step cambiano */
    onStepRisksChange?: (stepId: string, newRisks: string[]) => void
    /** Mostra Pro/Contro dinamici (default: true se editing è abilitato) */
    showDynamicProsCons?: boolean
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-medium">{value}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-300 ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    )
}

function OutcomeCard({ outcome, color }: { outcome: Scenario["outcome"], color: string }) {
    return (
        <div className={`p-4 rounded-xl border ${color} bg-card/60`}>
            <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-foreground">
                    {outcome.title}
                </h5>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {outcome.probability}% prob.
                </span>
            </div>
            <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                    <span className="text-emerald-400 flex-shrink-0">↑</span>
                    <span className="text-muted-foreground">{outcome.upside}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-red-400 flex-shrink-0">↓</span>
                    <span className="text-muted-foreground">{outcome.downside}</span>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ScenarioColumn({
    scenario,
    weight,
    expandedNodes,
    onToggleNode,
    isActive = true,
    onStepAssumptionsChange,
    onStepRisksChange,
    showDynamicProsCons
}: ScenarioColumnProps) {
    // Default: mostra pro/contro se editing è abilitato
    const shouldShowProsCons = showDynamicProsCons ?? 
        (!!onStepAssumptionsChange || !!onStepRisksChange)
    const AdvisorIcon = ADVISOR_ICONS[scenario.advisor_sponsor_id]
    const advisorName = ADVISOR_NAMES[scenario.advisor_sponsor_id]
    
    // Opacity based on weight
    const opacityClass = weight === 0 
        ? "opacity-30 grayscale pointer-events-none" 
        : weight < 20 
            ? "opacity-60" 
            : "opacity-100"
    
    return (
        <motion.div
            layout
            className={`
                flex flex-col h-full rounded-2xl border-2 overflow-hidden
                transition-all duration-300
                ${scenario.color_classes.border}
                ${opacityClass}
            `}
        >
            {/* Color Bar Top */}
            <div className={`h-1.5 ${scenario.color_classes.bg}`} />
            
            {/* Header */}
            <div className={`p-4 ${scenario.color_classes.bg} bg-opacity-20`}>
                {/* Advisor & Weight Badge */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${scenario.color_classes.bg} bg-opacity-50
                        `}>
                            <AdvisorIcon className={`w-4 h-4 ${scenario.color_classes.accent}`} />
                        </div>
                        <span className={`text-xs font-medium ${scenario.color_classes.accent}`}>
                            {advisorName}
                        </span>
                    </div>
                    
                    {weight > 0 && (
                        <span className={`
                            px-2.5 py-1 rounded-full text-xs font-bold
                            ${scenario.color_classes.bg} ${scenario.color_classes.text}
                        `}>
                            {weight}%
                        </span>
                    )}
                </div>
                
                {/* Title */}
                <h3 className="font-serif text-lg text-foreground mb-1">
                    {scenario.title}
                </h3>
                <p className="text-xs text-muted-foreground italic">
                    "{scenario.subtitle}"
                </p>
                
                {/* Score Bars */}
                <div className="mt-4 space-y-2">
                    <ScoreBar 
                        label="Velocità" 
                        value={scenario.speed_score} 
                        color="bg-emerald-500"
                    />
                    <ScoreBar 
                        label="Rischio" 
                        value={scenario.risk_score} 
                        color="bg-red-500"
                    />
                    <ScoreBar 
                        label="Scalabilità" 
                        value={scenario.scalability_score} 
                        color="bg-purple-500"
                    />
                </div>
                
                {/* Cost */}
                <div className="mt-3 text-xs text-muted-foreground">
                    Costo stimato: <span className="text-foreground font-medium">
                        €{formatNumber(scenario.total_cost_estimation)}
                    </span>
                </div>
            </div>
            
            {/* Timeline */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {scenario.steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <TimelineNode
                            step={step}
                            isExpanded={expandedNodes.includes(step.id)}
                            onToggle={() => onToggleNode(step.id)}
                            accentColor={scenario.color_classes.accent}
                            onAssumptionsChange={onStepAssumptionsChange}
                            onRisksChange={onStepRisksChange}
                            isEditable={!!onStepAssumptionsChange || !!onStepRisksChange}
                        />
                        
                        {/* Connector line */}
                        {idx < scenario.steps.length - 1 && (
                            <div className="flex justify-center">
                                <div className={`
                                    w-0.5 h-6 rounded-full
                                    ${scenario.color_classes.bg} bg-opacity-30
                                `} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            
            {/* Dynamic Pro/Contro */}
            {shouldShowProsCons && (
                <div className="p-4 border-t border-border/30">
                    <DynamicProsCons scenario={scenario} />
                </div>
            )}
            
            {/* Outcome */}
            <div className="p-4 border-t border-border/30">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Outcome
                </p>
                <OutcomeCard 
                    outcome={scenario.outcome} 
                    color={scenario.color_classes.border}
                />
            </div>
        </motion.div>
    )
}
