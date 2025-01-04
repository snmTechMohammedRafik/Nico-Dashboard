import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import './OtpValidate.css';

const OtpValidate = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState(''); // success or danger
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/user/otpvalidate`, formData);
      setMessage('OTP validated successfully.');
      setVariant('success');
      localStorage.setItem('email', formData.email);
      navigate('/newpassword');
    } catch (error) {
      setMessage('Error validating OTP. Please try again.');
      setVariant('danger');
      console.error('Error validating OTP:', error);
    }
  };

  return (
    <Container className="otp-validate-container">
      <Row className="justify-content-md-center">
        <Col md="4">
          <Form onSubmit={handleSubmit} className="otp-validate-form">
            <h2 className="text-center">OTP Validation</h2>
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
            <Form.Group controlId="formOtp">
              <Form.Label>OTP</Form.Label>
              <Form.Control
                type="number"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="otp-validate-button" block>
              Validate OTP
            </Button>
            {message && <Alert variant={variant} className="mt-3">{message}</Alert>}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default OtpValidate;
