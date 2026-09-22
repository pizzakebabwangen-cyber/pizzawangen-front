/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useEffect, useId, useState } from "react";
import { apiUrl } from "../../config/apiBase.js";
import "./GutscheineHomeCta.css";

/** Inline-SVG: funktioniert auch wenn ein CDN-Asset-Pfad für img fehlschlägt. */
function GutscheineStarSvg({ compact = false }) {
  const gid = useId().replace(/:/g, "");
  const w = compact ? 118 : 200;
  const h = compact ? 118 : 200;
  const fs = compact ? 18 : 22;
  const y1 = compact ? 100 : 108;
  const y2 = compact ? 130 : 142;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      width={w}
      height={h}
      className={`gutscheine-home-cta-svg${compact ? " gutscheine-home-cta-svg--compact" : ""}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={`gutscheineBurst-${gid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#ffb84d" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <path
        fill={`url(#gutscheineBurst-${gid})`}
        d="M120.00,20.00 L130.87,79.43 L170.00,33.40 L149.70,90.30 L206.60,70.00 L160.57,109.13 L220.00,120.00 L160.57,130.87 L206.60,170.00 L149.70,149.70 L170.00,206.60 L130.87,160.57 L120.00,220.00 L109.13,160.57 L70.00,206.60 L90.30,149.70 L33.40,170.00 L79.43,130.87 L20.00,120.00 L79.43,109.13 L33.40,70.00 L90.30,90.30 L70.00,33.40 L109.13,79.43 Z"
      />
      <text
        x="120"
        y={y1}
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui,Segoe UI,Arial,sans-serif"
        fontSize={fs}
        fontWeight="800"
      >
        Gutscheine
      </text>
      <text
        x="120"
        y={y2}
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui,Segoe UI,Arial,sans-serif"
        fontSize={fs}
        fontWeight="800"
      >
        bestellen
      </text>
    </svg>
  );
}

/** Normalisiert API-Antwort (camelCase/PascalCase) für Menü-Rabattkarte. */
function normalizeMenuOffer(data) {
  if (!data || typeof data !== "object") return null;

  const activeRaw = data.active ?? data.Active ?? data.isActive ?? data.IsActive;
  const code = String(data.code ?? data.Code ?? data.bonusNr ?? data.BonusNr ?? "").trim();
  const valueRaw = data.value ?? data.Value ?? data.rabatt ?? data.Rabatt ?? data.percent ?? data.Percent;
  const value = Number(valueRaw);
  const title = String(
    data.title ?? data.Title ?? data.angebotsTitel ?? data.AngebotsTitel ?? "Angebot"
  ).trim();
  const expiryDate = String(
    data.expiryDate ??
      data.ExpiryDate ??
      data.faelligBis ??
      data.FaelligBis ??
      data.validUntil ??
      data.ValidUntil ??
      ""
  ).trim();

  const explicitlyActive =
    activeRaw === true ||
    activeRaw === 1 ||
    String(activeRaw).toLowerCase() === "true" ||
    String(activeRaw).toLowerCase() === "ja";

  // Manche Backends liefern den Code ohne active:true — dann trotzdem anzeigen,
  // wenn Code + Prozent vorhanden sind.
  const hasOfferPayload = Boolean(code) && Number.isFinite(value) && value > 0;
  if (!explicitlyActive && !hasOfferPayload) return null;
  if (activeRaw === false && !hasOfferPayload) return null;
  // Nur { active:false } ohne Daten → nichts anzeigen
  if (activeRaw === false && !code) return null;

  return {
    active: true,
    title: title || "Angebot",
    value,
    code,
    expiryDate,
  };
}

/** Wird angezeigt, solange /api/Cart/active-menu-offer kein aktives Angebot liefert. */
const FALLBACK_MENU_OFFER = {
  active: true,
  title: "Herbst-Aktion 2026",
  value: 15,
  code: "Wangen15",
  expiryDate: "30.09.2026",
  lastDay: new Date(2026, 8, 30, 23, 59, 59),
};

function fallbackMenuOffer() {
  return new Date() <= FALLBACK_MENU_OFFER.lastDay ? FALLBACK_MENU_OFFER : null;
}

/**
 * @param {{ variant?: "home" | "menueInline" }} props
 * home: breiter Streifen unter Header (Startseite)
 * menueInline: kompakt neben «Unser Menü» auf /menue
 */
const GutscheineHomeCta = ({ variant = "home" }) => {
  const [menuOffer, setMenuOffer] = useState(null);

  useEffect(() => {
    if (variant !== "menueInline") return;

    let cancelled = false;
    fetch(apiUrl("/api/Cart/active-menu-offer"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setMenuOffer(normalizeMenuOffer(data) || fallbackMenuOffer());
      })
      .catch(() => {
        if (!cancelled) setMenuOffer(fallbackMenuOffer());
      });

    return () => {
      cancelled = true;
    };
  }, [variant]);

  if (variant === "menueInline") {
    const menuOfferTitle = String(menuOffer?.title || "Angebot").trim();

    return (
      <div
        className={`gutscheine-menue-inline-wrap${menuOffer ? " gutscheine-menue-inline-wrap--with-offer" : ""}`}
      >
        {menuOffer && (
          <div
            className="fruehlings-aktion-menue-card"
            aria-label={`${menuOfferTitle}: ${menuOffer.value} Prozent Rabatt mit Code ${menuOffer.code}`}
          >
            <span className="fruehlings-aktion-eyebrow">{menuOfferTitle}</span>
            <strong>{menuOffer.value}% Rabatt</strong>
            <span className="fruehlings-aktion-code">Code: {menuOffer.code}</span>
            {menuOffer.expiryDate ? (
              <span className="fruehlings-aktion-date">bis {menuOffer.expiryDate}</span>
            ) : null}
            <span className="fruehlings-aktion-hint">Code an der Kasse eingeben</span>
          </div>
        )}
        <Link
          to="/gutscheine"
          className="gutscheine-menue-voucher-link"
          aria-label="Wertgutschein kaufen"
        >
          <span>Geschenkidee?</span>
          <strong>Gutschein kaufen</strong>
        </Link>
      </div>
    );
  }

  return (
    <section className="gutscheine-home-cta-wrap" aria-label="Gutscheine bestellen">
      <Link to="/gutscheine" className="gutscheine-home-cta">
        <GutscheineStarSvg />
      </Link>
    </section>
  );
};

export default GutscheineHomeCta;
