// import React from 'react'

import ReservationForm from "../../component/ReservationForm/ReservationForm";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
const Reservation = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animation triggers only once
    threshold: 0.1, // Trigger when 10% of the component is visible
  });
  return (
    <div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 200 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="animated-component"
      >
        <ReservationForm />
      </motion.div>
      <Delivery />
      <Location />
    </div>
  );
};

export default Reservation;
