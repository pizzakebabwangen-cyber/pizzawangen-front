/* eslint-disable react/no-unescaped-entities */
// import React from 'react'
import "./Paner2.css"
import PanerBoy from "../../assets/images/Image002.webp"
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
const Paner2 = () => {
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
        <section className="section panner ">
          {/* <h1 className="component-label highlight"> paner </h1> */}
          <div className="container">
            <div className="offer__wrapper">
              <div className="offer__img">
                <img
                  src={PanerBoy}
                  alt="Frau öffnet einen Pizzakarton"
                  width={613}
                  height={478}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="offer__content">
                <h2>
                  <span className="highlight">Bei Wangen's Pizza</span>{" "}
                  geniessen Sie exzellente Speisen und Getränke in einem
                  entspannten Ambiente.
                  <br />
                  Wir vereinen geschickt die raffinierte italienische Esskultur
                  mit dem{" "}
                  <span className="highlight">Schweizer Lebensstil.</span>
                </h2>
                {/* <button className="view__more-btn">Order Now</button> */}
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    );
}

export default Paner2