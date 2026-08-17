import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './OrderTracking.css';

const API_BASE_URL = "https://pizzawangen.runasp.net";

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualSearch, setManualSearch] = useState(false);

  // Status steps for visual display
  const statusSteps = [
    { key: 'New', label: 'Bestellung erhalten', icon: '📋' },
    { key: 'Preparing', label: 'In Zubereitung', icon: '👨‍🍳' },
    { key: 'OutForDelivery', label: 'Unterwegs', icon: '🛵' },
    { key: 'Delivered', label: 'Geliefert', icon: '✅' }
  ];

  // Get current status index
  const getStatusIndex = (status) => {
    const index = statusSteps.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  // Fetch order status
  const fetchOrderStatus = async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Order/${id}/status`);
      
      if (!response.ok) {
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
      setError('Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if ID is in URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrderStatus(idFromUrl);
    }
  }, [searchParams]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      fetchOrderStatus(orderId.trim());
      setManualSearch(true);
    }
  };

  const currentStatusIndex = orderData ? getStatusIndex(orderData.status) : -1;

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
              <p className="customer-name">{orderData.name}</p>
            </div>

            {/* Status Steps */}
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

            {/* Current Status Message */}
            <div className={`current-status ${orderData.status === 'Delivered' ? 'delivered' : ''}`}>
              {orderData.status === 'New' && 'Ihre Bestellung wurde empfangen und wird bearbeitet.'}
              {orderData.status === 'Preparing' && 'Ihre Pizza wird frisch für Sie zubereitet! 🍕'}
              {orderData.status === 'OutForDelivery' && 'Ihre Bestellung ist unterwegs zu Ihnen! 🛵'}
              {orderData.status === 'Delivered' && 'Ihre Bestellung wurde erfolgreich zugestellt! Guten Appetit! 🍽️'}
            </div>

            {/* Delivery Address */}
            {(orderData.street || orderData.city) && (
              <div className="delivery-info">
                <strong>Lieferadresse:</strong><br />
                {orderData.street && <span>{orderData.street}</span>}
                {orderData.city && <span> {orderData.city}</span>}
              </div>
            )}
          </div>
        )}

        {/* No Result State */}
        {!orderData && !loading && !error && (manualSearch || searchParams.get('id')) && (
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
            <li>Verfolgen Sie den Status Ihrer Bestellung in Echtzeit</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
