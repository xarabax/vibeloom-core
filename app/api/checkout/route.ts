import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51PvGstP6bpx7S4U3uA6t0qI6Y5A5S1l2f3g4h5j6k7l8m9n0", {
    apiVersion: "2024-04-10" as any
})

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Non sei autenticato." }, { status: 401 })
        }

        const origin = req.headers.get("origin") || "http://localhost:3000"

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
                        unit_amount: 1900, // 19.00€
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/?success=true`, // Ritorna alla lobby con un flag per rinfrescare lo stato
            cancel_url: `${origin}/?canceled=true`,
            client_reference_id: userId, // Per rintracciarlo nel webhook
            metadata: {
                userId: userId
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error("[Stripe Checkout API] Errore:", error)
        return NextResponse.json({ error: error.message || "Impossibile creare la sessione di pagamento." }, { status: 500 })
    }
}
