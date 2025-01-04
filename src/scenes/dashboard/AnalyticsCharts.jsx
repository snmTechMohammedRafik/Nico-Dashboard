import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Row, Form } from "react-bootstrap";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";
import Select from "react-select"; // Import the react-select component for a better dropdown experience

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
  const [barData, setBarData] = useState(null); // Initially null to check later if data is available
  const [pieData, setPieData] = useState(null); // Initially null to check later if data is available
  const [loading, setLoading] = useState(false); // Set loading to false initially
  const [users, setUsers] = useState([]); // State to store the users list
  const [selectedUser, setSelectedUser] = useState(null); // State to store the selected user
  const [searchTerm, setSearchTerm] = useState(""); // State to track search input for users

  const navigate = useNavigate();

  // Fetch users for the dropdown
  const fetchUsers = async (searchQuery = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_URL}/user/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchQuery }, // Add search parameter to API request
      });
      const userList = response.data.data.list.map((user) => ({
        value: user.Id,
        label: user.name,
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch dashboard data based on the selected user
  const fetchDashboardData = async (userId) => {
    setLoading(true); // Start loading when fetching data
    try {
      const authToken = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/user/dashboard/data?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = response.data.data;

      // Bar chart: Display users-related data without notifications
      setBarData({
        labels: [
          "Active Users",
          "Completed Inquiries",
          "Ongoing Inquiries",
          "Reminders",
        ],
        datasets: [
          {
            label: "Dashboard Data",
            data: [
              data.activeUsersCount,
              data.completedInquiriesCount,
              data.ongoingInquiriesCount,
              data.remindersCount,
            ],
            backgroundColor: "#6A5ACD", // Background color
          },
        ],
      });

      // Pie chart: Display all the relevant data excluding notifications
      setPieData({
        labels: [
          "Active Users",
          "Completed Inquiries",
          "Ongoing Inquiries",
          "Reminders",
          "Unassigned Inquiries",
        ],
        datasets: [
          {
            label: "Dashboard Data Distribution",
            data: [
              data.activeUsersCount,
              data.completedInquiriesCount,
              data.ongoingInquiriesCount,
              data.remindersCount,
              data.unassignedInquiriesCount,
            ],
            backgroundColor: [
              "#FF6384", // Red
              "#36A2EB", // Blue
              "#FFCE56", // Yellow
              "#4BC0C0", // Green
              "#9966FF", // Purple
            ],
          },
        ],
      });

      setLoading(false); // Stop loading once data is fetched
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUserId = localStorage.getItem("userId"); // Get the currently logged-in user's ID from localStorage

    if (currentUserId) {
      setSelectedUser({ value: currentUserId, label: "Current User" }); // Set the current user as the default
      fetchDashboardData(currentUserId); // Fetch dashboard data for the current user
    }

    fetchUsers(); // Fetch the users when the component mounts
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchDashboardData(selectedUser.value); // Fetch dashboard data when a user is selected
    }
  }, [selectedUser]);

  // Handle input change in the search field for users
  const handleUserSearch = (inputValue) => {
    setSearchTerm(inputValue); // Track search term
    fetchUsers(inputValue); // Fetch users based on the search term
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid style={{ paddingTop: "30px" }}>
      <Button
        variant="primary"
        style={{
          marginBottom: "20px",
          backgroundColor: "#6A5ACD",
          border: "none",
        }}
        onClick={() => navigate(-1)} // Go back to the previous page
      >
        <BiArrowBack style={{ marginRight: "0px" }} /> {/* Icon with spacing */}
      </Button>

      {/* User Dropdown with Search Functionality */}
      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select User</Form.Label>
            <Select
              options={users}
              value={selectedUser}
              onChange={setSelectedUser}
              placeholder="Search and select a user..."
              onInputChange={handleUserSearch} // Call handleUserSearch on input change
              inputValue={searchTerm} // Set the current search term
              isClearable
              styles={{
                option: (provided) => ({
                  ...provided,
                  color: "black", // Set text color to black
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black", // Set single value text color to black
                }),
              }}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={6}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", // Soft shadow
              marginBottom: "20px",
            }}
          >
            {barData ? ( // Only render the chart if barData is available
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: "#6A5ACD", // Text color
                        font: { size: 16 },
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: "#333" }, // Darker text
                      grid: { display: false },
                    },
                    y: {
                      ticks: { color: "#333" }, // Darker text
                      grid: { color: "rgba(0, 0, 0, 0.05)" }, // Light grid lines
                    },
                  },
                }}
                style={{ height: "300px" }}
              />
            ) : (
              <div>No bar chart data available</div> // Fallback if no data
            )}
          </div>
        </Col>
        <Col md={6}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", // Soft shadow
              marginBottom: "20px",
            }}
          >
            {pieData ? ( // Only render the chart if pieData is available
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: "#6A5ACD", // Text color
                        font: { size: 16 },
                      },
                    },
                  },
                }}
                style={{ height: "300px" }}
              />
            ) : (
              <div>No pie chart data available</div> // Fallback if no data
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsPage;
