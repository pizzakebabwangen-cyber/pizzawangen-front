/* eslint-disable react/prop-types */
// import React from 'react'
import ShoppingCart from "../../component/ShoppingCart/ShoppingCart";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
import "./CartPage.css";
import { useSelector } from "react-redux";
import DeliveryMethod from "../../component/DeliveryMethod/DeliveryMethod";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const CartPage = ({ setCheckoutAllowed }) => {
  const deliveryMethod = useSelector((state) => state.delivery.deliverMethod);
  const location = useLocation();

  useEffect(() => {
    const h = (location.hash || "").replace(/^#/, "");
    if (h !== "gutschein-hinweis") return;
    const el = document.getElementById("gutschein-hinweis");
    if (!el) return;
    window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [location.hash, location.pathname]);

  return (
    <div>
      {(location.hash || "").replace(/^#/, "") === "gutschein-hinweis" && (
        <p id="gutschein-hinweis" className="cart-gutschein-hint">
          <strong>Gutschein:</strong> Warenkorb wie gewohnt füllen und auf{" "}
          <strong>Bestellen</strong> tippen. Den Code
          tragen Sie auf der Kasse unter <strong>Gutschein-Code</strong> ein.
        </p>
      )}
      <div className="cartsContainer">
        {!deliveryMethod && <DeliveryMethod />}
        <ShoppingCart setCheckoutAllowed={setCheckoutAllowed} />
      </div>
      <Delivery />
      <Location />
    </div>
  );
};

export default CartPage;
