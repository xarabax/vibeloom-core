"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, FileJson, Play, Loader2, Target, ShieldAlert, Cpu } from "lucide-react"
import { generateExecutiveBoardPDF } from "@/lib/services/pdf-generator"
import { downloadBlueprintJSON, BlueprintSchema } from "@/lib/services/blueprint-generator"

import { useUser } from "@clerk/nextjs"
import { PaywallModal } from "./paywall-modal"

interface StepExecutionProps {
    goal: string
    scenario: any
    onReset: () => void
}

export function StepExecution({ goal, scenario, onReset }: StepExecutionProps) {
    const { user } = useUser()
    const isPremium = user?.publicMetadata?.is_premium === true;

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const [isGeneratingJSON, setIsGeneratingJSON] = useState(false)

    const [isPaywallOpen, setIsPaywallOpen] = useState(false)

    // Formattazione data odierna
    const todayDate = new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        
        if (isPremium) {
            // LASCIA SCARICARE IL PDF
            try {
                await generateExecutiveBoardPDF("pdf-template-container", "VibeLoom-Verbale-Esecutivo.pdf")
            } catch (error) {
                console.error(error)
            } finally {
                setTimeout(() => setIsGeneratingPDF(false), 800)
            }
        } else {
            // Trigger Paywall per la risorsa Premium (PDF McKinsey)
            setTimeout(() => {
                setIsGeneratingPDF(false)
                setIsPaywallOpen(true)
            }, 800)
        }
    }

    const handleDownloadJSON = () => {
        setIsGeneratingJSON(true)
        const sysBlueprint: BlueprintSchema = {
            vibeloom_version: "2.1",
            generated_at: new Date().toISOString(),
            project_goal: goal,
            recommended_tools: ["Zapier", "OpenAI", "Make.com"],
            triggers: [
                { id: "T1", app: "VibeLoom", event: "Strategy Chosen" }
            ],
            actions: [
                { id: "A1", step_order: 1, app: "System", action: "Deploy Base AI Nodes", payload_structure: { strategy: scenario?.title || "Default" } }
            ],
            ai_generated_copy: {
                email_sequences: []
            }
        }

        setTimeout(() => {
            downloadBlueprintJSON(sysBlueprint, "vibeloom-architecture-blueprint.json")
            setIsGeneratingJSON(false)
        }, 600)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-5xl mx-auto p-6 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* IL TEMPLATE NASCOSTO (A4 PRO) - Renderizzato da html2canvas */}
            <div className="absolute left-[-9999px] top-[-9999px]">
                <div id="pdf-template-container" className="w-[850px] min-h-[1100px] p-16 bg-white text-slate-900 font-sans border border-slate-200">
                    
                    {/* Header Documento */}
                    <div className="flex items-center justify-between border-b-2 border-slate-800 pb-8 mb-10">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 uppercase">VERBALE ESECUTIVO</h1>
                            <p className="text-lg text-slate-500 font-medium mt-1 tracking-widest">Confidenziale • Audit VibeLoom AI</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tighter">VibeLoom.</h2>
                            <p className="text-sm text-slate-500 mt-1">Data: {todayDate}</p>
                            <p className="text-sm text-slate-500">Documento ID: VBL-{Math.floor(Math.random() * 100000)}</p>
                        </div>
                    </div>
                    
                    {/* Contenuto Principale */}
                    <div className="space-y-10">
                        
                        {/* Sezione 1: Contesto Strategico */}
                        <section>
                            <div className="flex items-center space-x-3 mb-4">
                                <Target className="w-6 h-6 text-slate-800" />
                                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wider">1. Analisi Integrata e Contesto</h3>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-md border border-slate-200">
                                <p className="text-slate-700 leading-relaxed text-sm">
                                    {goal || "Nessun obiettivo testuale fornito dal sistema."}
                                </p>
                            </div>
                        </section>

                        {/* Sezione 2: La Direttiva Esecutiva (Scenario Scelto) */}
                        <section>
                            <div className="flex items-center space-x-3 mb-4">
                                <Cpu className="w-6 h-6 text-emerald-600" />
                                <h3 className="text-xl font-bold text-emerald-700 uppercase tracking-wider">2. La Direttiva Esecutiva Approvata</h3>
                            </div>
                            
                            {scenario ? (
                                <div className="border-l-4 border-emerald-500 pl-6 space-y-4">
                                    <div>
                                        <h4 className="text-2xl font-extrabold text-slate-900">{scenario.title}</h4>
                                        <p className="inline-flex mt-2 items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-200">
                                            Focus Strategico: {scenario.strategic_focus || "Standard"}
                                        </p>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">
                                        {scenario.description}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg">
                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Capitale Richiesto</p>
                                            <p className="text-base font-semibold text-slate-800">{scenario.investment_required}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg">
                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Lasso Temporale di Esecuzione</p>
                                            <p className="text-base font-semibold text-slate-800">{scenario.time_to_impact}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">Dati direttiva mancanti (Azione simulata).</p>
                            )}
                        </section>

                        {/* Sezione 3: Valutazione e Gestione del Rischio */}
                        <section className="page-break-before">
                            <div className="flex items-center space-x-3 mb-4">
                                <ShieldAlert className="w-6 h-6 text-red-600" />
                                <h3 className="text-xl font-bold text-red-700 uppercase tracking-wider">3. Analisi e Mitigazione Rischi</h3>
                            </div>
                            
                            <div className="bg-red-50/50 p-6 rounded-lg border border-red-100">
                                <ul className="space-y-3">
                                    {scenario?.risk_analysis && Array.isArray(scenario.risk_analysis) ? (
                                        scenario.risk_analysis.map((risk: string, i: number) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-red-500 mr-2 font-bold">•</span>
                                                <span className="text-slate-700 text-sm leading-relaxed">{risk}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-500 text-sm italic">Profilo di rischio non specificato. Da valutare caso per caso.</li>
                                    )}
                                </ul>
                            </div>
                        </section>

                    </div>

                    {/* Footer / Fofirmatari */}
                    <div className="mt-20 pt-8 border-t border-slate-200">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Generato ed Espedito by</p>
                                <div className="h-10 w-48 border-b border-slate-300">
                                    <span className="text-xl inline-block mt-2 font-[satisfy] font-medium text-slate-700 italic">VibeLoom Board of AI</span>
                                </div>
                            </div>
                            <div className="text-right text-xs text-slate-400">
                                Pagina 1 di 1<br/>
                                Rigorosamente ad uso interno aziendale.
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* INTERFACCIA WEB (Quella che vede l'utente) */}
            <div className="text-center space-y-4 mt-8">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/5">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    Audit Completato
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Il piano d'azione finale è stato elaborato. Ora hai una roadmap chiara, i caveat di rischio e il budget stimato. <br className="hidden md:block"/> Scarica il tuo Verbale Esecutivo.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl pt-2">
                {/* PDF Card */}
                <div className="border border-border bg-card p-8 rounded-3xl text-center space-y-6 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Download className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-2xl mb-2">Verbale Esecutivo</h3>
                        <p className="text-sm text-muted-foreground px-2">Il riassunto in PDF stile McKinsey pronto da presentare ai soci e al team.</p>
                    </div>
                    <Button 
                        size="lg" 
                        className="w-full h-14 font-bold text-lg rounded-xl shadow-md" 
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                    >
                        {isGeneratingPDF ? (
                            <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Creazione in corso...</>
                        ) : (
                            'Scarica PDF'
                        )}
                    </Button>
                </div>

                {/* Blueprint JSON */}
                <div className="border border-border bg-card p-8 rounded-3xl text-center space-y-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <FileJson className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-2xl mb-2">Node Blueprint</h3>
                        <p className="text-sm text-muted-foreground px-2">Esporta la mappa tecnica JSON da passare ai dev per le automazioni.</p>
                    </div>
                    <Button 
                        variant="secondary" 
                        size="lg" 
                        className="w-full h-14 font-bold" 
                        onClick={handleDownloadJSON}
                        disabled={isGeneratingJSON}
                    >
                        {isGeneratingJSON ? (
                            <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Esportazione...</>
                        ) : (
                            'Esporta Architecture'
                        )}
                    </Button>
                </div>
            </div>

            <div className="pt-8 text-center w-full">
                <Button variant="ghost" size="lg" onClick={onReset} className="text-muted-foreground hover:text-foreground h-12">
                    ← Esegui una Nuova Discovery
                </Button>
            </div>
            
            <PaywallModal open={isPaywallOpen} onOpenChange={setIsPaywallOpen} />
        </div>
    )
}
