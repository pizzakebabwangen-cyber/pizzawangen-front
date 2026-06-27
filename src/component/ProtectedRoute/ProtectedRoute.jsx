/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import React from 'react'
import { Navigate, useLocation } from "react-router-dom";
import { readCheckoutUnlockedFlag } from "../../utils/checkoutVisitorStorage.js";

/** Erlaubt Kasse nach erfolgreichem cart/add — state, React-State oder Session (Reload). */
export const ProtectedRoute = ({ element: Component, isAllowed, redirectPath }) => {
  const location = useLocation();
  const unlocked =
    Boolean(isAllowed) ||
    location.state?.checkoutUnlocked === true ||
    readCheckoutUnlockedFlag();

  if (!unlocked) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Component />;
};
