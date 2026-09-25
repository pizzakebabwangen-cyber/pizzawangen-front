import { useEffect, useRef, useState } from "react";
import MealCard from "../../component/MealCard/MealCard";
import Spiner from "../../component/spiner/Spiner";
import { motion } from "framer-motion";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
import "./Menue.css";
import DeliveryMethod from "../../component/DeliveryMethod/DeliveryMethod";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetCompanyData from "../../hooks/useGetCompanyData";
import useGetExtensionsData from "../../hooks/useGetExtensions";
import GutscheineHomeCta from "../../component/GutscheineHomeCta/GutscheineHomeCta";
import { sortCategoriesForMenu } from "../../utils/sortCategories";
import { sortProductsForMenu } from "../../utils/sortProductsForMenu";
import WebRootImage from "../../component/WebRootImage/WebRootImage.jsx";
import { isDeliveryOrPreorder } from "../../utils/isDeliveryOrPreorder.js";
import { startCheckoutFromCart } from "../../utils/startCheckoutFromCart.js";
import useGetDelivery from "../../hooks/useGetDelivery.jsx";
import {
  DELIVERY_POSTCODE_STORAGE_KEY,
  getDeliveryMinimumBlock,
  getMinimumOrderForPlz,
} from "../../utils/deliveryMinimum.js";
import toast from "react-hot-toast";

const MEAL_BATCH = 6;

const normalizeSearchText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const Menue = () => {
  const server = import.meta.env.VITE_SERVER;
  const [categories, setCategories] = useState([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [nameOfType, setNameOfType] = useState("");
  const [prodOfSubCats, setProdOfSubCats] = useState([]);
  const [mealBatchCount, setMealBatchCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const allProductsCacheRef = useRef(null);
  const deliveryMethod = useSelector((state) => state.delivery.deliverMethod);
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const { deliveryData, getDelivery } = useGetDelivery();
  const [savedPostcode, setSavedPostcode] = useState(() =>
    typeof localStorage !== "undefined"
      ? localStorage.getItem(DELIVERY_POSTCODE_STORAGE_KEY) || ""
      : ""
  );
  const cartItemsCount = Array.isArray(cart?.items)
    ? cart.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
    : 0;
  const mobileCartTotal = Array.isArray(cart?.items)
    ? cart.items.reduce((sum, item) => {
        const lineTotal = isDeliveryOrPreorder(deliveryMethod)
          ? item?.totalPrice
          : item?.totalPriceWithoutDelivery;
        return sum + Number(lineTotal || 0);
      }, 0)
    : 0;

  const deliveryMinimum = getMinimumOrderForPlz(deliveryData, savedPostcode);
  const minimumMissing =
    isDeliveryOrPreorder(deliveryMethod) && deliveryMinimum != null
      ? Math.max(0, deliveryMinimum - mobileCartTotal)
      : null;
  const plzLabel = String(savedPostcode).match(/\d{4}/)?.[0] || "";
  const minimumHint =
    cartItemsCount <= 0 || !isDeliveryOrPreorder(deliveryMethod) || deliveryMinimum == null
      ? ""
      : minimumMissing > 0
        ? `Noch CHF ${minimumMissing.toFixed(2)} bis zum Mindestbestellwert${
            plzLabel ? ` (PLZ ${plzLabel})` : ""
          }.`
        : "Mindestbestellwert erreicht.";

  const sectionRef1 = useRef(null); // Ref for categories
  const sectionRef2 = useRef(null); // Ref for meals
  const { extensionsData, getExtensionsData } = useGetExtensionsData();
  const { companyData, getCompanyData } = useGetCompanyData()
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    const readPostcode = () => {
      setSavedPostcode(localStorage.getItem(DELIVERY_POSTCODE_STORAGE_KEY) || "");
    };
    window.addEventListener("focus", readPostcode);
    const timer = window.setInterval(readPostcode, 1500);
    return () => {
      window.removeEventListener("focus", readPostcode);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (isDeliveryOrPreorder(deliveryMethod)) {
      getDelivery();
    }
  }, [deliveryMethod, getDelivery]);

  const scrollToRef = (ref, offset = -80) => {
    if (ref.current) {
      const elementPosition =
        ref.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition + offset,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading1(true);
      try {
        const response = await fetch(`${server}/api/Category/GetAllCategorys`);
        const data = await response.json();
        setCategories(sortCategoriesForMenu(data.data));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
      setIsLoading1(false);
    };
    fetchCategories();
  }, [server]);

useEffect(() => {
  const fetchProducts = async () => {
    setIsLoading2(true);
    try {
      const response = await fetch(
        `${server}/api/Product/GetAllProductsBySubCategoryId?id=${selectedSubCategory}`
      );
      const data = await response.json();
      if (data && data.data) {
        setProdOfSubCats(sortProductsForMenu(data.data));
      } else {
        console.warn("No products found for the selected subcategory:", selectedSubCategory);
        setProdOfSubCats([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProdOfSubCats([]);
    } finally {
      setIsLoading2(false);
    }
  };

  if (selectedSubCategory) {
    fetchProducts();
  } else {
    setProdOfSubCats([]);
  }
}, [selectedSubCategory, server]);

  useEffect(() => {
    setMealBatchCount(1);
  }, [selectedSubCategory]);

  const visibleMeals = prodOfSubCats.slice(0, mealBatchCount * MEAL_BATCH);
  const hasMoreMeals = visibleMeals.length < prodOfSubCats.length;
  const trimmedSearch = searchQuery.trim();
  const isSearchActive = trimmedSearch.length >= 2;
  const mealsToShow = isSearchActive ? searchResults : visibleMeals;

  useEffect(() => {
    if (trimmedSearch.length < 2) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return undefined;
    }
    if (!categories.length) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        if (!allProductsCacheRef.current) {
          const subIds = categories
            .filter((cat) => cat.name !== "Offers" && cat.name !== "Bonus")
            .flatMap((cat) => (cat.subCategory || []).map((sc) => sc.id))
            .filter(Boolean);
          const chunks = await Promise.all(
            subIds.map(async (id) => {
              const response = await fetch(
                `${server}/api/Product/GetAllProductsBySubCategoryId?id=${id}`
              );
              const data = await response.json();
              return data?.data || [];
            })
          );
          const byId = new Map();
          chunks.flat().forEach((product) => {
            if (product?.id) byId.set(product.id, product);
          });
          allProductsCacheRef.current = sortProductsForMenu([...byId.values()]);
        }

        const needle = normalizeSearchText(trimmedSearch);
        const filtered = allProductsCacheRef.current.filter((product) => {
          const haystack = normalizeSearchText(
            [product.name, product.description, product.description1].join(" ")
          );
          return haystack.includes(needle);
        });
        if (!cancelled) setSearchResults(filtered);
      } catch (error) {
        console.error("Menu search failed:", error);
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setIsSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedSearch, categories, server]);

  const getSelectedCat = (id) => {
    setSelectedCategory(id);
    const dataOfSubCats = categories.find((x) => x.id === id)?.subCategory.length===1;
    if (dataOfSubCats) { // check if the selectedSubcats have one element then scroll to it direct without click 
      const element = categories.find((x) => x.id === id)?.subCategory[0];
      getSelectedSubCat(element.id, element.name);
    } else {
      setSelectedSubCategory("");
      setNameOfType("");
      scrollToRef(sectionRef2, -80);
    }
  };

  const getSelectedSubCat = (id, name) => {
    if (id && name) {
      setSelectedSubCategory(id);
      setNameOfType(name);
      scrollToRef(sectionRef1, -80);
    } else {
      console.error("Invalid subcategory selection:", { id, name });
    }
  };

  const goDirectlyToCheckout = async () => {
    if (isStartingCheckout || cartItemsCount <= 0) return;
    const minimumBlock = getDeliveryMinimumBlock({
      deliveryData,
      deliveryMethod,
      items: cart.items,
      postcode:
        typeof localStorage !== "undefined"
          ? localStorage.getItem(DELIVERY_POSTCODE_STORAGE_KEY)
          : "",
    });
    if (minimumBlock) {
      toast.error(
        `Mindestbestellwert für diese PLZ: CHF ${minimumBlock.minimum.toFixed(
          2
        )}. Aktuell: CHF ${minimumBlock.total.toFixed(2)}.`
      );
      navigate("/cart");
      return;
    }

    setIsStartingCheckout(true);
    try {
      const response = await startCheckoutFromCart({
        cartItems: cart.items,
        deliveryMethod,
        server,
      });
      navigate("/cart/checkOut", {
        state: { response, checkoutUnlocked: true },
      });
    } catch (error) {
      console.error("Failed to start checkout:", error);
      navigate("/cart");
    } finally {
      setIsStartingCheckout(false);
    }
  };
  
  useEffect(() => {
    getCompanyData()
    getExtensionsData()
  }, []);

  // console.log("data", prodOfSubCats);
  return (
    <section
      className={`menue-sec${cartItemsCount > 0 ? " menue-sec--mobile-cart" : ""}`}
    >
      {!deliveryMethod && <DeliveryMethod />}
      <div className="menue-with-side">
      <div className="container">
        <div className="menue-title-row">
          <h1 className="menue-page-heading">
            <span className="highlight">Unser </span>Menü
          </h1>
          <GutscheineHomeCta variant="menueInline" />
        </div>
        <div className="menue-local-seo">
          <p>
            Direkt bei Wangen Pizza Kebab bestellen: frisch zubereitete Pizza,
            Kebab und Döner für Wangen SZ, Lachen, Siebnen und Umgebung.
          </p>
          <div className="menue-trust-row" aria-label="Bewertungen und Direktbestellung">
            <span className="menue-rating">4.7 ★★★★★ Google</span>
            <span>Lieferung & Abholung</span>
            <span>Wertgutscheine online</span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Wangen%20Pizza%20Kebab%20Z%C3%BCrcherstrasse%203%208855%20Wangen%20SZ"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jetzt bewerten
            </a>
          </div>
        </div>

        <div className="menue-search-wrap">
          <label htmlFor="menue-search" className="menue-search-label">
            Suche im Menü
          </label>
          <input
            id="menue-search"
            type="search"
            className="menue-search-input"
            placeholder="z. B. Döner, Pizza, Getränke…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          {isSearchLoading && (
            <p className="menue-search-status">Suche läuft…</p>
          )}
          {isSearchActive && !isSearchLoading && searchResults.length === 0 && (
            <p className="menue-search-status">Keine Treffer für «{trimmedSearch}».</p>
          )}
        </div>

        {/* show cats */}
        {!isSearchActive && (
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="animated-component"
        >
          <div className="cats">
            {isLoading1 ? (
              <Spiner />
            ) : (
              categories
                .filter((cat) => cat.name !== "Offers" && cat.name !== "Bonus")
                .map((cat, index) => (
                  <div
                    className="card-label"
                    key={cat.id}
                    onClick={() => getSelectedCat(cat.id)}
                  >
                    <WebRootImage
                      photoName={cat.photoName}
                      alt={cat.name || "Menükategorie"}
                      className="card-Image"
                      width={120}
                      height={120}
                      decoding="async"
                      sizes="120px"
                      loading={index < 2 ? "eager" : "lazy"}
                      fetchPriority={index < 2 ? "high" : "low"}
                    />
                    <h4 className="card-title">{cat.name}</h4>
                  </div>
                ))
            )}
          </div>
        </motion.div>
        )}

        {/* show the subcats */}
        {!isSearchActive && (
        <div className="cats" id="cats" ref={sectionRef2}>
          {selectedCategory && isLoading2 ? (
            <Spiner />
          ) : (
            categories
              .find((x) => x.id === selectedCategory)
              ?.subCategory.map((ele) => (
                <button
                  key={ele.id}
                  className="btn"
                  onClick={() => getSelectedSubCat(ele.id, ele.name)}
                >
                  {ele.name}
                </button>
              ))
          )}
        </div>
        )}
        {/* show th meals  */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="animated-component"
        >
          {(isSearchActive || selectedSubCategory) && (
          <div className="selectedSubCategory">
            <h1>
              {isSearchActive
                ? `Suchergebnisse (${searchResults.length})`
                : nameOfType}
            </h1>
          </div>
          )}
          <div className="cards" ref={sectionRef1}>
            {isSearchActive && isSearchLoading ? (
              <Spiner />
            ) : (
            mealsToShow.map((product, idx) => (
              <MealCard
                key={product.id}
                meal={product}
                companyData={companyData}
                extensionsData={extensionsData}
                mealListIndex={idx}
              />
            ))
            )}
          </div>
          {!isSearchActive && hasMoreMeals && (
            <div className="menue-load-more-wrap">
              <button
                type="button"
                className="menue-load-more"
                onClick={() => setMealBatchCount((c) => c + 1)}
              >
                Mehr laden ({prodOfSubCats.length - visibleMeals.length} weitere)
              </button>
            </div>
          )}
        </motion.div>
      </div>
      <aside className="menue-side-cart" aria-label="Warenkorb">
        <h2>Warenkorb</h2>
        {cartItemsCount === 0 ? (
          <p className="menue-side-empty">Noch keine Artikel.</p>
        ) : (
          <ul className="menue-side-items">
            {cart.items.map((item, index) => {
              const lineTotal = isDeliveryOrPreorder(deliveryMethod)
                ? item?.totalPrice
                : item?.totalPriceWithoutDelivery;
              return (
                <li key={`${item.productId}-${index}`}>
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>CHF {Number(lineTotal || 0).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="menue-side-total">CHF {mobileCartTotal.toFixed(2)}</p>
        {minimumHint && <p className="menue-side-minimum">{minimumHint}</p>}
        <button
          type="button"
          className="menue-side-order"
          onClick={goDirectlyToCheckout}
          disabled={isStartingCheckout || cartItemsCount === 0}
        >
          {isStartingCheckout ? "Bitte warten..." : "Bestellen"}
        </button>
      </aside>
      </div>
      {cartItemsCount > 0 && (
        <div className="menue-mobile-cart-bar" aria-label="Warenkorb">
          <div className="menue-mobile-cart-total">
            <span className="menue-mobile-cart-icon">Warenkorb</span>
            <span>CHF {mobileCartTotal.toFixed(2)}</span>
            {minimumHint && (
              <span className="menue-mobile-cart-hint">{minimumHint}</span>
            )}
          </div>
          <button
            type="button"
            className="menue-mobile-cart-button"
            onClick={goDirectlyToCheckout}
            disabled={isStartingCheckout}
          >
            {isStartingCheckout ? "Bitte warten..." : "Bestellen"}
          </button>
        </div>
      )}
      <Delivery />
      <Location />
    </section>
  );
};

export default Menue;
