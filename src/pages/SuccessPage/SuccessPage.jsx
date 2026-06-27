/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import { useNavigate, useParams } from "react-router-dom";
import "./SuccessPage.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { clearWangenCheckoutPaymentSession } from "../../utils/wangenPaymentSessionStorage.js";

const GOOGLE_MERCHANT_ID = 5465477483;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SuccessPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [reviewData, setReviewData] = useState(null);
  const isVoucherOrder = reviewData?.wertgutscheinKauf === true;
  const googleBootRef = useRef(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    clearWangenCheckoutPaymentSession();
  }, []);

  /** Finalisierung (Stripe) + order-review-data mit vielen Versuchen — Google brauchst du Email + orderId. */
  useEffect(() => {
    if (!orderId) return;
    const server = import.meta.env.VITE_SERVER;
    const id = Number(orderId);
    if (!Number.isFinite(id) || id <= 0) return;

    let cancelled = false;

    const isStripeReturn = () => {
      const sp = new URLSearchParams(window.location.search);
      return (
        sp.has("payment_intent") ||
        sp.has("payment_intent_client_secret") ||
        sp.get("redirect_status") === "succeeded"
      );
    };

    const finalizeStripeIfNeeded = async () => {
      if (!isStripeReturn()) return;
      try {
        await axios.get(`${server}/api/Payment/success`, {
          params: { orderId: id },
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
      } catch (_) {
        /* bereits verarbeitet oder Netzwerk */
      }
    };

    const fetchReviewOnce = async () => {
      const { data } = await axios.get(`${server}/api/Payment/order-review-data`, {
        params: { orderId: id },
      });
      if (!cancelled) setReviewData(data);
    };

    (async () => {
      await finalizeStripeIfNeeded();

      const maxAttempts = 14;
      for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
        try {
          await fetchReviewOnce();
          break;
        } catch {
          if (attempt < maxAttempts - 1) {
            await sleep(280 + attempt * 180);
            if (attempt === 2 || attempt === 5) await finalizeStripeIfNeeded();
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  /** Google Customer Reviews — platform.js ruft onload; gapi kann kurz verzögert sein. */
  useEffect(() => {
    if (!reviewData?.orderId || !reviewData?.email) return undefined;

    const opts = {
      merchant_id: GOOGLE_MERCHANT_ID,
      order_id: String(reviewData.orderId),
      email: reviewData.email,
      delivery_country: reviewData.deliveryCountry || "CH",
      estimated_delivery_date: reviewData.estimatedDeliveryDate,
    };

    const runSurvey = () => {
      try {
        window.gapi.load("surveyoptin", function () {
          window.gapi.surveyoptin.render(opts);
        });
      } catch (_) {
        /* ignore */
      }
    };

    let tries = 0;
    const pollGapi = () => {
      if (window.gapi && typeof window.gapi.load === "function") {
        runSurvey();
        return;
      }
      tries += 1;
      if (tries < 100) window.setTimeout(pollGapi, 100);
    };

    window.renderOptIn = function () {
      pollGapi();
    };

    if (!googleBootRef.current) {
      googleBootRef.current = true;
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn";
      script.async = true;
      script.defer = true;
      script.dataset.wangenGcr = "1";
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch (_) {}
        googleBootRef.current = false;
      };
    }

    pollGapi();
    return undefined;
  }, [reviewData]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="icon-container">
          <span className="success-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              fill="#f66f00"
              viewBox="0 0 24 24"
            >
              <path d="M10 15.172l-4.95-4.95-1.414 1.414L10 18 20.364 7.636l-1.414-1.414z" />
            </svg>
          </span>
        </div>
        <h1>Bezahlung erfolgreich</h1>
        {reviewData == null ? (
          <p>Vielen Dank!</p>
        ) : isVoucherOrder ? (
          <p>
            Vielen Dank für Ihren Wertgutschein-Kauf! Sie erhalten den Gutschein-Code in der Regel
            per E-Mail nach Bearbeitung. Bei Fragen erreichen Sie uns über{" "}
            <a href="/kontakt">Kontakt</a>.
          </p>
        ) : (
          <p>Vielen Dank für Ihre Bestellung!</p>
        )}
        <button onClick={() => navigate("/")}>Zur Startseite</button>
      </div>
    </div>
  );
};

export default SuccessPage;
