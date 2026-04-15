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
      prompt1_label: "Operativo",
      prompt1_text: "Contesto: [Inserisci Dipartimento o Processo]. Strumenti attuali: [Software usati]. Trova i colli di bottiglia e progetta 3 automazioni per ridurre il tempo operativo del 30%.",
      prompt2_label: "Strategico",
      prompt2_text: "Settore: [Tuo Settore]. Fatturato: [Inserisci]. Considerando questi dati, estrai un elenco di agevolazioni o identifica i 2 centri di costo nascosti più critici.",
      prompt3_label: "Marketing",
      prompt3_text: "Obiettivo: Acquisizione. Canali: [es: LinkedIn/Email]. Crea un piano di qualificazione lead automatizzata tramite scoring prima del passaggio in [Tuo CRM].",
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
      prompt1_label: "Operations",
      prompt1_text: "Context: [Insert Department or Process]. Current tools: [Software used]. Find bottlenecks and design 3 automations to reduce operational time by 30%.",
      prompt2_label: "Strategy",
      prompt2_text: "Industry: [Your Industry]. Revenue: [Insert]. Given this data, extract a list of incentives or identify the top 2 hidden cost centers.",
      prompt3_label: "Marketing",
      prompt3_text: "Goal: Acquisition. Channels: [e.g. LinkedIn/Email]. Create an automated lead qualification plan via scoring before handoff to [Your CRM].",
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
