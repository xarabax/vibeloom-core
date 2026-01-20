"use client"

import { useEffect, useState } from "react"
import type { UploadedFile, AnalysisResult } from "@/components/vibeloom-wizard"

interface StepAnalysisProps {
  goal: string
  files: UploadedFile[]
  onComplete: (result: AnalysisResult) => void
}

export function StepAnalysis({ goal, files, onComplete }: StepAnalysisProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const analyze = async () => {
      try {
        const formData = new FormData()
        formData.append("goal", goal)
        files.forEach((file) => {
          formData.append("files", file)
        })

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Analysis failed")

        const result = await response.json()

        // Ensure we show the animation for at least a few seconds
        setProgress(100)
        setTimeout(() => {
          onComplete(result)
        }, 1000)

      } catch (error) {
        console.error(error)
        // Handle error (maybe add an error state)
      }
    }

    // Fake progress for visual feedback while waiting
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 1 : prev))
    }, 100)

    analyze()

    return () => clearInterval(interval)
  }, [goal, files, onComplete])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      {/* Weaving Animation */}
      <div className="relative w-64 h-64 mb-12">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-45deg)" }}>
          {/* Horizontal lines */}
          {[...Array(12)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={8 + i * 7}
              x2="100"
              y2={8 + i * 7}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border"
              style={{
                strokeDasharray: "100",
                strokeDashoffset: 100 - progress,
                transition: "stroke-dashoffset 0.1s ease-out",
              }}
            />
          ))}
          {/* Vertical lines */}
          {[...Array(12)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={8 + i * 7}
              y1="0"
              x2={8 + i * 7}
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-accent"
              style={{
                strokeDasharray: "100",
                strokeDashoffset: 100 - progress,
                transition: "stroke-dashoffset 0.1s ease-out",
                transitionDelay: `${i * 30}ms`,
              }}
            />
          ))}
        </svg>
      </div>

      <p className="font-serif text-2xl md:text-3xl text-foreground mb-4">Weaving insights...</p>

      <p className="text-muted-foreground font-sans text-sm mb-8">Analyzing patterns for: {goal}</p>

      {/* Progress bar */}
      <div className="w-64 h-px bg-border relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-muted-foreground font-sans text-xs tabular-nums">{progress}%</p>
    </div>
  )
}
