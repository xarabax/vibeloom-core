"use client"

/**
 * DecisionResultCards
 * 
 * Componente per visualizzare i risultati del Decision Board.
 * 3 Card verticali affiancate (desktop) o impilate (mobile),
 * stile "Character Select" / "Pricing Table".
 * 
 * Ogni agente ha uno stile visivo distintivo:
 * - THE SNIPER: Militare/minimalista (Slate/Green)
 * - THE GUARDIAN: Sicurezza/alert (Amber/Blue)
 * - THE VC ANALYST: Finance/premium (Emerald/Purple)
 */

import React from "react"
import { motion } from "framer-motion"
import { 
    Crosshair, 
    Shield, 
    TrendingUp,
    Scale,
    AlertTriangle,
    Zap,
    ChevronRight,
    type LucideIcon
} from "lucide-react"
import type { AgentAnalysis, AgentRole } from "@/lib/ai/services/decision-board"

// ============================================================================
// MOCK DATA - Dati finti realistici per testing
// ============================================================================

export const MOCK_RESULTS: AgentAnalysis[] = [
    {
        role: "The Sniper",
        bias_detected: "Prestige Bias",
        friction_point: "Kubernetes per 50 utenti? Stai bruciando 3 mesi di runway per far vedere che sai usare Helm. Un monolite Next.js su Vercel costa €0 e scala fino a 10.000 utenti. Il tuo ego non è un requisito tecnico.",
        verdict: "Uccidi la complessità",
        score: 35,
        action_item: "Deploya su Vercel OGGI. Zero config, zero DevOps. Risparmia €4.500/mese."
    },
    {
        role: "The Guardian",
        bias_detected: "Optimism Bias",
        friction_point: "Pre-mortem: tra 12 mesi il progetto è fallito perché hai speso il 60% del budget in infrastruttura invece che in acquisizione clienti. I microservizi hanno introdotto 47 punti di failure. Nessuno nel team sa debuggare un mesh Istio alle 3 di notte.",
        verdict: "Landmine nascoste ovunque",
        score: 42,
        action_item: "Scrivi un documento di 1 pagina: 'Cosa succede quando Kubernetes va giù alle 2AM?'. Se non hai risposta, non sei pronto."
    },
    {
        role: "The VC Analyst",
        bias_detected: "Mimetic Desire",
        friction_point: "Stai copiando l'architettura di Netflix perché l'hai vista in un talk. Netflix ha 200M utenti e 2000 ingegneri. Tu hai 50 utenti e 2 dev. Il tuo 'moat' non è l'infrastruttura - è il prodotto. Ogni ora spesa su K8s è un'ora rubata al PMF.",
        verdict: "Zero Unfair Advantage",
        score: 28,
        action_item: "Rispondi: 'Cosa impedisce a un competitor con €10M di copiarmi domani?'. Se la risposta è 'Kubernetes', hai perso."
    }
]

// ============================================================================
// STYLING CONFIGURATION per ogni agente
// ============================================================================

interface AgentStyle {
    icon: LucideIcon
    gradient: string           // Gradient per il bordo/header
    accentColor: string        // Colore accento principale
    bgColor: string            // Background della card
    iconBg: string             // Background dell'icona
    progressColor: string      // Colore della progress bar
    badgeStyle: string         // Stile del badge bias
    buttonStyle: string        // Stile del bottone CTA
}

const AGENT_STYLES: Record<AgentRole, AgentStyle> = {
    "The Sniper": {
        icon: Crosshair,
        gradient: "from-slate-600 via-slate-700 to-slate-800",
        accentColor: "text-slate-300",
        bgColor: "bg-slate-900/80",
        iconBg: "bg-slate-700",
        progressColor: "bg-slate-400",
        badgeStyle: "bg-slate-700/50 text-slate-300 border-slate-600",
        buttonStyle: "bg-slate-700 hover:bg-slate-600 text-slate-100"
    },
    "The Guardian": {
        icon: Shield,
        gradient: "from-amber-500 via-amber-600 to-orange-700",
        accentColor: "text-amber-400",
        bgColor: "bg-stone-900/80",
        iconBg: "bg-amber-600/20",
        progressColor: "bg-amber-500",
        badgeStyle: "bg-amber-900/50 text-amber-300 border-amber-700",
        buttonStyle: "bg-amber-600 hover:bg-amber-500 text-stone-900"
    },
    "The VC Analyst": {
        icon: TrendingUp,
        gradient: "from-emerald-500 via-teal-600 to-cyan-700",
        accentColor: "text-emerald-400",
        bgColor: "bg-zinc-900/80",
        iconBg: "bg-emerald-600/20",
        progressColor: "bg-emerald-500",
        badgeStyle: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
        buttonStyle: "bg-emerald-600 hover:bg-emerald-500 text-zinc-900"
    },
    "The Mentor": {
        icon: Scale,
        gradient: "from-purple-500 via-violet-600 to-indigo-700",
        accentColor: "text-purple-400",
        bgColor: "bg-purple-950/80",
        iconBg: "bg-purple-600/20",
        progressColor: "bg-purple-500",
        badgeStyle: "bg-purple-900/50 text-purple-300 border-purple-700",
        buttonStyle: "bg-purple-600 hover:bg-purple-500 text-purple-100"
    }
}

// ============================================================================
// ANIMATION VARIANTS (Framer Motion)
// ============================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,    // Ritardo tra le card
            delayChildren: 0.1
        }
    }
}

const cardVariants = {
    hidden: { 
        opacity: 0, 
        y: 50,
        scale: 0.9
    },
    visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Cerchio/Progress per il punteggio */
function ScoreCircle({ score, progressColor }: { score: number; progressColor: string }) {
    // Determina il colore del testo in base al punteggio
    const getScoreColor = (s: number) => {
        if (s >= 70) return "text-green-400"
        if (s >= 50) return "text-yellow-400"
        if (s >= 30) return "text-orange-400"
        return "text-red-400"
    }

    const circumference = 2 * Math.PI * 40 // raggio = 40
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <div className="relative w-24 h-24 mx-auto">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-white/10"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    className={progressColor.replace("bg-", "text-")}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference
                    }}
                />
            </svg>
            {/* Score number */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                    className={`text-2xl font-bold ${getScoreColor(score)}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    {score}
                </motion.span>
            </div>
        </div>
    )
}

/** Singola card agente */
function AgentCard({ 
    analysis, 
    onSelect 
}: { 
    analysis: AgentAnalysis
    onSelect?: (role: AgentRole) => void 
}) {
    const style = AGENT_STYLES[analysis.role]
    const Icon = style.icon

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
            }}
            className={`
                relative overflow-hidden rounded-2xl border border-white/10
                ${style.bgColor} backdrop-blur-sm
                flex flex-col h-full
                shadow-2xl shadow-black/50
            `}
        >
            {/* Gradient border top */}
            <div className={`h-1 bg-gradient-to-r ${style.gradient}`} />

            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${style.iconBg}`}>
                        <Icon className={`w-6 h-6 ${style.accentColor}`} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg text-white">
                            {analysis.role.replace("The ", "")}
                        </h3>
                        <p className="text-xs text-white/50 uppercase tracking-wider">
                            {analysis.role === "The Sniper" && "Pragmatico"}
                            {analysis.role === "The Guardian" && "Risk Analyst"}
                            {analysis.role === "The VC Analyst" && "Investitore"}
                        </p>
                    </div>
                </div>

                {/* Score Circle */}
                <ScoreCircle score={analysis.score} progressColor={style.progressColor} />
            </div>

            {/* Bias Detected Badge */}
            <div className="px-6 pb-4">
                <div className={`
                    inline-flex items-center gap-2 px-3 py-1.5 
                    rounded-full border text-xs font-medium
                    ${style.badgeStyle}
                `}>
                    <AlertTriangle className="w-3 h-3" />
                    {analysis.bias_detected}
                </div>
            </div>

            {/* Friction Point */}
            <div className="px-6 pb-4 flex-1">
                <div className="flex items-start gap-2 mb-2">
                    <Zap className={`w-4 h-4 mt-0.5 ${style.accentColor}`} />
                    <span className="text-xs uppercase tracking-wider text-white/60">
                        The Friction
                    </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                    {analysis.friction_point}
                </p>
            </div>

            {/* Verdict */}
            <div className="px-6 pb-4">
                <div className={`
                    p-4 rounded-xl bg-white/5 border border-white/10
                `}>
                    <p className={`text-sm font-medium ${style.accentColor}`}>
                        "{analysis.verdict}"
                    </p>
                </div>
            </div>

            {/* Action Item */}
            <div className="px-6 pb-4">
                <div className="flex items-start gap-2 mb-2">
                    <ChevronRight className={`w-4 h-4 mt-0.5 ${style.accentColor}`} />
                    <span className="text-xs uppercase tracking-wider text-white/60">
                        Fallo Subito
                    </span>
                </div>
                <p className="text-sm text-white/90 font-medium">
                    {analysis.action_item}
                </p>
            </div>

            {/* Footer CTA */}
            <div className="p-6 pt-2 mt-auto">
                <button
                    onClick={() => onSelect?.(analysis.role)}
                    className={`
                        w-full py-3 px-4 rounded-xl
                        font-sans text-sm font-medium uppercase tracking-wider
                        transition-all duration-200
                        ${style.buttonStyle}
                    `}
                >
                    Scegli questa strada
                </button>
            </div>
        </motion.div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface DecisionResultCardsProps {
    /** Array delle analisi dei 3 agenti */
    results?: AgentAnalysis[]
    /** Callback quando l'utente seleziona un agente */
    onSelectAgent?: (role: AgentRole) => void
    /** Usa dati mock se true (default: false) */
    useMock?: boolean
}

export function DecisionResultCards({ 
    results,
    onSelectAgent,
    useMock = false
}: DecisionResultCardsProps) {
    // Usa mock data se richiesto o se non ci sono risultati
    const data = useMock || !results ? MOCK_RESULTS : results

    // Ordina per score (opzionale - rimuovi se vuoi ordine fisso)
    // const sortedData = [...data].sort((a, b) => b.score - a.score)

    return (
        <div className="w-full px-4 py-8">
            {/* Header */}
            <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">
                    Il Tribunale ha deliberato
                </h2>
                <p className="text-white/60 font-sans text-sm max-w-xl mx-auto">
                    Tre prospettive. Tre bias smascherati. Una decisione più consapevole.
                </p>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
                {data.map((analysis) => (
                    <AgentCard 
                        key={analysis.role}
                        analysis={analysis}
                        onSelect={onSelectAgent}
                    />
                ))}
            </motion.div>

            {/* Footer note */}
            <motion.p 
                className="text-center text-white/40 text-xs mt-8 font-sans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                Ricorda: questi sono strumenti per pensare, non oracoli. La decisione finale è sempre tua.
            </motion.p>
        </div>
    )
}

// ============================================================================
// DEMO COMPONENT (per testing standalone)
// ============================================================================

export function DecisionResultCardsDemo() {
    const handleSelect = (role: AgentRole) => {
        console.log("Selected agent:", role)
        alert(`Hai scelto: ${role}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950">
            <DecisionResultCards 
                useMock={true}
                onSelectAgent={handleSelect}
            />
        </div>
    )
}
