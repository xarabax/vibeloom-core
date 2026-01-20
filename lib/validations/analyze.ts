import { z } from "zod"

export const MAX_GOAL_LENGTH = 1000
export const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv"
]
// 10MB Limit for now (Gemini has limits, but this is a safe default for serverless)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const analyzeRequestSchema = z.object({
    goal: z.string().min(1).max(MAX_GOAL_LENGTH),
})

export const fileSchema = z.object({
    name: z.string(),
    type: z.enum([
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv"
    ] as [string, ...string[]]),
    size: z.number().max(MAX_FILE_SIZE),
})
