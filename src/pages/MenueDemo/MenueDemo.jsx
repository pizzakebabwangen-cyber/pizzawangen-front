/**
 * MenueDemo — Menü-Sektion im Dieci-Stil.
 * Fasst Unterkategorien zusammen (z. B. „Vegitarisch 32 cm“ + „40 cm“ -> ein Vegitarisch-Tab).
 * Grössenwahl 32/40 pro Karte.
 */
import { useEffect, useRef, useState } from "react";
import MealCardDemo from "../../component/MealCardDemo/MealCardDemo";
import Spiner from "../../component/spiner/Spiner";
import { motion } from "framer-motion";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
import "./MenueDemo.css";
import DeliveryMethod from "../../component/DeliveryMethod/DeliveryMethod";
import { useSelector } from "react-redux";
import useGetCompanyData from "../../hooks/useGetCompanyData";
import useGetExtensionsData from "../../hooks/useGetExtensions";
import { sortCategoriesForMenu } from "../../utils/sortCategories";
import { sortProductsForMenu } from "../../utils/sortProductsForMenu";
import WebRootImage from "../../component/WebRootImage/WebRootImage.jsx";

// Grösse aus Unterkategorie-Name (32 cm, 40 cm)
const getSizeFromSubCatName = (name) => {
  if (/32\s*cm/i.test(name)) return "32";
  if (/40\s*cm/i.test(name)) return "40";
  return null;
};

// Basisname ohne Grössen-Suffix
const getBaseName = (name) => {
  return name
    .replace(/\s*32\s*cm\s*$/i, "")
    .replace(/\s*40\s*cm\s*$/i, "")
    .trim();
};

const MEAL_BATCH = 6;

const MenueDemo = () => {
  const server = import.meta.env.VITE_SERVER;
  const [categories, setCategories] = useState([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [mergedProducts, setMergedProducts] = useState([]);
  const [mealBatchCount, setMealBatchCount] = useState(1);
  const deliveryMethod = useSelector((state) => state.delivery.deliverMethod);
  const sectionRef1 = useRef(null);
  const sectionRef2 = useRef(null);
  const { extensionsData, getExtensionsData } = useGetExtensionsData();
  const { companyData, getCompanyData } = useGetCompanyData();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToRef = (ref, offset = -80) => {
    if (ref?.current) {
      const y = ref.current.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Kategorien laden
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading1(true);
      try {
        const res = await fetch(`${server}/api/Category/GetAllCategorys`);
        const data = await res.json();
        setCategories(sortCategoriesForMenu(data.data));
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
      setIsLoading1(false);
    };
    fetchCategories();
  }, [server]);

  // Unterkategorien nach Basisname gruppieren
  const getGroupedSubCats = () => {
    const cats = categories.filter(
      (c) => c.name !== "Offers" && c.name !== "Bonus"
    );
    if (!selectedCategoryId) return [];
    const cat = cats.find((c) => c.id === selectedCategoryId);
    if (!cat?.subCategory?.length) return [];
    const subCats = cat.subCategory;

    const groups = {};
    subCats.forEach((sc) => {
      const size = getSizeFromSubCatName(sc.name);
      const base = size ? getBaseName(sc.name) : sc.name;

      if (!groups[base]) {
        groups[base] = { name: base, subcategories: [] };
      }
      groups[base].subcategories.push({ ...sc, size });
    });
    return Object.values(groups);
  };

  const grouped = getGroupedSubCats();

  // Produkte laden, sobald eine Gruppe gewählt ist
  useEffect(() => {
    if (!selectedGroup?.subcategories?.length) {
      setMergedProducts([]);
      return;
    }

    const fetchAndMerge = async () => {
      setIsLoading2(true);
      try {
        const promises = selectedGroup.subcategories.map((sc) =>
          fetch(`${server}/api/Product/GetAllProductsBySubCategoryId?id=${sc.id}`).then(
            (r) => r.json()
          )
        );
        const results = await Promise.all(promises);
        const productsBySubCat = results.map((r) => r.data || []);

        const byName = {};
        selectedGroup.subcategories.forEach((sc, idx) => {
          const products = sortProductsForMenu(productsBySubCat[idx] || []);
          products.forEach((p) => {
            const key = (p.name || "").trim().toLowerCase();
            if (!byName[key]) {
              byName[key] = {
                name: p.name,
                description: p.description,
                description1: p.description1,
                photoName: p.photoName,
                sizes: {},
              };
            }
            const size = sc.size || "32";
            byName[key].sizes[size] = {
              ...p,
              subCategory: p.subCategory,
            };
          });
        });

        setMergedProducts(Object.values(byName));
      } catch (e) {
        console.error("Failed to fetch products:", e);
        setMergedProducts([]);
      }
      setIsLoading2(false);
    };

    fetchAndMerge();
  }, [selectedGroup, server]);

  const handleSelectCategory = (id) => {
    setSelectedCategoryId(id);
    setSelectedGroup(null);
    scrollToRef(sectionRef2, -80);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    scrollToRef(sectionRef1, -80);
  };

  useEffect(() => {
    getCompanyData();
    getExtensionsData();
  }, []);

  useEffect(() => {
    setMealBatchCount(1);
  }, [selectedGroup]);

  const visibleMerged = mergedProducts.slice(0, mealBatchCount * MEAL_BATCH);
  const hasMoreMerged = visibleMerged.length < mergedProducts.length;

  return (
    <section className="menue-sec menue-demo-sec">
      {!deliveryMethod && <DeliveryMethod />}
      <div className="container">
        <h1>
          <span className="highlight">Unser </span>Menü{" "}
          <span className="demo-badge">(Demo)</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 200 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="animated-component"
        >
          <div className="cats">
            {isLoading1 ? (
              <Spiner />
            ) : (
              categories
                .filter((c) => c.name !== "Offers" && c.name !== "Bonus")
                .map((cat, index) => (
                  <div
                    key={cat.id}
                    className="card-label"
                    onClick={() => handleSelectCategory(cat.id)}
                  >
                    <WebRootImage
                      photoName={cat.photoName}
                      alt={cat.name}
                      className="card-Image"
                      width={120}
                      height={120}
                      decoding="async"
                      loading={index < 4 ? "eager" : "lazy"}
                      fetchPriority={index < 2 ? "high" : undefined}
                    />
                    <h4 className="card-title">{cat.name}</h4>
                  </div>
                ))
            )}
          </div>
        </motion.div>

        <div className="cats" id="cats" ref={sectionRef2}>
          {selectedCategoryId && (
            <>
              {grouped.length === 0 && !isLoading1 && (
                <p style={{ color: "white" }}>Keine Unterkategorien</p>
              )}
              {grouped.map((group) => (
                <button
                  key={group.name}
                  className="btn"
                  onClick={() => handleSelectGroup(group)}
                >
                  {group.name}
                </button>
              ))}
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 200 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="animated-component"
        >
          <div className="selectedSubCategory">
            <h1>{selectedGroup?.name || "—"}</h1>
          </div>
          <div className="cards" ref={sectionRef1}>
            {isLoading2 ? (
              <Spiner />
            ) : (
              visibleMerged.map((product, idx) => (
                <MealCardDemo
                  key={idx}
                  mealWithSizes={product}
                  extensionsData={extensionsData}
                  companyData={companyData}
                  mealListIndex={idx}
                />
              ))
            )}
          </div>
          {!isLoading2 && hasMoreMerged && (
            <div className="menue-load-more-wrap">
              <button
                type="button"
                className="menue-load-more"
                onClick={() => setMealBatchCount((c) => c + 1)}
              >
                Mehr laden ({mergedProducts.length - visibleMerged.length} weitere)
              </button>
            </div>
          )}
        </motion.div>
      </div>
      <Delivery />
      <Location />
    </section>
  );
};

export default MenueDemo;
