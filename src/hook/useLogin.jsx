import { useState } from "react";
import AuthService from "../Services/AuthService";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
const useLogin = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const getLogin = async (data) => {
        try {
            setLoading(true);
            const res = await AuthService.Login({
                email: data.email,
                password: data.password,
                rememberMe: Boolean(data.rememberMe),
            });
            localStorage.setItem("token", res.data.token)
            const decoded = jwtDecode(res.data.token)
            localStorage.setItem("userName", decoded.FullName)
            localStorage.setItem("USER_ID", decoded.Id)
            setLoading(false);
            return res;

        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed ", {
                duration: 5000,
                position: 'bottom-center',
            })
            setError(err);
            setLoading(false);
        }
    }

    return { getLogin, error, loading };
}

export default useLogin
