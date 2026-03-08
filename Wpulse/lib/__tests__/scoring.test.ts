import { calculateScore } from "../scoring";
import type { ScanResult } from "../scanner";

const baseChecks: ScanResult["checks"] = {
  ssl: { valid: true },
  wordpress: { detected: true },
  pagespeed: { score: 85, status: "ok" },
  securityHeaders: { present: ["x-frame-options"], missing: [] },
  xmlrpc: { exposed: false, status: "blocked" },
  loginPage: { exposed: false, status: "hidden" },
  wpVersion: { exposed: false },
};

describe("calculateScore", () => {
  it("retourne 100 pour un site parfait", () => {
    expect(calculateScore(baseChecks)).toBe(100);
  });

  it("retire 20 points si SSL invalide", () => {
    const checks = { ...baseChecks, ssl: { valid: false } };
    expect(calculateScore(checks)).toBe(80);
  });

  it("retire 20 points si PageSpeed < 50", () => {
    const checks = {
      ...baseChecks,
      pagespeed: { score: 40, status: "fail" as const },
    };
    expect(calculateScore(checks)).toBe(80);
  });

  it("retire 10 points si PageSpeed entre 50 et 74", () => {
    const checks = {
      ...baseChecks,
      pagespeed: { score: 60, status: "warn" as const },
    };
    expect(calculateScore(checks)).toBe(90);
  });

  it("ne retire rien si PageSpeed >= 75", () => {
    const checks = {
      ...baseChecks,
      pagespeed: { score: 75, status: "ok" as const },
    };
    expect(calculateScore(checks)).toBe(100);
  });

  it("ne retire rien si PageSpeed untested", () => {
    const checks = {
      ...baseChecks,
      pagespeed: { status: "untested" as const },
    };
    expect(calculateScore(checks)).toBe(100);
  });

  it("retire 15 points si XML-RPC exposé", () => {
    const checks = {
      ...baseChecks,
      xmlrpc: { exposed: true, status: "exposed" as const },
    };
    expect(calculateScore(checks)).toBe(85);
  });

  it("retire 10 points si login exposé", () => {
    const checks = {
      ...baseChecks,
      loginPage: { exposed: true, status: "exposed" as const },
    };
    expect(calculateScore(checks)).toBe(90);
  });

  it("retire 10 points si version WP visible", () => {
    const checks = {
      ...baseChecks,
      wpVersion: { exposed: true, version: "6.4.2" },
    };
    expect(calculateScore(checks)).toBe(90);
  });

  it("retire 5 points par header manquant", () => {
    const checks = {
      ...baseChecks,
      securityHeaders: {
        present: [],
        missing: ["x-frame-options", "content-security-policy"],
      },
    };
    expect(calculateScore(checks)).toBe(90);
  });

  it("plafonne la déduction headers à 25 points", () => {
    const checks = {
      ...baseChecks,
      securityHeaders: {
        present: [],
        missing: ["a", "b", "c", "d", "e", "f"],
      },
    };
    expect(calculateScore(checks)).toBe(75);
  });

  it("ne descend jamais sous 0", () => {
    const checks = {
      ...baseChecks,
      ssl: { valid: false },
      pagespeed: { score: 10, status: "fail" as const },
      xmlrpc: { exposed: true, status: "exposed" as const },
      loginPage: { exposed: true, status: "exposed" as const },
      wpVersion: { exposed: true, version: "6.0" },
      securityHeaders: {
        present: [],
        missing: ["a", "b", "c", "d", "e", "f"],
      },
    };
    expect(calculateScore(checks)).toBeGreaterThanOrEqual(0);
  });
});
