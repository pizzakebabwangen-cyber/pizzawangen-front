/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./GutscheinShowcase.css";

const GUTSCHEIN_VALUES = [
  { amount: 25, label: "CHF 25" },
  { amount: 50, label: "CHF 50" },
  { amount: 100, label: "CHF 100" },
  { amount: 150, label: "CHF 150" },
  { amount: 200, label: "CHF 200" },
];

/** Eigenständiger Wertgutschein-Kauf unter /gutscheine — nicht über den Speisen-Warenkorb. */
const GutscheinShowcase = ({ variant = "full" }) => {
  const navigate = useNavigate();

  const goKaufen = (amount) => {
    navigate("/gutscheine", { state: { presetAmount: amount } });
  };

  if (variant === "compact") {
    return (
      <div className="gutschein-compact-grid">
        {GUTSCHEIN_VALUES.map(({ amount, label }) => (
          <motion.button
            key={amount}
            className="gutschein-compact-card"
            onClick={() => goKaufen(amount)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            <span className="gutschein-compact-value">{label}</span>
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="gutschein-showcase">
      <div className="gutschein-cards-grid">
        {GUTSCHEIN_VALUES.map(({ amount, label }) => (
          <motion.div
            key={amount}
            className="gutschein-card"
            onClick={() => goKaufen(amount)}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goKaufen(amount);
              }
            }}
          >
            <div className="gutschein-card-inner">
              <div className="gutschein-card-front">
                <div className="gutschein-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
                    <path d="M12 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                  </svg>
                </div>
                <span className="gutschein-value">{label}</span>
                <span className="gutschein-label">Wertgutschein</span>
              </div>
              <div className="gutschein-card-back">
                <span className="gutschein-tap-hint">Karte antippen</span>
                <span className="gutschein-tap-sub">Jetzt kaufen</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="gutschein-tip">
        Tipp: Karte antippen — Sie gelangen zur Bestellseite für Wertgutscheine (ohne Warenkorb).
        Zum Einlösen eines Codes nutzen Sie die Kasse bei Ihrer Speisenbestellung.
      </p>
    </div>
  );
};

export default GutscheinShowcase;
