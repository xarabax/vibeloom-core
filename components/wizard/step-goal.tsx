"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface StepGoalProps {
  onSubmit: (goal: string) => void
}

export function StepGoal({ onSubmit }: StepGoalProps) {
  const [goal, setGoal] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && goal.trim()) {
      onSubmit(goal.trim())
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground text-center leading-tight mb-12">
        What goal are we weaving today?
      </h1>
      <input
        ref={inputRef}
        type="text"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your strategic objective..."
        className="w-full max-w-2xl bg-transparent border-0 border-b border-border text-foreground text-lg md:text-xl font-sans placeholder:text-muted-foreground focus:outline-none focus:border-accent py-4 transition-colors"
      />
      <p className="mt-6 text-muted-foreground text-sm font-sans">Press Enter to continue</p>
    </div>
  )
}
