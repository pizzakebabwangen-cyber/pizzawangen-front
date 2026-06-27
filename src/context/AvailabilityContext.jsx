import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AvailabilityService from "../Services/AvailabilityService";

const AvailabilityContext = createContext(null);

export function AvailabilityProvider({ children }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isPickupAvailable, setIsPickupAvailable] = useState(false);
  const [isPreorderAllowed, setIsPreorderAllowed] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AvailabilityService.getAvailability();
      if (res) {
        setIsAvailable(!!res.isAvailable);
        setIsPickupAvailable(!!res.isPickupAvailable);
        setIsPreorderAllowed(res.isPreorderAllowed !== false);
        setMessage(res.message || "");
      } else {
        setIsAvailable(false);
        setIsPickupAvailable(false);
        setIsPreorderAllowed(true);
      }
    } catch {
      setIsAvailable(false);
      setIsPickupAvailable(false);
      setIsPreorderAllowed(true);
      setMessage("");
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, 60000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const value = useMemo(
    () => ({
      isAvailable,
      isPickupAvailable,
      isPreorderAllowed,
      message,
      loading,
      ready,
      getAvailability: refresh,
    }),
    [isAvailable, isPickupAvailable, isPreorderAllowed, message, loading, ready, refresh],
  );

  return (
    <AvailabilityContext.Provider value={value}>
      {children}
    </AvailabilityContext.Provider>
  );
}

export function useAvailability() {
  const ctx = useContext(AvailabilityContext);
  if (!ctx) {
    throw new Error("useAvailability must be used within AvailabilityProvider");
  }
  return ctx;
}
