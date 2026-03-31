"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ADVISORS, AdvisorConfig, AdvisorId } from "@/lib/types/decision-mate"
import { ArrowLeft, ArrowRight, UserPlus, BrainCircuit } from "lucide-react"

interface StepBoardAssemblyProps {
    onComplete: (selectedAdvisors: AdvisorId[], goal: string) => void
    onBack: () => void
}

export function StepBoardAssembly({ onComplete, onBack }: StepBoardAssemblyProps) {
    const [selectedAdvisors, setSelectedAdvisors] = useState<AdvisorId[]>([])
    const [goal, setGoal] = useState("")

    const toggleAdvisor = (id: AdvisorId) => {
        setSelectedAdvisors(prev => 
            prev.includes(id) 
                ? prev.filter(a => a !== id)
                : [...prev, id]
        )
    }

    const handleContinue = () => {
        if (selectedAdvisors.length > 0 && goal.trim()) {
            onComplete(selectedAdvisors, goal)
        }
    }

    const isValid = selectedAdvisors.length > 0 && goal.trim().length > 5

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
                </Button>
                <div className="text-right">
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-end gap-3 text-foreground">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                        Prendi decisioni con AI Specialistiche
                    </h2>
                    <p className="text-muted-foreground mt-2">Spiega il problema al volo e decidi chi ascoltare.</p>
                </div>
            </div>

            {/* Dilemma / Goal Input */}
            <div className="space-y-4 bg-card/50 p-6 rounded-xl border border-border">
                <label className="text-lg font-semibold block">Di cosa discutiamo?</label>
                <textarea 
                    className="w-full bg-background border border-input rounded-md p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground resize-none"
                    placeholder="Es: Devo lanciare un nuovo prodotto SaaS nel mercato B2B, ma il budget marketing è limitato e il team tecnico è già carico di lavoro. Quale strategia dovrei adottare?"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                />
            </div>

            {/* Advisors Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Seleziona Advisor (min. 1)</h3>
                    <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                        {selectedAdvisors.length} Selezionati
                    </span>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ADVISORS.map((advisor: AdvisorConfig) => {
                        const isSelected = selectedAdvisors.includes(advisor.id)
                        return (
                            <div 
                                key={advisor.id}
                                onClick={() => toggleAdvisor(advisor.id)}
                                className={`relative group cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${
                                    isSelected 
                                        ? "border-primary bg-primary/5" 
                                        : "border-muted hover:border-primary/50 bg-card/50"
                                }`}
                            >
                                {/* Placeholder per l'illustrazione in Bianco e Nero */}
                                <div className="aspect-square bg-stone-900 flex items-center justify-center border-b border-muted relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
                                    <span className="text-5xl opacity-80 filter grayscale">{/* Emoji o icona temporanea */}
                                        {advisor.id === 'sniper' ? '🎯' : 
                                         advisor.id === 'vc' ? '📈' : 
                                         advisor.id === 'guardian' ? '🛡️' : '⚖️'}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground p-1.5 rounded-full">
                                            <UserPlus className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-lg leading-tight">{advisor.title}</h4>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{advisor.role}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 line-clamp-3 italic">
                                        "{advisor.description}"
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end pt-6 border-t border-border">
                <Button 
                    size="lg" 
                    onClick={handleContinue}
                    disabled={!isValid}
                    className="w-full md:w-auto text-lg px-8"
                >
                    Apri la Seduta <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    )
}
