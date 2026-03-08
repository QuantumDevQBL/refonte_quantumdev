import { setCache, getCache, deleteCache } from "../cache";
import type { ScanResult } from "../scanner";

const mockScan: ScanResult = {
  url: "https://example.com",
  scannedAt: Date.now(),
  score: 80,
  checks: {
    ssl: { valid: true },
    wordpress: { detected: true },
    pagespeed: { score: 85, status: "ok" },
    securityHeaders: { present: ["x-frame-options"], missing: [] },
    xmlrpc: { exposed: false, status: "blocked" },
    loginPage: { exposed: false, status: "hidden" },
    wpVersion: { exposed: false },
  },
};

describe("cache", () => {
  it("stocke et récupère une valeur", () => {
    setCache("test-id", mockScan);
    const result = getCache("test-id");
    expect(result).not.toBeNull();
    expect(result?.url).toBe("https://example.com");
    expect(result?.score).toBe(80);
  });

  it("retourne null pour un ID inexistant", () => {
    expect(getCache("id-qui-nexiste-pas")).toBeNull();
  });

  it("supprime une valeur", () => {
    setCache("delete-me", mockScan);
    deleteCache("delete-me");
    expect(getCache("delete-me")).toBeNull();
  });

  it("les données récupérées correspondent aux données stockées", () => {
    setCache("full-test", mockScan);
    const result = getCache("full-test");
    expect(result).toEqual(mockScan);
  });
});
