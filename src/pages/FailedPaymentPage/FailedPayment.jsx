/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useNavigate, useParams } from "react-router-dom";
import "./FailedPayment.css";
// import axios from "axios";
// import { useEffect } from "react";

const FailedPayment = () => {
  const navigate = useNavigate();
  // const { orderId } = useParams();
  // const server = import.meta.env.VITE_SERVER;

  // useEffect(() => {
  //   const succeededFun = async () => {
  //     try {
  //       const response = await axios.post(
  //         `${server}/api/Cart/PaymentSucceeded?orderId=${orderId}`,
  //         { orderId }
  //       );
  //     } catch (error) {
  //       console.error("Error creating payment intent:", error);
  //     }
  //   };
  //   succeededFun();
  // }, [orderId]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="icon-container">
          <span className="failure-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              fill="#f66f00"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm4.95-10.95L14.95 12l2 2-1.414 1.414L12 13.414l-2.95 2.95-1.414-1.414L10.586 12l-2.95-2.95L9.05 7.636 12 10.586l2.95-2.95 1.414 1.414z" />
            </svg>
          </span>
        </div>
        <p>Zahlungstransaktion fehlgeschlagen</p>
        <p>Bitte versuchen Sie es erneut</p>
        <button onClick={() => navigate("/")}>Zur Startseite</button>
      </div>
    </div>
  );
};

export default FailedPayment;
