import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './NewPassword.css';

const NewPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState(''); // success or danger
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      setFormData((prevData) => ({ ...prevData, email }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear password error when typing in password fields
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/user/updatePasswordAfterOtpValidation`, {
        email: formData.email,
        password: formData.password
      });
      setMessage('Password updated successfully.');
      setVariant('success');
      setTimeout(() => {
        navigate('/'); // Redirect to home page after 2 seconds
      }, 2000);
    } catch (error) {
      setMessage('Error updating password. Please try again.');
      setVariant('danger');
      console.error('Error updating password:', error);
    }
  };

  return (
    <Container className="new-password-container">
      <Row className="justify-content-md-center">
        <Col md="4">
          <Form onSubmit={handleSubmit} className="new-password-form">
            <h2 className="text-center">Enter New Password</h2>
            <Form.Group controlId="formPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {passwordError && <Alert variant="danger">{passwordError}</Alert>}
            <Button variant="primary" type="submit" className="new-password-button" block>
              Update Password
            </Button>
            {message && <Alert variant={variant} className="mt-3">{message}</Alert>}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default NewPassword;
