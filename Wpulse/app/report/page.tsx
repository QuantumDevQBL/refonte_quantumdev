import { stripe } from "@/lib/stripe";
import { getCache } from "@/lib/cache";
import type { ScanResult } from "@/lib/scanner";
import { ScoreCircle } from "@/components/ScoreCircle";
import { CheckItem } from "@/components/CheckItem";

interface ReportPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

const SECURITY_HEADER_LABELS: Record<string, { label: string; desc: string }> = {
  "x-frame-options": {
    label: "X-Frame-Options",
    desc: "Protège contre le clickjacking",
  },
  "content-security-policy": {
    label: "Content-Security-Policy",
    desc: "Limite l'injection de scripts malveillants",
  },
  "x-content-type-options": {
    label: "X-Content-Type-Options",
    desc: "Empêche le MIME sniffing",
  },
  "strict-transport-security": {
    label: "HSTS (Strict-Transport-Security)",
    desc: "Force l'utilisation de HTTPS",
  },
  "referrer-policy": {
    label: "Referrer-Policy",
    desc: "Contrôle les informations de référent",
  },
  "permissions-policy": {
    label: "Permissions-Policy",
    desc: "Limite l'accès aux APIs navigateur",
  },
};

function ErrorMessage({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4 bg-bg-dark">
      <p className="text-text-secondary max-w-sm">{message}</p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
      >
        Nouveau scan
      </a>
    </main>
  );
}

async function ReportContent({ sessionId }: { sessionId: string }) {
  // Quick format guard before hitting Stripe API
  if (!sessionId.startsWith("cs_") || sessionId.length > 200) {
    return <ErrorMessage message="Session de paiement invalide." />;
  }

  let scanData: ScanResult | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return (
        <ErrorMessage message="Paiement non confirmé. Contactez-nous si vous avez été débité." />
      );
    }

    const scanId = session.metadata?.scan_id;
    if (scanId) {
      scanData = getCache(scanId);
    }
  } catch {
    return <ErrorMessage message="Session de paiement invalide ou expirée." />;
  }

  if (!scanData) {
    return (
      <ErrorMessage message="Votre session de rapport a expiré (30 minutes). Relancez un scan pour obtenir un nouveau rapport." />
    );
  }

  const { checks, score, url } = scanData;

  const allSecurityHeaders = Object.keys(SECURITY_HEADER_LABELS);

  return (
    <main className="min-h-screen pb-16 bg-bg-dark">
      {/* Header */}
      <div className="bg-bg-section border-b border-white/5 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            <span className="text-success text-xs font-semibold">
              Rapport complet déverrouillé
            </span>
          </div>
          <p className="font-mono text-text-muted text-sm truncate">{url}</p>
        </div>
      </div>

      <div className="px-4 py-8 max-w-xl mx-auto w-full space-y-6">
        {/* Score */}
        <div className="flex justify-center">
          <ScoreCircle score={score} />
        </div>

        {/* Tous les checks */}
        <div className="bg-bg-card rounded-xl border border-white/5">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">
              Rapport détaillé
            </p>
          </div>
          <div className="px-4">
            {/* SSL */}
            <CheckItem
              label="Certificat SSL"
              passed={checks.ssl.valid}
              detail={
                checks.ssl.valid
                  ? "HTTPS actif et valide."
                  : "SSL invalide ou absent. Action requise : activez Let's Encrypt ou contactez votre hébergeur."
              }
            />

            {/* WordPress */}
            <CheckItem
              label="WordPress détecté"
              passed={checks.wordpress.detected}
              detail={
                checks.wordpress.version
                  ? `Version ${checks.wordpress.version} détectée. Recommandation : masquez la version dans functions.php avec remove_action('wp_head', 'wp_generator').`
                  : checks.wordpress.detected
                  ? "CMS WordPress identifié, version non exposée."
                  : "WordPress non détecté sur ce site."
              }
            />

            {/* PageSpeed */}
            <CheckItem
              label="Performance mobile (PageSpeed)"
              passed={
                checks.pagespeed.status !== "untested" &&
                (checks.pagespeed.score ?? 0) >= 50
              }
              detail={
                checks.pagespeed.status === "untested"
                  ? "Non testé lors de ce scan."
                  : `Score : ${checks.pagespeed.score}/100. ${
                      (checks.pagespeed.score ?? 0) < 75
                        ? "Recommandation : optimisez les images (WebP), activez le cache serveur, utilisez un CDN."
                        : "Bonne performance mobile."
                    }`
              }
            />

            {/* Security Headers */}
            {allSecurityHeaders.map((key) => {
              const present = checks.securityHeaders.present.includes(key);
              const info = SECURITY_HEADER_LABELS[key];
              return (
                <CheckItem
                  key={key}
                  label={info.label}
                  passed={present}
                  detail={
                    present
                      ? `${info.desc} — en-tête présent.`
                      : `${info.desc} — absent. Recommandation : ajoutez cet en-tête dans la configuration de votre serveur web (Nginx/Apache) ou via un plugin WordPress dédié.`
                  }
                />
              );
            })}

            {/* XML-RPC */}
            <CheckItem
              label="XML-RPC"
              passed={!checks.xmlrpc.exposed}
              detail={
                checks.xmlrpc.exposed
                  ? "XML-RPC exposé — vecteur d'attaque pour brute-force et DDoS amplification. Recommandation : désactivez avec le plugin « Disable XML-RPC »."
                  : "XML-RPC non exposé ou désactivé. Bonne configuration."
              }
            />

            {/* Login Page */}
            <CheckItem
              label="Page de connexion (/wp-login.php)"
              passed={!checks.loginPage.exposed}
              detail={
                checks.loginPage.exposed
                  ? "/wp-login.php accessible publiquement. Recommandation : limitez l'accès par IP dans .htaccess ou déplacez l'URL avec WPS Hide Login."
                  : "Page de connexion protégée ou non accessible publiquement."
              }
            />

            {/* WP Version */}
            <CheckItem
              label="Version WordPress dans le code source"
              passed={!checks.wpVersion.exposed}
              detail={
                checks.wpVersion.exposed
                  ? `Version ${checks.wpVersion.version ?? ""} visible dans le HTML. Recommandation : ajoutez add_filter('the_generator', '__return_empty_string') dans functions.php.`
                  : "Version WordPress non exposée dans le code source."
              }
            />
          </div>
        </div>

        {/* Prochaine étape */}
        <div className="bg-primary-700/10 border border-primary-700/30 rounded-xl p-5">
          <h2 className="font-heading text-xl font-bold text-text-primary mb-2">
            Prochaine étape recommandée
          </h2>
          <p className="text-text-secondary text-sm mb-4">
            Ce rapport identifie les problèmes. Un diagnostic expert vous
            donne un plan d&apos;action complet avec implémentation garantie
            par un développeur WordPress senior.
          </p>
          <a
            href="https://quantumdev.fr/diagnostic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition"
          >
            Prendre RDV — Diagnostic expert 200€
          </a>
        </div>

        {/* Nouveau scan */}
        <div className="text-center">
          <a
            href="/"
            className="text-text-muted text-sm hover:text-text-secondary transition"
          >
            Analyser un autre site
          </a>
        </div>
      </div>
    </main>
  );
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <ErrorMessage message="Accès non autorisé. Complétez le paiement pour accéder au rapport." />
    );
  }

  return <ReportContent sessionId={sessionId} />;
}
