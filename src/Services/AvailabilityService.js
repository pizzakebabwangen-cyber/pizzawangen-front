import { isMoDoLieferpauseZuerich } from "../utils/pickupLunchGap.js";

const server = import.meta.env.VITE_SERVER;
const AvailabilityService = {
  getAvailability: async () => {
    if (!server) {
      console.warn("VITE_SERVER fehlt (.env)");
      return null;
    }
    const res = await fetch(`${server}/api/Company/check-availability`);
    if (!res.ok) {
      console.warn("check-availability HTTP", res.status);
      return null;
    }
    const data = await res.json();
    // ASP.NET kann camelCase oder PascalCase liefern — nie mit undefined überschreiben
    const delivery =
      data.isAvailable !== undefined ? data.isAvailable : data.IsAvailable;
    const pickupRaw =
      data.isPickupAvailable !== undefined ? data.isPickupAvailable : data.IsPickupAvailable;
    const pickupBool =
      pickupRaw !== undefined ? pickupRaw === true : delivery === true;
    const preorderRaw =
      data.isPreorderAllowed !== undefined ? data.isPreorderAllowed : data.IsPreorderAllowed;
    const preorder =
      preorderRaw !== undefined ? preorderRaw === true : true;

    const pickupBoosted = pickupBool || isMoDoLieferpauseZuerich();
    const rawMsg = String(data.message || data.Message || "");
    const message = preorder ? "" : rawMsg;

    return {
      ...data,
      isAvailable: delivery === true,
      isPickupAvailable: pickupBoosted,
      isPreorderAllowed: preorder,
      message,
    };
  },
};

export default AvailabilityService;
