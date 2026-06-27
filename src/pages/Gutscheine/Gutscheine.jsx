import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  apiUrl,
  getApiBaseCandidatesFor404Retry,
} from "../../config/apiBase";
import "./Gutscheine.css";
import { computeWertgutscheinTotals } from "../../utils/wertgutscheinPricing.js";
import { extractPaymentPageUrl } from "../../utils/extractPaymentPageUrl.js";
import { isValidSwissHausnummer } from "../../utils/hausnummerValidation.js";

const WERTGUTSCHEIN_CHECKOUT_PATH = "/api/Cart/wertgutschein-checkout";

/** Kurz für Gäste; Details nur in der Konsole (für Betreiber / Deploy). */
const extractCheckoutError = (err, requestUrl) => {
  if (!err?.response) {
    const m = err?.message || "";
    if (/network error/i.test(m))
      return "Server nicht erreichbar. Bitte Verbindung prüfen — ist die API erreichbar (CORS / gleiche Domain)?";
    return m || "Verbindungsfehler. Bitte erneut versuchen.";
  }
  const st = err.response.status;
  const d = err.response.data;
  if (typeof d === "string" && d.trim()) return d.trim();
  if (d?.title && String(d.title).trim()) return String(d.title).trim();
  if (d?.Message) return String(d.Message);
  if (d?.message) return String(d.message);
  if (d?.errors && typeof d.errors === "object") {
    const vals = Object.values(d.errors).flat().filter(Boolean);
    if (vals.length) return String(vals[0]);
  }
  if (st === 404) {
    console.warn(
      "[Gutscheine] POST wertgutschein-checkout → 404. URL:",
      requestUrl,
      "| Backend mit diesem Endpunkt deployen oder VITE_SERVER_FALLBACK in .env setzen."
    );
    return "Online-Gutschein ist derzeit nicht verfügbar. Bitte später erneut versuchen oder uns im Laden anrufen.";
  }
  return `Anfrage fehlgeschlagen (${st}). Bitte später erneut versuchen oder Support kontaktieren.`;
};

const GUTSCHEIN_VALUES = [
  { amount: 25, label: "CHF 25" },
  { amount: 50, label: "CHF 50" },
  { amount: 100, label: "CHF 100" },
  { amount: 150, label: "CHF 150" },
  { amount: 200, label: "CHF 200" },
];

const Gutscheine = () => {
  const location = useLocation();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [formData, setFormData] = useState({
    anrede: "",
    vorname: "",
    nachname: "",
    firma: "",
    strasse: "",
    hausnummer: "",
    plz: "",
    ort: "",
    email: "",
    telefon: "",
    bemerkungen: "",
    agbAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitLockRef = useRef(false);

  const priceTotals = useMemo(
    () =>
      selectedAmount != null
        ? computeWertgutscheinTotals(selectedAmount, 1)
        : null,
    [selectedAmount]
  );

  useEffect(() => {
    const p = location.state?.presetAmount;
    if (p == null) return;
    const ok = GUTSCHEIN_VALUES.some((x) => x.amount === p);
    if (ok) setSelectedAmount(p);
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting) return;
    submitLockRef.current = true;
    if (!selectedAmount) {
      setError("Bitte wählen Sie einen Gutschein-Wert aus.");
      submitLockRef.current = false;
      return;
    }
    if (!formData.agbAccepted) {
      setError("Bitte akzeptieren Sie die AGB.");
      submitLockRef.current = false;
      return;
    }
    if (!String(formData.hausnummer || "").trim()) {
      setError("Bitte die Hausnummer eingeben.");
      submitLockRef.current = false;
      return;
    }
    if (!isValidSwissHausnummer(formData.hausnummer)) {
      setError("Ungültige Hausnummer (z. B. 12, 12a, 12–14).");
      submitLockRef.current = false;
      return;
    }
    setError("");
    setIsSubmitting(true);

    const payload = {
      faceValueChf: selectedAmount,
      salute: formData.anrede,
      vorname: formData.vorname.trim(),
      nachname: formData.nachname.trim(),
      firma: formData.firma?.trim() || null,
      strasse: formData.strasse.trim(),
      hausnummer: formData.hausnummer.trim(),
      plz: formData.plz.trim(),
      ort: formData.ort.trim(),
      email: formData.email.trim(),
      telefon: formData.telefon?.trim() || null,
      differentDelivery: false,
      lieferVorname: null,
      lieferNachname: null,
      lieferStrasse: null,
      lieferHausnummer: null,
      lieferPlz: null,
      lieferOrt: null,
      bemerkungen: formData.bemerkungen?.trim() || null,
      voucherQuantity: 1,
    };

    const axiosOpts = {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    };

    let requestUrlUsed = "";

    try {
      const hosts = getApiBaseCandidatesFor404Retry();
      let response;
      let lastErr;
      for (const base of hosts) {
        const url = apiUrl(WERTGUTSCHEIN_CHECKOUT_PATH, base);
        requestUrlUsed = url;
        try {
          response = await axios.post(url, payload, axiosOpts);
          break;
        } catch (e) {
          lastErr = e;
          if (e?.response?.status === 404) continue;
          throw e;
        }
      }
      if (!response) throw lastErr;
      if (response.status < 200 || response.status >= 300) {
        setError("Zahlung konnte nicht vorbereitet werden.");
        return;
      }
      const body = response.data;
      const paymentUrl = extractPaymentPageUrl(body);
      if (!paymentUrl) {
        setError("Keine Zahlungs-URL erhalten. Bitte später erneut versuchen.");
        return;
      }
      const enriched = { ...body, clientPaymentWay: 2 };
      toast.success("Zur sicheren Zahlung …");
      try {
        sessionStorage.setItem("wangen_paymentResponse", JSON.stringify(enriched));
        sessionStorage.setItem("wangen_voucherCheckout", "1");
      } catch (_) {}
      window.location.assign(paymentUrl);
    } catch (err) {
      const msg = extractCheckoutError(err, requestUrlUsed);
      setError(msg);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className="gutscheine-page">
      <Toaster position="bottom-center" />
      <div className="gutscheine-page-inner">
        <Link to="/angebote" className="gutscheine-back-link">
          <svg viewBox="0 0 24 24" fill="currentColor" className="back-arrow"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Zurück zu Angebote
        </Link>

        <motion.div
          className="gutscheine-hero-banner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-overlay">
            <div className="hero-content">
              <motion.span 
                className="hero-badge" 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="badge-icon"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                Geschenkgutschein
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Schenken Sie <span className="text-gold">Freude</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Der perfekte Gutschein für unsere Gäste — Pizza, Kebab und mehr.<br />
                Einlösbar bei Wangen Pizza Kebab.
              </motion.p>

              <motion.div 
                className="hero-features"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="feature-item">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span>Per E-Mail zustellbar</span>
                </div>
                <div className="feature-item">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span>2 Jahre gültig</span>
                </div>
                <div className="feature-item">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span>Einlösbar vor Ort</span>
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>

        <form className="gutscheine-form" onSubmit={handleSubmit}>
          <motion.div
            id="gutschein-wertwahl"
            className="gutscheine-section gutscheine-section--in-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2>Wählen Sie Ihren Gutscheinwert</h2>
            <p className="gutscheine-amount-lead">
              Ohne Auswahl kein Betrag — der Button «Jetzt bezahlen» wird erst nach der Wahl aktiv. Zahlung
              erfolgt über PostFinance (TWINT, Karte, etc.).
            </p>
            <div className="gutschein-values-grid">
              {GUTSCHEIN_VALUES.map(({ amount, label }, index) => (
                <motion.button
                  key={amount}
                  className={`gutschein-value-card ${selectedAmount === amount ? "selected" : ""}`}
                  onClick={() => setSelectedAmount(amount)}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="card-sparkle">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  <div className="card-glow"></div>
                  <span className="gutschein-value-amount">{label}</span>
                  <span className="gutschein-value-subtitle">Wertgutschein</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="gutscheine-form-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>
              <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Kontakt & Adresse
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="anrede">Anrede *</label>
                <select
                  id="anrede"
name="anrede"
                  value={formData.anrede}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Bitte wählen</option>
                  <option value="herr">Herr</option>
                  <option value="frau">Frau</option>
                </select>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label htmlFor="vorname">Vorname *</label>
                <input
                  type="text"
                  id="vorname"
                  name="vorname"
                  value={formData.vorname}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nachname">Nachname *</label>
                <input
                  type="text"
                  id="nachname"
                  name="nachname"
                  value={formData.nachname}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firma">Firma (optional)</label>
                <input
                  type="text"
                  id="firma"
                  name="firma"
                  value={formData.firma}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label htmlFor="strasse">Strasse *</label>
                <input
                  type="text"
                  id="strasse"
                  name="strasse"
                  value={formData.strasse}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group form-group-small">
                <label htmlFor="hausnummer">Nr. *</label>
                <input
                  type="text"
                  id="hausnummer"
                  name="hausnummer"
                  value={formData.hausnummer}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group form-group-small">
                <label htmlFor="plz">PLZ *</label>
                <input
                  type="text"
                  id="plz"
                  name="plz"
                  value={formData.plz}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ort">Ort *</label>
                <input
                  type="text"
                  id="ort"
                  name="ort"
                  value={formData.ort}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label htmlFor="email">E-Mail *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefon">Telefon (optional)</label>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </motion.div>


          <motion.div 
            className="gutscheine-form-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="form-group">
              <label htmlFor="bemerkungen">Bemerkungen (optional)</label>
              <textarea
                id="bemerkungen"
                name="bemerkungen"
                value={formData.bemerkungen}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </motion.div>


          <>
              <motion.div
                className="gutscheine-form-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                    <path d="M4 4h16v16H4V4z" />
                    <path d="M4 9h16v3H4z" fillOpacity="0.35" />
                    <path d="M4 15h9v2H4z" fillOpacity="0.45" />
                  </svg>
                  Zahlung
                </h3>
                <p className="gutscheine-payment-info">
                  Sie werden nach dem Klick auf «Jetzt bezahlen» zu <strong>PostFinance Checkout</strong> weitergeleitet
                  (TWINT, Kreditkarte, PostFinance Pay).
                </p>
              </motion.div>

              {error && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="error-icon"
                    aria-hidden
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <span className="error-message-text">{error}</span>
                </motion.div>
              )}


              <motion.div 
                className="gutscheine-form-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="agbAccepted"
                    name="agbAccepted"
                    checked={formData.agbAccepted}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="agbAccepted">
                    Ich akzeptiere die{" "}
                    <a href="/agb" target="_blank" rel="noopener noreferrer">
                      AGB
                    </a>{" "}
                    und bin mit der Speicherung meiner Daten einverstanden. *
                  </label>
                </div>
              </motion.div>


              <motion.div 
                className="gutscheine-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {selectedAmount && priceTotals ? (
                  <div className="gutscheine-price-breakdown">
                    <div className="summary-line">
                      <span>Wertgutschein</span>
                      <span>CHF {selectedAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                      <span>Bearbeitungsgebühr inkl. Porto (netto)</span>
                      <span>CHF {priceTotals.feeNet.toFixed(2)}</span>
                    </div>
                    <div className="summary-line summary-line-mwst">
                      <span>MwSt 8.1 %</span>
                      <span>CHF {priceTotals.mwst.toFixed(2)}</span>
                    </div>
                    <div className="summary-line summary-line-total">
                      <span>Total</span>
                      <span className="total-amount">CHF {priceTotals.total.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="summary-total">
                    <span>Gutschein-Wert:</span>
                    <span className="total-amount">---</span>
                    <p className="gutscheine-summary-hint">
                      Bitte zuerst einen Gutscheinwert wählen (CHF 25–200). Danach erscheint der Totalbetrag und
                      Sie können sicher online bezahlen.
                    </p>
                  </div>
                )}
                <motion.button
                  type="submit"
                  className="gutscheine-submit-btn"
                  disabled={!selectedAmount || !formData.agbAccepted || isSubmitting}
                  title={
                    !selectedAmount
                      ? "Gutscheinwert auswählen"
                      : !formData.agbAccepted
                        ? "AGB akzeptieren"
                        : undefined
                  }
                  whileHover={selectedAmount && formData.agbAccepted ? { scale: 1.02 } : {}}
                  whileTap={selectedAmount && formData.agbAccepted ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <svg className="spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="40 60"/></svg>
                      Wird gesendet...
                    </span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="btn-icon"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      Jetzt bezahlen · CHF{" "}
                      {priceTotals ? priceTotals.total.toFixed(2) : "--"}
                    </>
                  )}
                </motion.button>
              </motion.div>
            </>
        </form>


        <motion.footer 
          className="gutscheine-foot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p>
            Fragen zum Einlosen?{" "}
            <Link to="/kontakt" className="gutscheine-inline-link">
              Kontakt
            </Link>
          </p>
        </motion.footer>
      </div>
    </section>
  );
};

export default Gutscheine;
