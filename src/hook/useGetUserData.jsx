import { useState } from "react"
import AuthService from "../Services/AuthService"
import { useDispatch, useSelector } from "react-redux"
import { setUserData } from "../reduxTool/AuthSlice"
const useGetUserData = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const {userData} = useSelector((state) => state.auth)
    const getUserData = async () => {
        try {
            setLoading(true);
            const USER_ID=localStorage.getItem("USER_ID");
            const res = await AuthService.getUserData(USER_ID);
            if (res) {
                setLoading(false);
                dispatch(setUserData(res.data.record))
            }
        } catch (error) {
            setError(error)
            setLoading(false)

        }
    }



    return {
        userData,
        loading,
        error,
        getUserData
    }
}

export default useGetUserData
