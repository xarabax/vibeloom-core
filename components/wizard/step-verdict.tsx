import { ArrowRight, RotateCcw, AlertTriangle } from "lucide-react"
import { StrategyFlowchart } from "@/components/wizard/strategy-flowchart"
import type { AnalysisResult } from "@/components/vibeloom-wizard"

interface StepVerdictProps {
  goal: string
  uploadedFiles?: string[]
  result: AnalysisResult
  onReset: () => void
}

export function StepVerdict({ goal, uploadedFiles = [], result, onReset }: StepVerdictProps) {
  const dossierNames =
    uploadedFiles.length > 0
      ? uploadedFiles.slice(0, 2).map((f) => f.replace(/\.[^/.]+$/, "").slice(0, 12))
      : ["Bando", "Financials"]

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 py-8 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-1">Analysis Complete</p>
            <h1 className="font-serif text-xl md:text-2xl text-foreground">{goal}</h1>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            New Analysis
          </button>
        </div>
      </div>


      {result.isMock && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <p className="font-sans text-xs text-yellow-500 uppercase tracking-widest">
            Simulation Mode (Mock Data)
          </p>
        </div>
      )}

      <div className="border-b border-border">
        <StrategyFlowchart goal={goal} dossiers={dossierNames} />
      </div>

      {/* Split Panels */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Strategic Insight */}
        <div className="flex-1 p-6 lg:p-12 lg:border-r border-border">
          <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-6">Strategic Insight</p>

          <div className="space-y-6">
            <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
              {result.strategicInsight}
            </p>

            {/* We could split the insight if it's long, or just rendering it as one block for now */}

            <div className="pt-6 border-t border-border">
              <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-4">Key Metrics</p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="font-serif text-2xl text-accent">{result.keyMetrics.growthPotential}</p>
                  <p className="font-sans text-xs text-muted-foreground">Growth Potential</p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-foreground">{result.keyMetrics.optimalWindow}</p>
                  <p className="font-sans text-xs text-muted-foreground">Optimal Window</p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-foreground">{result.keyMetrics.riskLevel}</p>
                  <p className="font-sans text-xs text-muted-foreground">Risk Level</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Action Scenarios */}
        <div className="flex-1 p-6 lg:p-12 bg-secondary/30">
          <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest mb-6">Action Scenarios</p>

          <div className="space-y-6">
            {result.actionScenarios.map((scenario, idx) => (
              <button key={idx} className="w-full text-left group border border-border bg-background p-6 hover:border-accent transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <span className={`font-sans text-xs uppercase tracking-widest ${scenario.recommended ? "text-accent" : "text-muted-foreground"}`}>
                    {scenario.recommended ? "Recommended" : "Alternative"}
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">{scenario.title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {scenario.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                  <span className="font-sans text-xs text-muted-foreground">Timeline: {scenario.timeline}</span>
                  <span className="font-sans text-xs text-muted-foreground">•</span>
                  <span className="font-sans text-xs text-muted-foreground">Investment: {scenario.investment}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
