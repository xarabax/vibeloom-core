"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface StepGoalProps {
    onSubmit: (goal: string) => void
}

// === COSTANTI ===
const MAX_GOAL_LENGTH = 1000
const MIN_GOAL_LENGTH = 10

/**
 * Sanitizza l'input per prevenire XSS e injection
 * - Rimuove tag HTML
 * - Rimuove caratteri di controllo
 * - Normalizza whitespace
 */
function sanitizeGoal(input: string): string {
    return input
        // Rimuovi tag HTML
        .replace(/<[^>]*>/g, "")
        // Rimuovi caratteri di controllo (eccetto newline/tab)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Normalizza whitespace multipli
        .replace(/\s+/g, " ")
        // Trim
        .trim()
}

/**
 * Valida il goal e restituisce errore se non valido
 */
function validateGoal(goal: string): string | null {
    if (goal.length < MIN_GOAL_LENGTH) {
        return `Please enter at least ${MIN_GOAL_LENGTH} characters`
    }
    if (goal.length > MAX_GOAL_LENGTH) {
        return `Maximum ${MAX_GOAL_LENGTH} characters allowed`
    }
    // Check per pattern sospetti (prompt injection base)
    const suspiciousPatterns = [
        /ignore\s+(previous|all|above)/i,
        /forget\s+(everything|all)/i,
        /system\s*:\s*/i,
        /\{\{.*\}\}/,  // Template injection
    ]
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(goal)) {
            return "Invalid input detected. Please rephrase your goal."
        }
    }
    return null
}

export function StepGoal({ onSubmit }: StepGoalProps) {
    const [goal, setGoal] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [charCount, setCharCount] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value
        
        // Limita lunghezza massima
        if (rawValue.length > MAX_GOAL_LENGTH) {
            return
        }

        setGoal(rawValue)
        setCharCount(rawValue.length)
        
        // Clear error while typing
        if (error) {
            setError(null)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSubmit()
        }
    }

    const handleSubmit = () => {
        // Sanitizza
        const sanitized = sanitizeGoal(goal)
        
        // Valida
        const validationError = validateGoal(sanitized)
        if (validationError) {
            setError(validationError)
            return
        }

        // Submit
        onSubmit(sanitized)
    }

    const isNearLimit = charCount > MAX_GOAL_LENGTH * 0.8
    const isOverLimit = charCount >= MAX_GOAL_LENGTH

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 animate-in fade-in duration-500">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground text-center leading-tight mb-12">
                What goal are we weaving today?
            </h1>
            
            <div className="w-full max-w-2xl relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={goal}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your strategic objective..."
                    maxLength={MAX_GOAL_LENGTH}
                    className={`w-full bg-transparent border-0 border-b text-foreground text-lg md:text-xl font-sans placeholder:text-muted-foreground focus:outline-none py-4 transition-colors ${
                        error 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-border focus:border-accent"
                    }`}
                    aria-describedby={error ? "goal-error" : undefined}
                    aria-invalid={!!error}
                />
                
                {/* Character counter */}
                <div className="absolute right-0 top-full mt-2 flex items-center gap-2">
                    <span className={`font-sans text-xs tabular-nums ${
                        isOverLimit ? "text-red-500" :
                        isNearLimit ? "text-yellow-500" :
                        "text-muted-foreground"
                    }`}>
                        {charCount}/{MAX_GOAL_LENGTH}
                    </span>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <p 
                    id="goal-error" 
                    className="mt-4 text-red-500 text-sm font-sans animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {/* Hint */}
            <p className="mt-6 text-muted-foreground text-sm font-sans">
                {goal.length >= MIN_GOAL_LENGTH 
                    ? "Press Enter to continue" 
                    : `Enter at least ${MIN_GOAL_LENGTH} characters`
                }
            </p>

            {/* Examples (opzionale) */}
            <div className="mt-12 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">Examples</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {[
                        "Evaluate SIMEST funding opportunity for market expansion",
                        "Analyze competitor acquisition target",
                        "Assess new product line viability"
                    ].map((example, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setGoal(example)
                                setCharCount(example.length)
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground border border-border hover:border-accent px-3 py-1.5 transition-colors"
                        >
                            {example.slice(0, 40)}...
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
