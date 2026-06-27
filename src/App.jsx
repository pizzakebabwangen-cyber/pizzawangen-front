/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import "./App.css";
import { useEffect, useState } from "react";
import Footer from "./component/Footer/Footer";
import Nav from "./component/Nav/Nav";
import Location from "./component/Location/Location";
import Home from "./pages/Home/Home";
import Menue from "./pages/Menue/Menue";
import MenueDemo from "./pages/MenueDemo/MenueDemo";
import Reservation from "./pages/Reservation/Reservation";
import Kontakt from "./pages/Kontakt/Kontakt";
import Restaurant from "./pages/Restaurant/Restaurant";
import Angebote from "./pages/Angebote/Angebote";
import Gutscheine from "./pages/Gutscheine/Gutscheine";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login/loginpage";
import RegisterPage from "./pages/Register/Register";
import ForgetPassPage from "./pages/ForgetPass/ForgetPassPage";
import ResetPassPage from "./pages/ResetPass/ResetPassPage";
import AccountPage from "./pages/Account/AccountPage";
import CartPage from "./pages/CartPage/CartPage";
import CheckOut from "./pages/CheckOut/CheckOut";
import { ProtectedRoute } from "./component/ProtectedRoute/ProtectedRoute";
import Payment from "./pages/Payment/Payment";
import { useSelector } from "react-redux";
import SuccessPage from "./pages/SuccessPage/SuccessPage";
import Delivery from "./component/Delivery/Delivery";
import Impressum from "./component/Policy&Info/Impressum";
import Datenschutzbestimmungen from "./component/Policy&Info/Datenschutzbestimmungen";
import AGB from "./component/Policy&Info/AGB";
import FailedPayment from "./pages/FailedPaymentPage/FailedPayment";
import { useAvailability } from "./context/AvailabilityContext.jsx";
import { applyRuntimeLanguage, getInitialLanguage } from "./utils/languageRuntime";
import { useLocation } from "react-router-dom";
import ScrollToTop from "./component/ScrollToTop/ScrollToTop";
import { readCheckoutUnlockedFlag } from "./utils/checkoutVisitorStorage.js";

function App() {
  const [isCheckoutAllowed, setCheckoutAllowed] = useState(() =>
    readCheckoutUnlockedFlag()
  );
  const { isCheckedOut } = useSelector((state) => state.Auth);
  const { isPreorderAllowed, ready } = useAvailability();
  const location = useLocation();

  useEffect(() => {
    const lang = getInitialLanguage();
    applyRuntimeLanguage(lang);

    const onLangChange = (event) => {
      applyRuntimeLanguage(event.detail?.lang || "DE");
    };
    window.addEventListener("app-language-change", onLangChange);
    return () => {
      window.removeEventListener("app-language-change", onLangChange);
    };
  }, []);

  useEffect(() => {
    // Re-apply active language after route content changes.
    applyRuntimeLanguage(localStorage.getItem("wangen-lang") || "DE");
  }, [location.pathname]);

  useEffect(() => {
    if (!ready) {
      document.documentElement.classList.remove("browse-only");
      return;
    }
    // Nur bei Urlaubspause (API: IsPreorderAllowed false) komplett sperren — sonst Vorbestellung wie Dieci
    document.documentElement.classList.toggle("browse-only", !isPreorderAllowed);
  }, [ready, isPreorderAllowed]);

  return (
    <>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route path="/menue" element={<Menue />} />
        <Route path="/menue-demo" element={<MenueDemo />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/angebote" element={<Angebote />} />
        <Route path="/gutscheine" element={<Gutscheine />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="/success/:orderId?" element={<SuccessPage />} />
        <Route path="/failed-payment" element={<FailedPayment />} />

        <Route
          path="/cart"
          element={<CartPage setCheckoutAllowed={setCheckoutAllowed} />}
        />
        <Route
          path="/cart/checkOut"
          element={
            <ProtectedRoute
              element={CheckOut}
              isAllowed={isCheckoutAllowed}
              redirectPath={"/cart"}
            />
          }
        />
        <Route path="/cart/checkOut/payment" element={<Payment />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route
          path="/datenschutzbestimmungen"
          element={<Datenschutzbestimmungen />}
        />
        <Route path="/agb" element={<AGB />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgetPass" element={<ForgetPassPage />} />
        <Route path="/resetPassword" element={<ResetPassPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
