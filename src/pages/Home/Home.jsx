/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import DeliveryMethod from "../../component/DeliveryMethod/DeliveryMethod";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
import "./Home.css";

const HOME_IMG = `${import.meta.env.BASE_URL}home/`;
const GOOGLE_REVIEW_URL = "https://maps.app.goo.gl/QrjZMVqjguiuBh1Z7";

const MENU_TILES = [
  { label: "Kebab", key: "kebab", img: null },
  { label: "Pizza", key: "pizza", img: "pizza-rucola", alt: "Pizza mit Rucola bei Wangen Pizza Kebab" },
  { label: "Pide", key: "pide", img: "pide-doener", alt: "Pide mit Döner bei Wangen Pizza Kebab" },
  { label: "Teller", key: "teller", img: null },
  { label: "Box", key: "box", img: null },
];

const FEATURES = [
  {
    title: "Frisch zubereitet",
    text: "Pizza, Kebab und Pide werden bei uns frisch für Sie zubereitet – das schmeckt man bei jedem Bissen.",
  },
  {
    title: "Hausgemacht",
    text: "Das Taschenbrot für Ihren Kebab backen wir frisch bei uns, und auch die Falafel machen wir selbst.",
  },
  {
    title: "Italienisches Mehl",
    text: "Für unsere Pizza verwenden wir 100 % hochwertiges italienisches Mehl – die Basis für einen feinen Pizzateig.",
  },
  {
    title: "Lieferung & Abholung",
    text: "Wir liefern nach Wangen, Lachen, Siebnen, Galgenen, Tuggen, Reichenburg, Buttikon, Schübelbach, Nuolen und Altendorf. Lieber selbst vorbeikommen? Dann holen Sie Ihre Bestellung an der Zürcherstrasse 3 in Wangen SZ ab.",
  },
  {
    title: "Wertgutscheine online",
    text: "Eine Freude zum Verschenken: Unsere Wertgutscheine bestellen Sie ganz einfach online.",
    link: { to: "/gutscheine", label: "Zu den Gutscheinen" },
  },
  {
    title: "4.5 ★ auf Google",
    text: "Unsere Gäste bewerten uns auf Google mit 4.5 von 5 Sternen (322 Bewertungen). Hat es Ihnen auch geschmeckt? Wir freuen uns über Ihre Bewertung.",
    link: { href: GOOGLE_REVIEW_URL, label: "Jetzt bewerten" },
  },
];

const Home = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="home">
      <DeliveryMethod />

      <section className="home-hero" aria-labelledby="home-title">
        <img
          className="home-hero__img"
          src={`${HOME_IMG}hero-salami.webp`}
          srcSet={`${HOME_IMG}hero-salami-640.webp 640w, ${HOME_IMG}hero-salami.webp 1280w`}
          sizes="100vw"
          width="1280"
          height="854"
          alt="Pizza mit Salami, Oliven und Chili auf einem Holzbrett"
          fetchpriority="high"
          decoding="async"
        />
        <div className="home-hero__shade" aria-hidden="true" />
        <div className="home-hero__content">
          <h1 id="home-title">Pizza, Kebab &amp; Pide in Wangen SZ</h1>
          <p>Frisch zubereitet – wir liefern zu Ihnen oder Sie holen bei uns ab</p>
          <div className="home-hero__cta">
            <Link className="home-btn home-btn--primary" to="/menue">
              Jetzt bestellen
            </Link>
            <Link className="home-btn" to="/gutscheine">
              Gutscheine
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-menu">
        <h2 id="home-menu">Unsere Speisekarte</h2>
        <ul className="home-tiles">
          {MENU_TILES.map((t) => (
            <li key={t.key}>
              <Link
                className={`home-tile${t.img ? "" : " home-tile--plain"}`}
                to={`/menue?kategorie=${t.key}`}
              >
                {t.img && (
                  <img
                    src={`${HOME_IMG}${t.img}-360.webp`}
                    srcSet={`${HOME_IMG}${t.img}-360.webp 360w, ${HOME_IMG}${t.img}-640.webp 640w`}
                    sizes="(min-width: 960px) 200px, 45vw"
                    width="360"
                    height="480"
                    alt={t.alt}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="home-tile__label">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-label="Das macht uns aus">
        <div className="home-features">
          {FEATURES.map((f) => (
            <article className="home-feature" key={f.title}>
              <h2>{f.title}</h2>
              <p>{f.text}</p>
              {f.link?.to && <Link to={f.link.to}>{f.link.label}</Link>}
              {f.link?.href && (
                <a href={f.link.href} target="_blank" rel="noopener noreferrer">
                  {f.link.label}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-kitchen" aria-labelledby="home-kitchen">
        <div className="home-kitchen__text">
          <h2 id="home-kitchen">Aus unserer Küche</h2>
          <p>
            Bei uns an der Zürcherstrasse 3 in Wangen SZ dreht sich alles ums gute Essen: Pizza,
            Kebab und Pide, frisch für Sie zubereitet. Das Taschenbrot backen wir selbst, die
            Falafel machen wir ebenfalls selbst, und für den Pizzateig verwenden wir 100 %
            hochwertiges italienisches Mehl.
          </p>
          <p>
            Ob eine Pizza mit Salami, Spinat oder Rucola, ein Kebab im frischen Taschenbrot oder
            eine Pide mit Döner: Bei uns finden Sie bestimmt Ihren Favoriten. Werfen Sie einen
            Blick in unsere <Link to="/menue">Speisekarte</Link> und bestellen Sie direkt online.
            Wir liefern zu Ihnen nach Hause, oder Sie holen Ihre Bestellung bei uns ab.
          </p>
          <p>
            Möchten Sie jemandem eine Freude machen? Dann schauen Sie bei unseren{" "}
            <Link to="/gutscheine">Gutscheinen</Link> vorbei. Für einen Besuch mit Familie oder
            Freunden können Sie über die <Link to="/reservation">Reservation</Link> bequem einen
            Tisch anfragen, und bei Fragen erreichen Sie uns über den{" "}
            <Link to="/kontakt">Kontakt</Link>.
          </p>
        </div>
        <div className="home-kitchen__pics">
          <img
            src={`${HOME_IMG}pizza-spinat-640.webp`}
            width="640"
            height="480"
            alt="Pizza mit Spinat frisch aus dem Ofen"
            loading="lazy"
            decoding="async"
          />
          <img
            src={`${HOME_IMG}pizza-pommes-640.webp`}
            width="640"
            height="853"
            alt="Pizza mit Pommes bei Wangen Pizza Kebab"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      <Delivery headingLevel="h2" />
      <Location />
    </div>
  );
};

export default Home;
