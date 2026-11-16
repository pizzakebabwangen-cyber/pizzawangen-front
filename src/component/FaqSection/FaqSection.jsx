import "./FaqSection.css";
import { FAQ_ITEMS } from "../../config/faq.js";

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
