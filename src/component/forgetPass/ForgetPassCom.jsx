
import { Toaster } from "react-hot-toast"
import "./ForgetPassCom.css"
import { Link } from "react-router-dom"
import ForgetPasshook from "../../hook/forgetPasshook"
import { useForm } from "react-hook-form"
import useForgetPassword from "../../hook/useForgetPassword";
function ForgetPassCom() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()
    const { error, getForgetPassword, loading, isSuccess, message } = useForgetPassword()
    const onSubmit = async (data) => {
        const res = await getForgetPassword(data.email)
    }
    return (
        <div className="login">
            {
                isSuccess &&
                <div className="verification-container">
                    <div className="content">
                        <p className="verification-message">
                            {message}
                        </p>s
                        <Link to={"/Login"}>
                            <h4 className="return">
                                <span>Weiter...</span>
                            </h4>
                        </Link>
                    </div>
                </div>

            }
            {!isSuccess &&
                <>
                    <h1 className="Page-name">Passwort vergessen? </h1>
                    <form className="form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="username">E-Mail-Adresse: </label>
                            <input
                                type="email" id="username" name="username" required    {...register("email")} />
                        </div>
                        <button type="submit" className={`${loading ? "loading-button" : ""}`}> {loading ? "Wait ..." : "Weiter..."}</button>
                    </form>
                    <div className="returnF">
                        <Link to={"/Login"}> <h4 className="return"> <span>Neu anmelden</span> </h4></Link>
                        <Link to={"/"}> <h4 className="return">  <span>  Startseite </span></h4></Link>
                    </div>

                    <Toaster
                        position="top-center"
                        reverseOrder={false}
                    /></>}
        </div>

    )
}

export default ForgetPassCom