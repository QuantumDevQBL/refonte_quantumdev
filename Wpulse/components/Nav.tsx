import Link from "next/link";

export function Nav() {
  return (
    <nav
      className="nav-glass fixed top-0 left-0 right-0 z-50"
      style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "1.25rem",
          letterSpacing: "0.02em",
          color: "#F1F5F9",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#3B82F6",
            animation: "pulse-glow 2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        WPULSE
      </Link>
      <a
        href="https://quantumdev.fr"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "#64748B",
          textDecoration: "none",
        }}
      >
        by QuantumDev
      </a>
    </nav>
  );
}
