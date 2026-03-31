/**
 * Decision Board API Endpoint
 * 
 * POST /api/decision-board
 * 
 * Riceve un dilemma/scenario e restituisce l'analisi dei 3 agenti AI.
 * Le chiamate ai 3 agenti sono PARALLELE per minimizzare la latenza.
 * 
 * Request Body:
 * {
 *   "dilemma": "string - il dilemma/scenario da analizzare"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "agents_analysis": [...],
 *     "timestamp": "ISO string",
 *     "input_hash": "string"
 *   },
 *   "latency_ms": number
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { getDecisionBoardService, DecisionBoardResult } from "@/lib/ai/services/decision-board"
import { z } from "zod"

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

const RequestSchema = z.object({
    dilemma: z
        .string()
        .min(20, "Il dilemma deve essere almeno 20 caratteri")
        .max(5000, "Il dilemma non può superare 5000 caratteri"),
    advisors: z
        .array(z.enum(["sniper", "vc", "guardian", "mentor"]))
        .min(2, "Seleziona almeno 2 advisor")
        .max(4, "Massimo 4 advisor")
        .optional()
})

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface SuccessResponse {
    success: true
    data: DecisionBoardResult
    latency_ms: number
}

interface ErrorResponse {
    success: false
    error: string
    code: string
}

type ApiResponse = SuccessResponse | ErrorResponse

// ============================================================================
// POST HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now()

    try {
        // 1. Parse e valida il body
        const body = await request.json()
        const validation = RequestSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error.errors[0]?.message || "Input non valido",
                    code: "VALIDATION_ERROR"
                },
                { status: 400 }
            )
        }

        const { dilemma, advisors } = validation.data

        console.log("[API /decision-board] Received request, dilemma length:", dilemma.length, "advisors:", advisors)

        // 2. Chiama il DecisionBoardService con gli advisor selezionati
        const service = getDecisionBoardService()
        const result = await service.analyzeScenario(dilemma, advisors)

        const latency = Date.now() - startTime
        console.log(`[API /decision-board] Completed in ${latency}ms`)

        // 3. Restituisci il risultato
        return NextResponse.json(
            {
                success: true,
                data: result,
                latency_ms: latency
            },
            { status: 200 }
        )

    } catch (error) {
        console.error("[API /decision-board] Error:", error)

        // Gestione errori specifici
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "JSON non valido nel body della richiesta",
                    code: "INVALID_JSON"
                },
                { status: 400 }
            )
        }

        // Errore API key mancante
        if (error instanceof Error && error.message.includes("Missing")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Configurazione API mancante. Contattare l'amministratore.",
                    code: "CONFIG_ERROR"
                },
                { status: 500 }
            )
        }

        // Errore generico
        return NextResponse.json(
            {
                success: false,
                error: "Errore interno del server. Riprovare più tardi.",
                code: "INTERNAL_ERROR"
            },
            { status: 500 }
        )
    }
}

// ============================================================================
// OPTIONS HANDLER (CORS preflight)
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    })
}
