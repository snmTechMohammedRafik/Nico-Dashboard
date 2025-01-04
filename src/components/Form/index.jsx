import React, { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CreateInquiryForm.css';

const CommonForm = () => {
  const [formData, setFormData] = useState({
    projectName: '',
    customer: '',
    product: '',
    consultant: '',
    followUp: '',
    quotation: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.projectName) newErrors.projectName = 'Project name is required';
    // Add more validation as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form data:', formData);
      // Handle form submission
    }
  };

  return (
    <div className="form-container">
      {/* <h3 style={{ backgroundColor: '#4B49AC'}}>Create The Inquiry</h3> */}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formProjectName">
          <Form.Label>Project Name*</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Project name"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            isInvalid={!!errors.projectName}
          />
          <Form.Control.Feedback type="invalid">
            {errors.projectName}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">Write the project name properly</Form.Text>
        </Form.Group>

        <Form.Group controlId="formCustomer">
          <Form.Label>Customer*</Form.Label>
          <Form.Control as="select" name="customer" value={formData.customer} onChange={handleChange}>
            <option>Please Select</option>
            {/* Add customer options here */}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formProduct">
          <Form.Label>Product*</Form.Label>
          <Form.Control as="select" name="product" value={formData.product} onChange={handleChange}>
            <option>Please Select</option>
            {/* Add product options here */}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formConsultant">
          <Form.Label>Consultant*</Form.Label>
          <Form.Control as="select" name="consultant" value={formData.consultant} onChange={handleChange}>
            <option>Please Select</option>
            {/* Add consultant options here */}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formFollowUp">
          <Form.Label>Assignment inquiry follow up</Form.Label>
          <Form.Control as="select" name="followUp" value={formData.followUp} onChange={handleChange}>
            <option>Please Select</option>
            {/* Add follow up options here */}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formQuotation">
          <Form.Label>Assignment inquiry report quotation</Form.Label>
          <Form.Control as="select" name="quotation" value={formData.quotation} onChange={handleChange}>
            <option>Please Select</option>
            {/* Add quotation options here */}
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Create Inquiry
        </Button>
      </Form>
    </div>
  );
};

export default CommonForm;
