import { NextResponse } from "next/server"
import { fileSchema } from "@/lib/validations/analyze"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate using Zod schema
        const validationResult = fileSchema.safeParse({
            name: file.name,
            type: file.type,
            size: file.size,
        })

        if (!validationResult.success) {
            const errorMessage = validationResult.error.errors[0].message
            return NextResponse.json({ error: errorMessage }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Upload validation error:", error)
        return NextResponse.json({ error: "Validation failed" }, { status: 500 })
    }
}
