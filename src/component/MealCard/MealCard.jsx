/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
import { Modal } from "antd";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaCartShopping } from "react-icons/fa6";
import toast from "react-hot-toast";
import { addMeal } from "../../reduxTool/CartSlice";
import "./MealCard.css";
import Image from "../../assets/images/paner.png";
import HolidayPopUp from "../holidayPopUp/HolidayPopUp";
import { isDeliveryOrPreorder } from "../../utils/isDeliveryOrPreorder";
import { getDeliveryUnitChf, getPickupUnitChf } from "../../utils/productPrices";
import WebRootImage from "../WebRootImage/WebRootImage.jsx";

const parseBaseIngredients = (description) =>
  String(description || "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && part.length <= 48)
    .slice(0, 12);

const MealCard = ({ meal, width, extensionsData, companyData, mealListIndex }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [itemNote, setItemNote] = useState("");
  const [modalSession, setModalSession] = useState(0);
  const [addQuantity, setAddQuantity] = useState(1);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [openPasue, setOpenPause] = useState(false);
  // const [relatedExtensions, setRelatedExtensions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoryId, selecedCategoryId] = useState("");

  const deliverMethod = useSelector((state) => state.delivery.deliverMethod);
  const clampQty = (n) => {
    const v = Number.parseInt(String(n), 10);
    if (!Number.isFinite(v) || v < 1) return 1;
    return Math.min(v, 99);
  };

  const baseUnitPriceChf = useMemo(() => {
    if (isDeliveryOrPreorder(deliverMethod)) return getDeliveryUnitChf(meal);
    return getPickupUnitChf(meal);
  }, [deliverMethod, meal]);

  const extensionsUnitTotalChf = useMemo(
    () =>
      selectedExtensions.reduce(
        (sum, t) => sum + (Number(t?.price) || 0),
        0
      ),
    [selectedExtensions]
  );

  const modalLineTotalChf = useMemo(
    () => (baseUnitPriceChf + extensionsUnitTotalChf) * clampQty(addQuantity),
    [baseUnitPriceChf, extensionsUnitTotalChf, addQuantity]
  );

  const baseIngredients = useMemo(
    () => parseBaseIngredients(meal?.description),
    [meal?.description]
  );

  const showModal = () => {
    setAddQuantity(1);
    setSelectedExtensions([]);
    setRemovedIngredients([]);
    setItemNote("");
    setModalSession((n) => n + 1);
    setOpen(true);
  };
  const showPause = () => {
    setOpenPause(true);
  };
  const handleOk = () => setOpen(false);
  const handleCancel = () => setOpen(false);

  const handleCancelPause = () => {
    setOpenPause(false);
  };

  const handleExtensionsChange = (topping) => {
    setSelectedExtensions((prevToppings) =>
      prevToppings.includes(topping)
        ? prevToppings.filter((t) => t !== topping)
        : [...prevToppings, topping]
    );
  };

  const toggleIngredient = (name) => {
    setRemovedIngredients((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const buildCartExtensions = () => {
    const categoryId = Number(
      meal?.subCategory?.categoryId ?? meal?.subCategory?.CategoryId ?? 0
    );
    const removals = removedIngredients.map((name) => ({
      name: `ohne ${name}`,
      price: 0,
      categoryId,
    }));
    const note = itemNote.trim().slice(0, 140);
    const noteLine = note
      ? [{ name: `Notiz: ${note}`, price: 0, categoryId }]
      : [];
    return [...selectedExtensions, ...removals, ...noteLine];
  };

  return (
    <>
      <div className="card" style={{ width: width }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 200 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="animated-component"
          onClick={
            companyData?.data?.pausetyp == 1
              ? showPause
              : companyData?.data?.pausetyp == 2
                ? showPause
                : showModal
          }
        >
          <WebRootImage
            photoName={meal.photoName}
            alt={meal.name}
            className="card-image"
            width={400}
            height={250}
            sizes="(max-width: 768px) 92vw, 400px"
            loading={
              typeof mealListIndex === "number" && mealListIndex < 3
                ? "eager"
                : "lazy"
            }
            decoding="async"
            fetchPriority={
              typeof mealListIndex === "number"
                ? mealListIndex < 2
                  ? "high"
                  : "low"
                : undefined
            }
          />
          <div className="card-content">
            <h2 className="meal-name">{meal.name}</h2>
            <p title={meal.description}>{meal.description}</p>
            <div className="card-footer">
              <span className="price">
                {" "}
                CHF{" "}
                {isDeliveryOrPreorder(deliverMethod)
                  ? getDeliveryUnitChf(meal).toFixed(2)
                  : getPickupUnitChf(meal).toFixed(2)}
              </span>
              <span className="cart-icon">
                <FaCartShopping />
              </span>
            </div>
            {/* <span className="pickUpPrice">
              Abholpreis:
              <span style={{ color: "white", marginLeft: "7px" }}>
                CHF {meal.pickup_Price.toFixed(2)}
              </span>
            </span> */}
          </div>{" "}
        </motion.div>

        <Modal
          className="modal meal-card-product-modal"
          open={open}
          title={meal.name}
          onOk={handleOk}
          onCancel={handleCancel}
          width={"70%"}
          footer={null}
          styles={{
            body: {
              padding: 0,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <div className="meal-card-modal-layout">
            <div className="meal-card-modal-scroll">
              <div className="pizza-customizer meal-card-modal-customizer">
                <div className="pizza-image">
                  <WebRootImage
                    photoName={meal.photoName}
                    alt={meal.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="pizza-details">
                  <h1>{meal.name}</h1>
                  <p className="price"> CHF {baseUnitPriceChf.toFixed(2)}</p>
                  <p>{meal.description1}</p>
                  {baseIngredients.length > 0 && (
                    <div className="base-ingredients">
                      <h3>Bestehende Zutaten entfernen</h3>
                      <div className="toppings">
                        {baseIngredients.map((name) => (
                          <label key={name}>
                            <input
                              type="checkbox"
                              checked={!removedIngredients.includes(name)}
                              onChange={() => toggleIngredient(name)}
                            />
                            {name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <label className="item-note">
                    Kommentar
                    <input
                      type="text"
                      maxLength={140}
                      value={itemNote}
                      placeholder="z. B. ohne Zwiebeln"
                      onChange={(e) => setItemNote(e.target.value)}
                    />
                  </label>
                  {meal.extensions && <h1>extras :</h1>}
                  <div className="toppings" key={modalSession}>
                    {extensionsData &&
                      extensionsData
                        ?.filter(
                          (x) => x.categoryId === meal.subCategory.categoryId
                        )
                        .slice()
                        .sort(
                          (a, b) =>
                            Number(a.displayOrder ?? a.DisplayOrder ?? 0) -
                            Number(b.displayOrder ?? b.DisplayOrder ?? 0)
                        )
                        .map((topping, index) => (
                          <label key={index}>
                            <input
                              type="checkbox"
                              value={topping.name}
                              onChange={() => handleExtensionsChange(topping)}
                            />
                            {topping.name} - CHF {topping.price.toFixed(2)}
                          </label>
                        ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card-modal-footer">
              <div className="meal-cart-actions meal-cart-actions--modal-bar">
                <div className="meal-qty-pill" aria-label="Anzahl">
                  <button
                    type="button"
                    className="meal-qty-pill-btn"
                    aria-label="Weniger"
                    onClick={() => setAddQuantity((q) => clampQty(q - 1))}
                  >
                    −
                  </button>
                  <input
                    className="meal-qty-pill-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={99}
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(clampQty(e.target.value))}
                  />
                  <button
                    type="button"
                    className="meal-qty-pill-btn"
                    aria-label="Mehr"
                    onClick={() => setAddQuantity((q) => clampQty(q + 1))}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="meal-add-bar-btn"
                  onClick={() => {
                    dispatch(
                      addMeal({
                        meal,
                        selectedExtensions: buildCartExtensions(),
                        quantity: addQuantity,
                      })
                    );
                    toast.success(`${meal.name} wurde in den Warenkorb gelegt. Danke für Ihre Auswahl!`);
                    handleOk();
                  }}
                >
                  <span className="meal-add-bar-label">Hinzufügen</span>
                  <span className="meal-add-bar-price">
                    CHF {modalLineTotalChf.toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
      {openPasue && (
        <>
          <HolidayPopUp
            open={openPasue}
            pausetyp={companyData?.data?.pausetyp}
            handleCancelPause={handleCancelPause}
            pausetill={companyData?.data?.pausetill}
            pausefrom={companyData?.data?.pausefrom}
          />
        </>
      )}
    </>
  );
};

export default MealCard;
