/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// import React from 'react'

import { useState, useEffect } from "react";
import Image from "../../assets/images/panerBoy.jpg";
import { useSelector } from "react-redux";

import emptyCart from "../../assets/images/emptyCart.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./ShoppingCart.css";
import CartMeals from "../cartMeal/CartMeals";
import useGetDelivery from "../../hooks/useGetDelivery";
import {
  persistVisitorIdFromApiResponse,
  setCheckoutUnlockedFlag,
} from "../../utils/checkoutVisitorStorage.js";
import { mapCartItemsForApi } from "../../utils/mapCartItemsForApi.js";
import { isDeliveryOrPreorder } from "../../utils/isDeliveryOrPreorder.js";
import { getApiBaseUrl } from "../../config/apiBase.js";

const POSTCODE_STORAGE_KEY = "wangen-delivery-postcode";
const POSTCODE_CITY_STORAGE_KEY = "wangen-delivery-city";

const extractPlz = (value) => {
  const m = String(value || "").match(/\d{4}/);
  return m ? m[0] : "";
};

const ShoppingCart = ({ setCheckoutAllowed }) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [minimumOrderAb, setMinimumOrderAb] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const cartItemsCount = Array.isArray(cart?.items)
    ? cart.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
    : 0;
  const { deliveryData, getDelivery } = useGetDelivery()
  const server = import.meta.env.VITE_SERVER;
  const {deliverMethod} = useSelector((state) => state.delivery);
  // sending order

  // run this api if the client will get the order by delivery
  const handleOrderClick = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await axios.post(
        `${server}/api/Cart/cart/add`,
        {
          items: mapCartItemsForApi(cart.items),
          replaceExistingItems: true,
        },
        { withCredentials: true }
      );
      if (response.status >= 200 && response.status < 300) {
        persistVisitorIdFromApiResponse(response.data);
        setCheckoutUnlockedFlag();
        setCheckoutAllowed(true);
        navigate("/cart/checkOut", {
          state: {
            response: response.data,
            city: selectedCity,
            checkoutUnlocked: true,
          },
        });
        toast.success("success");
      }
    } catch (err) {
      const d = err?.response?.data;
      const msg =
        (typeof d === "string" && d.trim()) ||
        d?.message ||
        d?.Message ||
        d?.title ||
        err?.message ||
        "Failed to send";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };
  // run this api if the client will go to take his order
  const handleOrderClickWithoutDelivery = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await axios.post(
        `${server}/api/Cart/pickup_cart/add`,
        {
          items: mapCartItemsForApi(cart.items),
          replaceExistingItems: true,
        },
        { withCredentials: true }
      );
      if (response.status >= 200 && response.status < 300) {
        persistVisitorIdFromApiResponse(response.data);
        setCheckoutUnlockedFlag();
        toast.success("success");
        setCheckoutAllowed(true);
        navigate("/cart/checkOut", {
          state: {
            response: response.data,
            city: selectedCity,
            checkoutUnlocked: true,
          },
        });
      }
    } catch (err) {
      const d = err?.response?.data;
      const msg =
        (typeof d === "string" && d.trim()) ||
        d?.message ||
        d?.Message ||
        d?.title ||
        err?.message ||
        "Failed to send";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  // run scroll to top
  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    // get the citys and postBox data
    getDelivery()
  }, []);

  useEffect(() => {
    if (!isDeliveryOrPreorder(deliverMethod)) {
      setSelectedCity("");
      setMinimumOrderAb("");
      return;
    }
    if (!deliveryData || deliveryData.length === 0) return;

    const plz = extractPlz(localStorage.getItem(POSTCODE_STORAGE_KEY) || "");
    if (!plz) {
      setSelectedCity("");
      setMinimumOrderAb("");
      return;
    }

    const matched = deliveryData.find(
      (d) => String(d.postBox ?? d.PostBox ?? "").trim() === plz
    );
    if (!matched) {
      setSelectedCity("");
      setMinimumOrderAb("");
      return;
    }

    setMinimumOrderAb(Number(matched.orderAb ?? matched.OrderAb ?? 0));
    const savedCity = (localStorage.getItem(POSTCODE_CITY_STORAGE_KEY) || "").trim();
    const pb = matched.postBox ?? matched.PostBox ?? plz;
    const ct = matched.city ?? matched.City ?? "";
    setSelectedCity(savedCity || `${pb} ${ct}`.trim());
  }, [deliverMethod, deliveryData]);

  return (
    <div className="cart-container">
      <div className="title">
        <h1 className="highlight">Pizza Wangen</h1>
        {cartItemsCount > 0 && isDeliveryOrPreorder(deliverMethod) && (
          <p className="delivery-city-readonly">
            {selectedCity
              ? `Liefer-PLZ: ${selectedCity}`
              : "Bitte Liefer-PLZ im Bestellfenster eingeben."}
          </p>
        )}
      </div>
      {/* if the cart is empty */}
      {cartItemsCount === 0 && (
        <img className="empty-cart" src={emptyCart} alt="emptyCart" />
      )}
      {/* show the selkected meals */}
      {/* <div className="twoOptionsofDelivery"> */}
      {cartItemsCount > 0 && (
        <>
          <CartMeals
            data={cart}
            withDelivery={isDeliveryOrPreorder(deliverMethod)}
            minimumOrderAb={minimumOrderAb}
            sending={sending}
            handleOrderClick={deliverMethod === "collect" ? handleOrderClickWithoutDelivery : handleOrderClick}
          />
        </>
      )}


      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
};

export default ShoppingCart;
