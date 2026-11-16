import { useEffect, useState } from "react";

/** Liest die Cookie-Entscheidung aus dem Banner in index.html: "accepted", "declined" oder null (noch offen). */
export const getCookieConsent = () =>
  typeof window !== "undefined" && typeof window.getCookieConsent === "function"
    ? window.getCookieConsent()
    : null;

/** Gibt die aktuelle Entscheidung zurueck und aktualisiert sich, sobald im Banner entschieden wird. */
export default function useCookieConsent() {
  const [consent, setConsent] = useState(getCookieConsent);
  useEffect(() => {
    const onChange = () => setConsent(getCookieConsent());
    window.addEventListener("cookie-consent-change", onChange);
    onChange();
    return () => window.removeEventListener("cookie-consent-change", onChange);
  }, []);
  return consent;
}