import { useState } from "react";
import AuthService from "../Services/AuthService";
import toast from "react-hot-toast";

const useForgetPassword = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false)
    const [message, setMessage] = useState()
    const getForgetPassword = async (email) => {
        try {
            setLoading(true);
            const res = await AuthService.ForgetPassword(email);
            if (res) {
                setLoading(false);
                setIsSuccess(res.data.isSuccess)
                setMessage(res.data.message)
            }

        } catch (err) {
            const d = err?.response?.data;
            const msg =
                (d && typeof d === "object" && (d.message || d.Message)) ||
                (typeof d === "string" && !d.trim().startsWith("<") ? d : null) ||
                "Anfrage fehlgeschlagen (kein Benutzer oder E-Mail-Versand).";
            toast.error(msg, {
                duration: 8000,
                position: 'bottom-center',
            })
            setError(err);
            setLoading(false);
        }
    }

    return { getForgetPassword, error, loading, isSuccess, message };
}

export default useForgetPassword
