import React, { useEffect } from "react";
import ConsultabtTabel from  "./consultabtTable";
import "./consultant.css";
import { useNavigate } from "react-router-dom";

const Consultant = () => {

  const navigate = useNavigate();
   // Check if the token exists in localStorage
   useEffect(() => {
    if (localStorage.getItem("token") === null) {
      // Redirect to "/"
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="main-table m-4">
      <ConsultabtTabel />
    </div>
  );
};

export default Consultant;
