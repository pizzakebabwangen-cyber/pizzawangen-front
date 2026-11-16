import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SITE } from '../../config/site.js';
import './OrderTracking.css';

const API_BASE_URL = import.meta.env.VITE_SERVER || "https://pizzawangen.runasp.net";
const REFRESH_MS = 60000; // Status alle 60 Sekunden automatisch aktualisieren

// Statuswerte, die das Backend heute setzt: New, Preparing, OutForDelivery, Delivered.
// ReadyForPickup, PickedUp und Cancelled sind vorbereitet (Abholung / Storno); unbekannte Werte zeigen "Bestellung erhalten".
const DELIVERY_STEPS = [
  { key: 'New', label: 'Bestellung erhalten', icon: '📋' },
  { key: 'Preparing', label: 'In Zubereitung', icon: '👨‍🍳' },
  { key: 'OutForDelivery', label: 'Unterwegs', icon: '🛵' },
  { key: 'Delivered', label: 'Geliefert', icon: '✅' }
];

const PICKUP_STEPS = [
  { key: 'New', label: 'Bestellung erhalten', icon: '📋' },
  { key: 'Preparing', label: 'In Zubereitung', icon: '👨‍🍳' },
  { key: 'ReadyForPickup', label: 'Abholbereit', icon: '🛍️' },
  { key: 'PickedUp', label: 'Abgeholt', icon: '✅' }
];

const STATUS_ALIASES = {
  ready: 'ReadyForPickup',
  readyforpickup: 'ReadyForPickup',
  abholbereit: 'ReadyForPickup',
  pickedup: 'PickedUp',
  collected: 'PickedUp',
  abgeholt: 'PickedUp',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  storniert: 'Cancelled'
};

const normalizeStatus = (status) => {
  const raw = String(status || 'New').trim();
  return STATUS_ALIASES[raw.toLowerCase()] || raw;
};

const FINAL_STATUSES = ['Delivered', 'PickedUp', 'Cancelled'];

const STATUS_MESSAGES = {
  New: 'Ihre Bestellung wurde empfangen und wird bearbeitet.',
  Preparing: 'Ihre Pizza wird frisch für Sie zubereitet! 🍕',
  OutForDelivery: 'Ihre Bestellung ist unterwegs zu Ihnen! 🛵',
  Delivered: 'Ihre Bestellung wurde erfolgreich zugestellt! Guten Appetit! 🍽️',
  ReadyForPickup: 'Ihre Bestellung ist abholbereit. Wir freuen uns auf Sie!',
  PickedUp: 'Ihre Bestellung wurde abgeholt. Guten Appetit! 🍽️',
  Cancelled: `Diese Bestellung wurde storniert. Bei Fragen erreichen Sie uns unter ${SITE.phoneDisplay}.`
};

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id') || '';
  const tokenFromUrl = searchParams.get('t') || '';
  const [orderId, setOrderId] = useState(idFromUrl);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualSearch, setManualSearch] = useState(false);

  // Der Token aus dem Tracking-Link gilt nur fuer die Bestellnummer aus demselben Link.
  const tokenFor = (id) =>
    tokenFromUrl && String(id).trim() === idFromUrl.trim() ? tokenFromUrl : '';

  // Fetch order status. silent = automatische Aktualisierung: kein Ladezustand, alter Stand bleibt bei Fehlern.
  const fetchOrderStatus = async (id, { silent = false } = {}) => {
    if (!id) return;

    if (!silent) {
      setLoading(true);
      setError('');
      setOrderData(null);
    }

    try {
      const token = tokenFor(id);
      const url = `${API_BASE_URL}/api/Order/${encodeURIComponent(id)}/status${token ? `?t=${encodeURIComponent(token)}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (silent) return;
        if (response.status === 404) {
          setError('Bestellung nicht gefunden. Bitte überprüfen Sie Ihre Bestellnummer.');
        } else {
          setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
        return;
      }

      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      if (!silent) {
        setError('Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Auto-fetch if ID is in URL
  useEffect(() => {
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrderStatus(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const currentStatus = orderData ? normalizeStatus(orderData.status) : null;

  // Automatische Aktualisierung alle 60 Sekunden, solange der Status nicht endgueltig ist und der Tab sichtbar ist.
  useEffect(() => {
    if (!orderData?.orderId || FINAL_STATUSES.includes(currentStatus)) return undefined;
    const id = String(orderData.orderId);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrderStatus(id, { silent: true });
      }
    }, REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData?.orderId, currentStatus, idFromUrl, tokenFromUrl]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      fetchOrderStatus(orderId.trim());
      setManualSearch(true);
    }
  };

  const isCancelled = currentStatus === 'Cancelled';
  const isPickupFlow = currentStatus === 'ReadyForPickup' || currentStatus === 'PickedUp';
  const statusSteps = isPickupFlow ? PICKUP_STEPS : DELIVERY_STEPS;
  const foundIndex = statusSteps.findIndex((s) => s.key === currentStatus);
  const currentStatusIndex = orderData ? (foundIndex >= 0 ? foundIndex : 0) : -1;
  const isFinal = FINAL_STATUSES.includes(currentStatus);
  const statusMessage = STATUS_MESSAGES[currentStatus] || STATUS_MESSAGES.New;

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <h1 className="tracking-title">📦 Bestellung verfolgen</h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="tracking-form">
          <div className="form-group">
            <label htmlFor="orderId">Bestellnummer eingeben:</label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="z.B. 6482"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-tracking" disabled={loading}>
            {loading ? 'Laden...' : 'Suchen'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="tracking-error">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="tracking-loading">
            <div className="loading-spinner"></div>
            <p>Bestellung wird geladen...</p>
          </div>
        )}

        {/* Order Status Display */}
        {orderData && !loading && (
          <div className="tracking-result">
            <div className="order-header">
              <h2>Bestellung #{orderData.orderId}</h2>
              {orderData.name && <p className="customer-name">{orderData.name}</p>}
            </div>

            {/* Status Steps (bei Storno ausgeblendet) */}
            {!isCancelled && (
              <div className="status-timeline">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={step.key}
                      className={`status-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="step-icon">
                        {isCompleted ? step.icon : '⚪'}
                      </div>
                      <div className="step-label">{step.label}</div>
                      {index < statusSteps.length - 1 && (
                        <div className={`step-line ${index < currentStatusIndex ? 'filled' : ''}`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Status Message */}
            <div
              className={`current-status ${
                currentStatus === 'Delivered' || currentStatus === 'PickedUp' ? 'delivered' : ''
              } ${isCancelled ? 'cancelled' : ''}`}
            >
              {statusMessage}
            </div>

            {/* Delivery Address (nur mit gueltigem Token aus dem Tracking-Link) */}
            {(orderData.street || orderData.city) && (
              <div className="delivery-info">
                <strong>Lieferadresse:</strong><br />
                {orderData.street && <span>{orderData.street}</span>}
                {orderData.city && <span> {orderData.city}</span>}
              </div>
            )}

            {!isFinal && (
              <p className="tracking-refresh-note">
                Der Status wird automatisch alle 60 Sekunden aktualisiert.
              </p>
            )}
          </div>
        )}

        {/* No Result State */}
        {!orderData && !loading && !error && (manualSearch || idFromUrl) && (
          <div className="tracking-empty">
            <p>Keine Bestellung gefunden.</p>
          </div>
        )}

        {/* Instructions */}
        <div className="tracking-help">
          <h3>Wie funktioniert's?</h3>
          <ol>
            <li>Sie erhalten Ihre Bestellnummer per E-Mail nach der Bestellung</li>
            <li>Geben Sie die Bestellnummer oben ein</li>
            <li>Verfolgen Sie den Status Ihrer Bestellung (aktualisiert sich automatisch)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
