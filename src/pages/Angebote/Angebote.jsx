import { useEffect, useState } from "react";
import MealCard from "../../component/MealCard/MealCard";
import "./Angebote.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
import { useSelector } from "react-redux";
import DeliveryMethod from "../../component/DeliveryMethod/DeliveryMethod";
import useGetExtensionsData from "../../hooks/useGetExtensions";
import useGetCompanyData from "../../hooks/useGetCompanyData";
import GutscheinShowcase from "../../component/GutscheinShowcase/GutscheinShowcase";

const Angebote = () => {

    const server = import.meta.env.VITE_SERVER;
    const [todayProductsData, setTodayProductsData] = useState({});
    const [offers, setOffers] = useState({});
    const hasOffers = Array.isArray(offers.data) && offers.data.length > 0;
    const hasTodayProducts =
      Array.isArray(todayProductsData.data) && todayProductsData.data.length > 0;
    const deliveryMethod = useSelector((state) => state.delivery.deliverMethod);
  const { extensionsData, getExtensionsData } = useGetExtensionsData();
  const { companyData, getCompanyData } = useGetCompanyData()
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  scrollToTop();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });



  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${server}/api/product/GetAllTodayBonus`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTodayProductsData(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${server}/api/product/GetAllOffers`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    getCompanyData()
    getExtensionsData()
  }, []);


  return (
    <section className="angebote">
      {!deliveryMethod && <DeliveryMethod />}
      <div className="container">
        <div id="wertgutscheine" className="angebote-gutscheine-block">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1>
              Wert<span className="highlight">gutscheine</span>
            </h1>
            <p className="angebote-gutscheine-intro">
              Wählen Sie einen Betrag — perfekt wie bei klassischen Restaurant-Gutscheinen. Details und
              grössere Karten auf der Gutschein-Seite.
            </p>
            <GutscheinShowcase variant="compact" />
          </motion.div>
        </div>
        {hasOffers && (
          <div className="today-bonus">
            <h1>
              Angebot<span className="highlight"> mit </span>Rabatt
            </h1>
            <div className="cards">
              {offers.data.map((offer) => (
                  <MealCard key={offer.id} meal={offer} />
                ))}
            </div>
          </div>
        )}
        {hasTodayProducts && (
          <div className="offers">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 200 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="animated-component"
            >
              <h1 style={{ marginTop: "200px" }}>
                Tages<span className="highlight">angebote</span>
              </h1>
              <div className="cards">
                {todayProductsData.data.map((product) => (
                    <MealCard key={product.id} meal={product} companyData={companyData} extensionsData={extensionsData} />
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Delivery />
      <Location />
    </section>
  );
};

export default Angebote;
