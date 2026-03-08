import { Nav } from "@/components/Nav";
import Link from "next/link";

export const metadata = {
  title: "Mentions légales — WPulse",
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

const Row = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#64748B", minWidth: 140, paddingTop: 2 }}>{label}</span>
    <span>{value}</span>
  </div>
);

export default function MentionsLegales() {
  return (
    <>
      <Nav />
      <main style={{ background: "#050A12", minHeight: "100vh", paddingTop: 64 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3B82F6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Conformité légale
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
              Mentions légales
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
              Dernière mise à jour : mars 2026
            </p>
          </div>

          <Section title="Éditeur du site">
            <Row label="Raison sociale" value="QuantumDev" />
            <Row label="Forme juridique" value="[À compléter — SASU / auto-entrepreneur...]" />
            <Row label="SIRET" value="[À compléter]" />
            <Row label="Siège social" value="[À compléter — adresse]" />
            <Row label="Email" value="contact@quantumdev.fr" />
            <Row label="Site principal" value="quantumdev.fr" />
          </Section>

          <Section title="Directeur de la publication">
            <p>[Nom du responsable légal de QuantumDev]</p>
          </Section>

          <Section title="Hébergement">
            <Row label="Hébergeur" value="Vercel Inc." />
            <Row label="Adresse" value="340 S Lemon Ave #4133, Walnut, CA 91789, USA" />
            <Row label="Site" value="vercel.com" />
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble du contenu de ce site (textes, analyses, interface graphique, code, logo) est la propriété exclusive de QuantumDev, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, est interdite sans autorisation préalable écrite.
            </p>
          </Section>

          <Section title="Limitation de responsabilité">
            <p>
              WPulse est un outil d&apos;analyse automatisée à titre informatif. Les résultats produits constituent une aide au diagnostic et ne sauraient engager la responsabilité de QuantumDev en cas d&apos;inexactitude ou d&apos;omission. L&apos;utilisateur reste seul responsable des décisions prises sur la base de ce rapport.
            </p>
          </Section>

          <Section title="Données personnelles">
            <p>
              WPulse ne collecte aucune donnée personnelle via l&apos;outil de scan. L&apos;URL analysée est transmise uniquement pour effectuer les vérifications techniques, puis supprimée de notre mémoire après 30 minutes. En cas de paiement, les données de transaction sont gérées par Stripe. Consultez notre{" "}
              <Link href="/confidentialite" style={{ color: "#3B82F6", textDecoration: "none" }}>
                politique de confidentialité
              </Link>{" "}
              pour plus de détails.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Ce site n&apos;utilise pas de cookies de tracking, de publicité ou d&apos;analytics tiers. Seuls des cookies strictement nécessaires au fonctionnement du paiement (Stripe) peuvent être déposés lors du règlement.
            </p>
          </Section>

          <Section title="Droit applicable">
            <p>
              Le présent site et ses mentions légales sont soumis au droit français. En cas de litige, les tribunaux français sont seuls compétents.
            </p>
          </Section>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#3B82F6", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              ← Retour à l&apos;accueil
            </Link>
            <Link href="/cgv" style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              CGV
            </Link>
            <Link href="/confidentialite" style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              Politique de confidentialité
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
