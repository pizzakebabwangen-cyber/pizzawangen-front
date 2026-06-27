/* eslint-disable react/prop-types */
// import React from 'react'
import "./LabelCard.css";
const LabelCard = ({title,ImgSrc}) => {
  return (
    <div className="card-label">
      <img src={ImgSrc} alt="Profile Image" className="card-image" />
      <h4 className="card-title">{title}</h4>
    </div>
  );
};

export default LabelCard;
