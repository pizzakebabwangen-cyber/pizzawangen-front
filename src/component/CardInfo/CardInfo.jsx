/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import React from 'react'
import "./CardInfo.css"


const formatLocalPhone = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/^\+41\s?/, "0").replace(/\s+/g, " ").trim();
};

const CardInfo = ({ address, email, phone }) => {
  const phoneDisplay = formatLocalPhone(phone);

  return (
    <div className="card-info">
      <div className="card-item">
        <span className="card-label">Adresse</span>
        <strong>{address}</strong>
      </div>
      <div className="card-item">
        <span className="card-label">Telefon</span>
        <a href={`tel:${phoneDisplay.replace(/\s/g, "")}`}>{phoneDisplay}</a>
      </div>
      <div className="card-item">
        <span className="card-label">E-Mail</span>
        <a href={`mailto:${email}`}>{email}</a>
      </div>

    </div>
  );
};

export default CardInfo