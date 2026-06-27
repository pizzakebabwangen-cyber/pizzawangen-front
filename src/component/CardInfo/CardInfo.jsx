/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import React from 'react'
import "./CardInfo.css"
import { FaWhatsapp } from "react-icons/fa";

const formatLocalPhone = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/^\+41\s?/, "0").replace(/\s+/g, " ").trim();
};

const normalizeWhatsapp = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `41${digits.slice(1)}`;
  return digits;
};

const CardInfo = ({ address, email, whatsapp, phone }) => {
  const phoneDisplay = formatLocalPhone(phone);
  const whatsappNumber = normalizeWhatsapp(whatsapp || phone);

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
      <div className="card-item whatsApp">
        <FaWhatsapp
          className="icon-whats"
          onClick={() => window.location.href = `https://wa.me/${whatsappNumber}`}
        />
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chatten Sie mit uns
        </a>
      </div>
    </div>
  );
};

export default CardInfo