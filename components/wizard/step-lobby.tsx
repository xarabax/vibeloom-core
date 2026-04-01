"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Loader2, PlayCircle, FileText } from "lucide-react"

interface StepLobbyProps {
    onSubmit: (text: string, fileText: string, fileName: string) => void
}

export function StepLobby({ onSubmit }: StepLobbyProps) {
    const [text, setText] = useState("")
    const [fileName, setFileName] = useState("")
    const [fileText, setFileText] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // Clerk hooks for lazy authentication
    const { isSignedIn, isLoaded } = useAuth()
    const clerk = useClerk()

    // Recupero magico dei dati se l'utente è stato rimbalzato dal Social Login
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const savedState = sessionStorage.getItem("vibeloom_pending_discovery")
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState)
                    sessionStorage.removeItem("vibeloom_pending_discovery")
                    // Se aveva un'elaborazione in sospeso, la spinge in automatico!
                    onSubmit(parsed.text, parsed.fileText, parsed.fileName)
                } catch (e) {
                    console.error("Errore fallback session storage", e)
                }
            }
        }
    }, [isLoaded, isSignedIn, onSubmit])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError(null)
        setFileName(file.name)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })
            
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Errore di parsing")
            }

            const data = await response.json()
            setFileText(data.text)
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Impossibile leggere il documento.")
            setFileName("")
            if (fileInputRef.current) fileInputRef.current.value = ""
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = () => {
        if (!text.trim() && !fileText) {
            setError("Scrivi qualcosa o allega un documento per iniziare l'analisi.")
            return
        }

        if (!isSignedIn) {
            // Se non è loggato, congeliamo l'input in memoria
            sessionStorage.setItem("vibeloom_pending_discovery", JSON.stringify({
                text, fileText, fileName
            }))
            // Apriamo il SignIn. Clerk gestirà l'autenticazione redirigendo se necessario.
            clerk.openSignIn({ fallbackRedirectUrl: "/" })
            return
        }

        // Utente già autenticato, procediamo regolarmente.
        onSubmit(text, fileText, fileName)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* INTESTAZIONE WEDGE */}
            <div className="text-center space-y-4 mb-10">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-foreground leading-tight">
                    Scopri dove l'AI può creare <span className="text-primary">impatto nella tua attività.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                    Dimmi cosa fai o allega i dati della tua azienda. Il motore VibeLoom genererà per te 3 opportunità concrete di automazione o crescita, prima di investirci tempo e soldi.
                </p>
            </div>

            {/* INPUT AREA */}
            <div className="w-full bg-card/50 border border-border/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl relative overflow-hidden">
                
                {/* SUGGERIMENTI / GUIDANCE */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded-md">Es. business plan (PDF)</span>
                    <span className="bg-muted px-2 py-1 rounded-md">Es. lista costi (Excel)</span>
                    <span className="bg-muted px-2 py-1 rounded-md">Es. mansionario / organigramma</span>
                </div>

                <Textarea 
                    placeholder="Descrivi la tua azienda, il tuo dipartimento o il processo operativo che ti ruba più tempo... oppure semplicemente clicca la graffetta per allegare i dati."
                    className="min-h-[160px] resize-none text-base md:text-lg bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none leading-relaxed"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {/* ATTACHMENT PILL (se allegato caricato) */}
                {fileName && !error && (
                    <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl w-max mt-4 animate-in zoom-in-95">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-semibold truncate max-w-[200px]">{fileName}</span>
                    </div>
                )}
                
                {error && (
                    <p className="text-sm text-destructive mt-3 font-medium">⚠️ {error}</p>
                )}

                {/* AZIONI BOTTOM */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-6 border-t border-border/50 gap-4">
                    
                    {/* Upload File */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept=".pdf,.docx,.xlsx,.xls,.csv,.txt"
                        />
                        <Button 
                            variant="secondary" 
                            size="lg"
                            className="w-full md:w-auto rounded-xl hover:bg-stone-800 text-stone-300 border border-stone-800"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> Elaborazione...</>
                            ) : (
                                <><Paperclip className="w-5 h-5 mr-3"/> Allega Dati Reali</>
                            )}
                        </Button>
                    </div>

                    {/* Submit */}
                    <Button 
                        size="lg" 
                        className="w-full md:w-auto h-14 px-8 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        onClick={handleSubmit}
                        disabled={isUploading}
                    >
                        Inizia la Discovery <PlayCircle className="w-6 h-6 ml-3" />
                    </Button>
                </div>

            </div>

        </div>
    )
}
