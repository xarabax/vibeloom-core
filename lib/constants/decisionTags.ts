/**
 * Decision Tags - Suggerimenti predefiniti per Assunzioni e Rischi
 * 
 * Ogni tag è categorizzato per "Lente Decisionale" (Sniper, Guardian, VC).
 * Usati nella Combobox del TimelineNode per guided inputs.
 */

export interface DecisionTag {
    /** Testo visualizzato nel chip */
    label: string
    /** Categoria/Lente decisionale */
    category: "Sniper" | "Guardian" | "VC"
    /** Tooltip esplicativo */
    tooltip: string
}

export const SUGGESTED_TAGS = {
    assumptions: [
        { 
            label: "CAC < 50€", 
            category: "Sniper", 
            tooltip: "Assumi che l'acquisizione sia economica." 
        },
        { 
            label: "No Legal Blockers", 
            category: "Guardian", 
            tooltip: "Assumi che il GDPR/Compliance non blocchi il lancio." 
        },
        { 
            label: "Viral Loop > 1.2", 
            category: "VC", 
            tooltip: "Assumi una crescita organica esponenziale." 
        },
        { 
            label: "Tech Stack Stable", 
            category: "Guardian", 
            tooltip: "Assumi che la tecnologia scelta non abbia debito tecnico immediato." 
        },
        { 
            label: "Payback < 3 Months", 
            category: "Sniper", 
            tooltip: "Rientro dell'investimento immediato." 
        },
        { 
            label: "Competitor Ignore Us", 
            category: "VC", 
            tooltip: "Assumi che i competitor non reagiscano subito." 
        },
        { 
            label: "Team Available", 
            category: "Sniper", 
            tooltip: "Il team ha bandwidth per questo progetto." 
        },
        { 
            label: "Market Timing OK", 
            category: "VC", 
            tooltip: "Il mercato è pronto per questa soluzione." 
        },
        { 
            label: "Budget Approved", 
            category: "Guardian", 
            tooltip: "Il budget è già stato approvato." 
        },
        { 
            label: "MVP in 30 Days", 
            category: "Sniper", 
            tooltip: "Possiamo costruire e lanciare in un mese." 
        }
    ] as DecisionTag[],
    
    risks: [
        { 
            label: "Low Adoption", 
            category: "Sniper", 
            tooltip: "Il mercato non vuole l'MVP." 
        },
        { 
            label: "Data Breach", 
            category: "Guardian", 
            tooltip: "Rischio critico di sicurezza/privacy." 
        },
        { 
            label: "Platform Lock-in", 
            category: "Guardian", 
            tooltip: "Difficile migrare via da questo fornitore." 
        },
        { 
            label: "Feature Creep", 
            category: "Sniper", 
            tooltip: "Aggiunta continua di funzioni inutili." 
        },
        { 
            label: "Runway Depletion", 
            category: "VC", 
            tooltip: "Fine dei soldi prima del Product-Market Fit." 
        },
        { 
            label: "Regulatory Change", 
            category: "Guardian", 
            tooltip: "Nuove leggi che uccidono il business model." 
        },
        { 
            label: "Tech Debt", 
            category: "Sniper", 
            tooltip: "Accumulo di debito tecnico che rallenta." 
        },
        { 
            label: "Team Burnout", 
            category: "Guardian", 
            tooltip: "Il team si esaurisce prima del lancio." 
        },
        { 
            label: "Competitor React", 
            category: "VC", 
            tooltip: "I competitor copiano o contrattaccano." 
        },
        { 
            label: "Cashflow Negative", 
            category: "VC", 
            tooltip: "Bruciamo più di quanto guadagniamo." 
        },
        { 
            label: "Scaling Issues", 
            category: "Sniper", 
            tooltip: "L'architettura non regge il carico." 
        },
        { 
            label: "Churn Elevato", 
            category: "VC", 
            tooltip: "I clienti abbandonano rapidamente." 
        }
    ] as DecisionTag[]
} as const

/**
 * Colori per categoria
 */
export const CATEGORY_COLORS: Record<DecisionTag["category"], string> = {
    Sniper: "bg-stone-800/50 text-stone-300 border-stone-600",
    Guardian: "bg-blue-950/50 text-blue-300 border-blue-700",
    VC: "bg-emerald-950/50 text-emerald-300 border-emerald-700"
}

/**
 * Icone per categoria (nomi Lucide)
 */
export const CATEGORY_ICONS: Record<DecisionTag["category"], string> = {
    Sniper: "Crosshair",
    Guardian: "Shield",
    VC: "TrendingUp"
}
