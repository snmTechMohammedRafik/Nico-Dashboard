import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginForm.css"; // Import custom CSS

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/user/login`,
        formData
      );
      console.log("Login successful", response.data);

      if (response.data.statusCode === 200) {
        setIsLoginSuccessful(true);

        if (response.data.data && response.data.data.token) {
          localStorage.setItem("token", response.data.data.token);
          localStorage.setItem("userRole", response.data.data.Role);
          localStorage.setItem("userId", response.data.data.userId);
          updateFirebaseToken();
        }

        // Show success toast with green color and red progress bar
        toast.success(response.data.data.message || "Login successful", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false, // Show progress bar
          className: "toast-success", // Custom class for green background
          progressStyle: { backgroundColor: "green" }, // Red progress bar
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        // Show error toast if login fails with red progress bar
        toast.error("Login failed. Please check your credentials and try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false, // Show progress bar
          progressStyle: { backgroundColor: "red" }, // Red progress bar
        });
      }
    } catch (error) {
      console.error("Login error", error);

      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        "Login failed. Please check your credentials and try again.";

      // Show error toast for catch block errors with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
    }
  };

  const updateFirebaseToken = async () => {
    const userId = localStorage.getItem("userId");
    const fireBaseToken = localStorage.getItem("firebaseToken");
    const token = localStorage.getItem("token");

    if (userId && fireBaseToken) {
      try {
        await axios.put(
          `${process.env.REACT_APP_URL}/notification/requesttoken`,
          {
            userId,
            fireBaseToken,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Firebase token updated successfully");
      } catch (error) {
        console.error("Error updating Firebase token", error);
      }
    }
  };

  return (
    <Container fluid className="LoginForm-container mt-5 p-5">
      <Row className="align-items-center justify-content-center g-0 mainraw">
        <Col md={6} className="book-image">
          <img src='../../assets/logo.png' alt="" className="book-image" />
        </Col>
        <Col md={6} className="form-side p-3">
          <h2 className="pt-3">Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="Login-btn-primary mt-3 mb-3"
            >
              Login
            </Button>
            <div className="text-center">
              <Link to="/forgotpassword" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
};

export default LoginForm;
