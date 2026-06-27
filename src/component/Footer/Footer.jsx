/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Logo from "../../assets/85a30340-f824-4e4a-b2a5-c5d808affecc.png";
import "./Footer.css";
import Instgram from "../../assets/images/instgram.jpg";
import Twitter from "../../assets/images/Twitter.jpg";
import Facebook from "../../assets/images/Facebook.jpg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DEFAULT_COMPANY_HOURS } from "../../constants/companyHours";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const server = import.meta.env.VITE_SERVER || "https://pizzawangen.runasp.net";

  const [delivers, setDelivers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${server}/api/Company/GetCompanyData`);
        if (!response.ok) {
          console.error("Network response was not ok");
          return;
        }
        const data = await response.json();
        setDelivers(data);
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      }
      setIsLoading(false);
    };

    fetchCompanyData();
  }, [server]);

  /* animate statt whileInView: sonst bleibt der Footer unsichtbar (opacity:0), wenn die Seite
     lang ist und der Nutzer nicht bis ganz unten scrollt (z. B. Zahlung / Checkout). */
  return (
    <motion.div
      className="animated-component footer-motion-root"
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <footer className="section footer">
        <div className="footer-container">
          <div className="footer__wrapper">
            {/* Logo + Social */}
            <div className="footer__logo">
              <div className="logo">
                <img src={Logo} alt="Logo" />
              </div>
              <div className="social-icons">
                <a
                  href="https://www.facebook.com/profile.php?id=100079034319158/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={Facebook} alt="facebook" className="icon" />
                </a>
                <a
                  href="https://x.com/WangenKebabHaus/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={Twitter} alt="twitter" className="icon" />
                </a>
                <a
                  href="https://www.instagram.com/wange_kebab_haus_sz/?hl=en"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={Instgram} alt="instgram" className="icon" />
                </a>
              </div>
            </div>

            {/* About Section */}
            <div className="footer__box">
              <h3 className="footer__link-title">Über uns...<br /><br /></h3>
              <ul className="footer__menu">
                <li className="footer__menu-item">
                  <p className="footer__link">
                    Bei uns geniessen Sie exzellente Pizzen und Getränke in einem entspannten Ambiente.
                    Unsere Küche vereint gekonnt die raffinierte italienische Esskultur mit dem charmanten Schweizer Lebensstil.
                    <br /><br />
                    Ob Sie bei uns vor Ort speisen oder unsere köstlichen Pizzen mit nach Hause nehmen möchten,
                    bei <span className="highlight" style={{ color: "rgb(255, 179, 3)" }}>Wangen</span> Pizza
                    erleben Sie stets erstklassigen Genuss und herzliche Gastfreundschaft.
                  </p>
                </li>
              </ul>
            </div>

            {/* Arbeitszeiten */}
            <div className="footer__box-Arbeitszeiten">
              <h3 className="footer__link-title">Arbeitszeiten<br /><br /></h3>
              <ul className="footer__menu">
                <li className="footer__menu-item">
                  <p className="footer__link company-time">
                    <span>Mo. – Do.: </span> {delivers?.data?.openTime1 || DEFAULT_COMPANY_HOURS.openTime1}
                  </p>
                </li>
                <li className="footer__menu-item">
                  <p className="footer__link company-time">
                    <span>Fr. – Sa.: </span> {delivers?.data?.openTime2 || DEFAULT_COMPANY_HOURS.openTime2}
                  </p>
                </li>
                <li className="footer__menu-item">
                  <p className="footer__link company-time">
                    <span>So.: </span> {delivers?.data?.openTime3 || DEFAULT_COMPANY_HOURS.openTime3}
                  </p>
                </li>
              </ul>
            </div>

            {/* Lieferzeiten */}
            <div className="footer__box">
              <h3 className="footer__link-title">Lieferzeiten<br /><br /></h3>
              <ul className="footer__menu">
                <li className="footer__menu-item">
                  <p className="footer__link company-time">
                    <span>Mo. – Do.: </span> {delivers?.data?.delivery1 || DEFAULT_COMPANY_HOURS.delivery1}
                  </p>
                </li>
                <li className="footer__menu-item">
                  <p className="footer__link company-time">
                    <span>Fr. – Sa.: </span> {delivers?.data?.delivery2 || DEFAULT_COMPANY_HOURS.delivery2}
                  </p>
                </li>
                <li className="footer__menu-item">
                  <p className="footer__link company-time">
                    <span>So.: </span> {delivers?.data?.delivery3 || DEFAULT_COMPANY_HOURS.delivery3}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Extras */}
          <div className="footer-extras">
            <div>
              <Link to="/impressum"><p>Impressum</p></Link>
              <Link to="/Datenschutzbestimmungen"><p>Datenschutzbestimmungen</p></Link>
              <Link to="/agb"><p>AGB</p></Link>
            </div>
          </div>

          <div className="footer-trust-badge" aria-label="11 Jahre Erfahrung in Wangen">
            <strong>11 JAHRE ERFAHRUNG IN WANGEN</strong>
          </div>

          <p className="footer-directory-link">
            <a
              href="https://speisekarte.menu/restaurants/wangen/wangen-pizza-kebab-3"
              target="_blank"
              rel="noopener follow"
            >
              Wangen Pizza Kebab
            </a>
            {" "}auf Speisekarte
          </p>

          <hr />
          <div className="light-soft footer-copyright-block">
            <p className="footer-copyright-line">
              Copyright © 2015 – {currentYear} Wangen Pizza
            </p>
            <p className="footer-copyright-line">
              Seit 2024 Wangen Pizza, Kebab GmbH.
            </p>
            <p className="footer-copyright-line">
              Developed by
              {" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.lightsoft.ch"
                className="highlight"
                style={{ color: "rgb(255, 179, 3)" }}
              >
                Lightsoft
              </a>
              , All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default Footer;
