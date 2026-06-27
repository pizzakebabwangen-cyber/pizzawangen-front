// import React from 'react'

import { useLayoutEffect, useEffect } from "react";
import ContactForm from "../../component/ContactForm/ContactForm"
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";

const scrollToTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const Kontakt = () => {
  useLayoutEffect(() => scrollToTop(), []);

  useEffect(() => {
    const t1 = setTimeout(scrollToTop, 100);
    const t2 = setTimeout(scrollToTop, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div>
      <ContactForm />
      <Delivery />
      <Location />
    </div>
  );
}

export default Kontakt