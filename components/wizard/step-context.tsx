"use client"

import type React from "react"
import { useState } from "react"
import { Plus, X, Target, Users, Building2, Compass, AlertTriangle, Brain } from "lucide-react"
import type { 
    ContextData, 
    BusinessModel, 
    PrimaryGoal, 
    PMPersonality,
    PMFocus,
    DecisionStyle
} from "@/lib/types/decision-mate"
import { 
    PRIMARY_GOAL_LABELS, 
    BUSINESS_MODEL_LABELS, 
    RISK_TOLERANCE_LABELS,
    createEmptyContextData,
    isContextDataComplete
} from "@/lib/types/decision-mate"

interface StepContextProps {
    /** Problema dallo Step 1 */
    problem: string
    /** Callback quando l'utente completa lo step */
    onComplete: (contextData: ContextData) => void
    /** Callback per tornare indietro */
    onBack?: () => void
}

/**
 * Step 3: Contesto e Attori
 * 
 * Form dinamico per definire:
 * - Target Audience
 * - Stakeholder coinvolti
 * - Modello di Business
 * - Obiettivo Primario (Stella Polare)
 * - Vincoli
 * - Personalità del PM
 */
export function StepContext({ problem, onComplete, onBack }: StepContextProps) {
    const [formData, setFormData] = useState<Partial<ContextData>>(createEmptyContextData())
    
    // Input temporanei per liste dinamiche
    const [newStakeholder, setNewStakeholder] = useState("")
    const [newConstraint, setNewConstraint] = useState("")

    // === HANDLERS ===

    const updateField = <K extends keyof ContextData>(
        field: K, 
        value: ContextData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const updatePersonality = <K extends keyof PMPersonality>(
        field: K,
        value: PMPersonality[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            pmPersonality: {
                ...prev.pmPersonality!,
                [field]: value
            }
        }))
    }

    // Stakeholders
    const addStakeholder = () => {
        if (newStakeholder.trim()) {
            updateField("stakeholders", [...(formData.stakeholders || []), newStakeholder.trim()])
            setNewStakeholder("")
        }
    }

    const removeStakeholder = (index: number) => {
        updateField("stakeholders", formData.stakeholders?.filter((_, i) => i !== index) || [])
    }

    // Constraints
    const addConstraint = () => {
        if (newConstraint.trim()) {
            updateField("constraints", [...(formData.constraints || []), newConstraint.trim()])
            setNewConstraint("")
        }
    }

    const removeConstraint = (index: number) => {
        updateField("constraints", formData.constraints?.filter((_, i) => i !== index) || [])
    }

    // === SUBMIT ===

    const handleSubmit = () => {
        if (isContextDataComplete(formData)) {
            onComplete(formData as ContextData)
        }
    }

    const canProceed = isContextDataComplete(formData)

    return (
        <div className="min-h-screen flex flex-col px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-12">
                <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-2">
                    Passo 3 di 9 — Contesto e Attori
                </p>
                <h1 className="font-serif text-2xl md:text-3xl text-foreground leading-tight mb-4">
                    Definisci il campo di battaglia
                </h1>
                <p className="text-muted-foreground font-sans text-sm max-w-2xl">
                    Aiutaci a capire il tuo contesto, gli stakeholder e il tuo stile decisionale.
                </p>
            </div>

            {/* Form Grid */}
            <div className="flex-1 max-w-4xl mx-auto w-full space-y-10">
                
                {/* === TARGET AUDIENCE === */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <label className="font-sans text-sm uppercase tracking-widest text-foreground">
                            Target di Riferimento
                        </label>
                    </div>
                    <input
                        type="text"
                        value={formData.targetAudience || ""}
                        onChange={(e) => updateField("targetAudience", e.target.value)}
                        placeholder="es. Aziende SaaS B2B con 50-200 dipendenti"
                        className="w-full bg-transparent border border-border px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors rounded"
                    />
                </section>

                {/* === STAKEHOLDERS === */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <label className="font-sans text-sm uppercase tracking-widest text-foreground">
                            Stakeholder Coinvolti
                        </label>
                    </div>
                    
                    {/* Input per nuovo stakeholder */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newStakeholder}
                            onChange={(e) => setNewStakeholder(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addStakeholder()}
                            placeholder="Aggiungi stakeholder (es. CEO, CTO, Investitori...)"
                            className="flex-1 bg-transparent border border-border px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors rounded"
                        />
                        <button
                            onClick={addStakeholder}
                            className="px-4 py-3 border border-border hover:border-accent hover:bg-accent/5 transition-colors rounded"
                        >
                            <Plus className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Lista stakeholders */}
                    {formData.stakeholders && formData.stakeholders.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.stakeholders.map((stakeholder, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded font-sans text-sm text-foreground"
                                >
                                    {stakeholder}
                                    <button 
                                        onClick={() => removeStakeholder(index)}
                                        className="hover:text-destructive transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* === BUSINESS MODEL === */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <label className="font-sans text-sm uppercase tracking-widest text-foreground">
                            Modello di Business
                        </label>
                    </div>
                    <select
                        value={formData.businessModel || ""}
                        onChange={(e) => updateField("businessModel", e.target.value as BusinessModel)}
                        className="w-full bg-background border border-border px-4 py-3 text-foreground font-sans focus:outline-none focus:border-accent transition-colors rounded appearance-none cursor-pointer"
                    >
                        {(Object.entries(BUSINESS_MODEL_LABELS) as [BusinessModel, string][]).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </section>

                {/* === PRIMARY GOAL (Stella Polare) === */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <label className="font-sans text-sm uppercase tracking-widest text-foreground">
                            Obiettivo Primario — La Tua Stella Polare
                        </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(Object.entries(PRIMARY_GOAL_LABELS) as [PrimaryGoal, string][]).map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => updateField("primaryGoal", value)}
                                className={`px-4 py-3 border text-sm font-sans transition-all rounded ${
                                    formData.primaryGoal === value
                                        ? "border-accent bg-accent/10 text-accent"
                                        : "border-border text-muted-foreground hover:border-muted-foreground"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* === CONSTRAINTS === */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <label className="font-sans text-sm uppercase tracking-widest text-foreground">
                            Vincoli e Limitazioni
                        </label>
                    </div>
                    
                    {/* Input per nuovo constraint */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newConstraint}
                            onChange={(e) => setNewConstraint(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addConstraint()}
                            placeholder="Aggiungi vincolo (es. Budget < 10k, No assunzioni esterne...)"
                            className="flex-1 bg-transparent border border-border px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors rounded"
                        />
                        <button
                            onClick={addConstraint}
                            className="px-4 py-3 border border-border hover:border-accent hover:bg-accent/5 transition-colors rounded"
                        >
                            <Plus className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Lista constraints */}
                    {formData.constraints && formData.constraints.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.constraints.map((constraint, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded font-sans text-sm text-foreground"
                                >
                                    {constraint}
                                    <button 
                                        onClick={() => removeConstraint(index)}
                                        className="hover:text-destructive transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* === PM PERSONALITY === */}
                <section className="space-y-6 p-6 border border-border rounded bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <label className="font-sans text-sm uppercase tracking-widest text-foreground">
                            Il Tuo Stile Decisionale
                        </label>
                    </div>

                    {/* Risk Tolerance Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-sm text-muted-foreground">Tolleranza al Rischio</span>
                            <span className="font-sans text-sm text-accent">
                                {RISK_TOLERANCE_LABELS[formData.pmPersonality?.riskTolerance || 3]}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={formData.pmPersonality?.riskTolerance || 3}
                            onChange={(e) => updatePersonality("riskTolerance", parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                            className="w-full accent-accent cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground font-sans">
                            <span>Conservativo</span>
                            <span>Aggressivo</span>
                        </div>
                    </div>

                    {/* Focus: Tech vs Business */}
                    <div className="space-y-3">
                        <span className="font-sans text-sm text-muted-foreground">Focus Principale</span>
                        <div className="flex gap-3">
                            {(["tech", "balanced", "business"] as PMFocus[]).map((focus) => (
                                <button
                                    key={focus}
                                    onClick={() => updatePersonality("focus", focus)}
                                    className={`flex-1 px-4 py-2 border text-sm font-sans capitalize transition-all rounded ${
                                        formData.pmPersonality?.focus === focus
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-border text-muted-foreground hover:border-muted-foreground"
                                    }`}
                                >
                                    {focus === "tech" ? "🔧 Tecnico" : focus === "business" ? "💼 Business" : "⚖️ Bilanciato"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Decision Style */}
                    <div className="space-y-3">
                        <span className="font-sans text-sm text-muted-foreground">Stile Decisionale</span>
                        <div className="flex gap-3">
                            {(["data-driven", "intuitive", "collaborative"] as DecisionStyle[]).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => updatePersonality("decisionStyle", style)}
                                    className={`flex-1 px-4 py-2 border text-sm font-sans capitalize transition-all rounded ${
                                        formData.pmPersonality?.decisionStyle === style
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-border text-muted-foreground hover:border-muted-foreground"
                                    }`}
                                >
                                    {style === "data-driven" ? "📊 Basato sui Dati" : style === "intuitive" ? "💡 Intuitivo" : "🤝 Collaborativo"}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="mt-12 flex justify-between items-center max-w-4xl mx-auto w-full">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-6 py-3 border border-border text-foreground font-sans text-sm uppercase tracking-widest hover:border-accent transition-colors rounded"
                    >
                        Indietro
                    </button>
                )}
                
                <button
                    onClick={handleSubmit}
                    disabled={!canProceed}
                    className={`ml-auto px-8 py-3 font-sans text-sm uppercase tracking-widest transition-all rounded ${
                        canProceed
                            ? "bg-accent text-background hover:bg-accent/90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                >
                    Avvia Analisi
                </button>
            </div>
        </div>
    )
}
