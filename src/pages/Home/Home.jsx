import { useEffect } from "react";
import DeliveryMethod from "../../component/DeliveryMethod/DeliveryMethod";
import Slider from "../../component/Slider/Slider";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
import About from "../../component/About/About";
import DailyProduct from "../../component/DailyProduct/DailyProduct";
import Sign from "../../component/Sign/Sign";
import Paner2 from "../../component/Paner2/Paner2";
import Paner from "../../component/Paner/Paner";
import Garage from "../../component/Garage/Garage";

const Home = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="home">
      <DeliveryMethod />
      <Slider />
      <About />
      <DailyProduct />
      <Sign />
      <Paner2 />
      <Paner />
      <Garage />
      <Delivery />
      <Location />
    </div>
  );
};

export default Home;
