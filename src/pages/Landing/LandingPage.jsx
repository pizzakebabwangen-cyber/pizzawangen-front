/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SITE, OPENING_HOURS, DELIVERY_HOURS, openText, deliveryText, addressLine,
} from "../../config/site.js";
import { LANDING_PAGES } from "../../config/landing.js";
import "./LandingPage.css";

/** Orts-/Gericht-Landingpage. Reiner Informationsseite: keine Warenkorb-, Kassen- oder API-Logik. */
const LandingPage = ({ page }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page.path]);

  const others = LANDING_PAGES.filter((p) => p.path !== page.path);

  return (
    <main className="landing">
      <div className="landing__inner">
        <h1>{page.h1}</h1>
        {page.intro.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <div className="landing__cta">
          <Link className="landing__btn landing__btn--primary" to="/menue">
            Zur Speisekarte und online bestellen
          </Link>
        </div>

        <section className="landing__card" aria-labelledby="landing-delivery">
          <h2 id="landing-delivery">{page.deliveryHeading}</h2>
          <p>{page.deliveryText}</p>
          <div className="landing__hours">
            <div>
              <h3>Lieferzeiten</h3>
              <ul>
                {DELIVERY_HOURS.map((d) => (
                  <li key={d.key}>
                    <span>{d.label}</span> {deliveryText(d)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Öffnungszeiten</h3>
              <ul>
                {OPENING_HOURS.map((h) => (
                  <li key={h.key}>
                    <span>{h.label}</span> {openText(h)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p>
            {SITE.name}, {addressLine()}, Tel.{" "}
            <a href={`tel:${SITE.phoneE164}`}>{SITE.phoneDisplay}</a>
          </p>
        </section>

        <nav className="landing__more" aria-label="Weitere Orte und Gerichte">
          <h2>Mehr von Wangen Pizza Kebab</h2>
          <ul>
            {others.map((p) => (
              <li key={p.path}>
                <Link to={p.path}>{p.short}</Link>
              </li>
            ))}
            <li><Link to="/menue">Speisekarte</Link></li>
            <li><Link to="/kontakt">Kontakt &amp; Liefergebiete</Link></li>
            <li><Link to="/gutscheine">Gutscheine</Link></li>
          </ul>
        </nav>
      </div>
    </main>
  );
};

export default LandingPage;
