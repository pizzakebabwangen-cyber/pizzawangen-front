import { useState } from "react";
import AuthService from "../Services/AuthService";
import toast from "react-hot-toast";

const useRegister = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.Message) return data.Message;
    if (data?.errors && typeof data.errors === "object") {
      const messages = Object.values(data.errors).flat().filter(Boolean);
      if (messages.length) return messages.join(" ");
    }
    if (data?.Errors && Array.isArray(data.Errors) && data.Errors.length) {
      return data.Errors.join(" ");
    }
    return "Registrierung fehlgeschlagen";
  };

  const getRegister = async (data) => {
    try {
      setLoading(true);
      const res = await AuthService.Register(data);
      setLoading(false);
      return res;

    } catch (err) {
      toast.error(getErrorMessage(err), {
        duration: 8000,
        position: 'bottom-center',
})
      setError(err);
      setLoading(false);
    }
  }

  return { getRegister, error, loading };
}

export default useRegister
