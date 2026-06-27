/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import "./Location.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
const Location = () => {
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
      style={{ pointerEvents: inView ? "auto" : "none" }}
    >
      <div className="location">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d43380.76844871578!2d8.894814!3d47.191179!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479ac9f21b004d51%3A0xa0638e9a28a0dded!2sPizza%20Wangen!5e0!3m2!1sen!2sus!4v1715531116787!5m2!1sen!2sus"
          width="100%"
          height="400"
          style={{ border: "0" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </motion.div>
  );
};

export default React.memo(Location);
