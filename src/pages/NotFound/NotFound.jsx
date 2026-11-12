import { Link } from "react-router-dom";

/** Unbekannte URL: Seite mit eigener h1; meta robots noindex setzt <Seo /> (siehe src/config/seo.js). */
const NotFound = () => (
  <div className="container" style={{ padding: "180px 16px 80px", textAlign: "center", minHeight: "60vh" }}>
    <h1 style={{ fontSize: "2.4rem" }}>Seite nicht gefunden</h1>
    <p style={{ margin: "16px 0 28px" }}>
      Diese Seite gibt es nicht (mehr). Zur <Link to="/">Startseite</Link> oder direkt zur{" "}
      <Link to="/menue">Speisekarte</Link>.
    </p>
  </div>
);

export default NotFound;
