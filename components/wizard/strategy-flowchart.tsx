"use client"

import { useEffect, useState } from "react"

interface StrategyFlowchartProps {
  goal: string
  dossiers: string[]
}

export function StrategyFlowchart({ goal, dossiers }: StrategyFlowchartProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full py-8 px-6 lg:px-12">
      <svg viewBox="0 0 800 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Gradient for accent glow */}
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a0522d" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a0522d" stopOpacity="0" />
          </radialGradient>

          {/* Gradient for line fade */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a0522d" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#737373" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e5e5e5" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="lineGradientTop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a0522d" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a0522d" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="lineGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a0522d" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#737373" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Path lines - drawn with bezier curves for weaving effect */}
        {/* Upper path: Goal -> Bando -> Aggressive */}
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

        {/* Lower path: Goal -> Financials -> Conservative */}
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

        {/* Cross-weaving threads */}
        <path
          d="M 320 40 Q 400 100 480 160"
          fill="none"
          stroke="#737373"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          className={`transition-all duration-700 ${animated ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.8s" }}
        />
        <path
          d="M 320 160 Q 400 100 480 40"
          fill="none"
          stroke="#737373"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          className={`transition-all duration-700 ${animated ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.9s" }}
        />

        {/* Origin Node - Goal */}
        <g className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`}>
          {/* Outer glow */}
          <circle cx="60" cy="100" r="20" fill="url(#nodeGlow)" />
          {/* Core node */}
          <circle cx="60" cy="100" r="4" fill="#a0522d" />
          {/* Label */}
          <text
            x="60"
            y="135"
            textAnchor="middle"
            className="fill-accent font-sans text-[10px] uppercase tracking-widest"
          >
            Goal
          </text>
        </g>

        {/* Dossier Node 1 - Bando (upper path) */}
        <g
          className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.5s" }}
        >
          <circle cx="320" cy="40" r="14" fill="url(#nodeGlow)" />
          <circle cx="320" cy="40" r="3" fill="#e5e5e5" />
          <text
            x="320"
            y="15"
            textAnchor="middle"
            className="fill-muted-foreground font-sans text-[9px] uppercase tracking-wider"
          >
            {dossiers[0] || "Bando"}
          </text>
        </g>

        {/* Dossier Node 2 - Financials (lower path) */}
        <g
          className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.6s" }}
        >
          <circle cx="320" cy="160" r="14" fill="url(#nodeGlow)" />
          <circle cx="320" cy="160" r="3" fill="#e5e5e5" />
          <text
            x="320"
            y="185"
            textAnchor="middle"
            className="fill-muted-foreground font-sans text-[9px] uppercase tracking-wider"
          >
            {dossiers[1] || "Financials"}
          </text>
        </g>

        {/* Intersection node - Analysis convergence */}
        <g
          className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.7s" }}
        >
          <circle cx="480" cy="100" r="10" fill="url(#nodeGlow)" />
          <circle cx="480" cy="100" r="2" fill="#737373" />
        </g>

        {/* End Node 1 - Aggressive Scenario */}
        <g
          className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "1s" }}
        >
          <circle cx="740" cy="50" r="16" fill="url(#nodeGlow)" />
          <circle cx="740" cy="50" r="4" fill="#a0522d" />
          <text
            x="740"
            y="80"
            textAnchor="middle"
            className="fill-accent font-sans text-[9px] uppercase tracking-wider"
          >
            Aggressive
          </text>
        </g>

        {/* End Node 2 - Conservative Scenario */}
        <g
          className={`transition-all duration-500 ${animated ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "1.1s" }}
        >
          <circle cx="740" cy="150" r="16" fill="url(#nodeGlow)" />
          <circle cx="740" cy="150" r="4" fill="#737373" />
          <text
            x="740"
            y="180"
            textAnchor="middle"
            className="fill-muted-foreground font-sans text-[9px] uppercase tracking-wider"
          >
            Conservative
          </text>
        </g>

        {/* Subtle pulse animation on origin */}
        <circle
          cx="60"
          cy="100"
          r="8"
          fill="none"
          stroke="#a0522d"
          strokeWidth="0.5"
          className={animated ? "animate-pulse" : "opacity-0"}
          style={{ opacity: 0.4 }}
        />
      </svg>
    </div>
  )
}
