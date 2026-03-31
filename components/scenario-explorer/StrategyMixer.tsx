"use client"

/**
 * StrategyMixer - Barra fissa in basso per mixare i pesi degli scenari
 * 
 * Features:
 * - 3 slider per A, B, C
 * - Auto-rebalance quando uno cambia
 * - Preset buttons (Equal, Focus A, A+B only)
 * - Indicatore totale (deve essere 100%)
 */

import React, { useCallback } from "react"
import { motion } from "framer-motion"
import { Sliders, RotateCcw, Zap, Shield, TrendingUp } from "lucide-react"
import type { Scenario, ScenarioId, ScenarioWeights } from "@/lib/types/scenario-explorer"
import { rebalanceWeights } from "@/lib/types/scenario-explorer"

// ============================================================================
// PROPS
// ============================================================================

interface StrategyMixerProps {
    scenarios: Scenario[]
    weights: ScenarioWeights
    onChange: (newWeights: ScenarioWeights) => void
    onApplyHybrid?: () => void
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ScenarioSliderProps {
    scenarioId: ScenarioId
    scenario: Scenario
    value: number
    onChange: (value: number) => void
}

function ScenarioSlider({ scenarioId, scenario, value, onChange }: ScenarioSliderProps) {
    return (
        <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`
                        w-3 h-3 rounded-full
                        ${scenario.color_classes.bg}
                    `} />
                    <span className="text-xs font-medium text-foreground truncate">
                        {scenario.title}
                    </span>
                </div>
                <span className={`
                    text-sm font-bold tabular-nums
                    ${value > 0 ? scenario.color_classes.accent : "text-muted-foreground"}
                `}>
                    {value}%
                </span>
            </div>
            
            {/* Slider */}
            <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className={`
                    w-full h-2 rounded-full appearance-none cursor-pointer
                    bg-muted
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110
                    ${scenario.color_classes.bg.replace("bg-", "[&::-webkit-slider-thumb]:bg-")}
                `}
                style={{
                    background: `linear-gradient(to right, 
                        ${getComputedColor(scenario.color_classes.bg)} ${value}%, 
                        hsl(var(--muted)) ${value}%
                    )`
                }}
            />
        </div>
    )
}

// Helper per convertire classe Tailwind in colore
function getComputedColor(bgClass: string): string {
    const colorMap: Record<string, string> = {
        "bg-stone-800": "#292524",
        "bg-blue-950": "#172554",
        "bg-emerald-950": "#022c22"
    }
    return colorMap[bgClass] || "#666"
}

interface PresetButtonProps {
    label: string
    icon: React.ReactNode
    onClick: () => void
    isActive: boolean
}

function PresetButton({ label, icon, onClick, isActive }: PresetButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all
                ${isActive 
                    ? "bg-accent text-background" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }
            `}
        >
            {icon}
            {label}
        </button>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StrategyMixer({ 
    scenarios, 
    weights, 
    onChange,
    onApplyHybrid 
}: StrategyMixerProps) {
    
    // Handler per cambio singolo slider
    const handleSliderChange = useCallback((id: ScenarioId, newValue: number) => {
        const rebalanced = rebalanceWeights(id, newValue, weights)
        onChange(rebalanced)
    }, [weights, onChange])
    
    // Preset: Equal (33/33/34)
    const setEqual = useCallback(() => {
        onChange({ A: 34, B: 33, C: 33 })
    }, [onChange])
    
    // Preset: Focus A (100/0/0)
    const setFocusA = useCallback(() => {
        onChange({ A: 100, B: 0, C: 0 })
    }, [onChange])
    
    // Preset: Balanced A+B (50/50/0)
    const setBalancedAB = useCallback(() => {
        onChange({ A: 50, B: 50, C: 0 })
    }, [onChange])
    
    // Check se un preset è attivo
    const isEqual = weights.A === 34 && weights.B === 33 && weights.C === 33
    const isFocusA = weights.A === 100 && weights.B === 0 && weights.C === 0
    const isBalancedAB = weights.A === 50 && weights.B === 50 && weights.C === 0
    
    // Totale (dovrebbe sempre essere 100)
    const total = weights.A + weights.B + weights.C
    const isValid = total === 100
    
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="
                fixed bottom-0 left-0 right-0 z-50
                bg-background/95 backdrop-blur-lg
                border-t border-border
                px-6 py-4
                shadow-2xl shadow-black/20
            "
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">
                            Strategy Mixer
                        </span>
                        <span className={`
                            text-xs px-2 py-0.5 rounded-full
                            ${isValid 
                                ? "bg-emerald-950/50 text-emerald-400" 
                                : "bg-red-950/50 text-red-400"
                            }
                        `}>
                            {total}%
                        </span>
                    </div>
                    
                    {/* Presets */}
                    <div className="flex items-center gap-2">
                        <PresetButton
                            label="Uguale"
                            icon={<RotateCcw className="w-3 h-3" />}
                            onClick={setEqual}
                            isActive={isEqual}
                        />
                        <PresetButton
                            label="Speed"
                            icon={<Zap className="w-3 h-3" />}
                            onClick={setFocusA}
                            isActive={isFocusA}
                        />
                        <PresetButton
                            label="Balanced"
                            icon={<Shield className="w-3 h-3" />}
                            onClick={setBalancedAB}
                            isActive={isBalancedAB}
                        />
                    </div>
                </div>
                
                {/* Sliders */}
                <div className="flex gap-6">
                    {scenarios.map((scenario) => (
                        <ScenarioSlider
                            key={scenario.id}
                            scenarioId={scenario.id}
                            scenario={scenario}
                            value={weights[scenario.id]}
                            onChange={(val) => handleSliderChange(scenario.id, val)}
                        />
                    ))}
                </div>
                
                {/* Hybrid Preview (opzionale) */}
                {onApplyHybrid && weights.A < 100 && weights.B < 100 && weights.C < 100 && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                        <button
                            onClick={onApplyHybrid}
                            className="
                                w-full py-2.5 rounded-lg
                                bg-accent/10 border border-accent/30
                                text-accent text-sm font-medium
                                hover:bg-accent/20 transition-colors
                            "
                        >
                            Genera Strategia Ibrida →
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
