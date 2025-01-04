import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Role from "./scenes/role";
import Product from "./scenes/product";
import Consumer from "./scenes/consumer";
import Inquiry from "./scenes/inquiry";
import User from "./scenes/user";
import Consultant from "./scenes/consultant";
import LoginForm from "./scenes/login";
import GenralFollowUp from "./scenes/genralFollowUp";
import ForgotPassword from "./scenes/ForgotPassword";
import OtpValidate from "./scenes/OtpValidate";
import NewPassword from "./scenes/NewPassword";
import ConsumerTable from "./scenes/consumer/consumerTable";
import Brand from "./scenes/brand";
import DropdownWithInfiniteScroll from "./scenes/test";
import InquiryDetails from "./scenes/inquiry/InquiryDetails";
import AnalyticsPage from "./scenes/dashboard/AnalyticsCharts";
import Login from "./scenes/test";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getPageName = (pathname) => {
    switch (pathname.toLowerCase()) {
      case "/dashboard":
        return "DASHBOARD";
      case "/inquiry":
        return "INQUIRY";
      case "/role":
        return "ROLE";
      case "/product":
        return "PRODUCT";
      case "/user":
        return "USER";
      case "/consumer":
        return "CONSUMER";
      case "/consultant":
        return "CONSULTANT";
      case "/genralfollowup":
        return "GENRAL FOLLOW UP";
      case "/forgotpassword":
        return "FORGOT PASSWORD";
      case "/otpvalidate":
        return "OTP VALIDATE";
      case "/newpassword":
        return "NEW PASSWORD";
      default:
        return "LOGIN";
    }
  };

  // Hide only the Topbar for certain routes like "/inquiry/:id"
  const shouldHideTopbar = location.pathname.startsWith("/inquiry/");

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {/* Sidebar remains visible on all pages */}
          {location.pathname !== "/" && (
            <Sidebar
              isSidebar={isSidebar}
              onToggle={() => setIsSidebar(!isSidebar)}
              className={isSidebar ? "expanded" : "collapsed"}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          )}
          <main
            className={`content ${
              location.pathname !== "/"
                ? isSidebar
                  ? ""
                  : "shifted"
                : ""
            }`}
          >
            {/* Hide Topbar only on specific routes */}
            {!shouldHideTopbar && location.pathname !== "/" && (
              <Topbar
                setIsSidebar={setIsSidebar}
                name={getPageName(location.pathname)}
              />
            )}
            <Routes>
              <Route
                path="/"
                element={token ? <Navigate to="/dashboard" /> : <LoginForm />}
              />
              <Route
                path="/dashboard"
                element={token ? <Dashboard /> : <Navigate to="/" />}
              />
              <Route
                path="/inquiry"
                element={
                  token ? (
                    <Inquiry isCollapsed={isCollapsed} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/role"
                element={
                  token && userRole !== "USER" ? <Role /> : <Navigate to="/" />
                }
              />
              <Route
                path="/product"
                element={token ? <Product /> : <Navigate to="/" />}
              />
              <Route
                path="/user"
                element={
                  token && userRole !== "USER" ? <User /> : <Navigate to="/" />
                }
              />
              <Route
                path="/consumer"
                element={token ? <Consumer /> : <Navigate to="/" />}
              />
              <Route
                path="/consultant"
                element={token ? <Consultant /> : <Navigate to="/" />}
              />
              <Route
                path="/genralFollowUp"
                element={token ? <GenralFollowUp /> : <Navigate to="/" />}
              />
              <Route
                path="/brand"
                element={token ? <Brand /> : <Navigate to="/" />}
              />
              <Route
                path="/inquiry/:id"
                element={<InquiryDetails />}
              />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/otpvalidate" element={<OtpValidate />} />
              <Route path="/newpassword" element={<NewPassword />} />
              <Route path="/test" element={<Login />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
