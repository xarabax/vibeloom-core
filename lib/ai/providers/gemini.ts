import { GoogleGenerativeAI } from "@google/generative-ai"
import { AIAdapter, AnalysisResult } from "@/lib/ai/types"
import { STRATEGIC_ANALYSIS_PROMPT } from "@/lib/ai/prompts/strategic-analysis"

export class GeminiProvider implements AIAdapter {
    private client: GoogleGenerativeAI

    constructor(apiKey: string) {
        this.client = new GoogleGenerativeAI(apiKey)
    }

    async analyze(goal: string, files: { content: string; mimeType: string }[]): Promise<AnalysisResult> {
        // Using "gemini-pro" as it is the most standard text model available.
        // If this fails with 404, the API key does not support any Gemini model.
        const model = this.client.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: STRATEGIC_ANALYSIS_PROMPT.replace("{{GOAL}}", goal),
            generationConfig: { responseMimeType: "application/json" },
        })

        const parts = []

        // Add goal context
        parts.push({ text: `Analyze these documents for the goal: ${goal}` })

        // Add files content as text parts
        for (const file of files) {
            parts.push({
                text: `Document Content:\n${file.content}`
            })
        }


        console.log("Sending request to Gemini with parts count:", parts.length)

        try {
            const result = await model.generateContent(parts)
            const responseText = result.response.text()
            console.log("Gemini Raw Response:", responseText)
            return JSON.parse(responseText) as AnalysisResult
        } catch (e) {
            console.error("Gemini API Error (Falling back to mock):", e)
            return {
                isMock: true,
                strategicInsight: "NOTICE: MOCK DATA. The provided API Key does not support 'gemini-pro' or 'gemini-1.5-flash'. Please upgrade your API key permissions. This is a simulation based on your parsed documents.",
                keyMetrics: {
                    growthPotential: "N/A (Mock)",
                    optimalWindow: "Immediate",
                    riskLevel: "Low"
                },
                actionScenarios: [
                    {
                        title: "Mock Scenario A",
                        description: "Simulation: Strategy based on parsed text content.",
                        timeline: "2 weeks",
                        investment: "Low",
                        risk: "Minimal",
                        returnPotential: "High Demo Value",
                        recommended: true
                    },
                    {
                        title: "Mock Scenario B",
                        description: "Simulation: Alternative approach.",
                        timeline: "1 month",
                        investment: "Moderate",
                        risk: "Medium",
                        returnPotential: "Medium",
                        recommended: false
                    }
                ]
            }
        }
    }
}
