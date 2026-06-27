import { useCallback, useState } from "react";
import DeliveryService from "../Services/DeliveryService";

const useGetDelivery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryData, setDeliveryData] = useState([]);

  const getDelivery = useCallback(async () => {
    try {
      setLoading(true);
      const res = await DeliveryService.getDeliveryData();
      setDeliveryData(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err);
      setDeliveryData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    deliveryData,
    getDelivery,
  };
};

export default useGetDelivery;
