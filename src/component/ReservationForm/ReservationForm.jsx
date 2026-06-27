/* eslint-disable no-unused-vars */
// import React from 'react'
import { useEffect, useState } from "react";
import "./ReservationForm.css";
import { format } from "date-fns";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { color, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { object, string } from "yup";
const ReservationForm = () => {
  const server = import.meta.env.VITE_SERVER;
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    scrollToTop();
  }, []);

  const { ref, inView } = useInView({
    triggerOnce: true, // Animation triggers only once
    threshold: 0.1, // Trigger when 10% of the component is visible
  });

  const userSchema = object({
    salute: string().required("Eingabe fehlt...."),
    name: string().required("Eingabe fehlt...."),
    email: string().email().required("Eingabe fehlt...."),
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
    const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rDate: "",
    rTime: "",
    numberOfPeople: "",
    notes: "",
    salute: "",
  });

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    handelChange(e);
  };
  const handelChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await userSchema.validate(formData, { abortEarly: false });
      const response = await axios.post(
        `${server}/api/Reservation/Reservation`,
        formData
      );
      toast.success("check your email");
      setSent(true);
      setTimeout(() => {
        setSent(false);
      }, 3000);
      setFormData({
        salute: "",
        name: "",
        email: "",
        phone: "",
        rDate: "",
        rTime: "",
        numberOfPeople: "",
        notes: "",
      });
            setErrors({});
    } catch (err) {
       console.log(err);
       const validationErrors = {};
       err.inner.forEach((error) => {
         validationErrors[error.path] = error.message;
       });
       setErrors(validationErrors);
       console.log("errors", errors);
      toast.error("email is false", err);
    } finally {
      setSending(false);
    }
  };

  const formatSelectedDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    if (day && month && year) {
      return `${day}.${month}.${year}`;
    }
  };
  // console.log("formData", formData);

  return (
    <div className="reservation">
      {/* <h1>
        {" "}
        <span className="highlight">Reserve</span> Your Table any time and for
        any occeasion
      </h1> */}
      <form id="contactForm" onSubmit={handleSubmit}>
        <div className="reservation-text">
          <h2 className="contact-us">Reservation</h2>
          <p>
            Buchen Sie online oder
            <br />
            rufen Sie uns unter{" "}
            <span className="highlight">+41 55 460 33 66 </span> zwischen{" "}
            <span className="highlight">9:30 - 22:00 Uhr </span>an
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="salute">Anrede:</label>
          <select
            id="salute"
            name="salute"
            onChange={handelChange}
            value={formData.salute}
          >
            <option value="" disabled>
              Anrede
            </option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
            <option value="Firma">Firma</option>
          </select>
          {errors.salute && <div style={{ color: "red" }}>{errors.salute}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handelChange}
          />
          {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}
        </div>
        {/* {selectedDate && (
          <p>Selected Date: {formatSelectedDate(selectedDate)}</p>
        )} */}
        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handelChange}
          />
          {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefon:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            onChange={handelChange}
            value={formData.phone}
          />
        </div>

        <div className="form-group">
          <label htmlFor="numberOfPeople">Anzahl-Personen:</label>
          <input
            type="text"
            id="numberOfPeople"
            name="numberOfPeople"
            onChange={handelChange}
            value={formData.numberOfPeople}
          />
        </div>
        <div className="time-inputs">
          <div className="form-group ">
            <label htmlFor="date">Datum:</label>
            <div className="dateContainer">
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                // name="rDate"
                disabled
                value={
                  formatSelectedDate(selectedDate)
                    ? formatSelectedDate(selectedDate)
                    : "DD.MM.YYYY"
                }
              />
              <input
                type="date"
                id="date"
                name="rDate"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="rTime">Zeit:</label>
            <input
              type="time"
              id="rTime"
              name="rTime"
              onChange={handelChange}
              value={formData.rTime}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="notes">Mitteilung: </label>
          <textarea
            onChange={handelChange}
            name="notes"
            value={formData.notes}
          />
        </div>
        <button type="submit" disabled={sending}>
          {sending ? "senden..." : "Bestätigen"}
        </button>
        {sent && (
          <div>
            <p style={{ color: "#1dff1d" }}>
              Nachricht erfolgreich gesendet ...
            </p>
          </div>
        )}
      </form>
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
};

export default ReservationForm;
