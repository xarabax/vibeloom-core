"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AdvisorId, getAdvisorById } from "@/lib/types/decision-mate"
import { Send, Paperclip, CheckCircle2, FileText, ArrowRight, Loader2 } from "lucide-react"
import { PaywallModal } from "./paywall-modal"

interface Message {
    id: string
    sender: "user" | AdvisorId | "system"
    text: string
    timestamp: Date
    isFileUploaded?: boolean
}

// Aggiungiamo il parser per migliorare l'UX del testo AI
const formatSimpleMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        
        let formattedLine = line;
        
        // Remove markdown list chars for custom styling
        const isList = formattedLine.trim().startsWith('* ') || formattedLine.trim().startsWith('- ');
        if (isList) formattedLine = formattedLine.trim().substring(2);
        
        const isNumbered = formattedLine.trim().match(/^\d+\.\s/);
        if (isNumbered) formattedLine = formattedLine.replace(/^\d+\.\s/, '');

        // Bold
        const parts = formattedLine.split(/(\*\*.*?\*\*)/g);

        return (
            <p key={i} className={`text-sm leading-relaxed ${isList || isNumbered ? 'pl-5 relative border-l border-border/40 ml-1 py-1' : 'mb-2'}`}>
                {isList && <span className="absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full bg-primary/60"></span>}
                {isNumbered && <span className="absolute left-[1px] top-1 text-xs font-bold text-primary/80">→</span>}
                {parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pIdx} className="text-foreground font-extrabold">{part.slice(2, -2)}</strong>
                    }
                    return part
                })}
            </p>
        )
    })
}

const MessageContent = ({ text, isUser }: { text: string, isUser: boolean }) => {
    if (isUser) {
        return <div className="space-y-1">{formatSimpleMarkdown(text)}</div>
    }

    // Rimuoviamo gli header grossi e gli asterischi (anche annidati, es. #### **) a inizio riga per far matchare "Fase" o "Step" pulito.
    let cleanText = text.replace(/^[\#\*\-\s]+/gm, '');

    // Dividiamo il testo ogni volta che troviamo "Fase", "Step", o "Passo" all'inizio riga
    const stepRegex = /(?:\n|^)(?=(?:Fase|Step|Passo|Analisi Preliminare|Top 3 priorità|Roadmap|Checklist)\b)/i;
    const blocks = cleanText.split(stepRegex);

    return (
        <div className="space-y-4">
            {blocks.map((block, idx) => {
                if (!block.trim()) return null;

                const isStep = block.trim().match(/^(?:Fase|Step|Passo)\s*\d+|Analisi Preliminare/i);

                if (isStep) {
                    const lines = block.trim().split('\n');
                    const titleLine = lines[0].replace(/\*\*/g, '').trim();
                    const content = lines.slice(1).join('\n').trim();

                    return (
                        <div key={idx} className="bg-background/80 border border-primary/20 rounded-xl p-5 my-5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/60 group-hover:bg-primary transition-colors"></div>
                            <h4 className="font-extrabold text-primary mb-3 text-[15px] flex items-center">
                                {/* Extract number if present */}
                                {titleLine.match(/\d+/) && (
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] mr-2">
                                        {titleLine.match(/\d+/)?.[0]}
                                    </span>
                                )}
                                {titleLine.replace(/^(?:Fase|Step|Passo)\s*\d+[\:\.\-]?\s*/i, '')}
                            </h4>
                            <div className="opacity-95 space-y-2">
                                {formatSimpleMarkdown(content)}
                            </div>
                        </div>
                    )
                }

                return (
                    <div key={idx} className="opacity-95 space-y-2">
                        {formatSimpleMarkdown(block)}
                    </div>
                )
            })}
        </div>
    )
}

interface StepBoardSessionProps {
    mode: "preset" | "custom"
    goal: string
    selectedAdvisors: AdvisorId[]
    onComplete: (messages: Message[]) => void
}

export function StepBoardSession({ mode, goal, selectedAdvisors, onComplete }: StepBoardSessionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isPaywallOpen, setIsPaywallOpen] = useState(false)

    const hasInitialized = useRef(false)

    // Determine the preset persona based on goal
    let presetType = "custom"
    if (goal.includes("vendite") || goal.includes("ricavi")) presetType = "marketing"
    if (goal.includes("costi") || goal.includes("efficienza") || goal.includes("automati")) presetType = "tech"
    if (goal.includes("cassa") || goal.includes("rischi") || goal.includes("bandi")) presetType = "finance"

    // Initialize Chat
    useEffect(() => {
        if (messages.length === 0 && !hasInitialized.current) {
            hasInitialized.current = true
            
            if (mode === "preset") {
                setMessages([
                    { id: "1", sender: "system", text: "Audit Aziendale Avviato. Il tuo Board è pronto.", timestamp: new Date() },
                    { id: "2", sender: selectedAdvisors[0] || "mentor", text: "Benvenuto nella stanza. Per fare un'analisi seria, dimmi di più sul problema oppure usa la graffetta in basso per caricare un bilancio, una lista costi o un documento aziendale da cui partire.", timestamp: new Date() }
                ])
            } else {
                // In Custom mode, the "goal" is exactly the first user prompt!
                // We add it to state, and immediately trigger the AI response in background.
                const userMsg: Message = {
                    id: Date.now().toString(),
                    sender: "user",
                    text: goal, // "Devo creare un programma che estrae dati da pdf..."
                    timestamp: new Date()
                }
                setMessages([userMsg])
                
                triggerInitialCustomAI(userMsg)
            }
        }
    }, [mode, goal, selectedAdvisors])

    const triggerInitialCustomAI = async (firstMessage: Message) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/board-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [firstMessage], // Inviamo subito il problema utente
                    goal: firstMessage.text,
                    presetType: "custom",
                    selectedAdvisors
                })
            })

            const data = await res.json()
            
            if (res.status === 403 || data.error === "PAYWALL_ACTIVE") {
                 setIsPaywallOpen(true)
                 setIsLoading(false)
                 return
            }

            if (data.error && !data.mock) throw new Error(data.error)

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: selectedAdvisors.length > 1 ? selectedAdvisors[1] : (selectedAdvisors[0] || "sniper"),
                text: data.text || "...",
                timestamp: new Date()
            }
            
            setMessages(prev => [...prev, aiMsg])
        } catch (error) {
            console.error(error)
             setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: "system",
                text: "⚠️ Si è verificato un errore di connessione con il Board.",
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [messages, isLoading])

    const handleSendMessage = async (textToSend: string = inputValue, isHiddenContext = false) => {
        if (!textToSend.trim() && !isHiddenContext) return

        const currentHistory = [...messages]

        // Add user message to UI
        if (!isHiddenContext) {
            const newUserMsg: Message = {
                id: Date.now().toString(),
                sender: "user",
                text: textToSend,
                timestamp: new Date()
            }
            currentHistory.push(newUserMsg)
            setMessages(currentHistory)
            setInputValue("")
        }

        setIsLoading(true)

        try {
            const payloadHistory = currentHistory.filter(m => m.sender !== "system")
            // Ensure the AI gets the context
            if (isHiddenContext) {
                payloadHistory.push({
                    id: "hidden-context",
                    sender: "user",
                    text: textToSend,
                    timestamp: new Date()
                })
            }

            const res = await fetch("/api/board-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: payloadHistory,
                    goal,
                    presetType,
                    selectedAdvisors
                })
            })

            const data = await res.json()

            if (res.status === 403 || data.error === "PAYWALL_ACTIVE") {
                 setIsPaywallOpen(true)
                 setIsLoading(false)
                 return
            }

            if (data.error && !data.mock) {
                throw new Error(data.error)
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: selectedAdvisors.length > 1 ? selectedAdvisors[1] : (selectedAdvisors[0] || "sniper"),
                text: data.text || "Nessuna risposta dal server.",
                timestamp: new Date()
            }
            
            setMessages(prev => [...prev, aiMsg])

        } catch (error) {
            console.error("Chat Error:", error)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: "system",
                text: "⚠️ Si è verificato un errore di connessione con il Board.",
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Errore upload")

            // Aggiungiamo un messaggio visivo per l'utente
            const fileMsg: Message = {
                id: Date.now().toString(),
                sender: "user",
                text: `Caricato documento: ${file.name}\nDimensione: ${(file.size / 1024).toFixed(1)} KB`,
                timestamp: new Date(),
                isFileUploaded: true
            }
            setMessages(prev => [...prev, fileMsg])

            // Mandiamo in backgound il testo puro all'AI, facendolo figurare come un prompt utente "nascosto"
            // così l'AI reagisce immediatamente al contenuto del documento.
            const hiddenContext = `Ho appena caricato un documento aziendale intitolato "${file.name}". Contenuto estratto:\n\n${data.text}\n\nAnalizza silenziosamente questi dati alla luce del nostro obiettivo. Dimmi cosa noti di allarmante o le prime deduzioni immediate.`
            
            await handleSendMessage(hiddenContext, true)

        } catch (error) {
            alert("Errore durante l'elaborazione del file: " + error)
        } finally {
            setIsUploading(false)
            // Reset input per permettere di ricaricare lo stesso file
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <div className="flex flex-col h-[80vh] max-w-5xl mx-auto border border-border rounded-xl overflow-hidden bg-card/30 animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
            {/* Header Chat */}
            <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-lg">{mode === 'preset' ? 'Audit Aziendale in corso' : 'Sessione Board Custom'}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-1">{mode === 'preset' ? `Focus: ${presetType.toUpperCase()}` : `Obiettivo: ${goal}`}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mb-1">Board Tecnico Attivo</p>
                    <div className="flex gap-2 flex-wrap justify-end">
                        {selectedAdvisors.map(id => {
                            const adv = getAdvisorById(id)
                            return adv ? (
                                <div key={id} className={`px-3 py-1.5 rounded-full border border-border/50 flex items-center justify-center shadow-sm ${adv.colorClasses}`}>
                                    <span className="text-[11px] uppercase font-bold tracking-wider whitespace-nowrap">
                                        {adv.title} <span className="opacity-60 mx-1">&bull;</span> {adv.role}
                                    </span>
                                </div>
                            ) : null
                        })}
                    </div>
                </div>
            </div>

            {/* Area Messaggi */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6">
                <div className="space-y-6">
                    {messages.map(msg => {
                        const isUser = msg.sender === "user"
                        const isSystem = msg.sender === "system"
                        const advisor = !isUser && !isSystem ? getAdvisorById(msg.sender as AdvisorId) : null

                        if (isSystem) {
                            return (
                                <div key={msg.id} className="flex justify-center text-xs text-muted-foreground my-4">
                                    <span className="bg-muted px-4 py-1.5 rounded-full font-medium">{msg.text}</span>
                                </div>
                            )
                        }

                        return (
                            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2`}>
                                {!isUser && advisor && (
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-1 ${advisor.colorClasses}`}>
                                        <span className="text-sm font-bold shadow-sm">{advisor.title.replace(/^The\s/i, '').charAt(0)}</span>
                                    </div>
                                )}
                                
                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 shadow-sm ${
                                    isUser 
                                        ? msg.isFileUploaded 
                                            ? 'bg-secondary/40 border-2 border-secondary/50 text-secondary-foreground'
                                            : 'bg-primary text-primary-foreground font-medium' 
                                        : 'bg-stone-800/80 text-foreground border border-stone-700/50'
                                }`}>
                                    {!isUser && advisor && (
                                        <div className="text-[11px] font-bold mb-2 opacity-60 uppercase tracking-widest flex items-center gap-2">
                                            {advisor.title} <span className="w-1 h-1 bg-current rounded-full"></span> {advisor.role}
                                        </div>
                                    )}
                                    
                                    {msg.isFileUploaded ? (
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-background rounded-lg">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium leading-tight">{msg.text}</span>
                                        </div>
                                    ) : (
                                        <MessageContent text={msg.text} isUser={isUser} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    
                    {/* Indicatore di caricamento del Board */}
                    {isLoading && (
                        <div className="flex justify-start w-full animate-in fade-in">
                            <div className="w-10 h-10 rounded-full bg-stone-800/50 flex-shrink-0 flex items-center justify-center mr-3 mt-1 border border-stone-700">
                                <span className="text-sm font-bold animate-pulse text-muted-foreground">AI</span>
                            </div>
                            <div className="bg-stone-800/50 text-muted-foreground rounded-2xl p-4 flex items-center space-x-2 border border-stone-700/50">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-sm font-medium animate-pulse">L'Advisor sta elaborando...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Action Bar (Chiudi sessione) */}
            {messages.length > 5 && !isLoading && (
                <div className="bg-primary/5 p-4 text-center border-t border-primary/10 animate-in slide-in-from-bottom-2">
                    <p className="text-sm text-foreground/80 font-medium mb-3">L'analisi sembra arrivata a un punto di svolta.</p>
                    <Button onClick={() => onComplete(messages)} size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20">
                        Genera Mappa Scenari <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <div className="flex items-center space-x-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.docx,.xlsx,.xls,.csv,.txt"
                        onChange={handleFileChange}
                    />
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 border-muted"
                        title="Carica un documento (PDF, Excel, Word)"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isUploading}
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Paperclip className="w-5 h-5" />}
                    </Button>
                    <Input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        placeholder="Rispondi al Board o fai una domanda provocatoria..."
                        className="flex-1 h-12 text-base px-6 rounded-full border-muted bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0 border shadow-inner"
                        disabled={isLoading || isUploading}
                    />
                    <Button 
                        onClick={() => handleSendMessage()}
                        size="icon" 
                        className="h-12 w-12 rounded-full flex-shrink-0 shadow-md"
                        disabled={!inputValue.trim() || isLoading || isUploading}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                
                <PaywallModal open={isPaywallOpen} onOpenChange={setIsPaywallOpen} />
            </div>
        </div>
    )
}
