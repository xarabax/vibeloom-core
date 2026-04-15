export type LocaleString = "it" | "en";

export const translations = {
  it: {
    lobby: {
      titleHigh1: "Scopri dove l'AI può creare ",
      titleHigh2: "impatto nella tua attività.",
      subtitle: "Dimmi cosa fai o allega i dati della tua azienda. Il motore AI-ergo-sum genererà per te 3 opportunità concrete di automazione o crescita, prima di investirci tempo e soldi.",
      sug_plan: "Es. business plan (PDF)",
      sug_costs: "Es. lista costi (Excel)",
      sug_org: "Es. mansionario / organigramma",
      placeholder: "Descrivi la tua azienda, il tuo dipartimento o il processo operativo che ti ruba più tempo... oppure semplicemente clicca la graffetta per allegare i dati.",
      prompt1_label: "Ingegnerizzazione (Operativo)",
      prompt1_text: "Il mio obiettivo è abbattere i tempi di lavoro manuale nel reparto [NOME REPARTO]. Attualmente utilizziamo [SOFTWARE/TOOLS], ma il passaggio di informazioni è frammentato e perdiamo circa [NUMERO] ore a settimana. Esamina il nostro workflow e suggerisci 3 soluzioni di automazione (tramite API o webhook) che si integrino con i nostri attuali strumenti, indicando chiaramente lo stack tecnologico da introdurre.",
      prompt2_label: "Difesa Margini (Strategico)",
      prompt2_text: "Operiamo nel settore [SETTORE] con un fatturato stimato di [FATTURATO]. Nell'ultimo periodo abbiamo notato un'erosione dei margini a causa dell'aumento progressivo dei costi. Ti chiedo di identificare 2 modelli matematici o categorie di costi nascosti per questo mercato e di stilare un piano difensivo operativo per riassorbirli in tre mesi.",
      prompt3_label: "Lead Pipeline (Growth)",
      prompt3_text: "Il nostro Costo di Acquisizione (CAC) sta salendo. Acquisiamo lead principalmente tramite [CANALI], ma il tasso di conversione verso la vendita finale è basso a causa di richieste spesso fuori target. Costruisci una pipeline automatizzata che filtri i contatti in entrata tramite scoring o architetture RAG prima della presa in carico dal team Sales.",
      btn_attach: "Allega Dati Reali",
      btn_processing: "Elaborazione...",
      btn_start: "Inizia la Discovery",
      err_empty: "Scrivi qualcosa o allega un documento per iniziare l'analisi."
    },
    discovery: {
      tag: "Diagnostica VibeLoom",
      title: "Le tue 3 Opportunità di Impatto",
      subtitle: "Abbiamo individuato 3 aree in cui l'AI può generare risultati concreti e immediati per ottimizzare margini e tempi.",
      loadingTitle: "Ingegnerizzazione stack in corso...",
      loadingSub: "L'AI sta incrociando i tuoi dati con le architetture SaaS e RAG più efficaci.",
      eval_gap: "Gap Operativo:",
      eval_impact: "Impatto Economico",
      eval_priority: "Priorità d'Azione",
      eval_time: "Tempo Stimato",
      eval_stack: "Stack Tecnologico",
      eval_workflow: "Soluzione Descritta",
      btn_board: "Porta nel Board Tecnico",
      btn_board_sub: "Approfondisci i costi API, le criticità e i dettagli di implementazione con l'Advisor.",
      btn_back: "Nuova Discovery"
    },
    board: {
      active_advisors: "Advisor attivi",
      focus: "Focus:",
      loading: "L'Advisor sta elaborando...",
      next_text: "L'analisi sembra arrivata a un punto di svolta.",
      btn_next: "Genera Mappa Scenari",
      placeholder: "Rispondi al Board o fai una domanda provocatoria...",
      attach_title: "Carica un documento (PDF, Excel, Word)"
    }
  },
  en: {
    lobby: {
      titleHigh1: "Discover where AI can create ",
      titleHigh2: "impact in your business.",
      subtitle: "Tell me what you do or attach your company data. The AI-ergo-sum engine will generate 3 concrete automation or growth opportunities for you, before investing time and money.",
      sug_plan: "E.g. business plan (PDF)",
      sug_costs: "E.g. cost list (Excel)",
      sug_org: "E.g. job descriptions / org chart",
      placeholder: "Describe your company, your department or the operational process that steals the most time... or simply click the paperclip to attach your data.",
      prompt1_label: "Engineering (Operations)",
      prompt1_text: "My goal is to drastically reduce manual labor times in the [DEPARTMENT NAME] department. Currently, we use [SOFTWARE/TOOLS], but information handoff is highly fragmented, causing us to lose [NUMBER] hours per week. Examine our workflow and suggest 3 high-impact API or webhook automations that integrate with our stack, specifying the tools required.",
      prompt2_label: "Margin Defense (Strategic)",
      prompt2_text: "We operate in the [INDUSTRY] sector with an estimated revenue of [REVENUE]. Recently, we've noticed significant margin erosion due to rising baseline costs. I request that you identify 2 hidden cost centers or mathematical models specific to this market, and draft a defensive operational plan to recover those margins within three months.",
      prompt3_label: "Lead Pipeline (Growth)",
      prompt3_text: "Our Customer Acquisition Cost (CAC) is rising. We mainly acquire leads via [CHANNELS], but the final conversion rate is too low because many requests arrive unqualified. Design an automated pipeline that pre-qualifies incoming contacts via predictive scoring or a RAG architecture before our Sales team engages them.",
      btn_attach: "Attach Real Data",
      btn_processing: "Processing...",
      btn_start: "Start Discovery",
      err_empty: "Write something or attach a document to start the analysis."
    },
    discovery: {
      tag: "VibeLoom Diagnostics",
      title: "Your 3 Opportunities for Impact",
      subtitle: "We have identified 3 areas where AI can generate concrete and immediate results to optimize margins and time.",
      loadingTitle: "Stack engineering in progress...",
      loadingSub: "The AI is matching your data with the most effective SaaS and RAG architectures.",
      eval_gap: "Operational Gap:",
      eval_impact: "Economic Impact",
      eval_priority: "Action Priority",
      eval_time: "Estimated Time",
      eval_stack: "Tech Stack",
      eval_workflow: "Solution Described",
      btn_board: "Take to Technical Board",
      btn_board_sub: "Delve into API costs, criticalities, and implementation details with the Advisor.",
      btn_back: "New Discovery"
    },
    board: {
      active_advisors: "Active Advisors",
      focus: "Focus:",
      loading: "The Advisor is processing...",
      next_text: "The analysis seems to have reached a turning point.",
      btn_next: "Generate Scenarios Map",
      placeholder: "Reply to the Board or ask a provocative question...",
      attach_title: "Upload a document (PDF, Excel, Word)"
    }
  }
}
