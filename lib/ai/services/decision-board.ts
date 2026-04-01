/**
 * DecisionBoardService
 * 
 * Core service per la feature "Decision Board".
 * Orchestrazione di 3 Agenti AI specializzati che lavorano in PARALLELO
 * per fornire un'analisi multi-prospettiva di un dilemma strategico.
 * 
 * Architettura:
 * - THE SNIPER: Pragmatico, anti-overengineering, Via Negativa
 * - THE GUARDIAN: CISO/Legal, Pre-mortem, Risk Assessment  
 * - THE VC ANALYST: Investitore, Scalabilità, Unfair Advantage
 * 
 * @author VibeLoom Core Team
 */

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

// ============================================================================
// TYPES
// ============================================================================

/** Ruoli degli agenti AI (4 advisor) */
export type AgentRole = "The Sniper" | "The Guardian" | "The VC Analyst" | "The Mentor"

/** Analisi singola di un agente */
export interface AgentAnalysis {
    role: AgentRole
    bias_detected: string      // Bias cognitivo rilevato
    friction_point: string     // Critica principale
    verdict: string            // Titolo breve del consiglio
    score: number              // 0-100
    action_item: string        // Cosa fare subito
}

/** Risultato aggregato del Decision Board */
export interface DecisionBoardResult {
    agents_analysis: AgentAnalysis[]
    timestamp: string
    input_hash: string         // Per cache/dedup
}

/** Messaggio nella discussione */
export interface DiscussionMessage {
    id: string
    role: "user" | AgentRole
    content: string
    timestamp: string
}

/** Stato della discussione */
export interface DiscussionState {
    messages: DiscussionMessage[]
    activeAdvisors: AgentRole[]
}

/** Configurazione interna di un agente */
interface AgentConfig {
    role: AgentRole
    systemPrompt: string
    temperature: number        // Varianza nella risposta
}

// ============================================================================
// SYSTEM PROMPTS - Definizioni rigorose dei 3 agenti
// ============================================================================

const AGENT_PROMPTS: Record<AgentRole, string> = {
    "The Sniper": `Sei 'The Sniper', l'agente pragmatico implacabile.

OBIETTIVO: Rilevare complessità inutile e "Prestige Bias" (usare tech sexy per ego invece che per necessità).

FILOSOFIA: Via Negativa. Togli tutto ciò che non serve per fatturare SUBITO.

AZIONI:
1. Smonta l'over-engineering spietamente
2. Se l'utente vuole usare Kubernetes per 10 utenti, microservizi per un MVP, o AI per un CRUD, chiamalo fuori (con ironia tagliente ma professionale)
3. Proponi sempre l'MVP "brutto ma funzionante" - il più piccolo esperimento che valida l'ipotesi
4. Calcola il "Complexity Tax" - quanto tempo/soldi sta bruciando in complessità non necessaria

BIAS DA RILEVARE: Prestige Bias, Shiny Object Syndrome, Resume-Driven Development, Premature Optimization.

Rispondi SEMPRE in italiano.`,

    "The Guardian": `Sei 'The Guardian', il CISO/Legal advisor paranoico.

OBIETTIVO: Proteggere l'utente dall'Optimism Bias - la tendenza a sottovalutare rischi e sovrastimare benefici.

AZIONI:
1. Esegui un PRE-MORTEM: Assumi che il progetto sia FALLITO tra 12 mesi
2. Spiega esattamente PERCHÉ è fallito, concentrandoti su:
   - Privacy/GDPR violations
   - Costi nascosti che esplodono (API, infra, legal)
   - Vendor lock-in letale
   - Single points of failure
   - Dipendenze critiche da terze parti
3. Cerca rischi legali, compliance issues, data retention problems
4. Identifica le "Landmine" nascoste che nessuno sta considerando

BIAS DA RILEVARE: Optimism Bias, Planning Fallacy, Survivorship Bias.

Rispondi SEMPRE in italiano.`,

    "The VC Analyst": `Sei 'The VC Analyst', l'investitore cinico della Sand Hill Road.

OBIETTIVO: Rilevare il Desiderio Mimetico (René Girard) - stai copiando perché altri lo fanno, non perché ha senso.

AZIONI:
1. Chiedi brutalmente: "Stai copiando un competitor senza un Unfair Advantage?"
2. Se l'idea non ha IP difendibile, network effects, o switching costs → bocciala come "Commodity Business"
3. Cerca la scalabilità x100: può crescere 100x senza 100x costi?
4. Identifica il "Moat" - cosa impedisce a un competitor con più soldi di copiarti domani?
5. Calcola il TAM reale, non quello fantasioso delle pitch deck

BIAS DA RILEVARE: Mimetic Desire, Confirmation Bias, Sunk Cost Fallacy, Groupthink.

Rispondi SEMPRE in italiano.`,

    "The Mentor": `Sei 'The Mentor', il consigliere strategico equilibrato.

OBIETTIVO: Fare sintesi tra le critiche feroci degli altri advisor e trovare la strada sostenibile.

FILOSOFIA: Bilancia rischio e opportunità. Non tutto è bianco o nero.

AZIONI:
1. Ascolta le critiche degli altri advisor e cerca il pattern comune
2. Identifica cosa è salvabile nell'idea originale
3. Proponi una via di mezzo pragmatica che tenga conto di:
   - I rischi reali (Guardian)
   - La necessità di semplificare (Sniper)
   - Il bisogno di differenziazione (VC)
4. Suggerisci un piano d'azione in 3 step prioritizzati
5. Ricorda all'utente che la decisione finale è sempre sua

APPROCCIO: Costruttivo ma onesto. Non edulcori, ma non demolisci.

Rispondi SEMPRE in italiano.`
}

// ============================================================================
// JSON SCHEMA per Structured Output (Gemini)
// ============================================================================

const AGENT_OUTPUT_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        bias_detected: {
            type: SchemaType.STRING,
            description: "Il bias cognitivo specifico rilevato nell'input dell'utente"
        },
        friction_point: {
            type: SchemaType.STRING,
            description: "La critica principale, il punto di frizione più importante"
        },
        verdict: {
            type: SchemaType.STRING,
            description: "Titolo breve del consiglio (max 10 parole)"
        },
        score: {
            type: SchemaType.INTEGER,
            description: "Punteggio da 0 a 100. 0 = pessima idea, 100 = eccellente"
        },
        action_item: {
            type: SchemaType.STRING,
            description: "Una singola azione concreta da fare SUBITO"
        }
    },
    required: ["bias_detected", "friction_point", "verdict", "score", "action_item"]
}

// ============================================================================
// MOCK DATA - Dati realistici per testing UI
// ============================================================================

const MOCK_ANALYSES: Record<AgentRole, AgentAnalysis> = {
    "The Sniper": {
        role: "The Sniper",
        bias_detected: "Prestige Bias",
        friction_point: "Stai costruendo una Ferrari per andare a comprare il pane. Il tuo MVP non ha bisogno di microservizi, Kubernetes, o architetture esagonali. Un monolite su Vercel costa €0/mese e scala fino a 50.000 utenti. Ogni ora spesa sull'infrastruttura è un'ora rubata alla validazione del prodotto. Il tuo ego ingegneristico sta sabotando il tuo business.",
        verdict: "Uccidi la complessità, spedisci domani",
        score: 42,
        action_item: "Cancella il 70% delle feature pianificate. Identifica l'UNICA cosa che risolve il problema del cliente e spediscila entro 48 ore."
    },
    "The Guardian": {
        role: "The Guardian",
        bias_detected: "Optimism Bias",
        friction_point: "Pre-mortem completato: tra 12 mesi questo progetto è fallito perché hai sottovalutato i costi nascosti. Le API di terze parti che oggi costano €50/mese esploderanno a €2.000/mese con 1.000 utenti. Non hai considerato GDPR, data retention, e il fatto che il tuo unico fornitore cloud può aumentare i prezzi del 300% domani. Single point of failure ovunque.",
        verdict: "Landmine nascoste in ogni direzione",
        score: 38,
        action_item: "Scrivi un documento di 1 pagina: 'Cosa succede quando X fallisce?' per ogni dipendenza critica. Se non hai risposta, non sei pronto."
    },
    "The VC Analyst": {
        role: "The VC Analyst",
        bias_detected: "Desiderio Mimetico",
        friction_point: "Stai copiando un competitor perché 'funziona per loro'. Ma loro hanno 5 anni di head start, €10M di funding, e un team di 50 persone. Il tuo 'moat' non esiste - chiunque con più soldi può copiarti in 3 mesi. Non vedo network effects, switching costs, o IP difendibile. Questo è un commodity business mascherato da innovazione.",
        verdict: "Zero Unfair Advantage rilevato",
        score: 35,
        action_item: "Rispondi onestamente: 'Cosa impedisce a Google di fare questa cosa domani e spazzarmi via?'. Se non hai risposta, trova un angolo diverso."
    },
    "The Mentor": {
        role: "The Mentor",
        bias_detected: "Tunnel Vision",
        friction_point: "Vedo pattern interessanti nelle critiche del Board. Lo Sniper ha ragione sulla complessità, il Guardian sui rischi nascosti, il VC sulla differenziazione. Ma c'è un filo conduttore: stai cercando di risolvere troppi problemi contemporaneamente. La strada sostenibile passa per una validazione incrementale.",
        verdict: "Semplifica, valida, poi scala",
        score: 55,
        action_item: "Step 1: Identifica il SINGOLO problema più doloroso. Step 2: Costruisci la soluzione più semplice. Step 3: Trova 10 clienti paganti prima di qualsiasi scaling."
    }
}

// ============================================================================
// MOCK DISCUSSION RESPONSES - Risposte per la chat
// ============================================================================

/**
 * Template di risposte mock per la discussione.
 * Ogni advisor ha risposte diverse basate su keyword nel messaggio utente.
 */
const MOCK_DISCUSSION_RESPONSES: Record<AgentRole, { patterns: RegExp[], responses: string[] }[]> = {
    "The Sniper": [
        {
            patterns: [/costo|budget|soldi|prezzo|euro|€/i],
            responses: [
                "Ogni euro speso in complessità è un euro che non stai investendo in acquisizione clienti. Qual è il costo REALE della tua architettura attuale?",
                "Mi stai dicendo che hai budget per Kubernetes ma non per 100 ads su Facebook? Priorità sbagliate."
            ]
        },
        {
            patterns: [/tempo|veloce|deadline|fretta/i],
            responses: [
                "Vuoi andare veloce? Taglia feature. Un MVP in 2 settimane batte un 'prodotto perfetto' in 6 mesi. Sempre.",
                "Il tempo è l'unica risorsa che non puoi comprare. Ogni giorno di delay è un giorno che qualcun altro sta validando la tua idea."
            ]
        },
        {
            patterns: [/sicuro|rischio|fallire/i],
            responses: [
                "Il rischio più grande non è fallire - è spendere 6 mesi a costruire qualcosa che nessuno vuole. Spedisci. Ora.",
                "Perfezionismo è procrastinazione travestita da diligenza. Hai paura del feedback del mercato?"
            ]
        },
        {
            patterns: [/.*/],
            responses: [
                "Interessante. Ma hai già clienti paganti? Perché tutto il resto è teoria fino a quel momento.",
                "Semplifica. Poi semplifica ancora. Poi togli altre 3 feature. Ecco il tuo MVP.",
                "Stai ragionando da ingegnere, non da imprenditore. Il codice elegante non paga le bollette."
            ]
        }
    ],
    "The Guardian": [
        {
            patterns: [/dati|privacy|gdpr|utenti/i],
            responses: [
                "Hai già consultato un DPO? Il GDPR non è un 'problema futuro' - è una bomba a orologeria che esploderà al primo cliente europeo.",
                "Chi ha accesso ai dati? Dove sono memorizzati? Per quanto tempo? Se non sai rispondere, hai un problema."
            ]
        },
        {
            patterns: [/api|terze parti|integrazione/i],
            responses: [
                "Ogni API esterna è un single point of failure. Cosa succede se domani raddoppiano i prezzi o chiudono?",
                "Hai testato cosa succede quando l'API di terze parti va in timeout? Il tuo sistema fallisce silenziosamente o gracefully?"
            ]
        },
        {
            patterns: [/sicuro|sicurezza|protetto/i],
            responses: [
                "Quando è stata l'ultima volta che hai fatto un penetration test? Mai? Ecco, questo è il problema.",
                "'Sicuro' non significa 'nessuno mi ha ancora hackerato'. Significa che hai mitigazioni attive per le minacce conosciute."
            ]
        },
        {
            patterns: [/.*/],
            responses: [
                "Faccio l'avvocato del diavolo: cosa succede se tutto va storto? Hai un piano B?",
                "Non voglio essere pessimista, ma il mio lavoro è vedere i problemi PRIMA che accadano. E ne vedo diversi.",
                "Ricorda: l'ottimismo non è una strategia di risk management."
            ]
        }
    ],
    "The VC Analyst": [
        {
            patterns: [/competitor|concorrenza|mercato/i],
            responses: [
                "Chi sono i tuoi 3 competitor diretti? Se non lo sai, non conosci il tuo mercato. Se lo sai, cosa ti rende diverso da loro?",
                "I competitor con più funding possono copiarti domani. Qual è la tua difesa? Network effects? Switching costs? IP?"
            ]
        },
        {
            patterns: [/scala|crescita|expansion|users/i],
            responses: [
                "Bellissimo. Ma può scalare x100 senza x100 costi? Se ogni nuovo utente richiede effort manuale, non è un business scalabile.",
                "La crescita senza margini è solo comprare ricavi. Qual è il tuo unit economics?"
            ]
        },
        {
            patterns: [/unico|differente|innovativo/i],
            responses: [
                "'Innovativo' lo dicono tutti. Dimmi: cosa puoi fare tu che i tuoi competitor NON possono copiare?",
                "Se il tuo vantaggio è 'eseguiamo meglio', non è un vantaggio. È una race to the bottom."
            ]
        },
        {
            patterns: [/.*/],
            responses: [
                "Toglimi un dubbio: perché qualcuno dovrebbe scegliere te invece di [inserisci competitor ovvio]?",
                "Vedo potenziale, ma anche red flags. Il mercato premia chi ha un unfair advantage, non chi 'lavora duro'.",
                "Quanto è grande il mercato REALE? Non il TAM delle slide, quello che puoi effettivamente catturare in 3 anni."
            ]
        }
    ],
    "The Mentor": [
        {
            patterns: [/consiglio|cosa faccio|aiuto|confuso/i],
            responses: [
                "Capisco la confusione. Le critiche sono intense, ma c'è un filo conduttore: devi validare prima di costruire. Qual è l'esperimento più piccolo che puoi fare questa settimana?",
                "Gli altri advisor vedono rischi reali. Ma non lasciare che la paura ti paralizzi. Scegli UNA cosa da migliorare e agisci."
            ]
        },
        {
            patterns: [/giusto|sbagliato|decidere/i],
            responses: [
                "Non esiste la decisione 'giusta' in astratto. Esiste la decisione migliore con le informazioni che hai oggi. Cosa ti dice l'istinto?",
                "Il paralysis by analysis è reale. A volte la miglior decisione è prendere una decisione, qualsiasi essa sia, e adattarsi."
            ]
        },
        {
            patterns: [/.*/],
            responses: [
                "Vedo che stai riflettendo seriamente. È un buon segno. Ora: qual è il prossimo step concreto?",
                "Gli altri advisor hanno punti validi, ma ricorda: la decisione finale è tua. Tu conosci il contesto meglio di chiunque.",
                "Bilancio le critiche: c'è del vero in ogni prospettiva. La strada giusta probabilmente sta nel mezzo. Cosa risuona di più con te?"
            ]
        }
    ]
}

/**
 * Genera una risposta mock per un advisor basata sul messaggio dell'utente.
 */
export function generateMockDiscussionResponse(
    advisor: AgentRole, 
    userMessage: string
): string {
    const advisorResponses = MOCK_DISCUSSION_RESPONSES[advisor]
    if (!advisorResponses) {
        return "Non ho una risposta per questo."
    }

    // Cerca un pattern match
    for (const { patterns, responses } of advisorResponses) {
        for (const pattern of patterns) {
            if (pattern.test(userMessage)) {
                // Ritorna una risposta random dal pool
                return responses[Math.floor(Math.random() * responses.length)]
            }
        }
    }

    // Fallback (non dovrebbe mai arrivare qui grazie al pattern /.*/)
    return "Interessante punto di vista. Dimmi di più."
}

// ============================================================================
// DECISION BOARD SERVICE
// ============================================================================

export class DecisionBoardService {
    private client: GoogleGenerativeAI | null = null
    private modelName: string = "gemini-2.0-flash"
    private useMock: boolean = false
    
    constructor(apiKey?: string) {
        // Controlla se usare mock mode
        this.useMock = process.env.USE_MOCK_AI === "true" || process.env.USE_MOCK_AI === "1"
        
        if (this.useMock) {
            console.log("[DecisionBoard] 🎭 Running in MOCK MODE - No AI calls will be made")
            return
        }
        
        const key = apiKey || process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY
        if (!key) {
            console.warn("[DecisionBoard] ⚠️ No API key found - falling back to MOCK MODE")
            this.useMock = true
            return
        }
        this.client = new GoogleGenerativeAI(key)
    }

    /**
     * Analizza uno scenario/dilemma con gli agenti AI selezionati in PARALLELO.
     * In mock mode, restituisce dati realistici per testing UI.
     * 
     * @param userInput - Il dilemma/scenario dell'utente
     * @param selectedAdvisors - Array di advisor ID selezionati (opzionale, default: sniper, guardian, vc)
     * @returns DecisionBoardResult con le analisi aggregate degli agenti
     */
    async analyzeScenario(
        userInput: string, 
        selectedAdvisors?: ("sniper" | "vc" | "guardian" | "mentor")[]
    ): Promise<DecisionBoardResult> {
        console.log("[DecisionBoard] Starting analysis for:", userInput.substring(0, 100) + "...")
        console.log("[DecisionBoard] Selected advisors:", selectedAdvisors)

        // Mappa advisor ID -> Agent Role
        const ADVISOR_ID_TO_ROLE: Record<string, AgentRole> = {
            sniper: "The Sniper",
            vc: "The VC Analyst",
            guardian: "The Guardian",
            mentor: "The Mentor"
        }

        // Determina quali agent usare
        const advisorIds = selectedAdvisors || ["sniper", "guardian", "vc"]
        const agentRoles = advisorIds.map(id => ADVISOR_ID_TO_ROLE[id]).filter(Boolean) as AgentRole[]

        // === MOCK MODE ===
        if (this.useMock) {
            console.log("[DecisionBoard] 🎭 Returning MOCK data for:", agentRoles)
            
            // Simula un piccolo delay per UX realistica
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // Restituisci solo gli advisor selezionati
            const analyses = agentRoles
                .map(role => MOCK_ANALYSES[role])
                .filter(Boolean)
            
            return {
                agents_analysis: analyses,
                timestamp: new Date().toISOString(),
                input_hash: this.hashInput(userInput)
            }
        }

        // === REAL API MODE ===
        const startTime = Date.now()

        // Configurazione degli agenti selezionati
        const agents: AgentConfig[] = agentRoles.map(role => ({
            role,
            systemPrompt: AGENT_PROMPTS[role],
            temperature: role === "The Guardian" ? 0.5 : role === "The VC Analyst" ? 0.6 : 0.7
        }))

        // ⚡ CHIAMATE PARALLELE con Promise.all
        const analysisPromises = agents.map(agent => 
            this.callAgent(agent, userInput)
        )

        const results = await Promise.all(analysisPromises)

        const elapsed = Date.now() - startTime
        console.log(`[DecisionBoard] All ${agents.length} agents completed in ${elapsed}ms`)

        // Costruisci il risultato aggregato
        const aggregatedResult: DecisionBoardResult = {
            agents_analysis: results,
            timestamp: new Date().toISOString(),
            input_hash: this.hashInput(userInput)
        }

        return aggregatedResult
    }

    /**
     * Chiama un singolo agente AI con Structured Output.
     * Usa JSON mode di Gemini per garantire output valido.
     */
    private async callAgent(config: AgentConfig, userInput: string): Promise<AgentAnalysis> {
        const startTime = Date.now()
        console.log(`[DecisionBoard] Calling agent: ${config.role}`)

        try {
            // Configura il modello con JSON Schema per structured output
            const model = this.client.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    temperature: config.temperature,
                    responseMimeType: "application/json",
                    responseSchema: AGENT_OUTPUT_SCHEMA as any
                },
                systemInstruction: config.systemPrompt
            })

            // Prompt utente
            const prompt = `Analizza questo dilemma/scenario e fornisci la tua valutazione critica:

---
${userInput}
---

Ricorda: sii spietato ma costruttivo. Il tuo obiettivo è proteggere l'utente dai suoi bias cognitivi.`

            const result = await model.generateContent(prompt)
            const response = result.response
            const text = response.text()

            // Parse JSON (già garantito dal responseSchema)
            const parsed = JSON.parse(text) as Omit<AgentAnalysis, "role">

            const elapsed = Date.now() - startTime
            console.log(`[DecisionBoard] Agent ${config.role} completed in ${elapsed}ms`)

            return {
                role: config.role,
                ...parsed,
                // Clamp score tra 0 e 100
                score: Math.max(0, Math.min(100, parsed.score))
            }

        } catch (error) {
            console.error(`[DecisionBoard] Agent ${config.role} failed:`, error)
            
            // Fallback graceful - non bloccare gli altri agenti
            return {
                role: config.role,
                bias_detected: "Errore di analisi",
                friction_point: `Impossibile completare l'analisi: ${error instanceof Error ? error.message : "Unknown error"}`,
                verdict: "Analisi non disponibile",
                score: 0,
                action_item: "Riprovare l'analisi o verificare la connessione API"
            }
        }
    }

    /**
     * Genera un hash semplice dell'input per cache/deduplicazione.
     */
    private hashInput(input: string): string {
        let hash = 0
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16)
    }
}

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

let _instance: DecisionBoardService | null = null

/**
 * Factory per ottenere un'istanza singleton del DecisionBoardService.
 * Lazy initialization per evitare errori se le env vars non sono caricate.
 */
export function getDecisionBoardService(): DecisionBoardService {
    if (!_instance) {
        _instance = new DecisionBoardService()
    }
    return _instance
}
