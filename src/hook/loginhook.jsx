
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { LoginPage } from "../reduxTool/AuthSlice"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

function Loginhook() {
    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [lo, setLog] = useState(true)

    const navigate = useNavigate()
  
    const dispatch = useDispatch()
    const { loginUser, error } = useSelector((state) => state.Auth)

    const getRegisterInfo = (info) => (e) => {
        info(e.target.value)
    }

    const SendLogin = async (e) => {
        e.preventDefault()
        if (password !== "" && userName !== "") {
            setLog(true)
            await dispatch(LoginPage(
                {
                    "email": userName,
                    "password": password
                }
            ))
            setLog(false)
        }
    }

    useEffect(() => {
        if (!lo) {
            if (error === null) {
                if (loginUser && loginUser.data) {
                    if (loginUser.data.message === "User Login successfully!") {
                        toast.success("User Login successfully ")
                        localStorage.setItem("token", loginUser.data.token)
                        setPassword("")
                        setUserName("")
                        setTimeout(() => {
                            navigate("/")
                        }, 500);
                    }
                }
            } else {
                if (error) {
                    // if (error.message === "Invalid password") {
                    //     toast.error("Invalid password")
                    // }
                    // if (error.message === "Email not confirmed ") {
                    //     toast.error("Email not confirmed ")
                    // }
                    // if (error.message === "There is no user with that Email address") {
                    //     toast.error("This email does not exist")
                    // }
                    toast.error(error.message)
                }
            }
        }
    }, [lo])

    return [getRegisterInfo, setUserName, setPassword, SendLogin]
}





export default Loginhook