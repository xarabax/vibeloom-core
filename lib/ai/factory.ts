import { AIAdapter } from "./types"
import { GeminiProvider } from "./providers/gemini"

export function createAIProvider(): AIAdapter {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

    if (apiKey) {
        return new GeminiProvider(apiKey)
    }

    // Future: Check for OPENAI_API_KEY

    throw new Error("No valid AI API Key found. Please configure GOOGLE_GENAI_API_KEY.")
}
