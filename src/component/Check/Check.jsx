/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useEffect, useRef } from "react";
import "./Check.css";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clearCart } from "../../reduxTool/CartSlice";
import { successCheckOut } from "../../reduxTool/AuthContext";
import axios from "axios";
import { clearWangenCheckoutPaymentSession } from "../../utils/wangenPaymentSessionStorage.js";
import { clearCheckoutSessionStorage } from "../../utils/checkoutVisitorStorage.js";
import {
  readPendingCashCheckout,
  clearPendingCashCheckout,
} from "../../utils/wangenPendingCashCheckout.js";
import { getApiBaseUrl } from "../../config/apiBase.js";
import { extractOrderErrorMessage } from "../../utils/extractOrderErrorMessage.js";

const Check = ({
  prePrice,
  discount,
  gutscheinDeduction = 0,
  totalPrice,
  paymentUrl,
  paymentWay,
  orderId,
  paymentReady = true,
  voucherPurchase = false,
  pendingCashOrder = false,
  pendingCashPayload = null,
}) => {
  const [checkUser, setCheckUser] = useState(false);
  /** Checkbox muss controlled sein, sonst kann die Box „angehakt“ wirken während checkUser noch false ist — sonst braucht der CTA zwei Klicks. */
  const onAgbChange = (e) => {
    setCheckUser(e.target.checked);
  };
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const server = getApiBaseUrl();
  const [processing, setProcessing] = useState(false);
  const completedRef = useRef(false);

  const cancelPendingCashOrder = (id, keepalive = false) => {
    if (Number(paymentWay) !== 1) return;
    if (!id || completedRef.current) return;
    completedRef.current = true;
    fetch(`${server}/api/Payment/failed?orderId=${id}`, {
      method: "GET",
      keepalive,
    }).catch(() => {});
  };

  useEffect(() => {
    return () => {
      const id = Number(orderId);
      if (id) {
        cancelPendingCashOrder(id, true);
      }
    };
  }, [orderId, paymentWay]);

  useEffect(() => {
    const handleUnload = () => {
      const id = Number(orderId);
      if (id && Number(paymentWay) === 1 && !completedRef.current) {
        fetch(`${server}/api/Payment/failed?orderId=${id}`, {
          method: "GET",
          keepalive: true,
        }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [orderId, paymentWay, server]);

  return (
    <div className="checkContainer">
      <div className="check">
        <h1 className="highlight">Rechnungsdetails</h1>

        {Number(paymentWay) === 1 && (
          <div
            className="check-voucher-hint"
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              background: "#eef7ff",
              border: "1px solid #2196f3",
              borderRadius: "8px",
              fontSize: "15px",
              lineHeight: 1.45,
            }}
          >
            <strong>Barzahlung:</strong> Bitte die AGB unten anhaken und auf <strong>Bestellen</strong> tippen.
            Erst dann wird die Bestellung ausgelöst und ans Restaurant übermittelt (kein Online-Zahlungslink).
          </div>
        )}

        {voucherPurchase && Number(paymentWay) !== 1 && (
          <div
            className="check-voucher-hint"
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              background: "#fff8f0",
              border: "1px solid #f66f00",
              borderRadius: "8px",
              fontSize: "15px",
              lineHeight: 1.45,
            }}
          >
            <strong>Wertgutschein — letzter Schritt vor der Zahlung:</strong> Bitte AGB unten
            anhaken und auf <strong>Bestellen</strong> tippen. Dann öffnet sich die sichere Seite von
            PostFinance (Karte / TWINT / PostFinance).
          </div>
        )}

        <div className="price-container">
          <h2>Total: </h2>
          <p>CHF {prePrice.toFixed(2)} </p>
        </div>

        {(discount > 0 || Number(gutscheinDeduction) <= 0) && (
          <div className="price-container">
            <h2>Coupon-Rabatt: </h2>
            <p>CHF {Number(discount).toFixed(2)} </p>
          </div>
        )}

        {Number(gutscheinDeduction) > 0 && (
          <div className="price-container">
            <h2>Wertgutschein: </h2>
            <p>CHF {Number(gutscheinDeduction).toFixed(2)} </p>
          </div>
        )}

        <div className="price-container ">
          <h2>Gesamtsumme: </h2>
          <p>CHF {totalPrice.toFixed(2)} </p>
        </div>

        <label className="check-agb-label">
          <input
            type="checkbox"
            checked={checkUser}
            onChange={onAgbChange}
          />
          <span>
            Mit dem Abschicken der Bestellung akzeptieren Sie die{" "}
            <Link to="/agb" className="check-agb-link" target="_blank" rel="noopener noreferrer">
              Allgemeinen Geschäftsbedingungen
            </Link>{" "}
            der Pizza Wangen.
          </span>
        </label>

        {error && (
          <p
            className="error"
            style={{
              color: "red",
              fontWeight: "bold",
              fontSize: "20px",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {error}
          </p>
        )}

        <hr />

        <div className="check-actions">
        <button
          type="button"
          disabled={processing || !paymentReady}
          onClick={async () => {
            if (!paymentReady) {
              toast.error("Zahlungsdaten werden geladen – bitte kurz warten.");
              return;
            }
            if (checkUser) {
              const url = (paymentUrl || "").trim();
              const zeroBalance = Number(totalPrice) <= 0;
              // Barzahlung ODER Gutschein deckt alles: kein PostFinance (Betrag 0) — gleicher Abschluss per /api/Payment/success
              // Ohne orderId darf (zeroBalance && !url) NICHT allein triggern: leerer State (kein Router-State / kein sessionStorage)
              // hat totalPrice 0 und keine URL — sonst sofort «Bestellnummer fehlt» obwohl der Kunde denkt der CTA geht nicht.
              const useAjaxFinalize =
                Number(paymentWay) === 1 ||
                (zeroBalance && !url && Number(orderId) > 0);

              if (useAjaxFinalize) {
                try {
                  setProcessing(true);
                  let resolvedOrderId =
                    Number(orderId) ||
                    Number(new URLSearchParams(window.location.search).get("orderId"));

                  if (Number(paymentWay) === 1 && !resolvedOrderId) {
                    const cashPayload =
                      pendingCashPayload ??
                      readPendingCashCheckout()?.payload;
                    if (!cashPayload) {
                      toast.error("Bestelldaten fehlen. Bitte erneut zur Kasse gehen.");
                      setProcessing(false);
                      navigate("/cart/checkOut");
                      return;
                    }
                    const postRes = await axios.post(
                      `${server}/api/Cart/order`,
                      cashPayload,
                      {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                        timeout: 120_000,
                      }
                    );
                    if (postRes.status < 200 || postRes.status >= 300) {
                      toast.error("Bestellung konnte nicht ausgelöst werden.");
                      setProcessing(false);
                      return;
                    }
                    const body = postRes.data;
                    const data = body?.data ?? body?.Data;
                    resolvedOrderId = Number(data?.id ?? data?.Id);
                    if (!resolvedOrderId) {
                      toast.error("Bestellnummer fehlt. Bitte erneut versuchen.");
                      setProcessing(false);
                      return;
                    }
                    clearPendingCashCheckout();
                  }

                  if (!resolvedOrderId) {
                    toast.error("Bestellnummer fehlt. Bitte erneut versuchen.");
                    setProcessing(false);
                    navigate("/cart");
                    return;
                  }

                  await axios.get(`${server}/api/Payment/success`, {
                    params: { orderId: resolvedOrderId },
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                    timeout: 120_000,
                  });

                  clearWangenCheckoutPaymentSession();
                  dispatch(successCheckOut());
                  clearCheckoutSessionStorage();
                  completedRef.current = true;
                  dispatch(clearCart());
                  navigate(`/success/${resolvedOrderId}`);
                } catch (err) {
                  console.error("Cash finalize error:", err);
                  const isTimeout = err?.code === "ECONNABORTED" || /timeout/i.test(String(err?.message));
                  toast.error(
                    isTimeout
                      ? "Zeitüberschreitung — bitte erneut versuchen oder uns anrufen."
                      : extractOrderErrorMessage(err)
                  );
                } finally {
                  setProcessing(false);
                }
              } else if (url) {
                completedRef.current = true;
                window.location.href = url;
                setError("");
              } else {
                toast.error("Zahlungslink fehlt. Seite neu laden oder erneut zur Kasse gehen.");
              }
            } else {
              setError(
                "Bitte akzeptieren Sie die Allgemeinen Geschäftsbedingungen (Kästchen ankreuzen)."
              );
            }
          }}
          className="btn-pay"
        >
          {!paymentReady
            ? "Laden..."
            : processing
              ? "Bitte warten..."
              : "Bestellen"}
        </button>
        {Number(paymentWay) === 1 && (pendingCashOrder || Number(orderId) > 0) && (
          <button
            type="button"
            onClick={() => {
              const id = Number(orderId);
              if (id) {
                cancelPendingCashOrder(id);
                dispatch(clearCart());
                navigate("/cart");
                return;
              }
              clearPendingCashCheckout();
              navigate("/cart/checkOut");
            }}
            className="btn-pay"
            style={{ marginTop: "10px", background: "#6b7280" }}
          >
            Bestellung abbrechen
          </button>
        )}
        </div>
      </div>
    </div>
  );
};

export default Check;
