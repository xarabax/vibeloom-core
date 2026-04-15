"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Target, MoveRight, Layers, AlertCircle, Zap, Crosshair } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { PaywallModal } from "./paywall-modal"

export interface DiscoveryOpportunity {
    title: string
    area: string
    economic_impact: string
    urgency: string
    urgency_rationale: string
    tech_stack: string[]
    workflow: string
    estimated_time: string
    why_it_matters: string
}

interface StepDiscoveryProps {
    input: { text: string; fileText: string; fileName: string }
    onSelectOpportunity: (opportunity: DiscoveryOpportunity) => void
    onBack: () => void
}

export function StepDiscovery({ input, onSelectOpportunity, onBack }: StepDiscoveryProps) {
    const { t, language } = useLanguage()
    const [opportunities, setOpportunities] = useState<DiscoveryOpportunity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPaywallOpen, setIsPaywallOpen] = useState(false)
    const fetched = useRef(false)

    useEffect(() => {
        if (fetched.current) return
        fetched.current = true

        const runDiscovery = async () => {
            try {
                // Pass language along with input
                const payload = { ...input, language }
                const res = await fetch("/api/discovery", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })

                if (res.status === 403) {
                    setIsPaywallOpen(true)
                    setIsLoading(false)
                    return
                }

                const data = await res.json()
                
                if (data.opportunities) {
                    setOpportunities(data.opportunities)
                    if (data.mock) {
                        setError(`Rete instabile. Visualizzazione di opportunità standard. ${data.debugInfo ? `[DEBUG: ${data.debugInfo}]` : ''}`)
                    }
                } else {
                    throw new Error("Formato json inaspettato dal server")
                }
            } catch (err) {
                console.error(err)
                setError("Impossibile analizzare i dati con l'intelligenza artificiale.")
            } finally {
                setIsLoading(false)
            }
        }

        runDiscovery()
    }, [input, language])

    return (
        <div className="flex flex-col items-center justify-start min-h-[70vh] max-w-7xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-20">
            
            {/* Header */}
            <div className="text-center space-y-4 w-full max-w-3xl mx-auto mt-6">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-2">
                    {t.discovery.tag}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    {t.discovery.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {t.discovery.subtitle}
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm font-medium px-4 py-2 rounded-md">
                    ⚠️ {error}
                </div>
            )}

            {/* Opportunities Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-card/10 rounded-3xl border border-dashed border-border/50">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">{t.discovery.loadingTitle}</h3>
                    <p className="text-muted-foreground animate-pulse">{t.discovery.loadingSub}</p>
                </div>
            )}

            {/* Opportunities Grid / Cards */}
            {!isLoading && opportunities.length > 0 && (
                <div className="w-full space-y-6 mt-8">
                    {opportunities.map((opp, index) => (
                        <div key={index} className="flex flex-col lg:flex-row bg-card border border-border/60 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
                            
                            {/* Left Side: Info */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wide">
                                            {opp.area}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-2xl md:text-3xl font-extrabold mb-3 group-hover:text-primary transition-colors">{opp.title}</h3>
                                    
                                    <p className="text-foreground/80 md:text-lg mb-6 leading-relaxed">
                                        <span className="font-semibold text-foreground">{t.discovery.eval_gap}</span> {opp.why_it_matters}
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pt-6 border-t border-border/40">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">{t.discovery.eval_impact}</p>
                                        <p className="text-xl md:text-2xl font-extrabold flex items-center text-primary"><Target className="w-6 h-6 mr-2 text-primary/70"/> {opp.economic_impact}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">{t.discovery.eval_priority}</p>
                                        <p className={`text-lg font-bold flex items-center pt-1
                                            ${opp.urgency?.toLowerCase().includes('alta') || opp.urgency?.toLowerCase().includes('high') ? 'text-red-500' :
                                              opp.urgency?.toLowerCase().includes('medi') ? 'text-yellow-500' : 'text-green-500'}
                                        `}>
                                            <AlertCircle className="w-5 h-5 mr-1.5" /> {opp.urgency}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1.5 leading-tight">{opp.urgency_rationale}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">{t.discovery.eval_time}</p>
                                        <p className="text-lg font-medium flex items-center pt-1"><Zap className="w-4 h-4 mr-2 text-stone-500"/> {opp.estimated_time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: The Stack & Handoff */}
                            <div className="w-full lg:w-[420px] bg-muted/30 p-6 md:p-8 flex flex-col border-l border-border/40">
                                <h4 className="font-bold mb-5 uppercase text-xs tracking-widest text-muted-foreground flex items-center">
                                    <Layers className="w-4 h-4 mr-2"/> {t.discovery.eval_stack}
                                </h4>
                                
                                <div className="space-y-6 flex-1">
                                    {/* Tech Badges */}
                                    <div>
                                        <ul className="flex flex-wrap gap-2">
                                            {opp.tech_stack?.map((tech, i) => (
                                                <li key={i} className="px-3 py-1.5 bg-background border border-border shadow-sm rounded-md text-xs font-bold text-foreground">
                                                    {tech}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    {/* Workflow Monospace Block */}
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">{t.discovery.eval_workflow}</p>
                                        <div className="bg-background/80 p-3 rounded-lg border border-border text-sm font-mono text-primary/90 leading-relaxed break-words shadow-inner">
                                            {opp.workflow}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    {/* Handoff CTA */}
                                    <Button 
                                        onClick={() => onSelectOpportunity(opp)}
                                        className="w-full h-14 text-base font-bold shadow-md hover:scale-105 transition-transform"
                                    >
                                        {t.discovery.btn_board} <MoveRight className="w-5 h-5 ml-2" />
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-3 leading-tight">
                                        {t.discovery.btn_board_sub}
                                    </p>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Actions Bottom */}
            {!isLoading && (
                <div className="flex w-full pt-4">
                    <Button variant="ghost" onClick={onBack} className="h-12 hover:bg-muted">
                        <ArrowLeft className="w-4 h-4 mr-2" /> {t.discovery.btn_back}
                    </Button>
                </div>
            )}

            <PaywallModal open={isPaywallOpen} onOpenChange={setIsPaywallOpen} />
        </div>
    )
}
