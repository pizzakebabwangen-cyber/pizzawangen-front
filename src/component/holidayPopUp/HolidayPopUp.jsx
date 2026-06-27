/* eslint-disable react/prop-types */
import "./HolidayPopUp.css"
import Logo from "../../assets/85a30340-f824-4e4a-b2a5-c5d808affecc.png";
const HolidayPopUp = ({
  open,
  pausetyp,
  handleCancelPause,
  pausetill,
  pausefrom,
}) => {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleCancelPause();
    }
  };
  return (
    <>
      {open && (
        <div className="backdrop" onClick={handleBackdropClick}>
          <div className="pause-modal">
            <div className="modal-header">
              <span>kurze Pause!</span>
              <button className="close-btn" onClick={handleCancelPause}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="image">
                <h2>{pausetyp == 1 ? "Liebe Gäste..." : "Sorry..."}</h2>
                <img
                  src={Logo}
                  alt="Wangen Pizza Kebab Logo"
                  className="logo"
                />
              </div>
              {pausetyp == 1 && (
                <>
                  <p
                    style={{
                      color: "blue",
                      textAlign: "start",
                      fontSize: "1rem",
                    }}
                  >
                    {" "}
                    Wir haben von :
                  </p>
                  <br />
                  <p
                    style={{
                      color: "blue",
                      textAlign: "start",
                      marginTop: "-30px",
                      fontSize: "1rem",
                    }}
                  >
                    {pausefrom} bis:{pausetill} geschlossen
                  </p>
                </>
              )}
              {pausetyp == 1 ? (
                <p style={{ textAlign: "start",fontSize:"1rem" }}>vielen Dank</p>
              ) : (
                <p style={{ textAlign: "center",fontSize:"1rem" }}>
                  Zur Zeit keine Bestellung möglich!
                </p>
              )}

              <button className="ok-btn" onClick={handleCancelPause}>
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HolidayPopUp