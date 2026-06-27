// import React from 'react'
import "./Sign.css"
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
const Sign = () => {
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
      <section className="sign">
        {/* <h1 className="component-label highlight">Sign</h1> */}
        <div className="text">
          <h1>
            Direkt bestellen lohnt sich!
            <br /> <br />
            Wert<span>gutscheine</span>
            <br /> online kaufen und Freude schenken.
          </h1>
        </div>
      </section>
    </motion.div>
  );
}

export default Sign