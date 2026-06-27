import toast, { Toaster } from "react-hot-toast";
import "./LoginCom.css";
import { Link, useNavigate } from "react-router-dom";
import Loginhook from "../../hook/loginhook";
import { useForm } from "react-hook-form";
import useLogin from "../../hook/useLogin";

function LoginCom() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { getLogin, loading } = useLogin()
  const onSubmit = async (data) => {
    const res = await getLogin(data)
    if (res) {
      toast.success(res?.data?.message, {
        duration: 5000,
        position: "bottom-center"
      })

      navigate("/")
    }
  }

  return (
    <div className="login">
      <h1 className="Page-name">Login</h1>
<p className="login-text">Bitte geben Sie Ihre Anmeldedaten ein:</p>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Ihre E-Mail-Adresse:</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            {...register("email")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Ihr Passwort:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            {...register("password")}
          />
        </div>
        <div className="form-group login-remember-row">
          <label className="login-remember-label" htmlFor="rememberMe">
            <input type="checkbox" id="rememberMe" {...register("rememberMe")} />
            <span>angemeldet bleiben</span>
          </label>
        </div>
        <button type="submit" className={`${loading ? "loading-button" : ""}`}> {loading ? "Wait ..." : "anmelden »"}</button>
      </form>
      <div className="returnF">
        <Link to={"/forgetPass"}>
          {" "}
          <h4 className="return">
            Passwort <span>vergessen?</span>{" "}
          </h4>
        </Link>
        <Link to={"/register"}>
          {" "}
          <h4 className="return">
            Noch <span>kein Konto?</span>{" "}
          </h4>
        </Link>
        <Link to={"/"}>
          {" "}
          <h4 className="return">
            Startseite <span>öffnen? </span>
          </h4>
        </Link>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default LoginCom;
