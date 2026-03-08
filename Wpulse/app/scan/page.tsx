"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanAnimation } from "@/components/ScanAnimation";

const SCAN_STEPS = [
  "Résolution DNS...",
  "Vérification SSL...",
  "Détection CMS...",
  "Test de performance...",
  "Analyse des en-têtes de sécurité...",
  "Vérification des points d'exposition...",
  "Calcul du score...",
];

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) {
      router.replace("/");
      return;
    }

    // Advance steps visually every 2s
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < SCAN_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 2000);

    // Launch the actual scan
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((data) => {
        clearInterval(interval);
        if (data.error) {
          setError(data.error);
        } else {
          // Store results in sessionStorage for the results page
          sessionStorage.setItem(`scan_${data.scanId}`, JSON.stringify(data));
          router.replace(`/results?id=${data.scanId}`);
        }
      })
      .catch(() => {
        clearInterval(interval);
        setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      });

    return () => clearInterval(interval);
  }, [url, router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-bg-dark">
        <p className="text-danger text-lg mb-4 max-w-sm">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
        >
          Réessayer
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-bg-dark">
      <div className="max-w-sm w-full">
        <ScanAnimation />

        <div className="mt-8">
          <p className="text-text-primary font-semibold mb-1">
            Analyse en cours...
          </p>
          {url && (
            <p className="text-text-muted text-sm font-mono truncate">{decodeURIComponent(url)}</p>
          )}
        </div>

        <div className="mt-6 space-y-2 text-left">
          {SCAN_STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-2 text-sm transition-opacity duration-500 ${
                i <= currentStep ? "opacity-100" : "opacity-20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  i < currentStep
                    ? "bg-success"
                    : i === currentStep
                    ? "bg-primary-500 animate-pulse"
                    : "bg-text-muted"
                }`}
              />
              <span
                className={
                  i < currentStep ? "text-text-muted" : "text-text-secondary"
                }
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-bg-dark">
          <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </main>
      }
    >
      <ScanPageContent />
    </Suspense>
  );
}
