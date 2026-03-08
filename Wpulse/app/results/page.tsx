"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScoreCircle } from "@/components/ScoreCircle";
import { CheckItem } from "@/components/CheckItem";
import { LockedCheck } from "@/components/LockedCheck";
import type { ScanResult } from "@/lib/scanner";

type ScanData = ScanResult & { scanId: string };

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("id");

  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!scanId) {
      router.replace("/");
      return;
    }

    const stored = sessionStorage.getItem(`scan_${scanId}`);
    if (stored) {
      try {
        setData(JSON.parse(stored));
        return;
      } catch {
        // fall through to error
      }
    }

    setError("Session expirée. Relancez un scan depuis la page d'accueil.");
  }, [scanId, router]);

  async function handlePay() {
    if (!scanId) return;
    setPaying(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });
      const json = await res.json();

      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      } else {
        setError(json.error || "Erreur lors du paiement.");
        setPaying(false);
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
      setPaying(false);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4 bg-bg-dark">
        <p className="text-text-secondary max-w-sm">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
        >
          Nouveau scan
        </button>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  const { checks, score } = data;

  const pagespeedDetail =
    checks.pagespeed.status === "untested"
      ? "Non testé (limite API atteinte)"
      : checks.pagespeed.score !== undefined
      ? `Score : ${checks.pagespeed.score}/100`
      : undefined;

  const pagespeedPassed =
    checks.pagespeed.status !== "untested" &&
    (checks.pagespeed.score ?? 0) >= 75;

  return (
    <main className="min-h-screen flex flex-col pb-32 bg-bg-dark">
      {/* Header */}
      <div className="bg-bg-section border-b border-white/5 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <p className="text-text-muted text-xs mb-1">Site analysé</p>
          <p className="font-mono text-text-secondary text-sm truncate">
            {data.url}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 max-w-xl mx-auto w-full">
        {/* Score */}
        <div className="flex justify-center mb-8">
          <ScoreCircle score={score} />
        </div>

        {/* Checks gratuits */}
        <div className="bg-bg-card rounded-xl border border-white/5 mb-4">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-1">
              Résultats gratuits
            </p>
          </div>
          <div className="px-4">
            <CheckItem
              label="Certificat SSL"
              passed={checks.ssl.valid}
              detail={
                checks.ssl.valid
                  ? "HTTPS actif et valide"
                  : "SSL invalide ou absent"
              }
            />
            <CheckItem
              label="WordPress détecté"
              passed={checks.wordpress.detected}
              detail={
                checks.wordpress.version
                  ? `Version ${checks.wordpress.version} visible dans le code source`
                  : checks.wordpress.detected
                  ? "CMS WordPress identifié"
                  : "WordPress non détecté"
              }
            />
            <CheckItem
              label="Performance mobile (PageSpeed)"
              passed={pagespeedPassed}
              detail={pagespeedDetail}
            />
          </div>
        </div>

        {/* Checks locked */}
        <div className="bg-bg-card rounded-xl border border-white/5 mb-6 relative overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-1">
              Rapport complet (verrouillé)
            </p>
          </div>
          <div className="px-4">
            <LockedCheck label="En-têtes de sécurité (X-Frame-Options, CSP, HSTS...)" />
            <LockedCheck label="XML-RPC exposé — vecteur d'attaque critique" />
            <LockedCheck label="Page de connexion exposée (/wp-login.php)" />
            <LockedCheck label="Version WordPress visible dans le code source" />
            <LockedCheck label="Plan d'action priorisé + recommandations détaillées" />
          </div>
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg-card to-transparent pointer-events-none" />
        </div>

        {/* CTA secondaire */}
        <div className="text-center mb-4">
          <p className="text-text-muted text-sm">
            Besoin d&apos;un diagnostic expert ?{" "}
            <a
              href="https://quantumdev.fr/diagnostic"
              className="text-primary-500 hover:text-primary-400 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Prendre RDV (200€)
            </a>
          </p>
        </div>
      </div>

      {/* CTA fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-dark border-t border-white/5 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold text-base transition cursor-pointer disabled:cursor-not-allowed"
          >
            {paying
              ? "Redirection vers le paiement..."
              : "Débloquer le rapport complet — 29€ HT"}
          </button>
          <p className="text-center text-text-muted text-xs mt-2">
            Paiement sécurisé · Rapport immédiat · Satisfait ou remboursé
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-bg-dark">
          <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
