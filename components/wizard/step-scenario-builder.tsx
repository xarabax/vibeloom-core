"use client"

/**
 * Step: Scenario Builder
 * 
 * Costruttore guidato di flussi strategici.
 * L'utente costruisce step-by-step ogni scenario con suggerimenti AI.
 */

import React, { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    Clock,
    Target,
    AlertTriangle,
    CheckCircle2,
    Crosshair,
    ShieldAlert,
    TrendingUp
} from "lucide-react"
import type { SelectedScenario, AdvisorId } from "@/lib/types/decision-mate"
import type { TimelineStep, Scenario, ScenarioId, TimelinePhase, EvidenceLevel, Reversibility } from "@/lib/types/scenario-explorer"
import { EditableChipList } from "@/components/scenario-explorer/EditableChipList"
import { DynamicProsCons } from "@/components/scenario-explorer/DynamicProsCons"
import { SUGGESTED_TAGS } from "@/lib/constants/decisionTags"

// ============================================================================
// SUGGERIMENTI AI PER STEP
// ============================================================================

interface StepSuggestion {
    action: string
    description: string
    phase: TimelinePhase
    category: "sniper" | "guardian" | "vc"
}

const STEP_SUGGESTIONS: StepSuggestion[] = [
    // SNIPER - Velocità
    {
        action: "MVP in 2 settimane",
        description: "Landing page + Stripe, niente backend complesso",
        phase: "Immediate",
        category: "sniper"
    },
    {
        action: "10 Interviste Clienti",
        description: "Validazione rapida del problema con utenti reali",
        phase: "Immediate",
        category: "sniper"
    },
    {
        action: "Lancio Beta Chiusa",
        description: "100 utenti early adopter per feedback veloce",
        phase: "Short-term",
        category: "sniper"
    },
    {
        action: "Paid Acquisition Test",
        description: "€500 di ads per validare CAC",
        phase: "Short-term",
        category: "sniper"
    },
    
    // GUARDIAN - Sicurezza
    {
        action: "Audit GDPR",
        description: "Verifica compliance privacy prima del lancio",
        phase: "Immediate",
        category: "guardian"
    },
    {
        action: "Security Review",
        description: "Penetration test e vulnerability assessment",
        phase: "Short-term",
        category: "guardian"
    },
    {
        action: "Piano di Backup",
        description: "Strategia di uscita se il progetto fallisce",
        phase: "Immediate",
        category: "guardian"
    },
    {
        action: "Contratti Legali",
        description: "Terms of Service e Privacy Policy completi",
        phase: "Short-term",
        category: "guardian"
    },
    
    // VC - Scalabilità
    {
        action: "Market Research Deep",
        description: "Analisi TAM/SAM/SOM dettagliata",
        phase: "Immediate",
        category: "vc"
    },
    {
        action: "Partnership Strategiche",
        description: "Accordi con player chiave del mercato",
        phase: "Short-term",
        category: "vc"
    },
    {
        action: "Fundraising Prep",
        description: "Deck, financial model, lista investitori",
        phase: "Short-term",
        category: "vc"
    },
    {
        action: "Platform Play",
        description: "Costruisci ecosistema, non solo prodotto",
        phase: "Long-term",
        category: "vc"
    }
]

const CATEGORY_COLORS = {
    sniper: "bg-stone-800/50 border-stone-600 text-stone-200",
    guardian: "bg-blue-950/50 border-blue-700 text-blue-200",
    vc: "bg-emerald-950/50 border-emerald-700 text-emerald-200"
}

const CATEGORY_ICONS = {
    sniper: Crosshair,
    guardian: ShieldAlert,
    vc: TrendingUp
}

// ============================================================================
// TIPI LOCALI
// ============================================================================

/** Branch (diramazione) di un bivio */
interface BuilderBranch {
    id: string
    condition: string  // "Se funziona", "Se fallisce"
    steps: ScenarioBuilderStep[]
}

interface ScenarioBuilderStep {
    id: string
    action: string
    description: string
    phase: TimelinePhase
    assumptions: string[]
    risks: string[]
    evidence_level: EvidenceLevel
    reversibility: Reversibility
    time_to_signal: string
    is_checkpoint: boolean
    /** Se true, questo step è un bivio con diramazioni */
    is_fork: boolean
    /** Diramazioni (solo se is_fork = true) */
    branches: BuilderBranch[]
}

interface BuilderScenario {
    id: ScenarioId
    title: string
    steps: ScenarioBuilderStep[]
    /** Pro definiti dall'utente */
    user_pros: string[]
    /** Contro definiti dall'utente */
    user_cons: string[]
}

// ============================================================================
// PROPS
// ============================================================================

interface StepScenarioBuilderProps {
    /** Problema originale */
    problem: string
    /** Scenari selezionati da esplorare (preset o custom) */
    selectedScenarios: SelectedScenario[]
    /** Advisor selezionati */
    selectedAdvisors: AdvisorId[]
    /** Callback al completamento */
    onComplete: (scenarios: Scenario[]) => void
    /** Callback per tornare indietro */
    onBack?: () => void
}

// ============================================================================
// STEP EDITOR COMPONENT
// ============================================================================

interface StepEditorProps {
    step: ScenarioBuilderStep
    index: number
    onUpdate: (step: ScenarioBuilderStep) => void
    onDelete: () => void
    accentColor: string
}

function StepEditor({ step, index, onUpdate, onDelete, accentColor }: StepEditorProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card/50 border border-border rounded-xl overflow-hidden"
        >
            {/* Header */}
            <div 
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                    ${accentColor}
                `}>
                    {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            {step.phase === "Immediate" ? "Oggi" : 
                             step.phase === "Short-term" ? "1-3 mesi" : "6+ mesi"}
                        </span>
                    </div>
                    <h4 className="font-medium text-foreground truncate">
                        {step.action || "Nuovo step..."}
                    </h4>
                </div>
                
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
            </div>
            
            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                    >
                        <div className="p-4 space-y-4">
                            {/* Azione */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                    Azione
                                </label>
                                <input
                                    type="text"
                                    value={step.action}
                                    onChange={(e) => onUpdate({ ...step, action: e.target.value })}
                                    placeholder="Es. Costruisci MVP, Intervista clienti..."
                                    className="
                                        w-full px-3 py-2 bg-muted/30 border border-border rounded-lg
                                        text-foreground text-sm placeholder:text-muted-foreground/50
                                        focus:outline-none focus:border-accent
                                    "
                                />
                            </div>
                            
                            {/* Descrizione */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                    Descrizione
                                </label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => onUpdate({ ...step, description: e.target.value })}
                                    placeholder="Dettagli su cosa fare..."
                                    rows={2}
                                    className="
                                        w-full px-3 py-2 bg-muted/30 border border-border rounded-lg
                                        text-foreground text-sm placeholder:text-muted-foreground/50
                                        focus:outline-none focus:border-accent resize-none
                                    "
                                />
                            </div>
                            
                            {/* Timeline */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                    Quando
                                </label>
                                <div className="flex gap-2">
                                    {(["Immediate", "Short-term", "Long-term"] as TimelinePhase[]).map(phase => (
                                        <button
                                            key={phase}
                                            onClick={() => onUpdate({ ...step, phase })}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                ${step.phase === phase
                                                    ? "bg-accent text-background"
                                                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                                                }
                                            `}
                                        >
                                            {phase === "Immediate" ? "Oggi" :
                                             phase === "Short-term" ? "1-3 mesi" : "6+ mesi"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Assunzioni */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                    Assunzioni
                                </label>
                                <EditableChipList
                                    type="assumptions"
                                    values={step.assumptions}
                                    suggestions={SUGGESTED_TAGS.assumptions}
                                    onChange={(values) => onUpdate({ ...step, assumptions: values })}
                                    chipColor="bg-blue-950/50 text-blue-300 border-blue-700/50"
                                    chipIcon={Lightbulb}
                                    placeholder="Aggiungi assunzione..."
                                />
                            </div>
                            
                            {/* Rischi */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                    Rischi
                                </label>
                                <EditableChipList
                                    type="risks"
                                    values={step.risks}
                                    suggestions={SUGGESTED_TAGS.risks}
                                    onChange={(values) => onUpdate({ ...step, risks: values })}
                                    chipColor="bg-red-950/50 text-red-300 border-red-700/50"
                                    chipIcon={AlertTriangle}
                                    placeholder="Aggiungi rischio..."
                                />
                            </div>
                            
                            {/* Time to Signal */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                    Tempo per capire se funziona
                                </label>
                                <select
                                    value={step.time_to_signal}
                                    onChange={(e) => onUpdate({ ...step, time_to_signal: e.target.value })}
                                    className="
                                        w-full px-3 py-2 bg-muted/30 border border-border rounded-lg
                                        text-foreground text-sm
                                        focus:outline-none focus:border-accent
                                    "
                                >
                                    <option value="1 week">1 settimana</option>
                                    <option value="2 weeks">2 settimane</option>
                                    <option value="1 month">1 mese</option>
                                    <option value="3 months">3 mesi</option>
                                    <option value="6 months">6 mesi</option>
                                </select>
                            </div>
                            
                            {/* Bivio / Fork */}
                            <div className="pt-4 border-t border-border/50">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={step.is_fork}
                                        onChange={(e) => onUpdate({ 
                                            ...step, 
                                            is_fork: e.target.checked,
                                            branches: e.target.checked && step.branches.length === 0 
                                                ? [
                                                    { id: `branch-${Date.now()}-1`, condition: "Se funziona", steps: [] },
                                                    { id: `branch-${Date.now()}-2`, condition: "Se fallisce", steps: [] }
                                                  ]
                                                : step.branches
                                        })}
                                        className="w-4 h-4 rounded border-border bg-muted/30 accent-accent"
                                    />
                                    <span className="text-sm text-foreground">
                                        Questo è un bivio decisionale
                                    </span>
                                </label>
                                
                                {/* Branches */}
                                {step.is_fork && step.branches.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <p className="text-xs text-muted-foreground">
                                            Definisci cosa succede in ogni caso:
                                        </p>
                                        {step.branches.map((branch, branchIdx) => (
                                            <div 
                                                key={branch.id}
                                                className="p-3 bg-muted/20 border border-border/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`
                                                        w-2 h-2 rounded-full
                                                        ${branchIdx === 0 ? "bg-emerald-500" : "bg-amber-500"}
                                                    `} />
                                                    <input
                                                        type="text"
                                                        value={branch.condition}
                                                        onChange={(e) => {
                                                            const newBranches = [...step.branches]
                                                            newBranches[branchIdx] = { ...branch, condition: e.target.value }
                                                            onUpdate({ ...step, branches: newBranches })
                                                        }}
                                                        placeholder="Condizione..."
                                                        className="
                                                            flex-1 bg-transparent text-sm font-medium
                                                            text-foreground placeholder:text-muted-foreground/50
                                                            focus:outline-none
                                                        "
                                                    />
                                                    {step.branches.length > 2 && (
                                                        <button
                                                            onClick={() => {
                                                                const newBranches = step.branches.filter((_, i) => i !== branchIdx)
                                                                onUpdate({ ...step, branches: newBranches })
                                                            }}
                                                            className="p-1 text-muted-foreground hover:text-red-400"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {branch.steps.length} step in questo percorso
                                                </p>
                                            </div>
                                        ))}
                                        
                                        {/* Add Branch */}
                                        {step.branches.length < 3 && (
                                            <button
                                                onClick={() => {
                                                    const newBranch: BuilderBranch = {
                                                        id: `branch-${Date.now()}`,
                                                        condition: "Altra opzione",
                                                        steps: []
                                                    }
                                                    onUpdate({ ...step, branches: [...step.branches, newBranch] })
                                                }}
                                                className="
                                                    w-full p-2 border border-dashed border-border rounded-lg
                                                    text-muted-foreground text-xs hover:border-accent hover:text-accent
                                                    transition-colors flex items-center justify-center gap-1
                                                "
                                            >
                                                <Plus className="w-3 h-3" />
                                                Aggiungi percorso
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ============================================================================
// SUGGESTION CARD
// ============================================================================

interface SuggestionCardProps {
    suggestion: StepSuggestion
    onSelect: () => void
}

function SuggestionCard({ suggestion, onSelect }: SuggestionCardProps) {
    const Icon = CATEGORY_ICONS[suggestion.category]
    
    return (
        <button
            onClick={onSelect}
            className={`
                w-full p-3 rounded-xl border text-left transition-all
                hover:scale-[1.02] hover:shadow-lg
                ${CATEGORY_COLORS[suggestion.category]}
            `}
        >
            <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-background/10">
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{suggestion.action}</p>
                    <p className="text-xs opacity-70 mt-0.5">{suggestion.description}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-background/10">
                        {suggestion.phase === "Immediate" ? "Oggi" :
                         suggestion.phase === "Short-term" ? "1-3 mesi" : "6+ mesi"}
                    </span>
                </div>
                <Plus className="w-4 h-4 opacity-50" />
            </div>
        </button>
    )
}

// ============================================================================
// SCENARIO COLUMN BUILDER
// ============================================================================

interface ScenarioColumnBuilderProps {
    scenario: BuilderScenario
    onUpdate: (scenario: BuilderScenario) => void
    accentColor: string
    selectedAdvisors: AdvisorId[]
}

function ScenarioColumnBuilder({ scenario, onUpdate, accentColor, selectedAdvisors }: ScenarioColumnBuilderProps) {
    const [showSuggestions, setShowSuggestions] = useState(scenario.steps.length === 0)
    
    // Filtra suggerimenti in base agli advisor selezionati
    const filteredSuggestions = useMemo(() => {
        const categoryMap: Record<AdvisorId, StepSuggestion["category"]> = {
            sniper: "sniper",
            guardian: "guardian",
            vc: "vc",
            mentor: "sniper" // Mentor usa suggerimenti bilanciati
        }
        
        const relevantCategories = selectedAdvisors.map(a => categoryMap[a])
        return STEP_SUGGESTIONS.filter(s => relevantCategories.includes(s.category))
    }, [selectedAdvisors])
    
    const addStep = useCallback((suggestion?: StepSuggestion) => {
        const newStep: ScenarioBuilderStep = {
            id: `step-${Date.now()}`,
            action: suggestion?.action || "",
            description: suggestion?.description || "",
            phase: suggestion?.phase || "Immediate",
            assumptions: [],
            risks: [],
            evidence_level: "Medium",
            reversibility: "High (Type 2)",
            time_to_signal: "2 weeks",
            is_checkpoint: false,
            is_fork: false,
            branches: []
        }
        
        onUpdate({
            ...scenario,
            steps: [...scenario.steps, newStep]
        })
        setShowSuggestions(false)
    }, [scenario, onUpdate])
    
    const updateStep = useCallback((index: number, step: ScenarioBuilderStep) => {
        const newSteps = [...scenario.steps]
        newSteps[index] = step
        onUpdate({ ...scenario, steps: newSteps })
    }, [scenario, onUpdate])
    
    const deleteStep = useCallback((index: number) => {
        const newSteps = scenario.steps.filter((_, i) => i !== index)
        onUpdate({ ...scenario, steps: newSteps })
        if (newSteps.length === 0) setShowSuggestions(true)
    }, [scenario, onUpdate])
    
    // Converti in Scenario per il calcolo pro/contro
    const scenarioForCalc: Scenario = useMemo(() => ({
        id: scenario.id,
        advisor_sponsor_id: selectedAdvisors[0] || "sniper",
        title: scenario.title,
        subtitle: "",
        description: "",
        color_classes: { bg: "", border: "", text: "", accent: accentColor },
        icon_name: "Target",
        steps: scenario.steps.map(s => ({
            ...s,
            cost_estimate: undefined,
            effort: "medium" as const,
            depends_on: []
        })),
        outcome: {
            title: "In costruzione",
            probability: 50,
            upside: "Da definire",
            downside: "Da definire"
        },
        total_cost_estimation: 10000,
        speed_score: 50,
        risk_score: 50,
        scalability_score: 50
    }), [scenario, selectedAdvisors, accentColor])
    
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={`p-4 border-b border-border ${accentColor}`}>
                <input
                    type="text"
                    value={scenario.title}
                    onChange={(e) => onUpdate({ ...scenario, title: e.target.value })}
                    placeholder="Nome scenario..."
                    className="
                        w-full bg-transparent text-lg font-semibold
                        placeholder:text-current placeholder:opacity-50
                        focus:outline-none
                    "
                />
                <p className="text-xs opacity-70 mt-1">
                    {scenario.steps.length} step definiti
                </p>
            </div>
            
            {/* Steps */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                <AnimatePresence>
                    {scenario.steps.map((step, index) => (
                        <StepEditor
                            key={step.id}
                            step={step}
                            index={index}
                            onUpdate={(s) => updateStep(index, s)}
                            onDelete={() => deleteStep(index)}
                            accentColor={accentColor}
                        />
                    ))}
                </AnimatePresence>
                
                {/* Add Step Button */}
                <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="
                        w-full p-4 border-2 border-dashed border-border rounded-xl
                        text-muted-foreground hover:border-accent hover:text-accent
                        transition-all flex items-center justify-center gap-2
                    "
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Aggiungi step</span>
                </button>
                
                {/* Suggestions Panel */}
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                        >
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span>Suggerimenti</span>
                            </div>
                            
                            <div className="grid gap-2">
                                {filteredSuggestions.slice(0, 4).map((suggestion, idx) => (
                                    <SuggestionCard
                                        key={idx}
                                        suggestion={suggestion}
                                        onSelect={() => addStep(suggestion)}
                                    />
                                ))}
                            </div>
                            
                            <button
                                onClick={() => addStep()}
                                className="
                                    w-full p-2 text-sm text-muted-foreground
                                    hover:text-accent transition-colors
                                "
                            >
                                + Crea step personalizzato
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Pro/Contro Dinamici (calcolati dall'AI) */}
            {scenario.steps.length > 0 && (
                <div className="p-4 border-t border-border">
                    <DynamicProsCons scenario={scenarioForCalc} showDelta={false} />
                </div>
            )}
            
            {/* Pro/Contro definiti dall'utente */}
            <div className="p-4 border-t border-border space-y-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    I tuoi Pro/Contro
                </p>
                
                {/* User Pros */}
                <div>
                    <label className="text-xs text-emerald-400 mb-1.5 block flex items-center gap-1">
                        <span>✓</span> Pro aggiuntivi
                    </label>
                    <EditableChipList
                        type="assumptions"
                        values={scenario.user_pros}
                        suggestions={[]}
                        onChange={(values) => onUpdate({ ...scenario, user_pros: values })}
                        chipColor="bg-emerald-950/50 text-emerald-300 border-emerald-700/50"
                        placeholder="Aggiungi un pro..."
                    />
                </div>
                
                {/* User Cons */}
                <div>
                    <label className="text-xs text-red-400 mb-1.5 block flex items-center gap-1">
                        <span>✗</span> Contro aggiuntivi
                    </label>
                    <EditableChipList
                        type="risks"
                        values={scenario.user_cons}
                        suggestions={[]}
                        onChange={(values) => onUpdate({ ...scenario, user_cons: values })}
                        chipColor="bg-red-950/50 text-red-300 border-red-700/50"
                        placeholder="Aggiungi un contro..."
                    />
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type PresetScenarioId = "A" | "B" | "C"

const PRESET_SCENARIO_CONFIGS: Record<PresetScenarioId, { title: string; color: string }> = {
    A: { title: "Scenario Aggressivo", color: "bg-stone-800/80 text-stone-100" },
    B: { title: "Scenario Prudente", color: "bg-blue-950/80 text-blue-100" },
    C: { title: "Scenario Visionario", color: "bg-emerald-950/80 text-emerald-100" }
}

const CUSTOM_SCENARIO_COLOR = "bg-purple-950/80 text-purple-100"

export function StepScenarioBuilder({
    problem,
    selectedScenarios,
    selectedAdvisors,
    onComplete,
    onBack
}: StepScenarioBuilderProps) {
    // Inizializza scenari vuoti (supporta preset e custom)
    const [scenarios, setScenarios] = useState<BuilderScenario[]>(() =>
        selectedScenarios.map(selected => {
            if (selected.type === "preset") {
                return {
                    id: selected.id as ScenarioId,
                    title: PRESET_SCENARIO_CONFIGS[selected.id].title,
                    steps: [],
                    user_pros: [],
                    user_cons: []
                }
            } else {
                // Custom scenario
                return {
                    id: selected.custom.id as ScenarioId,
                    title: selected.custom.title,
                    steps: [],
                    user_pros: [],
                    user_cons: []
                }
            }
        })
    )
    
    // Mappa per ottenere il colore corretto
    const getScenarioColor = useCallback((index: number): string => {
        const selected = selectedScenarios[index]
        if (selected.type === "preset") {
            return PRESET_SCENARIO_CONFIGS[selected.id].color
        }
        return CUSTOM_SCENARIO_COLOR
    }, [selectedScenarios])
    
    // Controlla se almeno uno scenario ha step
    const canProceed = scenarios.some(s => s.steps.length > 0)
    
    const updateScenario = useCallback((index: number, scenario: BuilderScenario) => {
        setScenarios(prev => {
            const newScenarios = [...prev]
            newScenarios[index] = scenario
            return newScenarios
        })
    }, [])
    
    const handleComplete = useCallback(() => {
        // Converti in Scenario completi
        const fullScenarios: Scenario[] = scenarios.map((s, index) => {
            const colorStr = getScenarioColor(index)
            const colorParts = colorStr.split(" ")
            
            return {
                id: s.id,
                advisor_sponsor_id: selectedAdvisors[0],
                title: s.title,
                subtitle: `${s.steps.length} step`,
                description: "",
                color_classes: {
                    bg: colorParts[0] || "bg-muted",
                    border: "border-border",
                    text: colorParts[1] || "text-foreground",
                    accent: "text-accent"
                },
                icon_name: "Target",
                steps: s.steps.map(step => ({
                    ...step,
                    cost_estimate: undefined,
                    effort: "medium" as const,
                    depends_on: []
                })),
                outcome: {
                    title: "Outcome",
                    probability: 50,
                    upside: "Da validare",
                    downside: "Da validare"
                },
                total_cost_estimation: 10000,
                speed_score: 50,
                risk_score: 50,
                scalability_score: 50,
                // Pro/Contro definiti dall'utente
                user_pros: s.user_pros,
                user_cons: s.user_cons
            }
        })
        
        onComplete(fullScenarios)
    }, [scenarios, selectedAdvisors, onComplete, getScenarioColor])
    
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="px-6 py-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest">
                            Passo 8 di 9 — Costruisci i tuoi Scenari
                        </p>
                    </div>
                    <h1 className="font-serif text-2xl md:text-3xl text-foreground">
                        Definisci il percorso per ogni scenario
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                        Aggiungi gli step, le assunzioni e i rischi. Il sistema calcolerà automaticamente Pro e Contro.
                    </p>
                </div>
            </div>
            
            {/* Problem Preview */}
            <div className="px-6 py-4 border-b border-border/50 bg-muted/10">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        La tua decisione
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                        {problem}
                    </p>
                </div>
            </div>
            
            {/* Scenario Columns */}
            <div className="flex-1 overflow-hidden">
                <div className={`
                    h-full grid gap-4 p-4 max-w-7xl mx-auto
                    ${selectedScenarios.length === 1 ? "grid-cols-1 max-w-2xl" :
                      selectedScenarios.length === 2 ? "grid-cols-1 md:grid-cols-2" :
                      "grid-cols-1 md:grid-cols-3"}
                `}>
                    {scenarios.map((scenario, index) => (
                        <div 
                            key={scenario.id}
                            className="bg-card border border-border rounded-xl overflow-hidden flex flex-col"
                        >
                            <ScenarioColumnBuilder
                                scenario={scenario}
                                onUpdate={(s) => updateScenario(index, s)}
                                accentColor={getScenarioColor(index)}
                                selectedAdvisors={selectedAdvisors}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="
                                flex items-center gap-2 px-5 py-2.5
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
                        onClick={handleComplete}
                        disabled={!canProceed}
                        whileHover={canProceed ? { scale: 1.02 } : {}}
                        whileTap={canProceed ? { scale: 0.98 } : {}}
                        className={`
                            ml-auto flex items-center gap-3 px-6 py-3
                            font-sans text-sm uppercase tracking-widest
                            transition-all rounded-xl
                            ${canProceed
                                ? "bg-accent text-background hover:bg-accent/90 shadow-lg shadow-accent/25"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            }
                        `}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Vai al Verdetto</span>
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </div>
    )
}
