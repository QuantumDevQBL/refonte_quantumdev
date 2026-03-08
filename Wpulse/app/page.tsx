"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1);
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

  const vulns = useCounter(11334, 2400, 800);
  const pluginPct = useCounter(96, 1800, 1000);
  const hours = useCounter(5, 1400, 1200);

  function isValidUrl(input: string): boolean {
    try {
      const parsed = new URL(input);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setError("Entrez l'URL de votre site WordPress."); return; }
    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed : `https://${trimmed}`;
    if (!isValidUrl(normalized)) { setError("URL invalide. Exemple : votresite.fr"); return; }
    router.push(`/scan?url=${encodeURIComponent(normalized)}`);
  }

  return (
    <main style={{ background: "#060A10", minHeight: "100dvh" }}>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col justify-center"
        style={{ minHeight: "100dvh", padding: "0 clamp(1rem, 5vw, 3.5rem)" }}
      >
        {/* Background: dot grid + blue glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% -5%, rgba(37,99,235,0.13) 0%, transparent 65%)",
          }}
        />

        {/* Scanline */}
        <div className="scanline-wrap" aria-hidden="true" />

        {/* Top bar */}
        <div
          className="relative flex items-center justify-between"
          style={{ paddingTop: "clamp(1.25rem, 4vw, 2rem)", marginBottom: "clamp(2.5rem, 8vw, 5rem)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#3B82F6",
                animation: "pulse 2s ease-in-out infinite",
                boxShadow: "0 0 8px rgba(59,130,246,0.6)",
              }}
            />
            <span
              className="font-mono text-text-muted uppercase tracking-widest"
              style={{ fontSize: "0.65rem" }}
            >
              WPulse
            </span>
          </div>
          <span
            className="font-mono text-text-muted/40 uppercase tracking-widest"
            style={{ fontSize: "0.6rem" }}
          >
            by QuantumDev
          </span>
        </div>

        {/* ─── H1 — massive, editorial ─── */}
        <div className="relative" style={{ marginBottom: "clamp(2rem, 6vw, 3.5rem)" }}>
          <h1
            className="font-heading font-bold uppercase"
            style={{
              fontSize: "clamp(3.4rem, 12vw, 10.5rem)",
              lineHeight: 0.88,
              letterSpacing: "-0.01em",
            }}
          >
            <span
              className="hero-word block text-text-primary"
              style={{ animationDelay: "0.05s" }}
            >
              Prenez
            </span>
            <span
              className="hero-word block"
              style={{
                animationDelay: "0.18s",
                color: "#F9FAFB",
              }}
            >
              le pouls
            </span>
            <span
              className="hero-word block"
              style={{
                animationDelay: "0.31s",
                color: "#2563EB",
                textShadow: "0 0 60px rgba(37,99,235,0.25)",
              }}
            >
              WordPress.
            </span>
          </h1>
        </div>

        {/* ─── Subtitle + form ─── */}
        <div
          className="hero-word relative"
          style={{
            animationDelay: "0.48s",
            maxWidth: "min(520px, 100%)",
          }}
        >
          <p
            className="text-text-secondary leading-relaxed"
            style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)", marginBottom: "1.5rem" }}
          >
            Scan gratuit en 30 secondes. Découvrez ce qui ralentit,
            fragilise et expose votre site — avant que les pirates le trouvent.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Terminal input */}
            <div className={`terminal-wrap${error ? " has-error" : ""}`} style={{ marginBottom: "0.75rem" }}>
              <span
                className="absolute font-mono text-primary-500 select-none"
                style={{
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "1.1rem",
                  opacity: 0.8,
                }}
                aria-hidden="true"
              >
                ›
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                placeholder="votresite.fr"
                className="w-full bg-transparent text-text-primary font-mono focus:outline-none placeholder:text-text-muted/40"
                style={{
                  padding: "1rem 1rem 1rem 2.4rem",
                  fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                }}
                autoFocus
                autoComplete="url"
                inputMode="url"
              />
            </div>

            {error && (
              <p className="font-mono text-danger" style={{ fontSize: "0.72rem", marginBottom: "0.6rem" }}>
                ✗ {error}
              </p>
            )}

            <button
              type="submit"
              className="cta-btn w-full text-white font-heading font-bold uppercase"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                borderRadius: "12px",
                padding: "1rem 1.5rem",
                fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                letterSpacing: "0.1em",
              }}
            >
              Scanner mon site
              <span
                className="font-mono normal-case"
                style={{ marginLeft: "0.75rem", opacity: 0.55, fontSize: "0.75rem", letterSpacing: "0.02em" }}
              >
                — gratuit
              </span>
            </button>

            <p
              className="text-center font-mono text-text-muted/50"
              style={{ fontSize: "0.65rem", marginTop: "0.75rem", letterSpacing: "0.05em" }}
            >
              SANS INSCRIPTION · SANS CARTE · RÉSULTAT IMMÉDIAT
            </p>
          </form>
        </div>

        {/* Scroll hint */}
        <div
          className="hero-word absolute"
          style={{
            animationDelay: "1.1s",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
            opacity: 0.25,
          }}
          aria-hidden="true"
        >
          <span className="font-mono uppercase text-text-muted" style={{ fontSize: "0.55rem", letterSpacing: "0.15em" }}>
            scroll
          </span>
          <div
            style={{
              width: 1,
              height: 28,
              background: "rgba(156,163,175,0.5)",
              animation: "scrollDrop 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS — chiffres monumentaux
      ══════════════════════════════════════════════ */}
      <section
        style={{
          background: "#060A10",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 3.5rem)",
        }}
      >
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <p
            className="font-mono text-text-muted/50 uppercase tracking-widest"
            style={{ fontSize: "0.6rem", marginBottom: "2.5rem" }}
          >
            — Source : Patchstack Security Report 2025
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "clamp(1rem, 4vw, 3rem)",
              alignItems: "start",
            }}
          >
            {[
              {
                value: vulns.count,
                suffix: "",
                started: vulns.started,
                label: "Failles découvertes",
                sub: "sur WordPress en 2025",
                delay: "0s",
              },
              {
                value: pluginPct.count,
                suffix: "%",
                started: pluginPct.started,
                label: "Des intrusions",
                sub: "viennent des plugins",
                delay: "0.15s",
              },
              {
                value: hours.count,
                suffix: "h",
                started: hours.started,
                label: "Avant le 1er exploit",
                sub: "après publication d'une faille",
                delay: "0.3s",
              },
            ].map(({ value, suffix, started, label, sub, delay }) => (
              <div key={label}>
                <div
                  className={started ? "stat-value" : ""}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "clamp(2rem, 7vw, 5rem)",
                    lineHeight: 1,
                    color: "#F9FAFB",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: "0.5rem",
                    animationDelay: delay,
                  }}
                >
                  {value.toLocaleString("fr-FR")}
                  {suffix}
                </div>
                <p
                  className="text-text-primary font-body"
                  style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)", fontWeight: 500, marginBottom: "0.2rem" }}
                >
                  {label}
                </p>
                <p
                  className="text-text-muted/60 font-mono"
                  style={{ fontSize: "0.65rem", lineHeight: 1.4 }}
                >
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section
        style={{
          background: "#0A0F1A",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 3.5rem)",
        }}
      >
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(2rem, 5vw, 3rem)",
            }}
          >
            <div>
              <p
                className="font-mono text-text-muted/50 uppercase tracking-widest"
                style={{ fontSize: "0.6rem", marginBottom: "0.6rem" }}
              >
                — Processus
              </p>
              <h2
                className="font-heading font-bold uppercase text-text-primary"
                style={{ fontSize: "clamp(1.8rem, 5vw, 3.2rem)", lineHeight: 0.92 }}
              >
                Comment<br />ça marche
              </h2>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                {
                  n: "01",
                  title: "Entrez votre URL",
                  desc: "Notre scanner analyse votre site en parallèle. SSL, CMS, performance, 4 checks de sécurité.",
                  tag: "~30 secondes",
                  accent: false,
                },
                {
                  n: "02",
                  title: "Recevez votre score /100",
                  desc: "3 checks gratuits révèlent les premiers problèmes. Le score résume votre niveau d'exposition réel.",
                  tag: "Gratuit",
                  accent: false,
                },
                {
                  n: "03",
                  title: "Débloquez le rapport complet",
                  desc: "7 checks détaillés, recommandations priorisées, plan d'action concret. Rapport immédiat après paiement.",
                  tag: "29€ HT",
                  accent: true,
                },
              ].map(({ n, title, desc, tag, accent }, i) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    gap: "clamp(1rem, 3vw, 2rem)",
                    padding: "clamp(1.25rem, 3vw, 1.75rem) 0",
                    borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Number */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "clamp(2.2rem, 5vw, 3rem)",
                      height: "clamp(2.2rem, 5vw, 3rem)",
                      borderRadius: "50%",
                      background: accent ? "#2563EB" : "rgba(37,99,235,0.1)",
                      border: accent ? "none" : "1px solid rgba(37,99,235,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "0.1rem",
                    }}
                  >
                    <span
                      className="font-mono font-bold"
                      style={{
                        fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
                        color: accent ? "#fff" : "#3B82F6",
                      }}
                    >
                      {n}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.6rem",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <h3
                        className="font-heading font-semibold text-text-primary"
                        style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
                      >
                        {title}
                      </h3>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.6rem",
                          borderRadius: "999px",
                          background: accent ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
                          color: accent ? "#3B82F6" : "#6B7280",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {tag}
                      </span>
                    </div>
                    <p
                      className="text-text-muted"
                      style={{ fontSize: "clamp(0.8rem, 1.8vw, 0.9rem)", lineHeight: 1.6 }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div style={{ paddingTop: "0.5rem" }}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); document.querySelector("input")?.focus(); }}
                className="cta-btn inline-flex items-center gap-3 text-white font-heading font-bold uppercase"
                style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  borderRadius: "12px",
                  padding: "0.9rem 1.75rem",
                  fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                  letterSpacing: "0.1em",
                  textDecoration: "none",
                }}
              >
                Lancer mon scan gratuit
                <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>↑</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "1.5rem clamp(1rem, 5vw, 3.5rem)",
        }}
      >
        <div
          style={{
            maxWidth: "56rem",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "rgba(59,130,246,0.4)",
              }}
            />
            <span className="font-mono text-text-muted/40" style={{ fontSize: "0.65rem" }}>
              WPulse ·{" "}
              <a
                href="https://quantumdev.fr"
                style={{ color: "inherit", textDecoration: "none" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                QuantumDev
              </a>
            </span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[
              { label: "Mentions légales", href: "/mentions-legales" },
              { label: "CGV", href: "/cgv" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="font-mono text-text-muted/35 hover:text-text-secondary transition"
                style={{ fontSize: "0.65rem", textDecoration: "none" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
