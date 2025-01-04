import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState(''); // success or danger
  const history = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/user/forgotpassword`, { email });
      console.log('Response:', response.data);
      setMessage('Password reset link sent successfully.');
      setVariant('success');
      setTimeout(() => {
        setMessage('');
        history('/otpvalidate');
      }, 3000); // Display the message for 3 seconds
    } catch (error) {
      console.error('Error sending password reset link:', error);
      setMessage('Error sending password reset link. Please try again.');
      setVariant('danger');
      setTimeout(() => {
        setMessage('');
      }, 3000); // Display the message for 3 seconds
    }
  };

  return (
    <Container className="forgot-password-container">
      <Row className="justify-content-md-center">
        <Col md="4">
          <h2 className="text-center">Forgot Password</h2>
          <Form onSubmit={handleSubmit} className="forgot-password-form">
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="forgot-password-button" block>
              Send Reset Link
            </Button>
            {message && <Alert variant={variant} className="mt-3">{message}</Alert>}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
