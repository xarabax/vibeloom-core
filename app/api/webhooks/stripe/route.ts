import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
    apiVersion: "2024-04-10" as any // Use standard API version
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: Request) {
    const payload = await req.text()
    const signature = req.headers.get("Stripe-Signature") as string

    let event: Stripe.Event;

    try {
        if (!webhookSecret) {
            throw new Error("Missing STRIPE_WEBHOOK_SECRET")
        }
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed.`, err.message)
        return NextResponse.json({ error: err.message }, { status: 400 })
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.client_reference_id
                
                if (userId) {
                    console.log(`✅ Incasso confermato per utente ${userId}. Sblocco account...`)
                    const client = await clerkClient()
                    
                    // Impostiamo l'utente come Premium per saltare i paywall
                    await client.users.updateUserMetadata(userId, {
                        privateMetadata: {
                            is_premium: true,
                            api_calls: 0
                        },
                        publicMetadata: {
                            is_premium: true
                        }
                    })
                    console.log(`🚀 Sblocco completato con successo.`)
                } else {
                    console.warn("⚠️ Pagamento completato senza client_reference_id associato.")
                }
                break;
            default:
                console.log(`Evento non gestito: ${event.type}`)
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (error: any) {
        console.error(`❌ Errore processamento webhook:`, error)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}
