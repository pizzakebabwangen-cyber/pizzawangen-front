
/* eslint-disable no-unused-vars */
// import React from 'react'
import "./Nav.css";
import Logo from "../../assets/85a30340-f824-4e4a-b2a5-c5d808affecc.png";
import { FaCartShopping } from "react-icons/fa6";
import { CiMenuBurger } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addMeal, deleteMeal, removeMeal } from "../../reduxTool/CartSlice";
import { FaUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

import useGetUserData from "../../hook/useGetUserData";
import { getFirstName } from "../../utils/getFirstName";
import { applyRuntimeLanguage, normalizeLanguage } from "../../utils/languageRuntime";

const Nav = () => {
  const [isMenue, setIsMenue] = useState(false);
  const [isCart, setIsCart] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(normalizeLanguage(localStorage.getItem("wangen-lang") || "DE"));
  const server = import.meta.env.VITE_SERVER;
  const menueRef = useRef(null);
  const cartRef = useRef(null);
  const langRef = useRef(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const cartItemsCount = Array.isArray(cart?.items)
    ? cart.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
    : 0;
  const navigate = useNavigate();
  const location = useLocation();

  /** Route-Wechsel: Mobile-Menü schließen — sonst kann UI-State «hängen» und Klicks stören. */
  useEffect(() => {
    setIsMenue(false);
    setIsLangMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleClickOutside = (event) => {
    if (menueRef.current && !menueRef.current.contains(event.target)) {
      setIsMenue(false);
    }
    if (langRef.current && !langRef.current.contains(event.target)) {
      setIsLangMenuOpen(false);
    }
  };



const handleLogout = () => {
  localStorage.removeItem("userName");
  localStorage.removeItem("token");

  dispatch({ type: "LOGOUT" });

  navigate("/login");
};
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const toggleCart = () => {
    setIsCart((prev) => !prev);
  };
  const handleClickOutsideCart = (event) => {
    if (isCart && cartRef.current && !cartRef.current.contains(event.target)) {
      setIsCart(false);
    }
  };
  useEffect(() => {
    if (isCart) {
      document.addEventListener("click", handleClickOutsideCart, true);
      return () => {
        document.removeEventListener("click", handleClickOutsideCart, true);
      };
    }
  }, [isCart]);
  // console.log("cart",cart.cart)
  
  const handleUserNavigate = () => {
    const t = localStorage.getItem("token");
    if (!t) {
      navigate("/login");
      return;
    }
    navigate("/account");
  };

  const handleCartNavigate = () => {
    setIsMenue(false);
    navigate("/cart");
  };
  

  const token=localStorage.getItem("token")
  const USER_ID = localStorage.getItem("USER_ID")
  const userName = localStorage.getItem("userName")
  const { getUserData } = useGetUserData();
  useEffect(()=>{
      if (USER_ID){
        getUserData(USER_ID);
      }
  }, [token, USER_ID])

  useEffect(() => {
    const syncLangState = (event) => {
      const fromEvent = event?.detail?.lang;
      const stored = normalizeLanguage(
        fromEvent || localStorage.getItem("wangen-lang") || "DE"
      );
      setCurrentLang(stored);
    };
    window.addEventListener("app-language-change", syncLangState);
    window.addEventListener("storage", syncLangState);
    return () => {
      window.removeEventListener("app-language-change", syncLangState);
      window.removeEventListener("storage", syncLangState);
    };
  }, []);

  const handleLanguageChange = (lang) => {
    const next = normalizeLanguage(lang);
    setCurrentLang(next);
    applyRuntimeLanguage(next);
    setIsLangMenuOpen(false);
    window.dispatchEvent(new CustomEvent("app-language-change", { detail: { lang: next } }));
  };

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/">
          <div className="logo">
            <img src={Logo} alt="logo" />
            <h1>
              <span className="highlight">Wangen </span>
              Pizza
            </h1>
          </div>
        </Link>

        <div className="navigation">
          <ul className="nav-links">
            <li className="nav-item">
              <NavLink to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/menue">Menü</NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/angebote">Gutscheine</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/reservation">Reservation</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/restaurant">Restaurant</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/kontakt">Kontakt</NavLink>
            </li>
          </ul>
        </div>

        <div className="nav-buttons">
         <div className="lang-switcher" ref={langRef}>
            <button
              type="button"
              className="lang-current"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
            >
              {currentLang}
            </button>
            {isLangMenuOpen && (
              <div className="lang-menu">
                {["DE", "EN", "FR", "IT"].map((lang) => (
                  <button
                    type="button"
                    key={lang}
                    className={currentLang === lang ? "active" : ""}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* <button className="login-btn">
            <Link to="Login">Login</Link>
          </button> */}
          <button
            type="button"
            className="profile profile-account"
            onClick={handleUserNavigate}
            aria-label="Mein Konto"
          >
            <FaUser className="user" aria-hidden />
            <span className="profile-mobile-label">Konto</span>
            <p className="profile-name">
              {userName
                ? userName.length > 6
                  ? `${userName.substring(0, 6)}...`
                  : userName
                : ""}
            </p>
          </button>
          {userName && (
            <div className="profile profile-logout-wrap">
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                title="Abmelden"
                aria-label="Abmelden"
              >
                <MdLogout className="logout-icon" aria-hidden />
              </button>
            </div>
          )}
          <div className="nav-cart-slot">
            <div className="cart-wrap">
              <button
                type="button"
                className="cart-btn"
                aria-label="Warenkorb"
                onClick={handleCartNavigate}
              >
                <FaCartShopping className="cart" />
              </button>
              <span className="nomOfMeals" data-no-runtime-translate="true">
                {cartItemsCount}
              </span>
            </div>
          </div>

          {/* this will appear in the small screen devices */}
          <div className="menu-btn">
            <CiMenuBurger
              className="menu"
              onClick={() => setIsMenue(!isMenue)}
            />
          </div>
        </div>
      </nav>

      {/* shoping cart */}
      {/* {isCart && (
        <div ref={cartRef} className="shoping-cart ">
          {
            cart.cart&&
            cart.cart.map((item)=>{
              return (
                <div className="cart-item" key={item.id}>
                  <img
                    src={${server}/Images/${item.photoName}}
                    alt="Product Image"
                    className="product-image"
                  />
                  <div className="item-details">
                    <p className="product-name">{item.name}</p>
                    <span>Qty : </span>
                    <span className="quantity">{item.quantity}</span>
                    <br />
                    <span>
                      price :{" "}
                      <span className="price">{item.price.toFixed(2)}</span> CHF
                    </span>
                  </div>
                  <div className="control-btns">
                    <FaPlus
                      className="plus pointer"
                      onClick={() => dispatch(addMeal(item))}
                    />
                    <FaMinus
                      className="minus pointer"
                      onClick={() => dispatch(deleteMeal(item))}
                    />
                    <MdDelete
                      className="delete pointer"
                      onClick={() => dispatch(removeMeal(item))}
                    />
                  </div>
                </div>
              );
            })
          }
        </div>
      )} */}

      {/* menue button */}
      {isMenue && (
        <div ref={menueRef} className="menue-links">
          <ul className="nav-links">
            <li className="nav-item">
              <NavLink to="/" onClick={() => setIsMenue(false)}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/menue" onClick={() => setIsMenue(false)}>
                Menü
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/reservation" onClick={() => setIsMenue(false)}>
                Reservation
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/angebote" onClick={() => setIsMenue(false)}>
                Gutscheine
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/restaurant" onClick={() => setIsMenue(false)}>
                Restaurant
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/kontakt" onClick={() => setIsMenue(false)}>
                Kontakt
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Nav;