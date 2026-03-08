import { Nav } from "@/components/Nav";
import Link from "next/link";

export const metadata = {
  title: "Conditions Générales de Vente — WPulse",
  robots: "noindex",
};

const Section = ({ title, num, children }: { title: string; num: string; children: React.ReactNode }) => (
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
      display: "flex",
      alignItems: "baseline",
      gap: 12,
    }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3B82F6", fontWeight: 400 }}>{num}</span>
      {title}
    </h2>
    <div style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.7 }}>
      {children}
    </div>
  </section>
);

export default function CGV() {
  return (
    <>
      <Nav />
      <main style={{ background: "#050A12", minHeight: "100vh", paddingTop: 64 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3B82F6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Conditions contractuelles
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
              Conditions générales<br />de vente
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
              Dernière mise à jour : mars 2026
            </p>
          </div>

          {/* Préambule */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 40,
            color: "#94A3B8",
            fontSize: "0.875rem",
            lineHeight: 1.7,
          }}>
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes réalisées par <strong style={{ color: "#F1F5F9" }}>QuantumDev</strong> via le service <strong style={{ color: "#F1F5F9" }}>WPulse</strong> (wpulse.fr). Tout achat implique l&apos;acceptation pleine et entière de ces conditions.
          </div>

          <Section num="art. 1" title="Vendeur">
            <p>
              QuantumDev — [Raison sociale complète, forme juridique, SIRET, adresse à compléter]<br />
              Email : contact@quantumdev.fr
            </p>
          </Section>

          <Section num="art. 2" title="Produit vendu">
            <p>
              WPulse commercialise un <strong style={{ color: "#F1F5F9" }}>rapport d&apos;audit de sécurité WordPress</strong> sous forme de document numérique accessible en ligne, généré automatiquement à partir de l&apos;URL fournie par le client.
            </p>
            <p style={{ marginTop: 10 }}>
              Le rapport comprend l&apos;analyse de 10 points de contrôle : certificat SSL, détection CMS, performance mobile (PageSpeed), en-têtes de sécurité HTTP (6 headers), exposition XML-RPC, exposition de la page de connexion, et visibilité de la version WordPress dans le code source.
            </p>
          </Section>

          <Section num="art. 3" title="Prix et TVA">
            <p>
              Le rapport complet est vendu au tarif de <strong style={{ color: "#F1F5F9" }}>29 € HT</strong> (soit 34,80 € TTC au taux de TVA française de 20 %) par analyse.
            </p>
            <p style={{ marginTop: 10 }}>
              Les prix sont indiqués en euros et peuvent être modifiés à tout moment. Le prix applicable est celui affiché au moment de la commande.
            </p>
          </Section>

          <Section num="art. 4" title="Commande et paiement">
            <p>
              La commande est finalisée après paiement sécurisé via <strong style={{ color: "#F1F5F9" }}>Stripe</strong>. Les moyens de paiement acceptés sont ceux proposés par Stripe (carte bancaire Visa, Mastercard, CB). Aucune donnée bancaire ne transite par les serveurs de QuantumDev.
            </p>
            <p style={{ marginTop: 10 }}>
              Le contrat de vente est formé au moment de la confirmation de paiement par Stripe. Un accès immédiat au rapport est accordé dès confirmation.
            </p>
          </Section>

          <Section num="art. 5" title="Livraison du service">
            <p>
              Le rapport est un <strong style={{ color: "#F1F5F9" }}>bien numérique délivré instantanément</strong> après confirmation du paiement, accessible via un lien unique envoyé ou redirigé automatiquement. Le rapport reste accessible pendant <strong style={{ color: "#F1F5F9" }}>30 minutes</strong> à compter du scan initial.
            </p>
            <p style={{ marginTop: 10 }}>
              En cas de problème technique empêchant l&apos;accès au rapport (expiration de session, erreur serveur), le client est invité à contacter QuantumDev à contact@quantumdev.fr avec son justificatif de paiement pour obtenir un nouveau scan sans frais.
            </p>
          </Section>

          <Section num="art. 6" title="Droit de rétractation">
            <p>
              Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation de 14 jours <strong style={{ color: "#F1F5F9" }}>ne s&apos;applique pas</strong> aux contenus numériques fournis immédiatement après paiement, dès lors que le client a expressément consenti à ce que l&apos;exécution commence avant l&apos;expiration du délai de rétractation.
            </p>
            <p style={{ marginTop: 10 }}>
              En procédant au paiement, le client reconnaît et accepte la fourniture immédiate du service numérique et renonce expressément à son droit de rétractation.
            </p>
          </Section>

          <Section num="art. 7" title="Garantie de satisfaction">
            <p>
              QuantumDev s&apos;engage à rembourser intégralement tout client insatisfait du rapport dans un délai de <strong style={{ color: "#F1F5F9" }}>7 jours</strong> suivant l&apos;achat, sur simple demande à contact@quantumdev.fr, sans justification requise.
            </p>
            <p style={{ marginTop: 10 }}>
              Cette garantie commerciale est distincte du droit légal de rétractation et s&apos;y substitue dans les conditions décrites à l&apos;article 6.
            </p>
          </Section>

          <Section num="art. 8" title="Limitation de responsabilité">
            <p>
              WPulse est un outil d&apos;analyse automatisée à caractère informatif. Les résultats produits ne constituent pas un audit de sécurité exhaustif et ne sauraient remplacer une expertise humaine. QuantumDev ne peut être tenu responsable :
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 4 }}>Des décisions prises sur la base des résultats du rapport</li>
              <li style={{ marginBottom: 4 }}>D&apos;éventuelles inexactitudes liées à des configurations serveur non standard</li>
              <li style={{ marginBottom: 4 }}>De tout dommage indirect résultant de l&apos;utilisation du service</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              La responsabilité de QuantumDev est en tout état de cause limitée au montant payé pour la prestation concernée.
            </p>
          </Section>

          <Section num="art. 9" title="Données personnelles">
            <p>
              Le traitement des données dans le cadre de la commande est décrit dans notre{" "}
              <Link href="/confidentialite" style={{ color: "#3B82F6", textDecoration: "none" }}>
                politique de confidentialité
              </Link>.
            </p>
          </Section>

          <Section num="art. 10" title="Droit applicable et litiges">
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort du siège social de QuantumDev seront seuls compétents.
            </p>
            <p style={{ marginTop: 10 }}>
              Conformément à l&apos;article L.612-1 du Code de la consommation, le client consommateur peut recourir gratuitement à un médiateur de la consommation. [Médiateur à désigner].
            </p>
          </Section>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#3B82F6", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              ← Retour à l&apos;accueil
            </Link>
            <Link href="/mentions-legales" style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
              Mentions légales
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
