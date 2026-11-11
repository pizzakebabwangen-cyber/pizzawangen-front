/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { classifyOtpError, sendOtp, verifyOtp } from "../../Api/otp.js";

const COOLDOWN_SECONDS = 30;
const CODE_LENGTH = 6;

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  box: {
    background: "#222",
    color: "#fff",
    borderRadius: 10,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  },
  title: { color: "#ff6600", textAlign: "center", margin: "0 0 12px" },
  text: { fontSize: "0.95rem", textAlign: "center", margin: "0 0 14px" },
  input: {
    width: "100%",
    padding: 10,
    border: "1px solid #555",
    borderRadius: 5,
    background: "#444",
    color: "#fff",
    fontSize: "1.5rem",
    letterSpacing: "0.4em",
    textAlign: "center",
    boxSizing: "border-box",
  },
  error: { color: "#ff6b6b", fontSize: "0.9rem", margin: "10px 0 0", textAlign: "center" },
  row: { display: "flex", flexDirection: "column", gap: 10, marginTop: 16 },
  primary: {
    padding: 12,
    border: "none",
    borderRadius: 5,
    background: "#ff6600",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondary: {
    padding: 10,
    border: "1px solid #555",
    borderRadius: 5,
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
};

/**
 * Schritt «Telefonnummer bestätigen». Sendet beim Öffnen automatisch einmal einen Code.
 * onVerified() nach Erfolg, onCancel() bei Abbruch.
 */
export default function PhoneOtpModal({ phone, onVerified, onCancel }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);

  const send = useCallback(async () => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await sendOtp(phone);
      setInfo("Wir haben Ihnen einen Code per SMS gesendet.");
    } catch (err) {
      setError(classifyOtpError(err, "send"));
    } finally {
      setBusy(false);
      /* Cooldown auch nach Fehler, damit nicht gespammt wird. */
      setCooldown(COOLDOWN_SECONDS);
    }
  }, [phone]);

  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    send();
  }, [send]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const confirm = async () => {
    if (busy) return;
    if (code.length !== CODE_LENGTH) {
      setError("Bitte geben Sie den 6-stelligen Code ein.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const ok = await verifyOtp(phone, code);
      if (ok) {
        onVerified();
        return;
      }
      setError("Der Code ist falsch. Bitte prüfen Sie die Eingabe.");
    } catch (err) {
      setError(classifyOtpError(err, "verify"));
    }
    setBusy(false);
  };

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" aria-labelledby="otp-title">
      <div style={S.box}>
        <h3 id="otp-title" style={S.title}>Telefonnummer bestätigen</h3>
        <p style={S.text}>
          Zur Sicherheit bestätigen wir Ihre Nummer{phone ? ` ${phone}` : ""} einmalig per SMS.
          Geben Sie den 6-stelligen Code ein.
        </p>
        <input
          style={S.input}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH}
          autoComplete="one-time-code"
          autoFocus
          value={code}
          placeholder="______"
          aria-label="SMS-Code"
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirm();
            }
          }}
        />
        {info && !error ? <p style={{ ...S.text, marginTop: 10 }}>{info}</p> : null}
        {error ? <p style={S.error} role="alert">{error}</p> : null}
        <div style={S.row}>
          <button type="button" style={S.primary} disabled={busy} onClick={confirm}>
            {busy ? "Bitte warten..." : "Bestätigen"}
          </button>
          <button
            type="button"
            style={S.secondary}
            disabled={busy || cooldown > 0}
            onClick={send}
          >
            {cooldown > 0 ? `Code erneut senden (${cooldown} s)` : "Code erneut senden"}
          </button>
          <button type="button" style={S.secondary} disabled={busy} onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
