export interface AnalysisResult {
    strategicInsight: string
    keyMetrics: {
        growthPotential: string
        optimalWindow: string
        riskLevel: "Low" | "Medium" | "High"
    }
    actionScenarios: {
        title: string
        description: string
        timeline: string
        investment: "Low" | "Moderate" | "High"
        risk: string
        returnPotential: string
        recommended: boolean
    }[]
    isMock?: boolean
}

export interface AIAdapter {
    analyze(goal: string, files: { content: string; mimeType: string }[]): Promise<AnalysisResult>
}
