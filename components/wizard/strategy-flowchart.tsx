"use client"

import { useEffect, useState, useMemo } from "react"
import type { FlowchartNode, FlowchartConnection } from "@/lib/ai/types"

interface StrategyFlowchartProps {
    goal: string
    dossiers: string[]
    // Nuovi props per rendering dinamico
    nodes?: FlowchartNode[]
    connections?: FlowchartConnection[]
    onNodeClick?: (node: FlowchartNode) => void
}

/**
 * StrategyFlowchart
 * 
 * Renderizza un flowchart SVG dinamico basato sui nodi e connessioni
 * restituiti dall'AI. Se non vengono forniti, usa un layout statico di fallback.
 */
export function StrategyFlowchart({ 
    goal, 
    dossiers, 
    nodes, 
    connections,
    onNodeClick 
}: StrategyFlowchartProps) {
    const [animated, setAnimated] = useState(false)
    const [hoveredNode, setHoveredNode] = useState<string | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100)
        return () => clearTimeout(timer)
    }, [])

    // Calcola posizioni dei nodi basandosi sul tipo
    const nodePositions = useMemo(() => {
        if (!nodes || nodes.length === 0) {
            // Fallback statico se non ci sono nodi dall'AI
            return null
        }

        const positions: Record<string, { x: number; y: number }> = {}
        
        // Raggruppa nodi per tipo
        const origins = nodes.filter(n => n.type === "origin")
        const documents = nodes.filter(n => n.type === "document")
        const convergences = nodes.filter(n => n.type === "convergence")
        const scenarios = nodes.filter(n => n.type === "scenario")

        // Posiziona origin a sinistra
        origins.forEach((n, i) => {
            positions[n.id] = { x: 60, y: 100 }
        })

        // Posiziona documenti
        documents.forEach((n, i) => {
            const yOffset = documents.length === 1 ? 100 : 40 + (i * 120 / Math.max(documents.length - 1, 1))
            positions[n.id] = { x: 280, y: yOffset }
        })

        // Posiziona convergenza al centro
        convergences.forEach((n, i) => {
            positions[n.id] = { x: 480, y: 100 }
        })

        // Posiziona scenari a destra
        scenarios.forEach((n, i) => {
            const yOffset = scenarios.length === 1 ? 100 : 40 + (i * 120 / Math.max(scenarios.length - 1, 1))
            positions[n.id] = { x: 700, y: yOffset }
        })

        return positions
    }, [nodes])

    // Funzione per ottenere il colore del nodo in base al tipo/rischio
    const getNodeColor = (node: FlowchartNode) => {
        if (node.type === "origin") return "#a0522d"  // Accent
        if (node.type === "scenario") {
            if (node.recommended) return "#a0522d"  // Accent per raccomandato
            if (node.riskLevel === "High") return "#ef4444"  // Rosso
            if (node.riskLevel === "Medium") return "#f59e0b"  // Arancione
            return "#737373"  // Grigio default
        }
        return "#e5e5e5"  // Bianco per documenti
    }

    // Funzione per ottenere il raggio del nodo
    const getNodeRadius = (node: FlowchartNode) => {
        if (node.type === "origin") return 4
        if (node.type === "convergence") return 3
        if (node.type === "scenario") return node.recommended ? 5 : 4
        return 3
    }

    // Se abbiamo nodi dinamici, renderizza il flowchart dinamico
    if (nodes && nodes.length > 0 && nodePositions) {
        return (
            <div className="w-full py-8 px-6 lg:px-12">
                <svg viewBox="0 0 800 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <radialGradient id="nodeGlowDynamic" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#a0522d" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#a0522d" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a0522d" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#737373" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>

                    {/* Renderizza connessioni */}
                    {connections?.map((conn, idx) => {
                        const fromPos = nodePositions[conn.from]
                        const toPos = nodePositions[conn.to]
                        if (!fromPos || !toPos) return null

                        // Calcola punto di controllo per curva bezier
                        const midX = (fromPos.x + toPos.x) / 2
                        const midY = (fromPos.y + toPos.y) / 2 + (Math.random() - 0.5) * 20

                        return (
                            <path
                                key={`conn-${idx}`}
                                d={`M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`}
                                fill="none"
                                stroke="url(#connectionGradient)"
                                strokeWidth="1"
                                className={`transition-all duration-1000 ${animated ? "opacity-100" : "opacity-0"}`}
                                style={{
                                    strokeDasharray: 400,
                                    strokeDashoffset: animated ? 0 : 400,
                                    transition: `stroke-dashoffset 1.5s ease-out ${idx * 0.1}s, opacity 0.5s ease-out`,
                                }}
                            />
                        )
                    })}

                    {/* Renderizza nodi */}
                    {nodes.map((node, idx) => {
                        const pos = nodePositions[node.id]
                        if (!pos) return null

                        const isHovered = hoveredNode === node.id
                        const color = getNodeColor(node)
                        const radius = getNodeRadius(node)
                        const isClickable = !!onNodeClick && (node.type === "document" || node.type === "scenario")

                        return (
                            <g
                                key={node.id}
                                className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"} ${isClickable ? "cursor-pointer" : ""}`}
                                style={{ transitionDelay: `${0.3 + idx * 0.1}s` }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onClick={() => isClickable && onNodeClick?.(node)}
                            >
                                {/* Glow */}
                                <circle 
                                    cx={pos.x} 
                                    cy={pos.y} 
                                    r={isHovered ? 20 : 14} 
                                    fill="url(#nodeGlowDynamic)" 
                                    style={{ transition: "r 0.2s ease-out" }}
                                />
                                {/* Core */}
                                <circle 
                                    cx={pos.x} 
                                    cy={pos.y} 
                                    r={isHovered ? radius + 1 : radius} 
                                    fill={color}
                                    style={{ transition: "r 0.2s ease-out" }}
                                />
                                {/* Label */}
                                <text
                                    x={pos.x}
                                    y={pos.y + (node.type === "origin" || node.type === "convergence" ? 25 : (pos.y < 100 ? -15 : 25))}
                                    textAnchor="middle"
                                    className={`font-sans text-[9px] uppercase tracking-wider ${
                                        node.recommended ? "fill-accent" : "fill-muted-foreground"
                                    }`}
                                >
                                    {node.label.slice(0, 15)}
                                </text>
                                {/* Indicator per raccomandato */}
                                {node.recommended && (
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={radius + 4}
                                        fill="none"
                                        stroke="#a0522d"
                                        strokeWidth="0.5"
                                        className={animated ? "animate-pulse" : "opacity-0"}
                                        style={{ opacity: 0.6 }}
                                    />
                                )}
                            </g>
                        )
                    })}

                    {/* Pulse sull'origine */}
                    {nodePositions["goal"] && (
                        <circle
                            cx={nodePositions["goal"].x}
                            cy={nodePositions["goal"].y}
                            r="8"
                            fill="none"
                            stroke="#a0522d"
                            strokeWidth="0.5"
                            className={animated ? "animate-pulse" : "opacity-0"}
                            style={{ opacity: 0.4 }}
                        />
                    )}
                </svg>

                {/* Tooltip per nodo hover */}
                {hoveredNode && nodes.find(n => n.id === hoveredNode)?.description && (
                    <div className="mt-2 text-center">
                        <p className="text-xs text-muted-foreground italic">
                            {nodes.find(n => n.id === hoveredNode)?.description}
                        </p>
                        {nodes.find(n => n.id === hoveredNode)?.sourceRef && (
                            <p className="text-xs text-accent mt-1">
                                📄 {nodes.find(n => n.id === hoveredNode)?.sourceRef}
                            </p>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // === FALLBACK STATICO (compatibilità con vecchio formato) ===
    return (
        <div className="w-full py-8 px-6 lg:px-12">
            <svg viewBox="0 0 800 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#a0522d" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#a0522d" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="lineGradientTop" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a0522d" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#a0522d" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="lineGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a0522d" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#737373" stopOpacity="0.3" />
                    </linearGradient>
                </defs>

                {/* Upper path */}
                <path
                    d="M 60 100 Q 150 100 200 60 Q 250 30 320 40 Q 400 50 480 40 Q 560 30 640 50 L 740 50"
                    fill="none"
                    stroke="url(#lineGradientTop)"
                    strokeWidth="1"
                    className={`transition-all duration-1000 ${animated ? "opacity-100" : "opacity-0"}`}
                    style={{
                        strokeDasharray: 800,
                        strokeDashoffset: animated ? 0 : 800,
                        transition: "stroke-dashoffset 1.5s ease-out, opacity 0.5s ease-out",
                    }}
                />

                {/* Lower path */}
                <path
                    d="M 60 100 Q 150 100 200 140 Q 250 170 320 160 Q 400 150 480 160 Q 560 170 640 150 L 740 150"
                    fill="none"
                    stroke="url(#lineGradientBottom)"
                    strokeWidth="1"
                    className={`transition-all duration-1000 ${animated ? "opacity-100" : "opacity-0"}`}
                    style={{
                        strokeDasharray: 800,
                        strokeDashoffset: animated ? 0 : 800,
                        transition: "stroke-dashoffset 1.5s ease-out 0.2s, opacity 0.5s ease-out",
                    }}
                />

                {/* Cross-weaving */}
                <path d="M 320 40 Q 400 100 480 160" fill="none" stroke="#737373" strokeWidth="0.5" strokeOpacity="0.3"
                    className={`transition-all duration-700 ${animated ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.8s" }} />
                <path d="M 320 160 Q 400 100 480 40" fill="none" stroke="#737373" strokeWidth="0.5" strokeOpacity="0.3"
                    className={`transition-all duration-700 ${animated ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.9s" }} />

                {/* Goal Node */}
                <g className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`}>
                    <circle cx="60" cy="100" r="20" fill="url(#nodeGlow)" />
                    <circle cx="60" cy="100" r="4" fill="#a0522d" />
                    <text x="60" y="135" textAnchor="middle" className="fill-accent font-sans text-[10px] uppercase tracking-widest">Goal</text>
                </g>

                {/* Dossier 1 */}
                <g className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.5s" }}>
                    <circle cx="320" cy="40" r="14" fill="url(#nodeGlow)" />
                    <circle cx="320" cy="40" r="3" fill="#e5e5e5" />
                    <text x="320" y="15" textAnchor="middle" className="fill-muted-foreground font-sans text-[9px] uppercase tracking-wider">
                        {dossiers[0] || "Bando"}
                    </text>
                </g>

                {/* Dossier 2 */}
                <g className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.6s" }}>
                    <circle cx="320" cy="160" r="14" fill="url(#nodeGlow)" />
                    <circle cx="320" cy="160" r="3" fill="#e5e5e5" />
                    <text x="320" y="185" textAnchor="middle" className="fill-muted-foreground font-sans text-[9px] uppercase tracking-wider">
                        {dossiers[1] || "Financials"}
                    </text>
                </g>

                {/* Convergence */}
                <g className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.7s" }}>
                    <circle cx="480" cy="100" r="10" fill="url(#nodeGlow)" />
                    <circle cx="480" cy="100" r="2" fill="#737373" />
                </g>

                {/* Scenario 1 - Recommended */}
                <g className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1s" }}>
                    <circle cx="740" cy="50" r="16" fill="url(#nodeGlow)" />
                    <circle cx="740" cy="50" r="4" fill="#a0522d" />
                    <text x="740" y="80" textAnchor="middle" className="fill-accent font-sans text-[9px] uppercase tracking-wider">Recommended</text>
                </g>

                {/* Scenario 2 - Alternative */}
                <g className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1.1s" }}>
                    <circle cx="740" cy="150" r="16" fill="url(#nodeGlow)" />
                    <circle cx="740" cy="150" r="4" fill="#737373" />
                    <text x="740" y="180" textAnchor="middle" className="fill-muted-foreground font-sans text-[9px] uppercase tracking-wider">Alternative</text>
                </g>

                {/* Pulse */}
                <circle cx="60" cy="100" r="8" fill="none" stroke="#a0522d" strokeWidth="0.5"
                    className={animated ? "animate-pulse" : "opacity-0"} style={{ opacity: 0.4 }} />
            </svg>
        </div>
    )
}
