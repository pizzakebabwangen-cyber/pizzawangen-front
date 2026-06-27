/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import React from 'react'
import { useEffect, useState } from "react";
import "./Delivery.css";
import Spiner from "../spiner/Spiner";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
const Delivery = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.1, 
  });
  // const server = "https://admin.lightsoft.ch/";
    const server = import.meta.env.VITE_SERVER;
  const [delivers, setDilevers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${server}/api/Delivery/GetAllDelivery`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setDilevers(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 200 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="animated-component"
    >
      <div className="postbox-container">
        <h1 className="highlight">Liefergebiete</h1>
        <div className="postbox-item container">
          {isLoading ? (
            <Spiner />
          ) : (() => {
            const list = delivers?.data ?? delivers?.Data;
            if (!Array.isArray(list) || list.length === 0) return "";
            return list.map((deliver) => (
              <div key={deliver?.id ?? deliver?.Id} className="postbox-details">
                <h2>
                  {deliver?.postBox ?? deliver?.PostBox}{" "}
                  {deliver?.city ?? deliver?.City}
                </h2>
                <p>
                  ab CHF{" "}
                  {Number(deliver?.orderAb ?? deliver?.OrderAb ?? 0).toFixed(2)}
                </p>
              </div>
            ));
          })()}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(Delivery);
