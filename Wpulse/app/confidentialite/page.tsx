import { Nav } from "@/components/Nav";
import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — WPulse",
  robots: "noindex",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 40 }}>
    <h2 style={{
      fontFamily: "var(--font-heading)",
      fontWeight: 700,
      fontSize: "1.25rem",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      color: "#F1F5F9",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>{title}</h2>
    <div style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.7 }}>
      {children}
    </div>
  </section>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: "inline-block",
    background: "rgba(59,130,246,0.1)",
    color: "#60A5FA",
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 100,
    marginRight: 6,
    marginBottom: 4,
  }}>{children}</span>
);

export default function Confidentialite() {
  return (
    <>
      <Nav />
      <main style={{ background: "#050A12", minHeight: "100vh", paddingTop: 64 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3B82F6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              RGPD · Conformité
            </p>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              textTransform: "uppercase",
              color: "#F1F5F9",
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Politique de<br />confidentialité
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
              Dernière mise à jour : mars 2026
            </p>
          </div>

          {/* Résumé visuel */}
          <div style={{
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 40,
          }}>
            <p style={{ color: "#22C55E", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              En bref — notre engagement
            </p>
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.6 }}>
              WPulse ne stocke aucune donnée personnelle, n&apos;utilise pas de cookies de tracking, et ne revend aucune information à des tiers. L&apos;URL que vous analysez n&apos;est conservée que 30 minutes en mémoire, le temps de vous délivrer votre rapport.
            </p>
          </div>

          <Section title="Responsable du traitement">
            <p>
              QuantumDev — contact@quantumdev.fr<br />
              [Adresse et SIRET à compléter]
            </p>
          </Section>

          <Section title="Données collectées et finalités">
            <p style={{ marginBottom: 16 }}>WPulse collecte un minimum de données, strictement nécessaires au fonctionnement du service :</p>

            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#F1F5F9", fontWeight: 600, marginBottom: 8 }}>1. L&apos;URL du site analysé</p>
              <div style={{ marginBottom: 6 }}><Tag>finalité</Tag> Effectuer les vérifications techniques (SSL, performance, sécurité)</div>
              <div style={{ marginBottom: 6 }}><Tag>base légale</Tag> Exécution du contrat (prestation de service demandée)</div>
              <div style={{ marginBottom: 6 }}><Tag>durée</Tag> 30 minutes en mémoire vive — suppression automatique</div>
              <div><Tag>tiers</Tag> Aucun. L&apos;analyse est effectuée directement depuis nos serveurs.</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#F1F5F9", fontWeight: 600, marginBottom: 8 }}>2. Données de paiement (rapport payant)</p>
              <div style={{ marginBottom: 6 }}><Tag>finalité</Tag> Traitement du paiement de 29 € HT pour le rapport complet</div>
              <div style={{ marginBottom: 6 }}><Tag>base légale</Tag> Exécution du contrat</div>
              <div style={{ marginBottom: 6 }}><Tag>durée</Tag> Gérée par Stripe selon leur propre politique (obligations légales comptables : 10 ans)</div>
              <div><Tag>tiers</Tag> Stripe Inc. — sous-traitant certifié PCI DSS. Aucune donnée bancaire ne transite par nos serveurs.</div>
            </div>

            <div>
              <p style={{ color: "#F1F5F9", fontWeight: 600, marginBottom: 8 }}>3. Logs serveur</p>
              <div style={{ marginBottom: 6 }}><Tag>finalité</Tag> Sécurité, détection d&apos;abus (rate limiting)</div>
              <div style={{ marginBottom: 6 }}><Tag>base légale</Tag> Intérêt légitime</div>
              <div><Tag>durée</Tag> 7 jours maximum</div>
            </div>
          </Section>

          <Section title="Cookies">
            <p>
              WPulse n&apos;installe <strong style={{ color: "#F1F5F9" }}>aucun cookie de tracking</strong>, de publicité ou d&apos;analytics sur votre navigateur.
            </p>
            <p style={{ marginTop: 10 }}>
              Lors du paiement, Stripe peut déposer des cookies techniques strictement nécessaires à la sécurisation de la transaction. Ces cookies expirent à la fin de votre session.
            </p>
          </Section>

          <Section title="Partage de données">
            <p>
              Vos données ne sont <strong style={{ color: "#F1F5F9" }}>jamais vendues, louées ou cédées</strong> à des tiers à des fins commerciales. Les seuls destinataires sont :
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 10 }}>
              <li style={{ marginBottom: 6 }}>
                <strong style={{ color: "#F1F5F9" }}>Stripe Inc.</strong> — traitement du paiement uniquement (sous-traitant RGPD, DPA en vigueur)
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong style={{ color: "#F1F5F9" }}>Vercel Inc.</strong> — hébergement de l&apos;application (infrastructure, logs techniques)
              </li>
              <li>
                <strong style={{ color: "#F1F5F9" }}>Google PageSpeed Insights API</strong> — l&apos;URL analysée est transmise à l&apos;API Google pour évaluer les performances mobiles. Cette transmission est nécessaire au service.
              </li>
            </ul>
          </Section>

          <Section title="Transferts hors UE">
            <p>
              Vercel et Stripe sont des sociétés américaines. Les transferts de données sont encadrés par les clauses contractuelles types de la Commission européenne (CCT) et les mécanismes de protection adéquats prévus par le RGPD.
            </p>
          </Section>

          <Section title="Vos droits">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul style={{ paddingLeft: 20, marginTop: 10 }}>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F1F5F9" }}>Droit d&apos;accès</strong> — obtenir copie des données vous concernant</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F1F5F9" }}>Droit de rectification</strong> — corriger des données inexactes</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F1F5F9" }}>Droit à l&apos;effacement</strong> — demander la suppression de vos données</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F1F5F9" }}>Droit à la portabilité</strong> — recevoir vos données dans un format structuré</li>
              <li><strong style={{ color: "#F1F5F9" }}>Droit d&apos;opposition</strong> — vous opposer à certains traitements</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Pour exercer ces droits, contactez-nous : <strong style={{ color: "#F1F5F9" }}>contact@quantumdev.fr</strong>. Réponse sous 30 jours. En cas de litige, vous pouvez saisir la{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "#3B82F6", textDecoration: "none" }}>CNIL</a>.
            </p>
          </Section>

          <Section title="Sécurité">
            <p>
              Nous mettons en œuvre des mesures techniques appropriées pour protéger vos données : chiffrement HTTPS (TLS), headers de sécurité (HSTS, CSP, X-Frame-Options), rate limiting des API, protection SSRF, isolation des données de paiement via Stripe.
            </p>
          </Section>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#3B82F6", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              ← Retour à l&apos;accueil
            </Link>
            <Link href="/mentions-legales" style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              Mentions légales
            </Link>
            <Link href="/cgv" style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              CGV
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
