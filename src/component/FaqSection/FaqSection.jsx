import "./FaqSection.css";
import { DEFAULT_COMPANY_HOURS } from "../../constants/companyHours";

const FAQ_ITEMS = [
  {
    q: "Wo liefert Wangen Pizza Kebab?",
    a: "Wir liefern nach Wangen SZ, Lachen, Siebnen, Galgenen, Tuggen, Nuolen und Umgebung. Alle PLZ und Mindestbestellwerte stehen weiter unten unter «Liefergebiete».",
  },
  {
    q: "Was sind eure Öffnungszeiten?",
    a: `Mo–Do: ${DEFAULT_COMPANY_HOURS.openTime1}, Fr–Sa: ${DEFAULT_COMPANY_HOURS.openTime2}, So: ${DEFAULT_COMPANY_HOURS.openTime3}.`,
  },
  {
    q: "Lieferung oder Abholung?",
    a: "Beides ist möglich. Beim Bestellen auf pizzawangen.ch wählen Sie «Liefern» oder «Abholen».",
  },
  {
    q: "Wie bestelle ich online?",
    a: "Öffnen Sie unser Menü unter /menue, wählen Sie Ihre Gerichte, legen Sie sie in den Warenkorb und schliessen Sie die Bestellung ab.",
  },
  {
    q: "Gibt es Wertgutscheine?",
    a: "Ja. Gutscheine können Sie direkt auf unserer Website unter «Gutscheine» bestellen.",
  },
  {
    q: "Wie erreiche ich das Restaurant?",
    a: "Telefon: 055 460 33 66, E-Mail: info@pizzawangen.ch, Adresse: Zürcherstrasse 3, 8855 Wangen SZ.",
  },
];

const FaqSection = () => (
  <section className="faq-section" aria-labelledby="faq-heading">
    <div className="container">
      <h2 id="faq-heading" className="faq-heading">
        <span className="highlight">Häufige</span> Fragen
      </h2>
      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FaqSection;
