// import React from 'react'
import "./About.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import About_image from "../../assets/images/aboutimage (2).png";
const About = () => {
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
      <div className="about">
        <h1 className="component-label">
          <span className="highlight">
            Herzlich willkommen bei Wangen Pizza!
          </span>
        </h1>
        <div className="container">
          <div className="image">
            <img src={About_image} alt="" />
          </div>
          <div className="text">
            <h2>Ein einladender Ort für kulinarischen Genuss.</h2>
            <p>
              Für ein unvergleichliches Wohlfühlmahl empfehlen wir eine stets
              köstliche Kombination aus frischem Gemüse, Maisbrot und delikaten
              frittierten Spezialitäten
              <br />
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default About