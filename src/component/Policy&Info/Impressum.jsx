// import React from 'react'
import { useEffect } from "react";
import "./Policy&Info.css"
const Impressum = () => {
   const scrollToTop = () => {
     window.scrollTo({
       top: 0,
       behavior: "smooth",
     });
   };
   useEffect(() => {
     scrollToTop();
   }, []);
  return (
    <div className="impressum container">
      <h1>Impressum</h1>
      <div className="section">
        <h2>Kontakt-Adresse:</h2>
        <p>
        Wangen Pizza Kebab GmbH
          <br />
          Zürcherstrasse 3<br />
          8855 Wangen
        </p>
        <p>
          E-Mail: <a href="mailto:info@pizzawangen.ch">info@pizzawangen.ch</a>
          <br />
          Webseite:{" "}
          <a href="https://www.pizzawangen.ch" target="_blank">
            www.pizzawangen.ch
          </a>
          <br />
          Telefon: +41 55 – 460 33 66
        </p>
        <p>
          Vertretungsberechtigte Person(en)
          <br />
          M. Adnan Safieddin, Geschäftsführer
        </p>
        <p>Handelsregister-Amt Schwyz: CHE-370.162.307</p>
      </div>
      <div className="section">
        <h2>Haftungsausschluss</h2>
        <p>
          Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen
          Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und
          Vollständigkeit der Informationen.
        </p>
        <p>
          Haftungsansprüche gegen den Autor wegen Schäden materieller oder
          immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw.
          Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der
          Verbindung oder durch technische Störungen entstanden sind, werden
          ausgeschlossen.
        </p>
        <p>
          Alle Angebote sind unverbindlich. Der Autor behält es sich
          ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne
          besondere Ankündigung zu verändern, zu ergänzen, zu löschen oder die
          Veröffentlichung zeitweise oder endgültig einzustellen.
        </p>
      </div>
      <div className="section">
        <h2>Haftungsausschluss für Links</h2>
        <p>
          Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
          Verantwortungsbereichs. Es wird jegliche Verantwortung für solche
          Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten
          erfolgen auf eigene Gefahr des jeweiligen Nutzers.
        </p>
      </div>
      <div className="section">
        <h2>Urheberrechte</h2>
        <p>
          Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder
          anderen Dateien auf dieser Website, gehören ausschliesslich Nidal
          Al-Bashawri oder den speziell genannten Rechtsinhabern. Für die
          Reproduktion jeglicher Elemente ist die schriftliche Zustimmung des
          Urheberrechtsträgers im Voraus einzuholen.
        </p>
      </div>
      <div className="section">
        <h2>Verwendung von Cookies</h2>
        <p>
          Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die
          beim Besuch dieser Website dauerhaft oder temporär auf Ihrem Computer
          gespeichert werden. Zweck der Cookies ist insbesondere die Analyse der
          Nutzung dieser Website zur statistischen Auswertung sowie für
          kontinuierliche Verbesserungen. In Ihrem Browser können Sie Cookies in
          den Einstellungen jederzeit ganz oder teilweise deaktivieren. Bei
          deaktivierten Cookies stehen Ihnen allenfalls nicht mehr alle
          Funktionen dieser Website zur Verfügung.
        </p>
        <p>
          Quelle:{" "}
          <a href="https://www.swissanwalt.ch" target="_blank">
            SwissAnwalt
          </a>
        </p>
      </div>
    </div>
  );
}

export default Impressum