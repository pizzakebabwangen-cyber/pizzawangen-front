/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
import { Modal } from "antd";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaCartShopping } from "react-icons/fa6";
import { addMeal } from "../../reduxTool/CartSlice";
import "../MealCard/MealCard.css";
import "./MealCardDemo.css";
import HolidayPopUp from "../holidayPopUp/HolidayPopUp";
import { isDeliveryOrPreorder } from "../../utils/isDeliveryOrPreorder";
import { getDeliveryUnitChf, getPickupUnitChf } from "../../utils/productPrices";
import WebRootImage from "../WebRootImage/WebRootImage.jsx";

/**
 * MealCardDemo — Pizza-Karte mit Grössenwahl 32 cm / 40 cm (Dieci-Stil).
 * mealWithSizes: { name, description, photoName, sizes: { 32: { id, price, pickup_Price, ... }, 40: { ... } } }
 */
const MealCardDemo = ({ mealWithSizes, extensionsData, companyData, mealListIndex }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [addQuantity, setAddQuantity] = useState(1);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [openPause, setOpenPause] = useState(false);
  const deliverMethod = useSelector((state) => state.delivery.deliverMethod);

  const hasSizes = mealWithSizes.sizes && Object.keys(mealWithSizes.sizes).length > 1;
  const sizeKeys = hasSizes ? Object.keys(mealWithSizes.sizes).sort((a, b) => a - b) : [];
  const [selectedSize, setSelectedSize] = useState(sizeKeys[0] || "32");

  const currentMeal = hasSizes
    ? mealWithSizes.sizes[selectedSize]
    : mealWithSizes.sizes?.[sizeKeys[0]] || mealWithSizes;

  if (!currentMeal) return null;

  const price = isDeliveryOrPreorder(deliverMethod)
    ? getDeliveryUnitChf(currentMeal)
    : getPickupUnitChf(currentMeal);

  const clampQty = (n) => {
    const v = Number.parseInt(String(n), 10);
    if (!Number.isFinite(v) || v < 1) return 1;
    return Math.min(v, 99);
  };

  const extensionsUnitTotalChf = useMemo(
    () =>
      selectedExtensions.reduce(
        (sum, t) => sum + (Number(t?.price) || 0),
        0
      ),
    [selectedExtensions]
  );

  const modalLineTotalChf = useMemo(
    () =>
      (Number(price) + extensionsUnitTotalChf) * clampQty(addQuantity),
    [price, extensionsUnitTotalChf, addQuantity]
  );

  const showModal = () => {
    setAddQuantity(1);
    setOpen(true);
  };
  const showPause = () => setOpenPause(true);
  const handleOk = () => setOpen(false);
  const handleCancel = () => setOpen(false);
  const handleCancelPause = () => setOpenPause(false);

  const handleExtensionsChange = (topping) => {
    setSelectedExtensions((prev) =>
      prev.includes(topping) ? prev.filter((t) => t !== topping) : [...prev, topping]
    );
  };

  const handleAddToCart = () => {
    dispatch(
      addMeal({
        meal: currentMeal,
        selectedExtensions,
        quantity: addQuantity,
      })
    );
    handleOk();
  };

  const handleCardClick = () => {
    if (companyData?.data?.pausetyp == 1 || companyData?.data?.pausetyp == 2) {
      showPause();
    } else {
      showModal();
    }
  };

  return (
    <>
      <div className="card card-demo">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 200 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="animated-component"
          onClick={handleCardClick}
        >
          <WebRootImage
            photoName={mealWithSizes.photoName || currentMeal.photoName}
            alt={mealWithSizes.name}
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
            <h2 className="meal-name">{mealWithSizes.name}</h2>
            <p title={mealWithSizes.description}>{mealWithSizes.description}</p>

            {/* Grössenwahl (Dieci-Stil) */}
            {hasSizes && (
              <div className="size-selector">
                {sizeKeys.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-option ${selectedSize === size ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                  >
                    {size} cm
                  </button>
                ))}
              </div>
            )}

            <div className="card-footer">
              <span className="price">CHF {Number(price).toFixed(2)}</span>
              <span className="cart-icon">
                <FaCartShopping />
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        className="modal meal-card-product-modal"
        open={open}
        title={mealWithSizes.name}
        onOk={handleOk}
        onCancel={handleCancel}
        width="70%"
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
                  photoName={mealWithSizes.photoName || currentMeal.photoName}
                  alt={mealWithSizes.name}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="pizza-details">
                <h1>{mealWithSizes.name}</h1>

                {hasSizes && (
                  <div className="size-selector-modal">
                    {sizeKeys.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`size-option ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size} cm
                      </button>
                    ))}
                  </div>
                )}

                <p className="price">CHF {Number(price).toFixed(2)}</p>
                <p>{mealWithSizes.description || currentMeal.description}</p>
                {extensionsData && extensionsData.length > 0 && <h1>Extras:</h1>}
                <div className="toppings">
                  {extensionsData
                    ?.filter((x) => x.categoryId === currentMeal.subCategory?.categoryId)
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
                        {topping.name} - CHF {topping.price?.toFixed(2)}
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
              <button type="button" className="meal-add-bar-btn" onClick={handleAddToCart}>
                <span className="meal-add-bar-label">Hinzufügen</span>
                <span className="meal-add-bar-price">
                  CHF {modalLineTotalChf.toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {openPause && (
        <HolidayPopUp
          open={openPause}
          pausetyp={companyData?.data?.pausetyp}
          handleCancelPause={handleCancelPause}
          pausetill={companyData?.data?.pausetill}
          pausefrom={companyData?.data?.pausefrom}
        />
      )}
    </>
  );
};

export default MealCardDemo;
