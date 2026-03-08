"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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

    if (!trimmed) {
      setError("Entrez l'URL de votre site WordPress.");
      return;
    }

    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    if (!isValidUrl(normalized)) {
      setError("URL invalide. Exemple : https://votresite.fr");
      return;
    }

    router.push(`/scan?url=${encodeURIComponent(normalized)}`);
  }

  return (
    <main className="min-h-screen flex flex-col bg-bg-dark">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-700/20 border border-primary-700/40 text-primary-500 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            WPulse by QuantumDev
          </div>

          {/* H1 */}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-4">
            Prenez le pouls de votre site{" "}
            <span className="text-primary-500">WordPress.</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-text-secondary text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            Scan gratuit en 30 secondes. Découvrez ce qui ralentit, fragilise
            et expose votre site.
          </p>

          {/* Formulaire URL */}
          <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://votresite.fr"
                className="flex-1 px-4 py-3.5 rounded-xl bg-bg-card border border-white/10 text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base transition whitespace-nowrap"
              >
                Scanner mon site
              </button>
            </div>
            {error && (
              <p className="text-danger text-sm mt-2 text-left">{error}</p>
            )}
            <p className="text-text-muted text-xs mt-3">
              Gratuit · Sans inscription · Résultats immédiats
            </p>
          </form>
        </div>
      </section>

      {/* Preuve sociale */}
      <section className="bg-bg-section border-t border-white/5 px-4 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-text-muted text-xs leading-relaxed">
            11 334 failles WordPress découvertes en 2025{" "}
            <span className="text-text-secondary">(Patchstack)</span> · 96%
            viennent des plugins · Un exploit se déclenche en moyenne en 5h
          </p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-4 py-12 bg-bg-dark border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center mb-8 text-text-primary">
            Comment ça marche
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Entrez votre URL",
                desc: "Scan automatique de votre site en 30 secondes",
              },
              {
                step: "02",
                title: "Recevez votre score",
                desc: "3 checks gratuits immédiats sur SSL, CMS et performance",
              },
              {
                step: "03",
                title: "Débloquez le rapport",
                desc: "Recommandations complètes + plan d'action pour 29€",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-bg-card rounded-xl p-5 border border-white/5"
              >
                <span className="font-mono text-primary-500 text-sm font-bold">
                  {step}
                </span>
                <h3 className="font-heading text-lg font-semibold text-text-primary mt-2 mb-1">
                  {title}
                </h3>
                <p className="text-text-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-text-muted text-xs">
            WPulse by{" "}
            <a
              href="https://quantumdev.fr"
              className="text-text-secondary hover:text-text-primary transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              QuantumDev
            </a>
          </p>
          <div className="flex gap-4">
            <a
              href="/mentions-legales"
              className="text-text-muted text-xs hover:text-text-secondary transition"
            >
              Mentions légales
            </a>
            <a
              href="/cgv"
              className="text-text-muted text-xs hover:text-text-secondary transition"
            >
              CGV
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
