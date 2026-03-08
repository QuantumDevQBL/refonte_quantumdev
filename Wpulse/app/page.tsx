"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";

function useCounter(target: number, duration = 2200, delay = 0) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    let raf: number;
    const startTime = performance.now();
    function tick(now: number) {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return { count, started };
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const vulns = useCounter(11334, 2400, 1000);
  const pluginPct = useCounter(96, 1800, 1200);
  const hours = useCounter(5, 1400, 1400);

  function isValidUrl(input: string): boolean {
    try {
      const parsed = new URL(input);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch { return false; }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setError("Entrez l'URL de votre site WordPress."); return; }
    const normalized = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed : `https://${trimmed}`;
    if (!isValidUrl(normalized)) { setError("URL invalide. Exemple : votresite.fr"); return; }
    router.push(`/scan?url=${encodeURIComponent(normalized)}`);
  }

  const px = "clamp(1.25rem, 5vw, 3rem)";

  return (
    <>
      <Nav />
      <main style={{ background: "#050A12" }}>

        {/* ── HERO ─────────────────────────────────── */}
        <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: px, paddingRight: px, textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.08)",
              fontFamily: "var(--font-mono)", fontSize: "0.8rem",
              color: "#EF4444", marginBottom: 32, letterSpacing: "0.02em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", animation: "blink 1.5s ease-in-out infinite" }} />
              11 334 failles WordPress découvertes en 2025
            </div>

            {/* H1 */}
            <h1
              className="font-heading"
              style={{
                fontWeight: 800,
                fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                marginBottom: 24,
                color: "#F1F5F9",
              }}
            >
              Votre site WordPress<br />
              <span style={{ color: "#3B82F6" }}>est-il vraiment sécurisé ?</span>
            </h1>

            {/* Sub */}
            <p style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "#94A3B8",
              maxWidth: 560, margin: "0 auto 40px",
              lineHeight: 1.6,
            }}>
              <strong style={{ color: "#F1F5F9", fontWeight: 600 }}>Dirigeants, indépendants, e-commerçants</strong>{" "}
              — votre site accumule peut-être des failles de sécurité et des problèmes de performance.
              Découvrez-les en 30 secondes, avant que quelqu&apos;un d&apos;autre ne les trouve.
            </p>

            {/* Scan input */}
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <form onSubmit={handleSubmit}>
                <div className={`scan-wrap${error ? " !border-danger" : ""}`}
                  style={{ flexDirection: "row" as const }}>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(""); }}
                    placeholder="https://votresite.fr"
                    style={{
                      flex: 1, padding: "16px 20px",
                      background: "transparent", border: "none", outline: "none",
                      color: "#F1F5F9",
                      fontFamily: "var(--font-mono)", fontSize: "0.95rem",
                    }}
                    autoFocus
                    autoComplete="url"
                    inputMode="url"
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "16px 28px",
                      background: "#2563EB",
                      color: "white", border: "none", cursor: "pointer",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700, fontSize: "0.95rem",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      whiteSpace: "nowrap", transition: "background 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1D4ED8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#2563EB")}
                  >
                    Scanner mon site →
                  </button>
                </div>
                {error && (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#EF4444", marginTop: 8, textAlign: "left" }}>
                    {error}
                  </p>
                )}
              </form>
              <div style={{
                display: "flex", justifyContent: "center", gap: 24,
                marginTop: 16, fontSize: "0.8rem", color: "#64748B",
                fontFamily: "var(--font-mono)",
              }}>
                {["✓ Gratuit", "✓ Sans inscription", "✓ 30 secondes"].map(t => (
                  <span key={t} style={{ color: t.startsWith("✓") ? undefined : undefined }}>
                    <span style={{ color: "#22C55E" }}>{t.split(" ")[0]}</span>{" "}{t.split(" ").slice(1).join(" ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── URGENCY STATS ─────────────────────────── */}
        <section style={{
          padding: `32px ${px}`,
          background: "#0B1120",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "clamp(1rem, 4vw, 2rem)",
              textAlign: "center",
            }}>
              {[
                { value: vulns.count, suffix: "", color: "#EF4444", label: "Failles découvertes", sub: "WordPress, en 2025 seul" },
                { value: pluginPct.count, suffix: "%", color: "#F1F5F9", label: "Viennent des plugins", sub: "Pas du cœur WordPress" },
                { value: hours.count, suffix: "h", color: "#EF4444", label: "Délai moyen d'exploit", sub: "Après publication d'une faille" },
              ].map(({ value, suffix, color, label, sub }) => (
                <div key={label}>
                  <div style={{
                    fontFamily: "var(--font-heading)", fontWeight: 800,
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    color, lineHeight: 1, fontVariantNumeric: "tabular-nums",
                  }}>
                    {value.toLocaleString("fr-FR")}{suffix}
                  </div>
                  <div style={{ fontWeight: 600, color: "#94A3B8", fontSize: "0.85rem", marginTop: 8 }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#64748B", marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#64748B", marginTop: 16 }}>
              Source : Patchstack — State of WordPress Security 2026
            </p>
          </div>
        </section>

        {/* ── ICP — VOUS ÊTES CONCERNÉ ──────────────── */}
        <section style={{ padding: `80px ${px}`, background: "#050A12" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="eyebrow">→ Vous êtes concerné</div>
              <h2 className="section-title">
                Votre site fonctionne.<br />Mais il accumule des risques invisibles.
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {[
                {
                  icon: "⚡", bg: "rgba(239,68,68,0.08)",
                  title: "Performance dégradée",
                  desc: "Votre site met plus de 4 secondes à charger sur mobile. Vos visiteurs partent avant de voir votre offre. Google vous pénalise.",
                  stat: "–7% de conversions par seconde de chargement supplémentaire",
                },
                {
                  icon: "🔓", bg: "rgba(239,68,68,0.08)",
                  title: "Failles de sécurité ouvertes",
                  desc: "Plugins obsolètes, XML-RPC actif, page de login exposée — votre site est scanné par des bots toutes les 28 minutes en moyenne.",
                  stat: "96% des pros WordPress ont déjà subi un incident — Melapress 2025",
                },
                {
                  icon: "🔍", bg: "rgba(245,158,11,0.08)",
                  title: "SEO technique invisible",
                  desc: "Version WordPress visible, headers de sécurité absents, robots.txt mal configuré. Des signaux que Google lit, même si vous ne les voyez pas.",
                  stat: "39% des sites piratés tournaient sur des logiciels obsolètes — Wordfence",
                },
              ].map(({ icon, bg, title, desc, stat }) => (
                <div key={title} className="wp-card" style={{ padding: 32 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 20 }}>
                    {icon}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.15rem", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 12, color: "#F1F5F9" }}>
                    {title}
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#EF4444",
                    paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}>{stat}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ─────────────────────────── */}
        <section style={{ padding: `80px ${px}`, background: "#0B1120" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="eyebrow">→ Ce que vous obtenez</div>
              <h2 className="section-title">Un diagnostic en deux niveaux</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48 }}>
              {/* Free */}
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", textTransform: "uppercase", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, color: "#F1F5F9" }}>
                  Scan gratuit <span className="tag-free">0€</span>
                </h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    "Score global de santé /100",
                    "Certificat SSL valide ou non",
                    "Détection WordPress + version",
                    "Score PageSpeed mobile",
                  ].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: "0.9rem", color: "#94A3B8", lineHeight: 1.5 }}>
                      <span style={{ color: "#22C55E", fontSize: "1.1rem", flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Paid */}
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", textTransform: "uppercase", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, color: "#F1F5F9" }}>
                  Rapport complet <span className="tag-paid">29€ HT</span>
                </h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    "Audit headers de sécurité (6 tests)",
                    "XML-RPC exposé ou bloqué",
                    "Page de login accessible publiquement",
                    "Version WordPress visible dans le code",
                    "Recommandations priorisées + plan d'action",
                  ].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: "0.9rem", color: "#94A3B8", lineHeight: 1.5 }}>
                      <span style={{ color: "#60A5FA", fontSize: "1rem", flexShrink: 0 }}>🔒</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────── */}
        <section style={{ padding: `80px ${px}`, background: "#050A12" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="eyebrow">→ Processus</div>
              <h2 className="section-title">Comment ça marche</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
              {[
                { n: "01", title: "Entrez votre URL", desc: "Notre scanner analyse votre site en parallèle : SSL, CMS, performance, 4 checks sécurité.", tag: "~30 secondes", tagClass: "tag-free" },
                { n: "02", title: "Recevez votre score", desc: "3 checks gratuits révèlent les premiers problèmes. Le score résume votre niveau d'exposition réel.", tag: "Gratuit", tagClass: "tag-free" },
                { n: "03", title: "Débloquez le rapport", desc: "7 checks détaillés, recommandations priorisées, plan d'action concret. Rapport immédiat après paiement.", tag: "29€ HT", tagClass: "tag-paid" },
              ].map(({ n, title, desc, tag, tagClass }) => (
                <div key={n} style={{ textAlign: "center", padding: "32px 24px" }}>
                  <div style={{
                    fontFamily: "var(--font-heading)", fontWeight: 800,
                    fontSize: "3rem", lineHeight: 1,
                    color: "#0B1120", WebkitTextStroke: "1px rgba(255,255,255,0.1)",
                    marginBottom: 16,
                  }}>{n}</div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.1rem", textTransform: "uppercase", marginBottom: 12, color: "#F1F5F9" }}>{title}</h3>
                  <p style={{ color: "#64748B", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 12 }}>{desc}</p>
                  <span className={tagClass}>{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ──────────────────────────── */}
        <section style={{ padding: `80px ${px}`, background: "#0B1120", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="eyebrow">→ Expertise terrain</div>
            <h2 className="section-title">Construit par un spécialiste<br />audit &amp; maintenance WordPress</h2>
            <blockquote style={{
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              fontStyle: "italic", color: "#94A3B8",
              margin: "40px auto", lineHeight: 1.7,
              position: "relative", maxWidth: 640,
            }}>
              <span style={{
                fontFamily: "var(--font-heading)", fontSize: "5rem",
                color: "#3B82F6", opacity: 0.3,
                position: "absolute", top: -30, left: -20, lineHeight: 1,
              }}>&ldquo;</span>
              WPulse automatise les 7 premiers checks que je réalise manuellement sur chaque site que j&apos;audite.
              Si votre score est inférieur à 60, votre site a besoin d&apos;attention — pas demain, maintenant.
              <footer style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#64748B", marginTop: 16, fontStyle: "normal" }}>
                — Quentin · QuantumDev · Tours
              </footer>
            </blockquote>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(1.5rem, 5vw, 3rem)", marginTop: 48, flexWrap: "wrap" }}>
              {[
                { n: "50+", label: "Sites audités" },
                { n: "38/100", label: "Score moyen constaté" },
                { n: "96%", label: "Avaient au moins 1 faille critique" },
              ].map(({ n, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.5rem", color: "#F1F5F9" }}>{n}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#64748B", marginTop: 8 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ─────────────────────────────── */}
        <section style={{ padding: `96px ${px}`, background: "#050A12", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", textTransform: "uppercase", marginBottom: 16, color: "#F1F5F9" }}>
              Votre site est exposé.<br /><span style={{ color: "#3B82F6" }}>Vérifiez-le maintenant.</span>
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", marginBottom: 40, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              Scan gratuit en 30 secondes. Aucune inscription requise.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => document.querySelector<HTMLInputElement>("input[type=text]")?.focus(), 500); }}
              className="cta-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                padding: "18px 40px",
                background: "#2563EB", color: "white",
                borderRadius: 12, textDecoration: "none",
                fontFamily: "var(--font-heading)", fontWeight: 700,
                fontSize: "1.1rem", letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Scanner mon site gratuitement
              <span style={{ fontSize: "1.3rem" }}>→</span>
            </a>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#64748B", marginTop: 20 }}>
              Gratuit · Sans carte bancaire · Résultat immédiat
            </p>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────── */}
        <footer style={{
          padding: `32px ${px}`,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
          fontSize: "0.8rem", color: "#64748B",
        }}>
          <div>
            <span style={{ color: "#94A3B8" }}>WPulse</span> · by{" "}
            <a href="https://quantumdev.fr" style={{ color: "#64748B", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">QuantumDev</a>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "Mentions légales", href: "/mentions-legales" }, { label: "CGV", href: "/cgv" }, { label: "Confidentialité", href: "/confidentialite" }].map(({ label, href }) => (
              <a key={href} href={href} style={{ color: "#64748B", textDecoration: "none" }}>{label}</a>
            ))}
          </div>
        </footer>

      </main>
    </>
  );
}
