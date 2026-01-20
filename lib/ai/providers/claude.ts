import Anthropic from "@anthropic-ai/sdk"
import { AIAdapter, AnalysisResult } from "@/lib/ai/types"
import { STRATEGIC_ANALYSIS_PROMPT } from "@/lib/ai/prompts/strategic-analysis"

export class ClaudeProvider implements AIAdapter {
    private client: Anthropic

    constructor(apiKey: string) {
        this.client = new Anthropic({
            apiKey: apiKey,
        })
    }

    async analyze(goal: string, files: { content: string; mimeType: string }[]): Promise<AnalysisResult> {
        // Construct user message with goal and file contents
        let userContent = `Analyze these documents for the goal: ${goal}\n\n`

        for (const file of files) {
            userContent += `Document Content:\n${file.content}\n\n`
        }

        try {
            const message = await this.client.messages.create({
                model: "claude-3-5-sonnet-20240620", // Using latest Sonnet
                max_tokens: 4096,
                system: STRATEGIC_ANALYSIS_PROMPT.replace("{{GOAL}}", goal),
                messages: [
                    {
                        role: "user",
                        content: userContent
                    }
                ]
            })

            // Parse response - assuming Claude returns strict JSON as requested in system prompt
            // Note: Claude might wrap in markdown ```json ... ``` blocks, so we might need to clean it.
            // For MVP, we assume the system prompt enforcement works or we strip basic markdown.
            let text = ""
            if (message.content[0].type === "text") {
                text = message.content[0].text
            }

            console.log("Claude Raw Response:", text)

            // Basic cleanup for json block
            const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim()

            return JSON.parse(jsonStr) as AnalysisResult

        } catch (e) {
            console.error("Claude API Error:", e)
            // Fallback (similar to Gemini) could be implemented here if needed
            return {
                isMock: true,
                strategicInsight: "NOTICE: CLAUDE MOCK DATA. API Error occurred. " + (e instanceof Error ? e.message : String(e)),
                keyMetrics: {
                    growthPotential: "N/A",
                    optimalWindow: "N/A",
                    riskLevel: "High"
                },
                actionScenarios: []
            }
        }
    }
}
