import React from 'react'
import "./Modal.css"
const Modal = ({message, nonBlocking = false}) => {
  return (
    <div className={`modalForBusy ${nonBlocking ? "modalForBusy--nonBlocking" : ""}`}>
      <div className="modal-content">
        <h2>Entschuldigung!</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
  {message}
</p>

      </div>
    </div>
  );
}

export default Modal
