import "./PaymentWay.css";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { successCheckOut } from "../../reduxTool/AuthContext";
 
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getApiBaseUrl } from "../../config/apiBase.js";
import { clearWangenCheckoutPaymentSession } from "../../utils/wangenPaymentSessionStorage.js";
import { clearCheckoutSessionStorage } from "../../utils/checkoutVisitorStorage.js";
import { clearCart } from "../../reduxTool/CartSlice";
import { extractOrderErrorMessage } from "../../utils/extractOrderErrorMessage.js";
import { extractPaymentPageUrl } from "../../utils/extractPaymentPageUrl.js";

const PaymentWay = ({ open, onClose, formData }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState("1");
    const [checkoutAgbAccepted, setCheckoutAgbAccepted] = useState(false);
    const [agbHighlightError, setAgbHighlightError] = useState(false);
    const agbHighlightTimerRef = useRef(null);
    const server = import.meta.env.VITE_SERVER;
    const [sending, setSending] = useState(false);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        setOpenDialog(open); // sync with parent prop
    }, [open]);

    useEffect(() => {
        setCheckoutAgbAccepted(false);
    }, [selectedMethod]);

    useEffect(() => {
        if (!checkoutAgbAccepted) return;
        setAgbHighlightError(false);
        if (agbHighlightTimerRef.current) {
            window.clearTimeout(agbHighlightTimerRef.current);
            agbHighlightTimerRef.current = null;
        }
    }, [checkoutAgbAccepted]);

    useEffect(() => {
        return () => {
            if (agbHighlightTimerRef.current) {
                window.clearTimeout(agbHighlightTimerRef.current);
            }
        };
    }, []);

    const pulseAgbValidationError = () => {
        setAgbHighlightError(false);
        window.requestAnimationFrame(() => {
            setAgbHighlightError(true);
            document.getElementById("payment-way-agb-unified")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        });
        if (agbHighlightTimerRef.current) {
            window.clearTimeout(agbHighlightTimerRef.current);
        }
        agbHighlightTimerRef.current = window.setTimeout(() => {
            setAgbHighlightError(false);
            agbHighlightTimerRef.current = null;
        }, 600);
    };

    const handleMethodChange = (value) => {
        setSelectedMethod(value);
    };

    const handleSelectdMethod = async () => {
        if (!selectedMethod) {
            toast.error("Bitte Zahlungsmethode wählen.");
            return;
        }
        if (!checkoutAgbAccepted) {
            pulseAgbValidationError();
            toast.error("Bitte AGB akzeptieren (Kästchen).");
            return;
        }
        const apiBase = getApiBaseUrl() || server;
        const rawTime = (formData.deliveryTime ?? formData.DeliveryTime ?? "").trim();
        let dTime = rawTime;
        const isClock = /^\d{1,2}:\d{2}$/.test(dTime);
        const isAsap = dTime.toLowerCase() === "so schnell wie möglich";
        if (!isClock && !isAsap) {
          dTime = "so schnell wie möglich";
        }
        const payload = {
            ...formData,
            paymentWay: parseInt(selectedMethod, 10), // ensure it's number
            deliveryTime: dTime,
            DeliveryTime: dTime,
        };
        try {
            setSending(true);
            const response = await axios.post(`${apiBase}/api/Cart/order`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            if (response.status < 200 || response.status >= 300) {
                toast.error("Etwas ist schief gelaufen...");
                navigate("/cart");
                return;
            }

            const apiResponse = response?.data;
            const data = apiResponse?.data ?? apiResponse?.Data;
            const orderId = data?.id ?? data?.Id;

            if (!orderId) {
                toast.error("Bestellnummer fehlt. Bitte erneut versuchen.");
                setSending(false);
                return;
            }

            const payWay = parseInt(selectedMethod, 10);
            // clientPaymentWay: falls API Order ohne paymentWay serialisiert → Payment-Seite sonst Online-Flow (PostFinance).
            const enriched = { ...apiResponse, clientPaymentWay: payWay };
            if (payWay === 1) {
                try {
                    await axios.get(`${apiBase}/api/Payment/success`, {
                        params: { orderId },
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                        timeout: 120_000,
                    });
                    clearWangenCheckoutPaymentSession();
                    dispatch(successCheckOut());
                    clearCheckoutSessionStorage();
                    dispatch(clearCart());
                    toast.success("Bestellung erfasst — vielen Dank!");
                    onClose?.();
                    setOpenDialog(false);
                    navigate(`/success/${orderId}`);
                } catch (err) {
                    console.error("Barzahlung Abschluss (Modal):", err);
                    toast.error(extractOrderErrorMessage(err));
                } finally {
                    setSending(false);
                }
                return;
            }

            const paymentUrl = extractPaymentPageUrl(apiResponse);
            if (paymentUrl) {
                try {
                    sessionStorage.setItem(
                        "wangen_paymentResponse",
                        JSON.stringify(enriched)
                    );
                } catch (_) {}
                onClose?.();
                setOpenDialog(false);
                window.location.replace(paymentUrl);
                return;
            }

            const finalTotalNumber =
                Number(data?.finalTotalNumber ?? data?.FinalTotalNumber ?? 0) || 0;
            const gutscheinDeduction =
                Number(data?.gutscheinDeduction ?? data?.GutscheinDeduction ?? 0) || 0;
            const zeroGutscheinOrder =
                finalTotalNumber <= 0.005 && gutscheinDeduction > 0.005;

            if (zeroGutscheinOrder) {
                try {
                    await axios.get(`${apiBase}/api/Payment/success`, {
                        params: { orderId },
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                        timeout: 120_000,
                    });
                    clearWangenCheckoutPaymentSession();
                    dispatch(successCheckOut());
                    clearCheckoutSessionStorage();
                    dispatch(clearCart());
                    toast.success("Bestellung erfasst — vielen Dank!");
                    onClose?.();
                    setOpenDialog(false);
                    navigate(`/success/${orderId}`);
                } catch (err) {
                    console.error("Gutschein Abschluss (Modal):", err);
                    toast.error(extractOrderErrorMessage(err));
                } finally {
                    setSending(false);
                }
                return;
            }

            toast.error(
                "Keine Zahlungs-URL erhalten. Bitte erneut versuchen oder uns anrufen."
            );
            onClose?.();
            setOpenDialog(false);
            navigate("/cart/checkOut", { replace: true });
        } catch (err) {
            console.error("Order error:", err);
            // Extract detailed error message
            let errorMessage = "Bestellung konnte nicht abgeschlossen werden.";
            
            if (err?.response?.data) {
                // Handle different error response formats
                const responseData = err.response.data;
                if (typeof responseData === "string") {
                    errorMessage = responseData;
                } else if (responseData?.message) {
                    errorMessage = responseData.message;
                } else if (responseData?.Message) {
                    errorMessage = responseData.Message;
                } else if (responseData?.Value) {
                    errorMessage = responseData.Value;
                }
            } else if (err?.message) {
                // Network error or other client-side error
                if (err.message.includes("Network Error") || err.message.includes("fetch")) {
                    errorMessage = "Server nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung.";
                } else {
                    errorMessage = err.message;
                }
            }
            
            toast.error(errorMessage);
            console.log("Detailed error:", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {openDialog && (
                <div className="paymentWay">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="container"
                    >
                        <h2 id="payment-way-heading">Wie möchten Sie bezahlen?</h2>
                        <div className="methods" role="radiogroup" aria-labelledby="payment-way-heading">
                            <div 
                                className={`method ${selectedMethod === "1" ? "selected" : ""}`} 
                                role="radio"
                                aria-checked={selectedMethod === "1"}
                                tabIndex={0}
                                onClick={() => handleMethodChange("1")}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleMethodChange("1");
                                    }
                                }}
                            >
                                <input
                                    className="payment-way-native-radio"
                                    type="radio"
                                    id="bar"
                                    name="deliveryMethod"
                                    value="1"
                                    checked={selectedMethod === "1"}
                                    readOnly
                                />
                                <label htmlFor="bar" className="payment-way-label-with-icon">
                                    <span className="payment-way-icon" aria-hidden>
                                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                        <path d="M4 6h16v12H4V6zm2 2v2h12V8H6zm0 4v4h4v-4H6z" />
                                      </svg>
                                    </span>
                                    <span className="payment-way-line-main">Barzahlung</span>
                                </label>
                            </div>

                            {/* Online */}
                            <div 
                                className={`method ${selectedMethod === "2" ? "selected" : ""}`} 
                                role="radio"
                                aria-checked={selectedMethod === "2"}
                                tabIndex={0}
                                onClick={() => handleMethodChange("2")}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleMethodChange("2");
                                    }
                                }}
                            >
                                <input
                                    className="payment-way-native-radio"
                                    type="radio"
                                    id="online"
                                    name="deliveryMethod"
                                    value="2"
                                    checked={selectedMethod === "2"}
                                    readOnly
                                />
                                <label htmlFor="online" className="payment-way-label-with-icon">
                                    <span className="payment-way-icon" aria-hidden>
                                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                        <path d="M4 4h16v16H4V4z" />
                                        <path d="M4 9h16v3H4z" fillOpacity="0.35" />
                                        <path d="M4 15h9v2H4z" fillOpacity="0.45" />
                                      </svg>
                                    </span>
                                    <span className="payment-way-line-main">Kreditkarte &amp; Twint &amp; PostFinance</span>
                                </label>
                            </div>

                            <label
                                id="payment-way-agb-unified"
                                className={`payment-way-agb${agbHighlightError ? " payment-way-agb--error" : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checkoutAgbAccepted}
                                    onChange={(e) => setCheckoutAgbAccepted(e.target.checked)}
                                    aria-invalid={agbHighlightError}
                                />
                                <span>
                                    Mit dem Abschicken der Bestellung akzeptieren Sie die{" "}
                                    <Link to="/agb" target="_blank" rel="noopener noreferrer">
                                        Allgemeinen Geschäftsbedingungen
                                    </Link>{" "}
                                    der Pizza Wangen.
                                </span>
                            </label>

                            <button
                                className="confirm-btn"
                                disabled={!selectedMethod || sending}
                                onClick={handleSelectdMethod}
                            >
                                {sending ? "Bitte warten..." : "Weiter zur Zahlung"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default PaymentWay;
