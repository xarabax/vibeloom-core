"use client"

/**
 * ScenarioExplorerPage - Pagina principale dello Scenario Explorer
 * 
 * Layout:
 * - Header con titolo dilemma e azioni
 * - 3 Swimlanes verticali (ScenarioColumn)
 * - StrategyMixer fisso in basso
 * 
 * Responsive:
 * - Desktop: 3 colonne affiancate
 * - Mobile: Tabs per switchare tra scenari
 */

import React, { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Columns3,
    GitCompare,
    Blend,
    Save,
    Download,
    ArrowLeft,
    ArrowRight,
    Map
} from "lucide-react"
import type { 
    StrategyState, 
    ScenarioId, 
    ScenarioWeights,
    ExpandedNodesState,
    ScenarioExplorerView
} from "@/lib/types/scenario-explorer"
import { createDefaultWeights, createEmptyExpandedState } from "@/lib/types/scenario-explorer"
import { ScenarioColumn } from "./ScenarioColumn"
import { StrategyMixer } from "./StrategyMixer"

// ============================================================================
// PROPS
// ============================================================================

interface ScenarioExplorerPageProps {
    /** Stato iniziale (da API o mock) */
    initialState: StrategyState
    /** Titolo del dilemma */
    dilemmaTitle: string
    /** Callback per tornare indietro */
    onBack?: () => void
    /** Callback per procedere al prossimo step */
    onContinue?: (state: StrategyState) => void
}

// ============================================================================
// MOBILE TAB COMPONENT
// ============================================================================

interface MobileTabsProps {
    scenarios: StrategyState["scenarios"]
    activeTab: ScenarioId
    weights: ScenarioWeights
    onTabChange: (id: ScenarioId) => void
}

function MobileTabs({ scenarios, activeTab, weights, onTabChange }: MobileTabsProps) {
    return (
        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl md:hidden">
            {scenarios.map((scenario) => (
                <button
                    key={scenario.id}
                    onClick={() => onTabChange(scenario.id)}
                    className={`
                        flex-1 py-2 px-3 rounded-lg text-xs font-medium
                        transition-all
                        ${activeTab === scenario.id
                            ? `${scenario.color_classes.bg} ${scenario.color_classes.text}`
                            : "text-muted-foreground hover:text-foreground"
                        }
                    `}
                >
                    <span className="truncate">{scenario.title}</span>
                    {weights[scenario.id] > 0 && (
                        <span className="ml-1 opacity-70">{weights[scenario.id]}%</span>
                    )}
                </button>
            ))}
        </div>
    )
}

// ============================================================================
// VIEW SWITCHER
// ============================================================================

interface ViewSwitcherProps {
    activeView: ScenarioExplorerView
    onChange: (view: ScenarioExplorerView) => void
}

function ViewSwitcher({ activeView, onChange }: ViewSwitcherProps) {
    const views: { id: ScenarioExplorerView, label: string, icon: React.ReactNode }[] = [
        { id: "swimlanes", label: "Swimlanes", icon: <Columns3 className="w-4 h-4" /> },
        { id: "comparison", label: "Confronto", icon: <GitCompare className="w-4 h-4" /> },
        { id: "hybrid", label: "Ibrido", icon: <Blend className="w-4 h-4" /> }
    ]
    
    return (
        <div className="hidden md:flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
            {views.map((view) => (
                <button
                    key={view.id}
                    onClick={() => onChange(view.id)}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                        transition-all
                        ${activeView === view.id
                            ? "bg-accent text-background"
                            : "text-muted-foreground hover:text-foreground"
                        }
                    `}
                >
                    {view.icon}
                    {view.label}
                </button>
            ))}
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ScenarioExplorerPage({
    initialState,
    dilemmaTitle,
    onBack,
    onContinue
}: ScenarioExplorerPageProps) {
    // === STATE ===
    const [state, setState] = useState<StrategyState>(initialState)
    const [activeView, setActiveView] = useState<ScenarioExplorerView>("swimlanes")
    const [mobileActiveTab, setMobileActiveTab] = useState<ScenarioId>("A")
    
    // Shortcuts for state
    const { scenarios, active_weights, expanded_nodes } = state
    
    // === HANDLERS ===
    
    const handleWeightsChange = useCallback((newWeights: ScenarioWeights) => {
        setState(prev => ({
            ...prev,
            active_weights: newWeights,
            updated_at: new Date().toISOString()
        }))
    }, [])
    
    const handleToggleNode = useCallback((scenarioId: ScenarioId, nodeId: string) => {
        setState(prev => {
            const currentExpanded = prev.expanded_nodes[scenarioId]
            const isExpanded = currentExpanded.includes(nodeId)
            
            const newExpanded = isExpanded
                ? currentExpanded.filter(id => id !== nodeId)
                : [...currentExpanded, nodeId]
            
            return {
                ...prev,
                expanded_nodes: {
                    ...prev.expanded_nodes,
                    [scenarioId]: newExpanded
                },
                updated_at: new Date().toISOString()
            }
        })
    }, [])
    
    const handleContinue = useCallback(() => {
        if (onContinue) {
            onContinue(state)
        }
    }, [state, onContinue])
    
    // Handler per modifica assunzioni di uno step
    const handleStepAssumptionsChange = useCallback((
        scenarioId: ScenarioId, 
        stepId: string, 
        newAssumptions: string[]
    ) => {
        setState(prev => ({
            ...prev,
            scenarios: prev.scenarios.map(scenario => 
                scenario.id === scenarioId
                    ? {
                        ...scenario,
                        steps: scenario.steps.map(step =>
                            step.id === stepId
                                ? { ...step, assumptions: newAssumptions }
                                : step
                        )
                    }
                    : scenario
            ) as [typeof prev.scenarios[0], typeof prev.scenarios[1], typeof prev.scenarios[2]],
            updated_at: new Date().toISOString()
        }))
    }, [])
    
    // Handler per modifica rischi di uno step
    const handleStepRisksChange = useCallback((
        scenarioId: ScenarioId, 
        stepId: string, 
        newRisks: string[]
    ) => {
        setState(prev => ({
            ...prev,
            scenarios: prev.scenarios.map(scenario => 
                scenario.id === scenarioId
                    ? {
                        ...scenario,
                        steps: scenario.steps.map(step =>
                            step.id === stepId
                                ? { ...step, risks: newRisks }
                                : step
                        )
                    }
                    : scenario
            ) as [typeof prev.scenarios[0], typeof prev.scenarios[1], typeof prev.scenarios[2]],
            updated_at: new Date().toISOString()
        }))
    }, [])
    
    // === LOCAL STORAGE PERSISTENCE ===
    useEffect(() => {
        const key = `scenario-explorer:${state.session_id}`
        const data = {
            weights: state.active_weights,
            expanded: state.expanded_nodes,
            view: activeView,
            mobileTab: mobileActiveTab,
            timestamp: Date.now()
        }
        localStorage.setItem(key, JSON.stringify(data))
    }, [state.active_weights, state.expanded_nodes, activeView, mobileActiveTab, state.session_id])
    
    // === RENDER ===
    return (
        <div className="min-h-screen flex flex-col bg-background pb-32"> {/* pb for fixed mixer */}
            
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Back + Title */}
                        <div className="flex items-center gap-3 min-w-0">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                                </button>
                            )}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <Map className="w-4 h-4 text-accent" />
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                        Scenario Explorer
                                    </span>
                                </div>
                                <h1 className="font-serif text-lg md:text-xl text-foreground truncate">
                                    {dilemmaTitle}
                                </h1>
                            </div>
                        </div>
                        
                        {/* Center: View Switcher (desktop) */}
                        <ViewSwitcher 
                            activeView={activeView} 
                            onChange={setActiveView}
                        />
                        
                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors hidden md:flex">
                                <Save className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors hidden md:flex">
                                <Download className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {onContinue && (
                                <button
                                    onClick={handleContinue}
                                    className="
                                        flex items-center gap-2 px-4 py-2 rounded-lg
                                        bg-accent text-background text-sm font-medium
                                        hover:bg-accent/90 transition-colors
                                    "
                                >
                                    Continua
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Mobile Tabs */}
                    <div className="mt-4 md:hidden">
                        <MobileTabs
                            scenarios={scenarios}
                            activeTab={mobileActiveTab}
                            weights={active_weights}
                            onTabChange={setMobileActiveTab}
                        />
                    </div>
                </div>
            </header>
            
            {/* Main Content: Swimlanes View */}
            {activeView === "swimlanes" && (
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
                    {/* Desktop: 3 columns */}
                    <div className="hidden md:grid md:grid-cols-3 gap-4 h-full">
                        {scenarios.map((scenario) => (
                            <ScenarioColumn
                                key={scenario.id}
                                scenario={scenario}
                                weight={active_weights[scenario.id]}
                                expandedNodes={expanded_nodes[scenario.id]}
                                onToggleNode={(nodeId) => handleToggleNode(scenario.id, nodeId)}
                                onStepAssumptionsChange={(stepId, values) => 
                                    handleStepAssumptionsChange(scenario.id, stepId, values)
                                }
                                onStepRisksChange={(stepId, values) => 
                                    handleStepRisksChange(scenario.id, stepId, values)
                                }
                            />
                        ))}
                    </div>
                    
                    {/* Mobile: Single column based on active tab */}
                    <div className="md:hidden">
                        {scenarios
                            .filter(s => s.id === mobileActiveTab)
                            .map((scenario) => (
                                <ScenarioColumn
                                    key={scenario.id}
                                    scenario={scenario}
                                    weight={active_weights[scenario.id]}
                                    expandedNodes={expanded_nodes[scenario.id]}
                                    onToggleNode={(nodeId) => handleToggleNode(scenario.id, nodeId)}
                                    onStepAssumptionsChange={(stepId, values) => 
                                        handleStepAssumptionsChange(scenario.id, stepId, values)
                                    }
                                    onStepRisksChange={(stepId, values) => 
                                        handleStepRisksChange(scenario.id, stepId, values)
                                    }
                                />
                            ))
                        }
                    </div>
                </main>
            )}
            
            {/* Comparison View (placeholder) */}
            {activeView === "comparison" && (
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
                    <div className="flex items-center justify-center h-64 bg-muted/20 rounded-xl border border-dashed border-border">
                        <p className="text-muted-foreground">
                            Comparison View — Coming Soon
                        </p>
                    </div>
                </main>
            )}
            
            {/* Hybrid View (placeholder) */}
            {activeView === "hybrid" && (
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
                    <div className="flex items-center justify-center h-64 bg-muted/20 rounded-xl border border-dashed border-border">
                        <p className="text-muted-foreground">
                            Hybrid Strategy View — Coming Soon
                        </p>
                    </div>
                </main>
            )}
            
            {/* Fixed Bottom Mixer */}
            <StrategyMixer
                scenarios={scenarios}
                weights={active_weights}
                onChange={handleWeightsChange}
            />
        </div>
    )
}

// ============================================================================
// DEMO EXPORT (per testing)
// ============================================================================

export function ScenarioExplorerDemo() {
    // Import mock data
    const { MOCK_STRATEGY_STATE } = require("@/lib/mock/scenario-explorer-mock")
    
    return (
        <ScenarioExplorerPage
            initialState={MOCK_STRATEGY_STATE}
            dilemmaTitle="Decidere se lanciare nuova linea di prodotto"
            onBack={() => console.log("Back")}
            onContinue={(state) => console.log("Continue", state)}
        />
    )
}
