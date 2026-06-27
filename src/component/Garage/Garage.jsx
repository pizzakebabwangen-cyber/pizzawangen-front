// import React from 'react'
import "./Garage.css";
import Garage1 from "../../assets/images/garage1.png";
import Garage2 from "../../assets/images/garage2.png";
import Garage3 from "../../assets/images/garage3.png";
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
      initial={{ opacity: 0, y: 200 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="animated-component"
    >
      <div className="garage">
        <h1>
          Gratis <span> Parkplätze</span>
        </h1>
        <div className="places container">
          <img src={Garage1} alt="garage1" />
          <img src={Garage2} alt="garage2" />
          <img src={Garage3} alt="garage3" />
        </div>
      </div>
    </motion.div>
  );
};

export default Garage;
