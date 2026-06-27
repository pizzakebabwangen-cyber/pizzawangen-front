/** Nach cart/add: VisitorId überlebt Reload / verlorenes React-Router-state. */
export const CHECKOUT_VISITOR_STORAGE_KEY = "wangen_checkout_visitor_id";

/** ProtectedRoute: Kasse nach Reload noch erreichbar (mit gespeicherter VisitorId). */
export const CHECKOUT_UNLOCKED_STORAGE_KEY = "wangen_checkout_unlocked";

/** Antwort von cart/add: meist String (VisitorId); sonst Felder im Objekt. */
export const normalizeVisitorId = (raw, depth = 0) => {
  if (raw == null || raw === "") return "";
  if (depth > 6) return "";

  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return "";
    if (
      (t.startsWith("{") && t.endsWith("}")) ||
      (t.startsWith("[") && t.endsWith("]"))
    ) {
      try {
        const inner = normalizeVisitorId(JSON.parse(t), depth + 1);
        if (inner) return inner;
      } catch {
        /* kein JSON */
      }
    }
    return t;
  }

  if (typeof raw === "object") {
    const nested = raw.data ?? raw.Data;
    if (nested != null && nested !== raw) {
      const inner = normalizeVisitorId(nested, depth + 1);
      if (inner) return inner;
    }
    const v =
      raw.userId ??
      raw.UserId ??
      raw.visitorId ??
      raw.VisitorId ??
      raw.value ??
      raw.Value;
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v != null && typeof v === "object") {
      const inner = normalizeVisitorId(v, depth + 1);
      if (inner) return inner;
    }
  }

  const s = String(raw).trim();
  return s === "[object Object]" ? "" : s;
};

export const readPersistedVisitorId = () => {
  try {
    return (sessionStorage.getItem(CHECKOUT_VISITOR_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
};

export const persistVisitorIdFromApiResponse = (data) => {
  const id = normalizeVisitorId(data);
  if (!id) return;
  try {
    sessionStorage.setItem(CHECKOUT_VISITOR_STORAGE_KEY, id);
  } catch {
    /* ignore quota / private mode */
  }
};

export const clearPersistedVisitorId = () => {
  try {
    sessionStorage.removeItem(CHECKOUT_VISITOR_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

export const setCheckoutUnlockedFlag = () => {
  try {
    sessionStorage.setItem(CHECKOUT_UNLOCKED_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
};

export const readCheckoutUnlockedFlag = () => {
  try {
    return sessionStorage.getItem(CHECKOUT_UNLOCKED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const clearCheckoutUnlockedFlag = () => {
  try {
    sessionStorage.removeItem(CHECKOUT_UNLOCKED_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

/** Nach erfolgreicher Bestellung: Session für Kasse zurücksetzen. */
export const clearCheckoutSessionStorage = () => {
  clearPersistedVisitorId();
  clearCheckoutUnlockedFlag();
};

/** Priorität: Router-state, dann Session (Reload), dann optional Fallback-String. */
export const resolveVisitorId = (stateResponse, fallbackUserId = "") => {
  return (
    normalizeVisitorId(stateResponse) ||
    readPersistedVisitorId() ||
    normalizeVisitorId(fallbackUserId)
  );
};
