// import React from 'react'
import { useEffect, useState } from "react";
import "./DailyProduct.css";
import MealCard from "../MealCard/MealCard";
import useGetExtensionsData from "../../hooks/useGetExtensions";
import useGetCompanyData from "../../hooks/useGetCompanyData";

const DailyProduct = () => {

  const server = import.meta.env.VITE_SERVER;
  const [dailyProduct, setDailyProducts] = useState([]);
  const { extensionsData, getExtensionsData } = useGetExtensionsData();
  const { companyData, getCompanyData } = useGetCompanyData()
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${server}/api/Product/GetHomeProducts`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setDailyProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    getCompanyData()
    getExtensionsData()
  }, []);

  return (
    <div>
      <div className="dailyProduct container">
        <h1>
          <span>Produkte</span> für den täglichen Bedarf !
        </h1>
        <div className="cards">
          {dailyProduct.data &&
            dailyProduct?.data?.map((product) => {
              return <MealCard key={product.id} meal={product} companyData={companyData} extensionsData={extensionsData} />;
            })}
        </div>
      </div>
    </div>
  );
};

export default DailyProduct;
