import { Toaster } from "react-hot-toast";
import "./ResetPassCom.css";
import ResetPasshook from "../../hook/resetPasshook";
import { Link } from "react-router-dom";

function ResetPassCom() {
  const [
    getRegisterInfo,
    setPassword,
    setConfirmPassword,
    SendResetPass,
  ] = ResetPasshook();

  return (
    <div className="register">
      <h1 className="Page-name">Reset Password</h1>
      <form className="form" onSubmit={SendResetPass}>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            onChange={getRegisterInfo(setPassword)}
            type="password"
            id="password"
            name="password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            onChange={getRegisterInfo(setConfirmPassword)}
            type="password"
            id="confirm-password"
            name="confirm-password"
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      <div className="returnF">
        <Link to={"/"}>
          {" "}
          <h4 className="return">
            return to <span> Home page</span>
          </h4>
        </Link>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default ResetPassCom;
