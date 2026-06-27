/* eslint-disable no-unused-vars */
// import React from 'react'

import PaymentForm from "../../component/PaymentForm/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Payment.css";
import Check from "../../component/Check/Check";
import Location from "../../component/Location/Location";
import { Toaster } from "react-hot-toast";
import {
  readPendingCashCheckout,
  clearPendingCashCheckout,
} from "../../utils/wangenPendingCashCheckout.js";
import { extractPaymentPageUrl } from "../../utils/extractPaymentPageUrl.js";

const scrollToTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const Payment = () => {
  useLayoutEffect(() => scrollToTop(), []);

  useEffect(() => {
    const t1 = setTimeout(scrollToTop, 100);
    const t2 = setTimeout(scrollToTop, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // const [clientSecret, setClientSecret] = useState("");
  const [prePrice, setPrePrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [gutscheinDeduction, setGutscheinDeduction] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [paymentUrl,setPaymentUrl]=useState("")
  const [paymentWay,setPaymentWay]=useState("")
  const [orderId,setOrderId]=useState("")
  /** Erst nach useEffect: sonst ist paymentWay/orderId leer und „Bestellen“ macht window.location.href = "" (Doppelklick). */
  const [paymentReady, setPaymentReady] = useState(false)
  // const server = import.meta.env.VITE_SERVER;
  // const publishKey = import.meta.env.VITE_PUPLISH_KEY;
  // const stripePromise = loadStripe(`${publishKey}`);
  const location = useLocation();
  const responseFromState = location.state?.response;
  const [voucherPurchase, setVoucherPurchase] = useState(false);
  const [pendingCashOrder, setPendingCashOrder] = useState(
    () => location.state?.pendingCashReview === true
  );
  const [pendingCashPayload, setPendingCashPayload] = useState(null);

  useEffect(() => {
    try {
      const fromNav = location.state?.pendingCashData;
      const pendingStorage = readPendingCashCheckout();

      const readStoredPaymentResponse = () => {
        try {
          const stored = sessionStorage.getItem("wangen_paymentResponse");
          if (!stored) return null;
          return JSON.parse(stored);
        } catch {
          return null;
        }
      };

      /** POST /api/Cart/order hat bereits eine Bestell-ID (Online-Zahlung / Gutschein-Kauf) */
      const hasPlacedOrderPayload = (r) => {
        if (!r || typeof r !== "object") return false;
        const data = r?.data ?? r?.Data;
        const id = data?.id ?? data?.Id;
        return id != null && String(id).trim().length > 0;
      };

      const applyOrderResponse = (response) => {
        clearPendingCashCheckout();
        setPendingCashPayload(null);
        setPendingCashOrder(false);
        const data = response?.data ?? response?.Data;
        const preN = Number(data?.totalNumber ?? data?.TotalNumber ?? 0) || 0;
        const discN = Number(data?.discountValue ?? data?.DiscountValue ?? 0) || 0;
        let gDed =
          Number(data?.gutscheinDeduction ?? data?.GutscheinDeduction ?? 0) || 0;
        let finalN =
          Number(data?.finalTotalNumber ?? data?.FinalTotalNumber ?? 0) || 0;
        if (
          Math.abs(finalN) < 0.005 &&
          preN > discN + 0.005 &&
          gDed < 0.005
        ) {
          gDed = Math.max(0, preN - discN);
        }
        setPrePrice(preN);
        setDiscount(discN);
        setGutscheinDeduction(gDed);
        setTotalPrice(finalN);
        setPaymentUrl(extractPaymentPageUrl(response));
        setPaymentWay(
          Number(
            response?.clientPaymentWay ??
              data?.paymentWay ??
              data?.PaymentWay ??
              0
          ) || 0
        );
        setOrderId(data?.id ?? data?.Id ?? "");
      };

      console.log("[Payment] useEffect start location.state", location.state);
      console.log("[Payment] useEffect start readPendingCashCheckout()", pendingStorage);

      // Online-Zahlung zuerst: sonst überschreibt altes Barzahlungs-Backup aus sessionStorage den PostFinance-Link.
      if (hasPlacedOrderPayload(responseFromState)) {
        let fromVoucher = location.state?.wertgutscheinKauf === true;
        if (!fromVoucher) {
          try {
            fromVoucher = sessionStorage.getItem("wangen_voucherCheckout") === "1";
          } catch (_) {}
        }
        setVoucherPurchase(fromVoucher);
        applyOrderResponse(responseFromState);
        console.log("[Payment] hydrate: order response from navigate state");
        return;
      }

      const storedOrderResponse = readStoredPaymentResponse();
      if (hasPlacedOrderPayload(storedOrderResponse)) {
        let fromVoucher = location.state?.wertgutscheinKauf === true;
        if (!fromVoucher) {
          try {
            fromVoucher = sessionStorage.getItem("wangen_voucherCheckout") === "1";
          } catch (_) {}
        }
        setVoucherPurchase(fromVoucher);
        applyOrderResponse(storedOrderResponse);
        console.log("[Payment] hydrate: order response from sessionStorage (reload)");
        return;
      }

      if (
        fromNav &&
        typeof fromNav === "object" &&
        fromNav.payload != null
      ) {
        setVoucherPurchase(false);
        const t = fromNav.totals || {};
        setPrePrice(Number(t.prePrice) || 0);
        setDiscount(Number(t.discount) || 0);
        setGutscheinDeduction(Number(t.gutscheinDeduction) || 0);
        setTotalPrice(Number(t.totalPrice) || Number(t.prePrice) || 0);
        setPaymentUrl("");
        setPaymentWay(1);
        setOrderId("");
        setPendingCashOrder(true);
        setPendingCashPayload(fromNav.payload);
        console.log("[Payment] hydrate: pending cash from navigate state");
        return;
      }

      if (pendingStorage?.totals) {
        setVoucherPurchase(false);
        const t = pendingStorage.totals;
        setPrePrice(Number(t.prePrice) || 0);
        setDiscount(Number(t.discount) || 0);
        setGutscheinDeduction(Number(t.gutscheinDeduction) || 0);
        setTotalPrice(Number(t.totalPrice) || Number(t.prePrice) || 0);
        setPaymentUrl("");
        setPaymentWay(1);
        setOrderId("");
        setPendingCashOrder(true);
        setPendingCashPayload(pendingStorage.payload ?? null);
        console.log("[Payment] hydrate: pending cash from sessionStorage");
        return;
      }

      setPendingCashPayload(null);

      let fromVoucher =
        location.state?.wertgutscheinKauf === true;
      if (!fromVoucher) {
        try {
          fromVoucher = sessionStorage.getItem("wangen_voucherCheckout") === "1";
        } catch (_) {}
      }
      setVoucherPurchase(fromVoucher);

      let response = responseFromState;
      if (!response) {
        response = storedOrderResponse;
      }
      setPendingCashOrder(false);
      if (response) {
        applyOrderResponse(response);
      }
      console.log("[Payment] hydrate: main path (card / empty shell)");
    } catch (e) {
      console.error("[Payment] hydrate error", e);
    } finally {
      // Immer aktivieren — auch wenn Router-state fehlt (Zurück/Reload), damit die Payment-UI nicht dauerhaft «Laden…» bleibt.
      // Fehlerhafte/fehlende Zahlungsdaten: Check.jsx / Toasts fangen den Kundenfluss ab.
      setPaymentReady(true);
    }
  }, [
    responseFromState,
    location.state?.wertgutscheinKauf,
    location.state?.pendingCashReview,
    location.state?.pendingCashData,
    location.key,
    location.pathname,
    location.search,
  ]);

  /** PSP-Link (Kreditkarte/TWINT/PostFinance): direkt weiter — nie Rechnungsdetails/Check. Bar: pendingCashOrder, kein PSP-Link. */
  useLayoutEffect(() => {
    if (!paymentReady) return;
    if (pendingCashOrder) return;
    const u = String(paymentUrl || "").trim();
    if (!u) return;
    window.location.replace(u);
  }, [paymentReady, pendingCashOrder, paymentUrl]);



  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{ pointerEvents: "none" }}
        toastOptions={{
          style: { pointerEvents: "auto" },
          duration: 5000,
        }}
      />
    <div className="payment-container">
      {/* {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm orderID={keyId} /> */}
      {!paymentReady ? (
        <p
          className="payment-boot-msg"
          style={{ color: "#fff", textAlign: "center", padding: "2rem" }}
        >
          Laden…
        </p>
      ) : pendingCashOrder || Number(paymentWay) === 1 ? (
        <Check
          prePrice={Number(prePrice) || 0}
          discount={Number(discount) || 0}
          gutscheinDeduction={Number(gutscheinDeduction) || 0}
          totalPrice={Number(totalPrice) || 0}
          paymentUrl={paymentUrl ?? ""}
          paymentWay={Number(paymentWay) || 0}
          orderId={orderId}
          paymentReady={paymentReady}
          voucherPurchase={voucherPurchase}
          pendingCashOrder={pendingCashOrder}
          pendingCashPayload={pendingCashPayload}
        />
      ) : String((paymentUrl || "").trim()) !== "" ? (
        <p
          className="payment-psp-redirect-msg"
          style={{ color: "#fff", textAlign: "center", padding: "2rem" }}
        >
          Weiterleitung zur sicheren Zahlungsseite…
        </p>
      ) : (
        <Check
          prePrice={Number(prePrice) || 0}
          discount={Number(discount) || 0}
          gutscheinDeduction={Number(gutscheinDeduction) || 0}
          totalPrice={Number(totalPrice) || 0}
          paymentUrl={paymentUrl ?? ""}
          paymentWay={Number(paymentWay) || 0}
          orderId={orderId}
          paymentReady={paymentReady}
          voucherPurchase={voucherPurchase}
          pendingCashOrder={pendingCashOrder}
          pendingCashPayload={pendingCashPayload}
        />
      )}
      {/* </Elements>
      )} */}
      <Location />
    </div>
    </>
  );
};

export default Payment;
