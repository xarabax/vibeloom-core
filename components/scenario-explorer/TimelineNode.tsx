"use client"

/**
 * TimelineNode - Singolo step nella timeline di uno scenario
 * 
 * Stato collapsed: mostra solo titolo e fase
 * Stato expanded: mostra tutti i dettagli Decision-Grade
 * 
 * Features:
 * - Editing inline di Assunzioni e Rischi
 * - Combobox con suggerimenti categorizzati
 */

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Undo2,
    Lightbulb,
    Flag,
    type LucideIcon
} from "lucide-react"
import type { TimelineStep, EvidenceLevel, Reversibility } from "@/lib/types/scenario-explorer"
import { getEvidenceLevelColor, getReversibilityColor } from "@/lib/types/scenario-explorer"
import { EditableChipList } from "./EditableChipList"
import { SUGGESTED_TAGS } from "@/lib/constants/decisionTags"

// ============================================================================
// PROPS
// ============================================================================

interface TimelineNodeProps {
    step: TimelineStep
    isExpanded: boolean
    onToggle: () => void
    accentColor: string  // Tailwind color class
    isHighlighted?: boolean
    /** Callback quando le assunzioni cambiano */
    onAssumptionsChange?: (stepId: string, newAssumptions: string[]) => void
    /** Callback quando i rischi cambiano */
    onRisksChange?: (stepId: string, newRisks: string[]) => void
    /** Abilita editing (default: true) */
    isEditable?: boolean
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PhaseLabel({ phase }: { phase: TimelineStep["phase"] }) {
    const config = {
        Immediate: { label: "Oggi", color: "text-emerald-400" },
        "Short-term": { label: "1-3 mesi", color: "text-amber-400" },
        "Long-term": { label: "6+ mesi", color: "text-purple-400" }
    }
    
    const { label, color } = config[phase]
    
    return (
        <span className={`text-xs font-medium uppercase tracking-wider ${color}`}>
            {label}
        </span>
    )
}

function EvidenceBadge({ level }: { level: EvidenceLevel }) {
    const colorClass = getEvidenceLevelColor(level)
    const icons: Record<EvidenceLevel, LucideIcon> = {
        High: CheckCircle,
        Medium: Lightbulb,
        Low: AlertTriangle
    }
    const Icon = icons[level]
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            <Icon className="w-3 h-3" />
            Evidenza {level}
        </span>
    )
}

function ReversibilityBadge({ reversibility }: { reversibility: Reversibility }) {
    const colorClass = getReversibilityColor(reversibility)
    const isReversible = reversibility === "High (Type 2)"
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            <Undo2 className={`w-3 h-3 ${isReversible ? "" : "opacity-50"}`} />
            {isReversible ? "Reversibile" : "Irreversibile"}
        </span>
    )
}

function ChipList({ items, icon: Icon, color }: { 
    items: string[], 
    icon: LucideIcon,
    color: string 
}) {
    if (items.length === 0) return null
    
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item, idx) => (
                <span 
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${color}`}
                >
                    <Icon className="w-2.5 h-2.5" />
                    {item}
                </span>
            ))}
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TimelineNode({ 
    step, 
    isExpanded, 
    onToggle, 
    accentColor,
    isHighlighted = false,
    onAssumptionsChange,
    onRisksChange,
    isEditable = true
}: TimelineNodeProps) {
    return (
        <motion.div
            layout
            className={`
                relative w-full rounded-xl border transition-all duration-200
                ${isExpanded 
                    ? "bg-card/80 border-accent/50 shadow-lg" 
                    : "bg-card/40 border-border/50 hover:border-border"
                }
                ${isHighlighted ? "ring-2 ring-accent/50" : ""}
            `}
        >
            {/* Collapsed Header - Always Visible */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                {/* Phase indicator */}
                <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isExpanded ? "bg-accent/20" : "bg-muted/50"}
                `}>
                    {step.is_checkpoint ? (
                        <Flag className={`w-5 h-5 ${accentColor}`} />
                    ) : (
                        <Clock className={`w-5 h-5 ${isExpanded ? accentColor : "text-muted-foreground"}`} />
                    )}
                </div>
                
                {/* Title & Phase */}
                <div className="flex-1 min-w-0">
                    <PhaseLabel phase={step.phase} />
                    <h4 className={`
                        font-medium text-sm mt-0.5 truncate
                        ${isExpanded ? "text-foreground" : "text-foreground/80"}
                    `}>
                        {step.action}
                    </h4>
                </div>
                
                {/* Expand/Collapse icon */}
                <div className="flex-shrink-0">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
            </button>
            
            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                            
                            {/* Description */}
                            {step.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            )}
                            
                            {/* Decision-Grade Badges */}
                            <div className="flex flex-wrap gap-2">
                                <EvidenceBadge level={step.evidence_level} />
                                <ReversibilityBadge reversibility={step.reversibility} />
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    Segnale in {step.time_to_signal}
                                </span>
                            </div>
                            
                            {/* Assumptions - Editable */}
                            <div className="space-y-1.5">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Assunzioni
                                </p>
                                {isEditable && onAssumptionsChange ? (
                                    <EditableChipList
                                        type="assumptions"
                                        values={step.assumptions}
                                        suggestions={SUGGESTED_TAGS.assumptions}
                                        onChange={(newValues) => onAssumptionsChange(step.id, newValues)}
                                        chipColor="bg-blue-950/50 text-blue-300 border-blue-700/50"
                                        chipIcon={Lightbulb}
                                        placeholder="Cerca assunzione..."
                                    />
                                ) : (
                                    <ChipList 
                                        items={step.assumptions} 
                                        icon={Lightbulb}
                                        color="bg-blue-950/50 text-blue-300"
                                    />
                                )}
                            </div>
                            
                            {/* Risks - Editable */}
                            <div className="space-y-1.5">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Rischi
                                </p>
                                {isEditable && onRisksChange ? (
                                    <EditableChipList
                                        type="risks"
                                        values={step.risks}
                                        suggestions={SUGGESTED_TAGS.risks}
                                        onChange={(newValues) => onRisksChange(step.id, newValues)}
                                        chipColor="bg-red-950/50 text-red-300 border-red-700/50"
                                        chipIcon={AlertTriangle}
                                        placeholder="Cerca rischio..."
                                    />
                                ) : (
                                    <ChipList 
                                        items={step.risks} 
                                        icon={AlertTriangle}
                                        color="bg-red-950/50 text-red-300"
                                    />
                                )}
                            </div>
                            
                            {/* Cost & Effort */}
                            {(step.cost_estimate || step.effort) && (
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    {step.cost_estimate && (
                                        <span>Costo: <span className="text-foreground">{step.cost_estimate}</span></span>
                                    )}
                                    {step.effort && (
                                        <span>Effort: <span className="text-foreground capitalize">{step.effort}</span></span>
                                    )}
                                </div>
                            )}
                            
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Checkpoint indicator */}
            {step.is_checkpoint && (
                <div className={`
                    absolute -left-2 top-1/2 -translate-y-1/2 
                    w-4 h-4 rounded-full border-2 border-background
                    ${accentColor.replace("text-", "bg-")}
                `} />
            )}
        </motion.div>
    )
}
