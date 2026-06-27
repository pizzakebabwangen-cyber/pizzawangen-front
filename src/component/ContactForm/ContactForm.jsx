/* eslint-disable no-unused-vars */
import { object, string } from "yup";
import { useEffect, useState } from "react";
import "./ContactForm.css";
import CardInfo from "../CardInfo/CardInfo";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Logo from "../../assets/85a30340-f824-4e4a-b2a5-c5d808affecc.png";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
const ContactForm = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animation triggers only once
    threshold: 0.1, // Trigger when 10% of the component is visible
  });

  const server = import.meta.env.VITE_SERVER;
  const [companyData, setCompanyData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const userSchema = object({
    name: string().required("Eingabe fehlt...."),
    email: string().email().required("Eingabe fehlt...."),
    phone: string(),
    message: string().required("Eingabe fehlt...."),
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${server}/api/Company/GetCompanyData`);
        if (!response.ok) {
          throw new Error("Fehler im Netzwerk...");
        }
        const data = await response.json();
        setCompanyData(data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // const nameInput = e.target.elements.name;
    // nameInput.setCustomValidity("");
    // nameInput.setCustomValidity("Dieses Feld ist erforderlich.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setSending(true);
    try {
      await userSchema.validate(formData, { abortEarly: false });
      const response = await axios.post(
        `${server}/api/Contact/Contact`,
        formData
      );
      toast.success("E-mail wurde gesendet...");
  
      // Clear form and errors
      setFormData({
        name: "",
        email: "",
        message: "",
        phone: "",
      });
      setErrors({});
  
      // Redirect to home page after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000); // Adjust delay as needed (2 seconds in this case)
    } catch (err) {
      console.log(err);
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      console.log("errors", errors);
      toast.error("E-mail fehlgeschlagen");
    } finally {
      setSending(false);
    }
  };
  

  return (
    <div className="contact">
      <h1 className="highlighth1">Kontakt</h1>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 200 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="animated-component"
      >
        <div className="container">
          <div className="contact-info">
            <div className="company-logo-name">
              <img src={Logo} alt="logo" />
              <div>
                <h1 className="highlight">Wangen Pizza, Kebab und Kurier</h1>
              </div>
            </div>
            <CardInfo
              address={`${companyData?.data?.street || ""}, ${companyData?.data?.postbox || ""} ${companyData?.data?.city || ""}`.trim()}
              email={companyData?.data?.email}
              phone={companyData?.data?.phone1}
              whatsapp={companyData?.data?.phone1}
            />
          </div>
          <form onSubmit={handleSubmit} className="contact-form">
            <h2 className="highlight " style={{ fontSize: "2rem" }}>
              Kontakt
            </h2>
            <br />
            <br />
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div style={{ color: "red" }}>{errors.email}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefon:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Nachricht:</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
              />
              {errors.message && (
                <div style={{ color: "red" }}>{errors.message}</div>
              )}
            </div>
            <button type="submit" disabled={sending}>
              {sending ? "warte..." : "Senden"}
            </button>
            {sent && (
              <div>
                <p style={{ color: "#1dff1d", fontSize: "1rem" }}>
                  Nachricht erfolgreich gesendet ...
                </p>
              </div>
            )}
          </form>
        </div>
      </motion.div>
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
};

export default ContactForm;
