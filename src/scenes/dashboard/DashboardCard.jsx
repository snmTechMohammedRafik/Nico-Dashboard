import { Box, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";
import CloseIcon from "@mui/icons-material/Close";
import AlarmIcon from "@mui/icons-material/Alarm";
import React, { useEffect, useState } from "react";
import axios from "axios";
import paginationFactory from "react-bootstrap-table2-paginator";
import { useNavigate } from "react-router-dom";

const DashboardCard = () => {
  const [inquiries, setInquiries] = useState(0); // Initialize to 0 for count
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const authToken = localStorage.getItem("token"); // Get the auth token
  const userId = localStorage.getItem("userId"); // Get the user ID
  const [activeUserCount, setActiveUserCount] = useState("");
  const [completedInquiriesCount, setCompletedInquiriesCount] = useState("");
  const [ongoingInquiriesCount, setOngoingInquiriesCount] = useState("");
  const [remindersCount, setRemindersCount] = useState("");
  const [rejectedInquiriesCount, setRejectedInquiriesCount] = useState("");
  const [assignInquary, setassignInquary] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  // Modify handleBoxClick to accept a status
  const handleBoxClick = (status) => {
    // Navigate with the specified status
    navigate("/inquiry", { state: { status } });
  };

  const iconStyle = {
    color: "#fff",
    fontSize: "40px",
    marginBottom: "10px",
    borderRadius: "21px",
    padding: "10px",
  };

  const fetchInquiries = async () => {
    setLoading(true); // Set loading to true before the API call
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/inquiry/totalinquiries`,
        {
          params: {
            userId: userId,
            isAdmin: false,
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log(">>>>>", response); // Log the response data
      // Access the total inquiries count
      setInquiries(response.data.data.totalInquiries); // Set the inquiries state to the count
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Set loading to false after the API call
    }
  };
  const dashboardDataFatch = async () => {
    // console.log("hello");
    const response = await axios.get(
      `${process.env.REACT_APP_URL}/user/dashboard/data?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log("log", response);
    const totalUser = response.data.data.totalUser;
    localStorage.setItem("totalUser", totalUser);
    setActiveUserCount(response.data.data.urgentInquiryCount);
    setCompletedInquiriesCount(response.data.data.purchaseInquiryCount);
    // setUnassignedInquiriesCount(response.data.data.unassignedInquiriesCount);
    setOngoingInquiriesCount(response.data.data.procurementInquiryCount);
    setRemindersCount(response.data.data.remindersCount);
    setRejectedInquiriesCount(response.data.data.tenderInquiryCount);
    // setassignInquary(response.data.data.tenderInquiryCount);
  };

  //hit this api
  //  GET:localhost:8084/generalFollowUp/getall?userId=3&search&page=1&size=5

  useEffect(() => {
    fetchInquiries();
    dashboardDataFatch();
  }, []);

  return (
    <Box>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography style={{ color: "red" }}>{error}</Typography>}
      <Box
        gridColumn="span 7"
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap="20px"
      >
        {/* First Box for Inquiries */}
        <Box
      onClick={() => handleBoxClick("UNASSIGNED")}
          style={{
            display: "flex",
            height: "100px",
            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <ChatIcon
            style={{
              ...iconStyle,
              backgroundColor: "#4747A1",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {inquiries} {/* This should now show the total inquiries count */}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              Unassign Inquiries
            </Typography>
          </Box>
        </Box>

        {/* Other Boxes (You can adjust these as needed) */}
        <Box
          onClick={() => handleBoxClick("PROCUREMENT")}
          style={{
            display: "flex",

            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <EmailIcon
            style={{
              ...iconStyle,
              backgroundColor: "#8A47A1",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {ongoingInquiriesCount}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              procurement Inquiries
            </Typography>
          </Box>
        </Box>

        <Box
          onClick={() => handleBoxClick("PURCHASE")}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <CheckCircleIcon
            style={{
              ...iconStyle,
              backgroundColor: "#7878E8",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {completedInquiriesCount}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              purchase Inquiries
            </Typography>
          </Box>
        </Box>

        <Box
          onClick={() => handleBoxClick("URGENT")}
          style={{
            display: "flex",
            height: "100px",
            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <PeopleIcon
            style={{
              ...iconStyle,
              backgroundColor: "#7878E8",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {activeUserCount}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              Urgent Inquiry
            </Typography>
          </Box>
        </Box>

        <Box
          onClick={() => handleBoxClick("TENDER")}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <CloseIcon
            style={{
              ...iconStyle,
              backgroundColor: "#F47880",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {rejectedInquiriesCount}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              tender Inquiries
            </Typography>
          </Box>
        </Box>

        <Box
        onClick={() => handleBoxClick("REMINDERS")}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <AlarmIcon
            style={{
              ...iconStyle,
              backgroundColor: "#7DA0FA",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {remindersCount}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              Reminders
            </Typography>
          </Box>
        </Box>

        <Box
        onClick={() => handleBoxClick("REJECTED")}
          style={{
            display: "flex",
            height: "100px",
            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <ChatIcon
            style={{
              ...iconStyle,
              backgroundColor: "#4747A1",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {inquiries} {/* This should now show the total inquiries count */}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              Rejected Inquiries
            </Typography>
          </Box>
        </Box>

        <Box
        onClick={() => handleBoxClick("ASSIGN")}
          style={{
            display: "flex",
            height: "100px",
            alignItems: "center",
            border: "1px solid #8A47A1",
            ...iconStyle,
          }}
        >
          <ChatIcon
            style={{
              ...iconStyle,
              backgroundColor: "#4747A1",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              style={{ color: "#000000" }}
            >
              {assignInquary} {/* This should now show the total inquiries count */}
            </Typography>
            <Typography
              style={{
                color: "#717171",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              Assign Inquiries
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardCard;
