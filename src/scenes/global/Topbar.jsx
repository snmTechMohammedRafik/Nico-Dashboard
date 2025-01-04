import React, { useEffect, useState } from 'react';
import { Box, IconButton, Badge } from "@mui/material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { Logout, Notifications } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import "./topbar.css";

const Topbar = ({ name }) => {
  const userId = localStorage.getItem('userId'); // Get the user ID
  const token = localStorage.getItem('token'); // Get the auth token from localStorage
  const navigate = useNavigate(); // Initialize useNavigate
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [unreadCount, setUnreadCount] = useState(0); // State for unread notification count

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/user/dashboard/data?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
            },
          }
        );
        
        // Log notifications data
        // console.log("noti", response.data.data.notifications);
        
        const notificationsData = response.data.data.notifications;
        setNotifications(notificationsData);

        // Calculate unread notifications
        const unread = notificationsData.filter(notification => !notification.read).length;
        setUnreadCount(unread); // Set unread notifications count
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (userId && token) {
      fetchNotifications(); // Only fetch notifications if userId and token are available
    }
  }, [userId, token]);

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();

    // Redirect to the login page
    navigate('/');
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* NAME */}
      <Box display="flex" borderRadius="3px">
        <h3 style={{ color: "black" }}>{name}</h3>
      </Box>

      {/* ICONS */}
      <Box display="flex" alignItems="center">
      <div className="notification-container">
      <FontAwesomeIcon icon={faBell} className="notification-bell" />
      <span className="notification-count">{notifications}</span> {/* Static count */}
    </div>

        <IconButton>
          <PersonOutlinedIcon
            sx={{
              color: "black",
              backgroundColor: "#DFDFDF",
              borderRadius: "50%",
              fontSize: "40px",
              padding: "10px",
            }}
          />
        </IconButton>

        <IconButton onClick={handleLogout}>
          <Logout
            sx={{
              color: "white",
              backgroundColor: "#4B49AC",
              borderRadius: "50%",
              fontSize: "40px",
              padding: "10px",
            }}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
