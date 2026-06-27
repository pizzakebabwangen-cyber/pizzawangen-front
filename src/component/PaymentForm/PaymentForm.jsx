/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// import React from 'react'
import "./PaymentForm.css";
import Spiner from "../spiner/Spiner";
import { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import TwentImage from "../../assets/images/TwentImage.png";
import axios from "axios";
import { useSelector } from "react-redux";
const PaymentForm = ({ orderID }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [orderId, setOrderId] = useState("");
  const checkUser = useSelector((state) => state.checkSlice.isCheck);

  useEffect(() => {
    setOrderId(orderID);
  }, []);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Die Zahlung wurde erfolgreich abgeschlossen... Danke");
          break;
        case "processing":
          setMessage("Ihre Zahlung wird verarbeitet. Bitte warten...!");
          break;
        case "requires_payment_method":
          setMessage("Ihre Zahlung war nicht erfolgreich, bitte versuchen Sie es erneut.");
          break;
        default:
          setMessage("Etwas ist schiefgelaufen. Bitte versuche es noch einmal.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `https://pizzawangen.ch/success/${orderId}`,
        // return_url: "http://localhost:5173/success",
        // return_url: `http://localhost:5173/success/${orderId}`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("Ein unerwarteter Fehler ist aufgetreten.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  return (
    <div className="payment-form">
      <div className="payment-method-selection">
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === "stripe"}
            onChange={() => setPaymentMethod("stripe")}
          />
          Pay with Stripe
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="twint"
            checked={paymentMethod === "twint"}
            onChange={() => setPaymentMethod("twint")}
          />
          Pay with TWINT
        </label>
      </div>

      {paymentMethod === "stripe" && (
        <form id="payment-form" onSubmit={handleSubmit}>
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
          />
          <button
            disabled={isLoading || !stripe || !elements || !checkUser}
            className={!checkUser?"disable":""}
            id="submit"
          >
            <span id="button-text">
              {isLoading ? (
                <div className="spinner" id="spinner">
                  <Spiner />
                </div>
              ) : (
                "Pay now"
              )}
            </span>
          </button>
          {/* Show any error or success messages */}
          {message && <div id="payment-message">{message}</div>}
        </form>
      )}

      {paymentMethod === "twint" && (
        <div className="twint-payment">
          <img src={TwentImage} alt="TWINT QR Code" />
          <p>Bitte scanne den QR-Code, um mit TWINT zu bezahlen.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
