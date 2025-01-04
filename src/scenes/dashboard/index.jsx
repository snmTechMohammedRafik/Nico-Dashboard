import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import PieImg from "../../assets/pie.png";
import Calendar from "../calendar/calendar";
import { Container, Row, Col } from "react-bootstrap";
import ReminderTable from "./DashBoardTable";
import DashboardCard from "./DashboardCard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const userRole = localStorage.getItem("userRole");

  const navigate = useNavigate();

   // Check if the token exists in localStorage
   useEffect(() => {
    if (localStorage.getItem("token") === null) {
      // Redirect to "/"
      navigate("/");
    }
  }, [navigate]);

  // Handler for clicking on the "Analytics" box
  const handleAnalyticsClick = () => {
    navigate("/analytics");
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={12} md={8} className="left-column">
          <DashboardCard />
          <ReminderTable />
        </Col>
        <Col xs={12} md={4} className="right-column">
          <Box className="right-box mb-5">
            {userRole !== "USER" && (
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  backgroundColor: "#4B49AC",
                  height: "169px",
                  marginBottom: "16px",
                }}
              >
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight="600"
                    style={{ color: "#fff" }}
                  >
                    {localStorage.getItem("totalUser")}
                  </Typography>
                  <Typography style={{ color: "#fff" }} variant="h4">
                    Total User
                  </Typography>
                </Box>
              </Box>
            )}
            {/* Analytics Box with onClick handler */}
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                backgroundColor: "#01A0E2",
                height: "167px",
                position: "relative",
                cursor: "pointer",
              }}
              onClick={handleAnalyticsClick}
            >
              <Container>
                <Row>
                  <Col md={6}>
                    <Box>
                      <Typography
                        variant="h3"
                        fontWeight="700"
                        style={{ color: "#fff" }}
                      >
                        Analytics
                      </Typography>
                    </Box>
                  </Col>
                  <Col md={6}>
                    <img
                      src={PieImg}
                      alt="pie"
                      style={{
                        width: "75px",
                        height: "75px",
                        position: "absolute",
                        top: "50%",
                        right: "10%",
                        transform: "translateY(-50%)",
                      }}
                    />
                  </Col>
                </Row>
              </Container>
            </Box>
          </Box>
          <Calendar />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
