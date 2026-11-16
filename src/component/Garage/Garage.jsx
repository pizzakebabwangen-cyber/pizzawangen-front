// import React from 'react'
import "./Garage.css";
import Garage1 from "../../assets/images/garage1.webp";
import Garage2 from "../../assets/images/garage2.webp";
import Garage3 from "../../assets/images/garage3.webp";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
const Garage = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animation triggers only once
    threshold: 0.1, // Trigger when 10% of the component is visible
  });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3 }}
      className="animated-component"
    >
      <div className="garage">
        <h1>
          Gratis <span> Parkplätze</span>
        </h1>
        <div className="places container">
          <img src={Garage1} alt="Parkplatzschild: Reserviert für Kunden Kebab Haus Wangen" width={360} height={297} loading="lazy" decoding="async" />
          <img src={Garage2} alt="Kundenparkplätze neben der Strasse in Wangen" width={396} height={297} loading="lazy" decoding="async" />
          <img src={Garage3} alt="Reservierter Kundenparkplatz mit Parkplatzschild" width={396} height={297} loading="lazy" decoding="async" />
        </div>
      </div>
    </motion.div>
  );
};

export default Garage;
