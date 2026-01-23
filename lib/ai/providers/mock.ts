/**
 * MockProvider - Provider AI di test
 * 
 * Restituisce dati simulati per testare l'UI senza API key.
 * Attivato automaticamente quando non sono presenti API keys.
 */

import { AIAdapter, AnalysisResult } from "@/lib/ai/types"

export class MockProvider implements AIAdapter {
    async analyze(goal: string, files: { content: string; mimeType: string }[]): Promise<AnalysisResult> {
        console.log(`[MockProvider] Analyzing goal: "${goal.slice(0, 50)}..." with ${files.length} files`)
        
        // Simula delay di elaborazione (2-4 secondi)
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))

        // Estrae alcune parole chiave dai documenti per rendere il mock più realistico
        const allText = files.map(f => f.content).join(" ")
        const words = allText.split(/\s+/).filter(w => w.length > 5).slice(0, 10)
        const keyTerms = words.length > 0 ? words.join(", ") : "business strategy, growth, innovation"

        return {
            isMock: true,
            
            strategicInsight: `**MOCK MODE** - Nessuna API key configurata.\n\nAnalisi simulata per: "${goal}"\n\nDai documenti caricati (${files.length} file) emergono questi termini chiave: ${keyTerms}.\n\nQuesta è una simulazione per testare l'interfaccia. Per analisi reali, configura GOOGLE_GENAI_API_KEY nel file .env.local`,
            
            riskScore: 42,
            
            riskFactors: [
                {
                    factor: "Mancanza API Key",
                    severity: "Critical",
                    mitigation: "Configura GOOGLE_GENAI_API_KEY in .env.local"
                },
                {
                    factor: "Dati simulati",
                    severity: "High",
                    mitigation: "I risultati non riflettono analisi reale"
                }
            ],
            
            keyMetrics: {
                growthPotential: "85% (simulato)",
                optimalWindow: "Q1 2026 - Q2 2026",
                riskLevel: "Medium",
                investmentRequired: "€50K - €150K",
                probabilityOfSuccess: "72%"
            },
            
            nodes: [
                { id: "origin", type: "origin", label: "Goal", description: goal.slice(0, 100) },
                { id: "doc1", type: "document", label: `Doc 1`, sourceRef: files[0]?.content.slice(0, 30) || "N/A" },
                { id: "convergence", type: "convergence", label: "Analisi", description: "Convergenza dati" },
                { id: "scenario-a", type: "scenario", label: "Scenario Aggressivo", recommended: true, riskLevel: "High" },
                { id: "scenario-b", type: "scenario", label: "Scenario Conservativo", recommended: false, riskLevel: "Low" }
            ],
            
            connections: [
                { from: "origin", to: "doc1" },
                { from: "doc1", to: "convergence" },
                { from: "convergence", to: "scenario-a" },
                { from: "convergence", to: "scenario-b" }
            ],
            
            actionScenarios: [
                {
                    title: "🚀 Scenario Aggressivo (Mock)",
                    description: "Strategia ad alto rischio/alto rendimento. Investimento immediato in R&D e marketing. Questa è una simulazione per dimostrare il layout dell'interfaccia.",
                    timeline: "3-6 mesi",
                    investment: "High",
                    risk: "Alto - richiede capitale significativo",
                    returnPotential: "ROI 200-300%",
                    recommended: true,
                    keyActions: [
                        "Configurare API key Gemini",
                        "Caricare documenti reali",
                        "Ripetere l'analisi"
                    ],
                    dealBreakers: [
                        "Budget inferiore a €100K",
                        "Timeline superiore a 12 mesi"
                    ]
                },
                {
                    title: "🛡️ Scenario Conservativo (Mock)",
                    description: "Approccio graduale con validazione iterativa. Minore esposizione al rischio ma potenziale di crescita moderato.",
                    timeline: "12-18 mesi",
                    investment: "Moderate",
                    risk: "Basso - crescita organica",
                    returnPotential: "ROI 50-80%",
                    recommended: false,
                    keyActions: [
                        "Testare l'app in locale",
                        "Verificare il flusso UI completo",
                        "Preparare deployment su Vercel"
                    ]
                }
            ],
            
            sourceReferences: [
                {
                    documentName: files[0]?.content.slice(0, 20) || "Documento 1",
                    keyFindings: ["Keyword rilevate dai documenti", "Struttura testuale analizzata"],
                    reliability: "Low",
                    notes: "Dati mock - non rappresentativi"
                }
            ],
            
            blindSpots: [
                "API key non configurata - impossibile analisi AI reale",
                "Dati di mercato non verificati",
                "Competitor analysis non disponibile"
            ],
            
            bottomLine: "⚠️ MOCK MODE: Configura .env.local con GOOGLE_GENAI_API_KEY per analisi reali."
        }
    }
}
