import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import Stripe from "stripe"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeKey) {
        console.error("❌ STRIPE_SECRET_KEY non configurata")
        return NextResponse.json({ error: "Configurazione server non valida." }, { status: 500 })
    }
    if (!webhookSecret) {
        console.error("❌ STRIPE_WEBHOOK_SECRET non configurata")
        return NextResponse.json({ error: "Configurazione server non valida." }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey, {
        apiVersion: "2026-03-25.dahlia",
    })

    const payload = await req.text()
    const signature = req.headers.get("Stripe-Signature") ?? ""

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Firma non valida"
        console.error(`❌ Webhook signature verification failed: ${message}`)
        return NextResponse.json({ error: message }, { status: 400 })
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.client_reference_id

                if (userId) {
                    const client = await clerkClient()
                    await client.users.updateUserMetadata(userId, {
                        privateMetadata: {
                            is_premium: true,
                            api_calls: 0
                        },
                        publicMetadata: {
                            is_premium: true
                        }
                    })
                    console.log(`✅ Utente ${userId} sbloccato come Premium.`)
                } else {
                    console.warn("⚠️ Pagamento completato senza client_reference_id associato.")
                }
                break
            }
            default:
                // Evento ricevuto ma non gestito — normale per Stripe
                break
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Errore sconosciuto"
        console.error(`❌ Errore processamento webhook: ${message}`)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}
