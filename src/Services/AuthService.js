import { usePostData } from "../hooks/usePostDate";


const AuthService = {
        Register: async (userData) => {
                const res = await usePostData("/api/Auth/Register", userData)
                return res;
        },
        Login: async (userData) => {
                const res = await usePostData("/api/Auth/Login", userData)
                return res;
        },
        ForgetPassword: async (userData) => {
                const res = await usePostData(`/api/Auth/ForgetPassword/${encodeURIComponent(userData)}`)
                return res;
        },
        getUserData: async (userData) => {
                if (userData) {
                        const res = await usePostData(`/api/Auth/getAccountData/${userData}`)
                        return res;
                }
                return;
        }

}
export default AuthService;