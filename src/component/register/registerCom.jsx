import { Toaster } from "react-hot-toast";
import "./registerCom.css";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import useRegister from "../../hook/useRegister";
import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Define schema
const registerSchema = z
.object({
fullName: z.string().min(3, "Der vollständige Name muss mindestens 3 Zeichen lang sein"),
phoneNumber: z
.string()
.regex(/^[0-9]{10,15}$/, "Die Telefonnummer muss 10–15 Ziffern lang sein"),
email: z.string().email("Ungültige E-Mail-Adresse"),
password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein"),
ConfirmPassword: z.string().min(6, "Bestätigen Sie Ihr Passwort"),
street: z.string().min(1, "Strasse ist erforderlich"),
city: z.string().min(1, "Ort ist erforderlich"),
postBox: z.string().min(1, "Postfach ist erforderlich"),
})
  .refine((data) => data.password === data.ConfirmPassword, {
    path: ["ConfirmPassword"],
    message: "Passwords do not match",
  });


function RegisterCom() {
  const [isRegistered, setIsRegistered] = useState(false);
  const { error, getRegister, loading } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const res = await getRegister(data);
    if (res) {
      setIsRegistered(true);
    }
  };



  return (
    <div className="register">
      {!isRegistered && (
        <>
          <h1 className="Page-name">Registrieren</h1>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName"> Name</label>
              <input type="text" id="fullName" {...register("fullName")} />
              {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phoneNumber">Telefonnummer</label>
              <input type="tel" id="phoneNumber" {...register("phoneNumber")} />
              {errors.phoneNumber && <p className="error-message">{errors.phoneNumber.message}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">E-Mail</label>
              <input type="email" id="email" {...register("email")} />
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Passwort</label>
              <input type="password" id="password" {...register("password")} />
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="ConfirmPassword">Passwort bestätigen</label>
              <input
                type="password"
                id="ConfirmPassword"
                {...register("ConfirmPassword")}
              />
          
                {errors.ConfirmPassword && (
                <p className="error-message">{errors.ConfirmPassword.message}</p>
                )}
      
            </div>

            {/* Street */}
            <div className="form-group">
              <label htmlFor="street">Strasse</label>
              <input type="text" id="street" {...register("street")} />
              {errors.street && <p className="error-message">{errors.street.message}</p>}
            </div>

           

            {/* City */}
            <div className="form-group">
              <label htmlFor="city">Stadt</label>
              <input type="text" id="city" {...register("city")} />
              {errors.city && <p className="error-message">{errors.city.message}</p>}
            </div>

            {/* Post Box */}
            <div className="form-group">
              <label htmlFor="postBox">Briefkasten</label>
              <input type="text" id="postBox" {...register("postBox")} />
              {errors.postBox && <p className="error-message">{errors.postBox.message}</p>}
            </div>

            <button
              type="submit"
              className={`${loading ? "loading-button" : ""}`}
            >
              {loading ? "Wait ..." : "Weiter..."}
            </button>
          </form>

          <div className="returnF">
            <Link to={"/Login"}>
              <h4 className="return">
                <span>Anmeldeseite </span>
              </h4>
            </Link>
            <Link to={"/"}>
              <h4 className="return">
                 <span> Startseite  </span>
              </h4>
            </Link>
          </div>

          <Toaster position="top-center" reverseOrder={false} />
        </>
      )}

      {isRegistered && (
        <div className="verification-container">
          <div className="content">
            <h2 className="verification-title">Vielen Dank!</h2>
            <p className="verification-message">
              Ihre Registrierung war erfolgreich.
            </p>
            <Link to={"/Login"}>
              <h4 className="return">
                <span>Weiter... </span>
              </h4>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterCom;
