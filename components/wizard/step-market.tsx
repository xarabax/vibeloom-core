"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Upload, FileText, Check, Sparkles, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import type { MarketData } from "@/lib/types/decision-mate"

interface StepMarketProps {
    /** Problema/obiettivo dallo Step 1 (usato per generare analisi AI) */
    problem: string
    /** Callback quando l'utente completa lo step */
    onComplete: (marketData: MarketData) => void
    /** Callback per tornare indietro */
    onBack?: () => void
}

/**
 * Step 2: Dati di Mercato
 * 
 * L'utente può:
 * 1. Caricare file (PDF, CSV, TXT) con dati di mercato
 * 2. Cliccare "Analisi automatica" per generare un riassunto AI
 */
export function StepMarket({ problem, onComplete, onBack }: StepMarketProps) {
    // Stato per file upload
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [validating, setValidating] = useState(false)
    
    // Stato per analisi AI
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiSummary, setAiSummary] = useState<string | null>(null)

    // === FILE UPLOAD HANDLERS ===

    const validateFile = async (file: File): Promise<boolean> => {
        try {
            setValidating(true)
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                toast.error(`File rifiutato: ${file.name}`, {
                    description: error.error,
                })
                return false
            }

            toast.success(`File accettato: ${file.name}`)
            return true
        } catch (e) {
            console.error("Errore validazione", e)
            toast.error("Impossibile validare il file")
            return false
        } finally {
            setValidating(false)
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const rawFiles = Array.from(e.dataTransfer.files)
        const validFiles: File[] = []

        for (const file of rawFiles) {
            const isValid = await validateFile(file)
            if (isValid) validFiles.push(file)
        }

        setUploadedFiles((prev) => [...prev, ...validFiles])
        // Reset AI summary se l'utente carica nuovi file
        if (validFiles.length > 0) {
            setAiSummary(null)
        }
    }, [])

    const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const rawFiles = Array.from(e.target.files)
            const validFiles: File[] = []

            for (const file of rawFiles) {
                const isValid = await validateFile(file)
                if (isValid) validFiles.push(file)
            }

            setUploadedFiles((prev) => [...prev, ...validFiles])
            if (validFiles.length > 0) {
                setAiSummary(null)
            }
        }
    }, [])

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    // === AI ANALYSIS HANDLER ===

    const handleAutoAnalysis = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch("/api/market-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problem }),
            })

            if (!response.ok) {
                throw new Error("Impossibile generare l'analisi di mercato")
            }

            const data = await response.json()
            setAiSummary(data.summary)
            toast.success("Analisi di mercato generata!")
        } catch (error) {
            console.error("Errore analisi automatica:", error)
            toast.error("Analisi fallita. Riprova.")
        } finally {
            setIsGenerating(false)
        }
    }

    // === COMPLETION ===

    const handleContinue = () => {
        if (uploadedFiles.length > 0) {
            // Utente ha caricato file
            onComplete({
                source: "upload",
                files: uploadedFiles,
                generatedAt: new Date()
            })
        } else if (aiSummary) {
            // Utente ha usato analisi AI
            onComplete({
                source: "ai-generated",
                aiSummary,
                generatedAt: new Date()
            })
        }
    }

    const canProceed = uploadedFiles.length > 0 || aiSummary !== null

    return (
        <div className="min-h-screen flex flex-col px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header con problema */}
            <div className="mb-12">
                <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-2">
                    Passo 2 di 9 — Dati di Mercato
                </p>
                <h1 className="font-serif text-2xl md:text-3xl text-foreground leading-tight mb-4">
                    Alimenta il contesto
                </h1>
                <p className="text-muted-foreground font-sans text-sm max-w-2xl">
                    Carica ricerche di mercato, analisi competitor o documenti rilevanti. 
                    Oppure lascia che l'AI faccia una scansione rapida del mercato.
                </p>
            </div>

            {/* Problema di riferimento */}
            <div className="mb-8 p-4 border border-border bg-muted/30 rounded">
                <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-1">
                    La Tua Decisione
                </p>
                <p className="font-sans text-sm text-foreground">{problem}</p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full">
                
                {/* Left: File Upload */}
                <div className="flex-1">
                    <label
                        htmlFor="file-upload-market"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full aspect-[3/2] border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded ${
                            isDragging 
                                ? "border-accent bg-accent/5" 
                                : "border-border hover:border-muted-foreground"
                        }`}
                    >
                        {validating ? (
                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-muted-foreground mb-4" strokeWidth={1} />
                                <p className="font-serif text-lg text-foreground mb-2">
                                    Trascina i file qui
                                </p>
                                <p className="text-muted-foreground font-sans text-sm">
                                    PDF, CSV, TXT, Excel supportati
                                </p>
                            </>
                        )}
                        <input 
                            id="file-upload-market" 
                            type="file" 
                            multiple 
                            onChange={handleFileInput} 
                            className="hidden" 
                            accept=".pdf,.csv,.txt,.xlsx,.xls,.docx"
                        />
                    </label>

                    {/* Lista file caricati */}
                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-between p-3 border border-accent/30 bg-accent/5 rounded"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                        <span className="font-sans text-sm text-foreground">
                                            {file.name}
                                        </span>
                                        <span className="font-sans text-xs text-muted-foreground">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center lg:flex-col">
                    <div className="h-px w-16 lg:h-16 lg:w-px bg-border" />
                    <span className="px-4 py-2 text-muted-foreground font-sans text-xs uppercase">
                        oppure
                    </span>
                    <div className="h-px w-16 lg:h-16 lg:w-px bg-border" />
                </div>

                {/* Right: AI Analysis */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center max-w-sm">
                        <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" strokeWidth={1} />
                        <h3 className="font-serif text-xl text-foreground mb-3">
                            Nessun dato? Ci pensa l'AI
                        </h3>
                        <p className="text-muted-foreground font-sans text-sm mb-6">
                            Genereremo una scansione rapida del mercato basata sulla tua decisione.
                        </p>
                        
                        <button
                            onClick={handleAutoAnalysis}
                            disabled={isGenerating}
                            className={`px-6 py-3 bg-accent text-background font-sans text-sm uppercase tracking-widest hover:bg-accent/90 transition-all rounded flex items-center gap-2 mx-auto ${
                                isGenerating ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analisi in corso...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Analisi automatica
                                </>
                            )}
                        </button>

                        {/* AI Summary Preview */}
                        {aiSummary && (
                            <div className="mt-6 p-4 border border-accent/30 bg-accent/5 rounded text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="w-4 h-4 text-accent" />
                                    <span className="font-sans text-xs uppercase tracking-widest text-accent">
                                        Riepilogo AI Pronto
                                    </span>
                                </div>
                                <p className="font-sans text-sm text-foreground line-clamp-4">
                                    {aiSummary}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-12 flex justify-between items-center max-w-6xl mx-auto w-full">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-6 py-3 border border-border text-foreground font-sans text-sm uppercase tracking-widest hover:border-accent transition-colors rounded"
                    >
                        Indietro
                    </button>
                )}
                
                {canProceed && (
                    <button
                        onClick={handleContinue}
                        className="ml-auto px-8 py-3 bg-accent text-background font-sans text-sm uppercase tracking-widest hover:bg-accent/90 transition-colors rounded animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        Continua al Contesto
                    </button>
                )}
            </div>
        </div>
    )
}
