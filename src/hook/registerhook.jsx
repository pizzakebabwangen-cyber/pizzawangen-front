import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RegisterPage } from "../reduxTool/AuthSlice"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"






const Registerhook = () => {


    const navigate = useNavigate()

    const [userName, setUserName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [street, setStreet] = useState("")
    const [salute, setSalute] = useState("")
    const [city, setCity] = useState("")
    const [postBox, setPostBox] = useState("")
    const [lo, setLog] = useState(true)



    const dispatch = useDispatch()
    const { Registeruser, error } = useSelector((state) => state.Auth)

    const getRegisterInfo = (info) => (e) => {
        info(e.target.value)
    }

    const SendRegister = async (e) => {
        e.preventDefault()
        if (password === confirmPassword) {
            if (password.length > 6) {
                setLog(true)
                await dispatch(RegisterPage({
                    userName,
                    phoneNumber,
                    email,
                    password,
                    confirmPassword,
                    street,
                    salute,
                    city,
                    postBox,
                }))
                setLog(false)
            } else {
                toast.error('password must be at least 6 characters')
            }
        } else {
            toast.error('password and confirmPassword are not the same ')
        }

    }


    useEffect(() => {
        if (!lo) {
            if (error === null) {
                if (Registeruser.status === 200) {
                    toast.success("sucess")
                    toast('Active Email in Your Gmail', {
                        icon: '👏',
                        duration: 6000,
                    })
                    setUserName("")
                    setPhoneNumber("")
                    setEmail("")
                    setPassword("")
                    setConfirmPassword("")
                    setStreet("")
                    setSalute("")
                    setCity("")
                    setPostBox("")
                    setTimeout(() => {
                        navigate("/Login")
                    }, 5000);
                }
            } else {
                if (error.message === "User already registed") {
                    toast.error(error.message)
                }
                if (error.message === "User did not create") {
                    toast.error("Change Name ")
                }
            }
        }
    }, [lo])

    return [getRegisterInfo, setUserName, setPhoneNumber, setEmail, setPassword, setConfirmPassword, setStreet,
        setSalute, setCity, setPostBox, SendRegister
    ]


}

export default Registerhook