// import React from 'react'

import CheckOutForm from "../../component/CheckOutForm/CheckOutForm"
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";

const CheckOut = () => {
  return (
    <div>
      <CheckOutForm />
      <Delivery />
      <Location />
    </div>
  );
}

export default CheckOut