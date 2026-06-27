/* eslint-disable react/no-unescaped-entities */
// import React from 'react'
import "./Paner.css"
import PanerImg from "../../assets/images/Image003.png"
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
const Paner = () => {
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
      <section className="section panner" style={{ marginTop: "150px" }}>
        {/* <h1 className="component-label highlight">paner</h1> */}
        <div className="container">
          <div className="offer__wrapper">
            <div className="offer__img">
              <img src={PanerImg} alt="Im Wangen's Pizza" />
            </div>
            <div className="offer__content">
              <h2>
                <span className="highlight">
                  Gerichte zum Mitnehmen bestellen.
                </span>{" "}
                <br />
                Jetzt bequem online bestellen und abholen oder schnell liefern
                lassen.
                <br />
                <br /> Bei uns kannst du dein Lieblingsessen ganz einfach
                bestellen und bequem nach
              </h2>

              <Link to="menue">
                {" "}
                <button className="view__more-btn">Jetzt bestellen</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default Paner