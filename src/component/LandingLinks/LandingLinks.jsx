import { Link } from "react-router-dom";
import { LANDING_PAGES } from "../../config/landing.js";
import "./LandingLinks.css";

/**
 * Interne Links zu den Orts- und Gericht-Landingpages (Startseite, Kontakt).
 * Reine Navigation: keine Warenkorb-, Kassen- oder API-Logik.
 */
const LandingLinks = () => (
  <nav className="landing-links" aria-labelledby="landing-links-title">
    <h2 id="landing-links-title">Pizza Kurier in Ihrer Nähe</h2>
    <p>
      Wir liefern von Wangen SZ in die umliegenden Orte der March. Wählen Sie Ihren Ort oder Ihr
      Lieblingsgericht:
    </p>
    <ul>
      {LANDING_PAGES.map((p) => (
        <li key={p.path}>
          <Link to={p.path}>{p.short}</Link>
        </li>
      ))}
    </ul>
  </nav>
);

export default LandingLinks;
