import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ResetPasswrod } from "../reduxTool/AuthSlice"
import toast from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"






const ResetPasshook = () => {


    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const email = searchParams.get("email") || ""
    const token = searchParams.get("token") || ""
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")



    const dispatch = useDispatch()
    const { reset, error } = useSelector((state) => state.Auth)

    const getRegisterInfo = (info) => (e) => {
        info(e.target.value)
    }

    const SendResetPass = async (e) => {
        e.preventDefault()
        if (!email || !token) {
            toast.error('Reset password link is invalid')
            return
        }
        if (password === confirmPassword) {
                const result = await dispatch(ResetPasswrod({
                    email,
                    password,
                    confirmPassword,
                    token
                }))
                if (ResetPasswrod.fulfilled.match(result)) {
                    toast.success('Password changed successfully')
                    setTimeout(() => {
                        window.location.href = 'https://www.pizzawangen.ch/login?passwordReset=1'
                    }, 1000)
                    return
                }
                toast.error('Password reset failed')
        } else {
            toast.error('password and confirmPassword are not the same ')
        }

    }
    return [getRegisterInfo, setPassword, setConfirmPassword, SendResetPass]


}
export default ResetPasshook
