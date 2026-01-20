"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, Check } from "lucide-react"
import { toast } from "sonner"
import type { UploadedFile } from "@/components/vibeloom-wizard"

interface StepFeedingProps {
  goal: string
  onComplete: (files: UploadedFile[]) => void
}

const requiredDossiers = [
  { id: "bando", label: "Bando Text" },
  { id: "financials", label: "Company Financials" },
  { id: "market", label: "Market Analysis" },
  { id: "competitors", label: "Competitor Data" },
]

export function StepFeeding({ goal, onComplete }: StepFeedingProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const [validating, setValidating] = useState(false)

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
        toast.error(`File rejected: ${file.name}`, {
          description: error.error,
        })
        return false
      }

      return true
    } catch (e) {
      console.error("Validation error", e)
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
    const validFiles: UploadedFile[] = []

    for (const file of rawFiles) {
      const isValid = await validateFile(file)
      if (isValid) validFiles.push(file)
    }

    setUploadedFiles((prev) => [...prev, ...validFiles])
  }, [])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const rawFiles = Array.from(e.target.files)
      const validFiles: UploadedFile[] = []

      for (const file of rawFiles) {
        const isValid = await validateFile(file)
        if (isValid) validFiles.push(file)
      }

      setUploadedFiles((prev) => [...prev, ...validFiles])
    }
  }, [])

  const canProceed = uploadedFiles.length >= 2

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with goal */}
      <div className="mb-16">
        <p className="text-muted-foreground font-sans text-sm uppercase tracking-widest mb-2">Goal</p>
        <h1 className="font-serif text-2xl md:text-3xl text-foreground leading-tight">{goal}</h1>
      </div>

      {/* Drop Zone */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full aspect-[2/1] border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
            }`}
        >
          <Upload className="w-8 h-8 text-muted-foreground mb-4" strokeWidth={1} />
          <p className="font-serif text-xl md:text-2xl text-foreground mb-2">Feed the Loom with context</p>
          <p className="text-muted-foreground font-sans text-sm">Drop files here or click to browse</p>
          <input id="file-upload" type="file" multiple onChange={handleFileInput} className="hidden" />
        </label>

        {/* Required Dossiers */}
        <div className="w-full mt-12">
          <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-6">Required Dossiers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {requiredDossiers.map((dossier, index) => {
              const isFilled = uploadedFiles.length > index
              return (
                <div
                  key={dossier.id}
                  className={`border p-4 transition-all duration-300 ${isFilled ? "border-accent bg-accent/5" : "border-border"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {isFilled ? (
                      <Check className="w-4 h-4 text-accent" strokeWidth={1.5} />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1} />
                    )}
                    <span className={`font-sans text-sm ${isFilled ? "text-foreground" : "text-muted-foreground"}`}>
                      {isFilled ? uploadedFiles[index].name : dossier.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Continue Button */}
        {canProceed && (
          <button
            onClick={() => onComplete(uploadedFiles)}
            className="mt-12 px-8 py-3 bg-accent text-background font-sans text-sm uppercase tracking-widest hover:bg-accent/90 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            Begin Analysis
          </button>
        )}
      </div>
    </div>
  )
}
