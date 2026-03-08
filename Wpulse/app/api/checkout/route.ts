import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  let scanId: string;
  try {
    const body = await req.json();
    scanId = body.scanId;
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  if (!scanId) {
    return NextResponse.json(
      { error: "scanId manquant." },
      { status: 400 }
    );
  }

  const scanData = getCache(scanId);
  if (!scanData) {
    return NextResponse.json(
      { error: "Scan introuvable ou expiré. Relancez un scan." },
      { status: 404 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "WPulse — Rapport complet audit WordPress",
              description:
                "Analyse complète de sécurité et performance + recommandations priorisées",
            },
            unit_amount: 2900,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/results?id=${scanId}`,
      metadata: {
        scan_id: scanId,
        scanned_url: scanData.url,
      },
      locale: "fr",
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement." },
      { status: 500 }
    );
  }
}
