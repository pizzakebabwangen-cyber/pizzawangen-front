/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useDispatch } from "react-redux";
import WebRootImage from "../WebRootImage/WebRootImage.jsx";
import {
  addMealFromCart,
  deleteMeal,
  removeMeal,
} from "../../reduxTool/CartSlice";
import "./CartMeals.css";

const CartMeals = ({
  data,
  withDelivery,
  minimumOrderAb,
  sending,
  handleOrderClick,
}) => {
  const dispatch = useDispatch();
  const cartItemsCount = Array.isArray(data?.items)
    ? data.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
    : 0;

  const foodTotalDelivery =
    Array.isArray(data?.items) && withDelivery
      ? data.items.reduce((sum, item) => sum + Number(item?.totalPrice || 0), 0)
      : 0;

  const foodTotalPickup =
    Array.isArray(data?.items) && !withDelivery
      ? data.items.reduce(
          (sum, item) => sum + Number(item?.totalPriceWithoutDelivery || 0),
          0
        )
      : 0;

  /** Immer aus Zeilen summieren — vermeidet falsche Gesamtpreise bei Redux-Drift. */
  const displayedTotal = withDelivery ? foodTotalDelivery : foodTotalPickup;

  const minAbNum =
    minimumOrderAb === "" ? NaN : parseFloat(String(minimumOrderAb));
  const belowDeliveryMinimum =
    withDelivery &&
    minimumOrderAb !== "" &&
    !Number.isNaN(minAbNum) &&
    displayedTotal > 0 &&
    displayedTotal < minAbNum;

  return (
    <div className="deliveryOptions">
      <p>
        {withDelivery ? "Als Lieferung bestellen" : "Zur Abholung bestellen"}
      </p>
      {data &&
        data.items.map((meal, index) => {
          const qty = Math.max(1, Number(meal.quantity) || 1);
          const lineTotal = withDelivery
            ? Number(meal.totalPrice) || 0
            : Number(meal.totalPriceWithoutDelivery) || 0;
          const unitPrice = lineTotal / qty;
          return (
            <div className="cart-item" key={index}>
              <WebRootImage
                photoName={meal.photoName}
                alt={meal.name}
                className="product-image"
              />
              <div className="product-details">
                <h3>{meal.name}</h3>
                <p className="price">
                  {qty > 1 ? (
                    <>
                      Stückpreis:{" "}
                      <span className="highlight">CHF {unitPrice.toFixed(2)}</span>
                      {" · Summe: "}
                      <span className="highlight">CHF {lineTotal.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      Preis :{" "}
                      <span className="highlight">CHF {lineTotal.toFixed(2)}</span>
                    </>
                  )}
                </p>
                <p className="description">
                  {meal.extensions.map((top) => {
                    return (
                      <span key={top.id} className="cart-topings">
                        {top.name + " "} ,{" "}
                      </span>
                    );
                  })}
                </p>
                <div className="quantity-container">
                  Menge : <span className="highlight"> {meal.quantity}</span>
                </div>
                <div className="cart-buttons">
                  <button
                    className="remove-button"
                    onClick={() => dispatch(addMealFromCart(meal))}
                  >
                    {" "}
                    +{" "}
                  </button>
                  <button
                    className="remove-button"
                    onClick={() => dispatch(deleteMeal(meal))}
                  >
                    -
                  </button>
                  <button
                    className="remove-button"
                    onClick={() => dispatch(removeMeal(meal))}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      {cartItemsCount > 0 && (
        <div className="cart-checkout-footer">
          <h2 className="total-price">
            Gesamtpreis : CHF
            <span className="highlight">
              {" "}
              {displayedTotal.toFixed(2)}{" "}
            </span>{" "}
          </h2>
          {withDelivery && minimumOrderAb === "" && (
            <p className="minimumOrderAb">
              Sie müssen eine gueltige Postleitzahl eingeben ....
            </p>
          )}
          {belowDeliveryMinimum && (
              <p className="minimumOrderAb">
                Der Einkaufswert erreicht nicht die erforderliche Mindestgrenze
                für eine Lieferung in Ihre Region! Ab CHF{" "}
                {minAbNum.toFixed(2)}...
              </p>
            )}
          <button
            className="shopping-cart-order"
            onClick={handleOrderClick}
            disabled={
              belowDeliveryMinimum ||
              (withDelivery && minimumOrderAb === "") ||
              sending
                ? true
                : false
            }
          >
            {sending ? "Bitte warten..." : "Bestellen"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartMeals;
