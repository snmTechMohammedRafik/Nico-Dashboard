import React, { useEffect } from "react";
import "./consumer.css";
import ConsumerTable from "./consumerTable";
import { useNavigate } from "react-router-dom";

const Consumer = () => {

  const navigate = useNavigate();
 // Check if the token exists in localStorage
 useEffect(() => {
  if (localStorage.getItem("token") === null) {
    // Redirect to "/"
    navigate("/");
  }
}, [navigate]);

  return (
    <>
    <div className="main-table m-4">
      <ConsumerTable />
      
    </div>
    </>
  );
};

export default Consumer;
