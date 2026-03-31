import { AIAdapter } from "./types"
import { GeminiProvider } from "./providers/gemini"
import { ClaudeProvider } from "./providers/claude"
import { MockProvider } from "./providers/mock"

export type AIStrategy = "generation" | "ingestion" | "auto"

export function createAIProvider(strategy: AIStrategy = "auto"): AIAdapter {
    const claudeKey = process.env.ANTHROPIC_API_KEY
    const geminiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

    // Logica di routing Multi-LLM
    if (strategy === "generation" && claudeKey) {
        console.log("[AI Factory/Router] Using Claude for generation strategy")
        return new ClaudeProvider(claudeKey)
    }

    if (strategy === "ingestion" && geminiKey) {
        console.log("[AI Factory/Router] Using Gemini for ingestion strategy")
        return new GeminiProvider(geminiKey)
    }

    // Default Fallback
    if (claudeKey) return new ClaudeProvider(claudeKey)
    if (geminiKey) return new GeminiProvider(geminiKey)

    // Fallback: Mock provider per testing senza API key
    console.warn("[AI Factory] ⚠️ No API key found - using MockProvider")
    return new MockProvider()
}
