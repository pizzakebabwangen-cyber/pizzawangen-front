import { useState } from "react"
import AuthService from "../Services/AuthService"
AuthService
const useForgetPassword = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [message, setMessage] = useState()

    const ForgetPassword = async () => {
        try {
            setLoading(true);
            const res = await AuthService.ForgetPassword(email)
            if (res) {
                setLoading(false)
                setIsSuccess(res.isSuccess)
                setMessage(res.message)

            }
        }
        catch (err) {
            setLoading(false)
            setError(error)
        }

    }
    return {
        loading, error, ForgetPassword, message, isSuccess
    }
}

export default useForgetPassword
