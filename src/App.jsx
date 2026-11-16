/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import "./App.css";
import { Suspense, useEffect, useState } from "react";
import Footer from "./component/Footer/Footer";
import Nav from "./component/Nav/Nav";
import Location from "./component/Location/Location";
import Home from "./pages/Home/Home";
import { Routes, Route } from "react-router-dom";
import { lazyWithReload } from "./utils/lazyWithReload.js";
import { LANDING_PAGES } from "./config/landing.js";
import CartPage from "./pages/CartPage/CartPage";
import CheckOut from "./pages/CheckOut/CheckOut";
import { ProtectedRoute } from "./component/ProtectedRoute/ProtectedRoute";
import Payment from "./pages/Payment/Payment";
import { useSelector } from "react-redux";
import SuccessPage from "./pages/SuccessPage/SuccessPage";
import Delivery from "./component/Delivery/Delivery";
import FailedPayment from "./pages/FailedPaymentPage/FailedPayment";
import { useAvailability } from "./context/AvailabilityContext.jsx";
import { applyRuntimeLanguage, getInitialLanguage } from "./utils/languageRuntime";
import { useLocation } from "react-router-dom";
import ScrollToTop from "./component/ScrollToTop/ScrollToTop";
import Seo from "./component/Seo/Seo.jsx";
import { readCheckoutUnlockedFlag } from "./utils/checkoutVisitorStorage.js";

// Startseite, Warenkorb, Kasse, Zahlung, Erfolg/Fehler bleiben im Haupt-Bundle (Bestellablauf ohne Nachladen).
// Alle uebrigen Seiten werden erst beim Aufruf geladen.
const Menue = lazyWithReload(() => import("./pages/Menue/Menue"));
const MenueDemo = lazyWithReload(() => import("./pages/MenueDemo/MenueDemo"));
const Reservation = lazyWithReload(() => import("./pages/Reservation/Reservation"));
const Kontakt = lazyWithReload(() => import("./pages/Kontakt/Kontakt"));
const Restaurant = lazyWithReload(() => import("./pages/Restaurant/Restaurant"));
const Angebote = lazyWithReload(() => import("./pages/Angebote/Angebote"));
const Gutscheine = lazyWithReload(() => import("./pages/Gutscheine/Gutscheine"));
const LoginPage = lazyWithReload(() => import("./pages/Login/loginpage"));
const RegisterPage = lazyWithReload(() => import("./pages/Register/Register"));
const ForgetPassPage = lazyWithReload(() => import("./pages/ForgetPass/ForgetPassPage"));
const ResetPassPage = lazyWithReload(() => import("./pages/ResetPass/ResetPassPage"));
const AccountPage = lazyWithReload(() => import("./pages/Account/AccountPage"));
const OrderTracking = lazyWithReload(() => import("./pages/OrderTracking/OrderTracking"));
const Impressum = lazyWithReload(() => import("./component/Policy&Info/Impressum"));
const Datenschutzbestimmungen = lazyWithReload(() => import("./component/Policy&Info/Datenschutzbestimmungen"));
const AGB = lazyWithReload(() => import("./component/Policy&Info/AGB"));
const NotFound = lazyWithReload(() => import("./pages/NotFound/NotFound.jsx"));
const LandingPage = lazyWithReload(() => import("./pages/Landing/LandingPage.jsx"));

const RouteFallback = () => <div style={{ minHeight: "70vh" }} aria-hidden="true" />;

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
      <Seo />
      <Nav />
      <Suspense fallback={<RouteFallback />}>
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
        {LANDING_PAGES.map((p) => (
          <Route key={p.path} path={p.path} element={<LandingPage page={p} />} />
        ))}
        <Route path="/success/:orderId?" element={<SuccessPage />} />
        <Route path="/failed-payment" element={<FailedPayment />} />
        <Route path="/order-tracking" element={<OrderTracking />} />

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
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
