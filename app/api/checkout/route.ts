import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"

export const dynamic = 'force-dynamic'

function getStripeClient(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
        throw new Error("STRIPE_SECRET_KEY non configurata")
    }
    return new Stripe(key, {
        apiVersion: "2026-03-25.dahlia",
    })
}

function getAppUrl(): string {
    const url = process.env.NEXT_PUBLIC_APP_URL
    if (!url) {
        // Fallback sicuro solo in development
        if (process.env.NODE_ENV === "development") return "http://localhost:3000"
        throw new Error("NEXT_PUBLIC_APP_URL non configurata")
    }
    return url
}

export async function POST(_req: NextRequest) {
    try {
        const stripe = getStripeClient()
        const appUrl = getAppUrl()

        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Non sei autenticato." }, { status: 401 })
        }

        const unitAmount = process.env.STRIPE_PRICE_AMOUNT_CENTS
            ? parseInt(process.env.STRIPE_PRICE_AMOUNT_CENTS, 10)
            : 1900 // fallback: 19.00€

        // Creazione Sessione di Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "VibeLoom Premium Access",
                            description: "Sblocco analisi illimitate e board advisor completo.",
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${appUrl}/?success=true`,
            cancel_url: `${appUrl}/?canceled=true`,
            client_reference_id: userId,
            metadata: {
                userId: userId
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Impossibile creare la sessione di pagamento."
        console.error("[Stripe Checkout API] Errore:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
