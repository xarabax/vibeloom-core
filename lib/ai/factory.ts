import { AIAdapter } from "./types"
import { GeminiProvider } from "./providers/gemini"
import { ClaudeProvider } from "./providers/claude"
import { MockProvider } from "./providers/mock"

export function createAIProvider(): AIAdapter {
    // Priority to Claude if key is explicitly present
    const claudeKey = process.env.ANTHROPIC_API_KEY
    if (claudeKey) {
        console.log("[AI Factory] Using Claude provider")
        return new ClaudeProvider(claudeKey)
    }

    const geminiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
    if (geminiKey) {
        console.log("[AI Factory] Using Gemini provider")
        return new GeminiProvider(geminiKey)
    }

    // Fallback: Mock provider per testing senza API key
    console.warn("[AI Factory] ⚠️ No API key found - using MockProvider for testing")
    return new MockProvider()
}
