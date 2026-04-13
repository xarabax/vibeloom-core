"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

interface PaywallModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
    const { userId } = useAuth();

    if (!open) return null;

    const handleCheckout = async () => {
        try {
            const res = await fetch("/api/checkout", { method: "POST" })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || "Errore durante il checkout.")
            }
        } catch (err) {
            alert("Impossibile avviare il pagamento: " + err)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 text-stone-100 overflow-hidden shadow-2xl rounded-2xl animate-in zoom-in-95 duration-300 m-4">
                
                {/* Glow bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
                
                <div className="pt-8 pb-6 px-6">
                    <div className="mx-auto w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 ring-8 ring-primary/5 shadow-inner">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl text-center font-bold">Crediti Esauriti</h2>
                    <p className="text-center text-stone-400 mt-2 text-sm leading-relaxed">
                        Hai utilizzato tutte le tue 4 analisi gratuite. 
                        Per continuare a generare piani strategici e sfruttare il motore AI di VibeLoom, fai il salto di qualità.
                    </p>

                    <div className="bg-stone-950 rounded-xl p-5 mt-6 border border-stone-800">
                        <h4 className="flex items-center text-sm font-semibold uppercase tracking-wider mb-3 text-stone-300">
                            <Sparkles className="w-4 h-4 mr-2 text-primary" /> Vantaggi Premium
                        </h4>
                        <ul className="space-y-3 text-sm text-stone-400">
                            <li className="flex items-start"><span className="text-primary mr-2 font-bold focus">✓</span> Advisor illimitati (CFO, CMO, Tech Lead)</li>
                            <li className="flex items-start"><span className="text-primary mr-2 font-bold focus">✓</span> Generazione di report PDF Esecutivi</li>
                            <li className="flex items-start"><span className="text-primary mr-2 font-bold focus">✓</span> Chat illimitata con il Board</li>
                        </ul>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Button 
                            size="lg" 
                            className="w-full font-semibold shadow-lg shadow-primary/20 group h-12"
                            onClick={handleCheckout}
                        >
                            Sblocca Ora
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        
                        <p className="text-[10px] text-center text-stone-500 mt-1 uppercase tracking-tighter">
                            Hai bisogno di un piano Enterprise? <a href="mailto:info@ergo-sum.tv" className="text-primary hover:underline">Contattaci</a>
                        </p>


                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="w-full text-stone-500 hover:text-stone-300 mt-2">
                            Annulla e Torna Indietro
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
