"use client"

/**
 * Step: Discussione con il Board + Selezione Scenari
 * 
 * Chat interattiva dove l'utente può discutere la propria idea
 * e gli advisor selezionati rispondono con le loro prospettive.
 * 
 * Include selezione degli scenari da esplorare nel passo successivo.
 * 
 * Design: Thread verticale con bubble colorate per advisor.
 */

import React, { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Crosshair, 
    TrendingUp, 
    ShieldAlert,
    Scale,
    MessageSquare,
    Send,
    ArrowLeft,
    ArrowRight,
    User,
    Sparkles,
    Check,
    Zap,
    Shield,
    Rocket,
    Plus,
    type LucideIcon
} from "lucide-react"
import type { AdvisorId, AdvisorConfig, ScenarioChoice, SelectedScenario, CustomScenarioChoice } from "@/lib/types/decision-mate"
import { ADVISORS, getAdvisorById, ADVISOR_TO_AGENT_ROLE } from "@/lib/types/decision-mate"
import type { AgentRole, AgentAnalysis, DiscussionMessage } from "@/lib/ai/services/decision-board"
import { generateMockDiscussionResponse } from "@/lib/ai/services/decision-board"

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
// SCENARIO CONFIGS
// ============================================================================

interface ScenarioConfig {
    id: ScenarioChoice
    title: string
    subtitle: string
    icon: LucideIcon
    colorClasses: string
}

const PRESET_SCENARIOS: ScenarioConfig[] = [
    {
        id: "A",
        title: "Lancio Rapido",
        subtitle: "MVP veloce, test di mercato immediato",
        icon: Zap,
        colorClasses: "bg-stone-800/80 border-stone-600 text-stone-100"
    },
    {
        id: "B",
        title: "Approccio Prudente",
        subtitle: "Validazione metodica, rischio controllato",
        icon: Shield,
        colorClasses: "bg-blue-950/80 border-blue-700 text-blue-100"
    },
    {
        id: "C",
        title: "Visione Grande",
        subtitle: "Platform play, pensare in grande",
        icon: Rocket,
        colorClasses: "bg-emerald-950/80 border-emerald-700 text-emerald-100"
    }
]

// ============================================================================
// PROPS
// ============================================================================

interface StepDiscussionProps {
    /** Problema originale */
    problem: string
    /** Advisor selezionati dal Board */
    selectedAdvisors: AdvisorId[]
    /** Analisi iniziali degli advisor (dal Decision Board) */
    initialAnalyses: AgentAnalysis[]
    /** Callback quando l'utente vuole procedere - passa scenari selezionati */
    onComplete: (selectedScenarios: SelectedScenario[]) => void
    /** Callback per tornare indietro */
    onBack?: () => void
}

// ============================================================================
// ADVISOR COLOR STYLES
// ============================================================================

const ADVISOR_STYLES: Record<AdvisorId, { bg: string, border: string, text: string, icon: string }> = {
    sniper: { 
        bg: "bg-stone-800/90", 
        border: "border-stone-600", 
        text: "text-stone-100",
        icon: "text-stone-300"
    },
    vc: { 
        bg: "bg-emerald-950/90", 
        border: "border-emerald-700", 
        text: "text-emerald-100",
        icon: "text-emerald-400"
    },
    guardian: { 
        bg: "bg-blue-950/90", 
        border: "border-blue-800", 
        text: "text-blue-100",
        icon: "text-blue-400"
    },
    mentor: { 
        bg: "bg-purple-950/90", 
        border: "border-purple-800", 
        text: "text-purple-100",
        icon: "text-purple-400"
    }
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

interface MessageBubbleProps {
    message: DiscussionMessage
    advisorConfig?: AdvisorConfig
}

function MessageBubble({ message, advisorConfig }: MessageBubbleProps) {
    const isUser = message.role === "user"
    
    if (isUser) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end mb-4"
            >
                <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="bg-accent/20 border border-accent/40 rounded-2xl rounded-br-md px-4 py-3">
                        <p className="text-foreground text-sm font-sans">{message.content}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-accent" />
                    </div>
                </div>
            </motion.div>
        )
    }

    // Advisor message
    const advisorId = advisorConfig?.id || "mentor"
    const styles = ADVISOR_STYLES[advisorId]
    const Icon = advisorConfig ? (ICON_MAP[advisorConfig.iconName] || Sparkles) : Sparkles

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start mb-4"
        >
            <div className="flex items-start gap-3 max-w-[85%]">
                <div className={`
                    w-10 h-10 rounded-full ${styles.bg} border ${styles.border}
                    flex items-center justify-center flex-shrink-0
                `}>
                    <Icon className={`w-5 h-5 ${styles.icon}`} strokeWidth={1.5} />
                </div>
                <div className={`${styles.bg} border ${styles.border} rounded-2xl rounded-tl-md px-4 py-3`}>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${styles.text} opacity-70`}>
                        {advisorConfig?.title || message.role}
                    </p>
                    <p className={`${styles.text} text-sm font-sans leading-relaxed`}>
                        {message.content}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

// ============================================================================
// SCENARIO SELECTOR (con supporto custom)
// ============================================================================

interface ScenarioSelectorProps {
    selectedScenarios: SelectedScenario[]
    customScenarios: CustomScenarioChoice[]
    onTogglePreset: (id: ScenarioChoice) => void
    onToggleCustom: (id: string) => void
    onAddCustom: () => void
}

function ScenarioSelector({ 
    selectedScenarios, 
    customScenarios,
    onTogglePreset, 
    onToggleCustom,
    onAddCustom 
}: ScenarioSelectorProps) {
    const isPresetSelected = (id: ScenarioChoice) => 
        selectedScenarios.some(s => s.type === "preset" && s.id === id)
    
    const isCustomSelected = (id: string) => 
        selectedScenarios.some(s => s.type === "custom" && s.custom.id === id)
    
    return (
        <div className="space-y-4">
            {/* Scenari Predefiniti */}
            <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Scenari Suggeriti
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PRESET_SCENARIOS.map(scenario => {
                        const Icon = scenario.icon
                        const isSelected = isPresetSelected(scenario.id)
                        
                        return (
                            <button
                                key={scenario.id}
                                onClick={() => onTogglePreset(scenario.id)}
                                className={`
                                    relative p-4 rounded-xl border-2 transition-all text-left
                                    ${isSelected 
                                        ? `${scenario.colorClasses} border-accent shadow-lg` 
                                        : "bg-muted/20 border-border text-muted-foreground hover:border-accent/50"
                                    }
                                `}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-background" />
                                    </div>
                                )}
                                
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? "bg-white/10" : "bg-muted/30"}`}>
                                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{scenario.title}</p>
                                        <p className={`text-xs mt-0.5 ${isSelected ? "opacity-80" : "opacity-60"}`}>
                                            {scenario.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
            
            {/* Scenari Custom */}
            <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    I Tuoi Scenari
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {customScenarios.map(custom => {
                        const isSelected = isCustomSelected(custom.id)
                        
                        return (
                            <button
                                key={custom.id}
                                onClick={() => onToggleCustom(custom.id)}
                                className={`
                                    relative p-4 rounded-xl border-2 transition-all text-left
                                    ${isSelected 
                                        ? "bg-purple-950/80 border-purple-600 text-purple-100 shadow-lg" 
                                        : "bg-muted/20 border-border text-muted-foreground hover:border-accent/50"
                                    }
                                `}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-background" />
                                    </div>
                                )}
                                
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? "bg-white/10" : "bg-muted/30"}`}>
                                        <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{custom.title}</p>
                                        <p className={`text-xs mt-0.5 ${isSelected ? "opacity-80" : "opacity-60"}`}>
                                            {custom.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                    
                    {/* Add Custom Button */}
                    <button
                        onClick={onAddCustom}
                        className="
                            p-4 rounded-xl border-2 border-dashed border-border 
                            text-muted-foreground hover:border-accent hover:text-accent
                            transition-all flex items-center justify-center gap-2
                        "
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium text-sm">Crea il tuo scenario</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// CUSTOM SCENARIO MODAL
// ============================================================================

interface CustomScenarioModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (scenario: CustomScenarioChoice) => void
    advisors: AdvisorId[]
}

function CustomScenarioModal({ isOpen, onClose, onSave, advisors }: CustomScenarioModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [advisorId, setAdvisorId] = useState<AdvisorId | undefined>(undefined)
    
    const handleSave = () => {
        if (title.trim()) {
            onSave({
                id: `custom-${Date.now()}`,
                title: title.trim(),
                description: description.trim() || "Scenario personalizzato",
                advisorId
            })
            setTitle("")
            setDescription("")
            setAdvisorId(undefined)
            onClose()
        }
    }
    
    if (!isOpen) return null
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
                >
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                        Crea il tuo scenario
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                Nome dello scenario *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Es. Strategia Ibrida, Pivot Graduale..."
                                className="
                                    w-full px-3 py-2 bg-muted/30 border border-border rounded-lg
                                    text-foreground text-sm placeholder:text-muted-foreground/50
                                    focus:outline-none focus:border-accent
                                "
                                autoFocus
                            />
                        </div>
                        
                        {/* Descrizione */}
                        <div>
                            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                Descrizione breve
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Cosa rende questo scenario unico?"
                                rows={2}
                                className="
                                    w-full px-3 py-2 bg-muted/30 border border-border rounded-lg
                                    text-foreground text-sm placeholder:text-muted-foreground/50
                                    focus:outline-none focus:border-accent resize-none
                                "
                            />
                        </div>
                        
                        {/* Advisor Sponsor */}
                        <div>
                            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                Advisor sponsor (opzionale)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {advisors.map(id => {
                                    const advisor = getAdvisorById(id)
                                    if (!advisor) return null
                                    const Icon = ICON_MAP[advisor.iconName] || Sparkles
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setAdvisorId(advisorId === id ? undefined : id)}
                                            className={`
                                                flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm
                                                ${advisorId === id
                                                    ? "bg-accent/20 border-accent text-accent"
                                                    : "bg-muted/30 border-border text-muted-foreground hover:border-accent/50"
                                                }
                                            `}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {advisor.title}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${title.trim()
                                    ? "bg-accent text-background hover:bg-accent/90"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                }
                            `}
                        >
                            Crea Scenario
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StepDiscussion({ 
    problem, 
    selectedAdvisors, 
    initialAnalyses,
    onComplete, 
    onBack 
}: StepDiscussionProps) {
    // Stato messaggi
    const [messages, setMessages] = useState<DiscussionMessage[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    
    // Scenari selezionati per esplorazione
    const [selectedScenarios, setSelectedScenarios] = useState<SelectedScenario[]>([])
    
    // Scenari custom creati dall'utente
    const [customScenarios, setCustomScenarios] = useState<CustomScenarioChoice[]>([])
    
    // Modal per creare scenario custom
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
    
    // Ref per scroll automatico
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Advisor configs attivi
    const activeAdvisors = selectedAdvisors
        .map(id => getAdvisorById(id))
        .filter((a): a is AdvisorConfig => a !== undefined)
    
    // Toggle selezione scenario preset
    const togglePresetScenario = useCallback((id: ScenarioChoice) => {
        setSelectedScenarios(prev => {
            const exists = prev.find(s => s.type === "preset" && s.id === id)
            if (exists) {
                return prev.filter(s => !(s.type === "preset" && s.id === id))
            }
            return [...prev, { type: "preset", id }]
        })
    }, [])
    
    // Toggle selezione scenario custom
    const toggleCustomScenario = useCallback((id: string) => {
        setSelectedScenarios(prev => {
            const exists = prev.find(s => s.type === "custom" && s.custom.id === id)
            if (exists) {
                return prev.filter(s => !(s.type === "custom" && s.custom.id === id))
            }
            const custom = customScenarios.find(c => c.id === id)
            if (custom) {
                return [...prev, { type: "custom", custom }]
            }
            return prev
        })
    }, [customScenarios])
    
    // Aggiungi scenario custom
    const addCustomScenario = useCallback((scenario: CustomScenarioChoice) => {
        setCustomScenarios(prev => [...prev, scenario])
        // Auto-seleziona il nuovo scenario
        setSelectedScenarios(prev => [...prev, { type: "custom", custom: scenario }])
    }, [])

    // Scroll to bottom quando arrivano nuovi messaggi
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Inizializza la discussione con i verdetti iniziali
    useEffect(() => {
        if (messages.length === 0 && initialAnalyses.length > 0) {
            const initialMessages: DiscussionMessage[] = []
            
            // Messaggio intro dal sistema
            initialMessages.push({
                id: "intro",
                role: "The Mentor" as AgentRole,
                content: "Il Board ha deliberato. Ora puoi discutere con noi, fare domande, o chiedere chiarimenti. Quando sei pronto, scegli quali scenari vuoi esplorare nel dettaglio.",
                timestamp: new Date().toISOString()
            })

            setMessages(initialMessages)
        }
    }, [initialAnalyses, messages.length])

    // Invia messaggio
    const sendMessage = useCallback(async () => {
        const trimmed = inputValue.trim()
        if (!trimmed || isTyping) return

        // Aggiungi messaggio utente
        const userMessage: DiscussionMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: trimmed,
            timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, userMessage])
        setInputValue("")
        setIsTyping(true)

        // Simula delay e risposte dagli advisor (1-2 advisor rispondono)
        await new Promise(resolve => setTimeout(resolve, 800))

        // Decidi quanti advisor rispondono (1-2)
        const respondingCount = Math.random() > 0.5 ? 2 : 1
        const respondingAdvisors = [...activeAdvisors]
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(respondingCount, activeAdvisors.length))

        for (let i = 0; i < respondingAdvisors.length; i++) {
            const advisor = respondingAdvisors[i]
            const agentRole = ADVISOR_TO_AGENT_ROLE[advisor.id] as AgentRole
            
            // Delay tra le risposte
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 600))
            }

            const responseContent = generateMockDiscussionResponse(agentRole, trimmed)
            
            const advisorMessage: DiscussionMessage = {
                id: `${advisor.id}-${Date.now()}`,
                role: agentRole,
                content: responseContent,
                timestamp: new Date().toISOString()
            }
            
            setMessages(prev => [...prev, advisorMessage])
        }

        setIsTyping(false)
    }, [inputValue, isTyping, activeAdvisors])

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    // Trova advisor config per un AgentRole
    const getAdvisorConfigByRole = (role: AgentRole): AdvisorConfig | undefined => {
        const idMap: Record<AgentRole, AdvisorId> = {
            "The Sniper": "sniper",
            "The Guardian": "guardian",
            "The VC Analyst": "vc",
            "The Mentor": "mentor"
        }
        return getAdvisorById(idMap[role])
    }

    // Procedi al verdict
    const handleProceed = useCallback(() => {
        if (selectedScenarios.length > 0) {
            onComplete(selectedScenarios)
        }
    }, [selectedScenarios, onComplete])

    return (
        <div className="min-h-screen flex flex-col animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="px-6 py-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest">
                            Passo 7 di 9 — Confrontati con il Board
                        </p>
                    </div>
                    <h1 className="font-serif text-2xl text-foreground">
                        Confrontati con i tuoi Advisor
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Fai domande, chiedi chiarimenti, esplora le loro critiche.
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence>
                        {messages.map(message => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                advisorConfig={
                                    message.role !== "user" 
                                        ? getAdvisorConfigByRole(message.role as AgentRole) 
                                        : undefined
                                }
                            />
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-muted-foreground text-sm mb-4"
                        >
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span>Il Board sta riflettendo...</span>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-background/80 backdrop-blur-sm px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Input */}
                    <div className="flex gap-3 mb-6">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Scrivi una domanda o un dubbio..."
                            disabled={isTyping}
                            className="
                                flex-1 px-4 py-3 bg-muted/30 border border-border rounded-xl
                                text-foreground font-sans text-sm resize-none
                                placeholder:text-muted-foreground/50
                                focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all
                            "
                            rows={2}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || isTyping}
                            className="
                                px-5 py-3 bg-accent text-background rounded-xl
                                flex items-center justify-center
                                hover:bg-accent/90 transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Selezione Scenari */}
                    <div className="mb-6">
                        <p className="text-sm text-foreground font-medium mb-2">
                            Quali scenari vuoi esplorare nel dettaglio?
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Scegli tra quelli suggeriti o crea i tuoi. Nel passo successivo costruirai il percorso.
                        </p>
                        <ScenarioSelector
                            selectedScenarios={selectedScenarios}
                            customScenarios={customScenarios}
                            onTogglePreset={togglePresetScenario}
                            onToggleCustom={toggleCustomScenario}
                            onAddCustom={() => setIsCustomModalOpen(true)}
                        />
                        {selectedScenarios.length > 0 && (
                            <p className="text-xs text-accent mt-3">
                                {selectedScenarios.length} scenario{selectedScenarios.length > 1 ? "i" : ""} selezionat{selectedScenarios.length > 1 ? "i" : "o"}
                            </p>
                        )}
                    </div>
                    
                    {/* Modal Scenario Custom */}
                    <CustomScenarioModal
                        isOpen={isCustomModalOpen}
                        onClose={() => setIsCustomModalOpen(false)}
                        onSave={addCustomScenario}
                        advisors={selectedAdvisors}
                    />

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
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
                            onClick={handleProceed}
                            disabled={selectedScenarios.length === 0}
                            whileHover={selectedScenarios.length > 0 ? { scale: 1.02 } : {}}
                            whileTap={selectedScenarios.length > 0 ? { scale: 0.98 } : {}}
                            className={`
                                ml-auto flex items-center gap-3 px-6 py-3 
                                font-sans text-sm uppercase tracking-widest 
                                transition-all rounded-xl
                                ${selectedScenarios.length > 0
                                    ? "bg-accent text-background hover:bg-accent/90 shadow-lg shadow-accent/25"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                }
                            `}
                        >
                            <span>Costruisci Scenari</span>
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )
}
