"use client"

/**
 * Step: Assembla il tuo Board
 * 
 * L'utente seleziona 2-3 advisor AI che sfideranno la sua idea.
 * Design "Character Select" per creare connessione emotiva con le personalità.
 * 
 * Testi studiati per ridurre i bias cognitivi (metodo Girardiano).
 */

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Crosshair, 
    TrendingUp, 
    ShieldAlert,
    Scale,
    Users,
    ArrowRight,
    ArrowLeft,
    Check,
    Sparkles,
    type LucideIcon
} from "lucide-react"
import type { AdvisorId, BrainstormData, AdvisorConfig } from "@/lib/types/decision-mate"
import { ADVISORS } from "@/lib/types/decision-mate"

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
    Crosshair,
    TrendingUp,
    ShieldAlert,
    Scale
}

// ============================================================================
// PROPS
// ============================================================================

interface StepBrainstormProps {
    /** Problema dallo Step 1 */
    problem: string
    /** Callback quando l'utente completa lo step */
    onComplete: (data: BrainstormData) => void
    /** Callback per tornare indietro */
    onBack?: () => void
}

// ============================================================================
// ADVISOR CARD COMPONENT
// ============================================================================

interface AdvisorCardProps {
    advisor: AdvisorConfig
    isSelected: boolean
    selectionOrder: number | null
    onToggle: () => void
    disabled: boolean
}

function AdvisorCard({ advisor, isSelected, selectionOrder, onToggle, disabled }: AdvisorCardProps) {
    const Icon = ICON_MAP[advisor.iconName] || Sparkles

    return (
        <motion.button
            onClick={onToggle}
            disabled={disabled && !isSelected}
            whileHover={!disabled || isSelected ? { scale: 1.02, y: -4 } : {}}
            whileTap={!disabled || isSelected ? { scale: 0.98 } : {}}
            className={`
                relative w-full text-left p-6 rounded-2xl border-2 
                transition-all duration-300 ease-out
                ${isSelected 
                    ? `${advisor.colorClasses} border-opacity-100 shadow-2xl shadow-black/50` 
                    : disabled 
                        ? "bg-muted/20 border-border/50 opacity-50 cursor-not-allowed"
                        : "bg-card/50 border-border hover:border-muted-foreground hover:bg-card"
                }
            `}
        >
            {/* Selection Badge */}
            <AnimatePresence>
                {isSelected && selectionOrder !== null && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg"
                    >
                        <span className="text-background font-bold text-sm">
                            {selectionOrder}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header: Icon + Title + Role */}
            <div className="flex items-start gap-4 mb-4">
                <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isSelected ? "bg-white/10" : "bg-muted/50"}
                    transition-colors duration-300
                `}>
                    <Icon 
                        className={`w-7 h-7 ${isSelected ? "text-current" : "text-muted-foreground"}`}
                        strokeWidth={1.5}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`
                        font-serif text-xl font-medium mb-1
                        ${isSelected ? "text-current" : "text-foreground"}
                    `}>
                        {advisor.title}
                    </h3>
                    <p className={`
                        text-sm font-medium uppercase tracking-wider
                        ${isSelected ? "text-current opacity-70" : "text-muted-foreground"}
                    `}>
                        {advisor.role}
                    </p>
                </div>
            </div>

            {/* Description - Voce in prima persona */}
            <p className={`
                text-sm leading-relaxed mb-4 font-sans
                ${isSelected ? "text-current opacity-90" : "text-muted-foreground"}
            `}>
                "{advisor.description}"
            </p>

            {/* Badge */}
            <div className="flex items-center justify-between">
                <span className={`
                    inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                    ${isSelected 
                        ? "bg-white/20 text-current" 
                        : "bg-muted text-muted-foreground"
                    }
                `}>
                    {advisor.badge}
                </span>

                {/* Selection indicator */}
                <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200
                    ${isSelected 
                        ? "bg-accent border-accent" 
                        : "border-muted-foreground/30"
                    }
                `}>
                    {isSelected && <Check className="w-4 h-4 text-background" strokeWidth={3} />}
                </div>
            </div>
        </motion.button>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StepBrainstorm({ problem, onComplete, onBack }: StepBrainstormProps) {
    const [selectedAdvisors, setSelectedAdvisors] = useState<AdvisorId[]>([])
    const [focusQuestion, setFocusQuestion] = useState("")

    const MAX_SELECTION = 3
    const MIN_SELECTION = 2

    // Toggle selezione advisor
    const toggleAdvisor = (advisorId: AdvisorId) => {
        setSelectedAdvisors(prev => {
            if (prev.includes(advisorId)) {
                // Rimuovi se già selezionato
                return prev.filter(id => id !== advisorId)
            } else if (prev.length < MAX_SELECTION) {
                // Aggiungi se sotto il limite
                return [...prev, advisorId]
            }
            return prev
        })
    }

    // Ordine di selezione per un advisor
    const getSelectionOrder = (advisorId: AdvisorId): number | null => {
        const index = selectedAdvisors.indexOf(advisorId)
        return index >= 0 ? index + 1 : null
    }

    // Validazione
    const canProceed = selectedAdvisors.length >= MIN_SELECTION

    // Submit
    const handleSubmit = () => {
        if (canProceed) {
            onComplete({
                selectedAdvisors,
                focusQuestion: focusQuestion.trim() || undefined
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 mb-4"
                >
                    <Users className="w-5 h-5 text-accent" strokeWidth={1.5} />
                    <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest">
                        Passo 4 di 9 — Assembla il Board
                    </p>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-3xl md:text-4xl text-foreground leading-tight mb-4"
                >
                    Chi vuoi nel tuo Board?
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground font-sans text-base"
                >
                    Scegli <span className="text-accent font-medium">2-3 advisor</span> che sfideranno la tua idea. 
                    Ognuno cercherà un bias diverso nel tuo ragionamento.
                </motion.p>
            </div>

            {/* Problem Preview - Mini */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl mx-auto w-full mb-8"
            >
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        La tua decisione
                    </p>
                    <p className="text-sm text-foreground font-sans line-clamp-2">
                        {problem}
                    </p>
                </div>
            </motion.div>

            {/* Advisor Grid */}
            <div className="flex-1 max-w-5xl mx-auto w-full">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                >
                    {ADVISORS.map((advisor, index) => (
                        <motion.div
                            key={advisor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                        >
                            <AdvisorCard
                                advisor={advisor}
                                isSelected={selectedAdvisors.includes(advisor.id)}
                                selectionOrder={getSelectionOrder(advisor.id)}
                                onToggle={() => toggleAdvisor(advisor.id)}
                                disabled={selectedAdvisors.length >= MAX_SELECTION}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Focus Question (optional) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mb-8"
                >
                    <label className="block text-sm text-muted-foreground mb-2 font-sans">
                        C'è una domanda specifica che vuoi porre al Board? 
                        <span className="text-muted-foreground/60"> (opzionale)</span>
                    </label>
                    <textarea
                        value={focusQuestion}
                        onChange={(e) => setFocusQuestion(e.target.value)}
                        placeholder="Es. Sono preoccupato per i costi di scaling... oppure: Ha senso puntare su questo mercato?"
                        className="
                            w-full h-24 p-4 bg-transparent border border-border rounded-xl
                            text-foreground font-sans text-sm
                            placeholder:text-muted-foreground/50
                            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                            transition-all resize-none
                        "
                    />
                </motion.div>

                {/* Selection Summary */}
                <AnimatePresence>
                    {selectedAdvisors.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="p-5 bg-accent/10 border border-accent/30 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-accent" />
                                    </div>
                                    <p className="text-sm text-foreground font-medium">
                                        Il tuo Board ({selectedAdvisors.length}/{MAX_SELECTION})
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {selectedAdvisors.map((advisorId, idx) => {
                                        const advisor = ADVISORS.find(a => a.id === advisorId)
                                        if (!advisor) return null
                                        return (
                                            <span 
                                                key={advisorId}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
                                            >
                                                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">
                                                    {idx + 1}
                                                </span>
                                                <span className="font-medium">{advisor.title}</span>
                                            </span>
                                        )
                                    })}
                                </div>
                                {selectedAdvisors.length < MIN_SELECTION && (
                                    <p className="text-xs text-muted-foreground mt-3">
                                        Seleziona almeno {MIN_SELECTION - selectedAdvisors.length} advisor per continuare
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex justify-between items-center max-w-5xl mx-auto w-full">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="
                            flex items-center gap-2 px-6 py-3 
                            border border-border text-foreground 
                            font-sans text-sm uppercase tracking-widest 
                            hover:border-accent hover:text-accent
                            transition-colors rounded-xl
                        "
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Indietro
                    </button>
                )}
                
                <motion.button
                    onClick={handleSubmit}
                    disabled={!canProceed}
                    whileHover={canProceed ? { scale: 1.02 } : {}}
                    whileTap={canProceed ? { scale: 0.98 } : {}}
                    className={`
                        ml-auto flex items-center gap-3 px-8 py-4 
                        font-sans text-sm uppercase tracking-widest 
                        transition-all rounded-xl
                        ${canProceed
                            ? "bg-accent text-background hover:bg-accent/90 shadow-lg shadow-accent/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }
                    `}
                >
                    <span>Convoca il Board</span>
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    )
}
