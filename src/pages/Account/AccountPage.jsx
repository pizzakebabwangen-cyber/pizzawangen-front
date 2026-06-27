import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGetUserData from "../../hook/useGetUserData";
import "./AccountPage.css";

const AccountPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedName = localStorage.getItem("userName");
  const USER_ID = localStorage.getItem("USER_ID");
  const { userData, getUserData } = useGetUserData();
  const record = userData && typeof userData === "object" ? userData : {};

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (USER_ID) {
      getUserData();
    }
  }, [token, USER_ID, navigate]);

  const displayName =
    storedName ||
    record.userName ||
    record.fullName ||
    record.name ||
    record.email ||
    "—";

  return (
    <main className="account-page">
      <div className="account-card">
        <h1 className="account-title">Mein Konto</h1>
        <p className="account-line">
          <span className="account-label">Name</span>
          <span className="account-value">{displayName}</span>
        </p>
        {record.email && (
          <p className="account-line">
            <span className="account-label">E-Mail</span>
            <span className="account-value">{String(record.email)}</span>
          </p>
        )}
        {record.phoneNumber != null && String(record.phoneNumber).trim() !== "" && (
          <p className="account-line">
            <span className="account-label">Telefon</span>
            <span className="account-value">{String(record.phoneNumber)}</span>
          </p>
        )}
        <p className="account-hint">
          Passwort ändern?{" "}
          <Link to="/forgetPass" className="account-link">
            Passwort vergessen
          </Link>
        </p>
        <Link to="/" className="account-back">
          ← Zur Startseite
        </Link>
      </div>
    </main>
  );
};

export default AccountPage;
