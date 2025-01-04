import React, { useState } from 'react';
import "./registration.css"; // Import the CSS file with the styles

const UserRegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNo: '',
    email: '',
    confirmPassword: '',
    password: '',
    aadharNo: '',
    panCardNo: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/userRegister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful', result);
      } else {
        console.error('Registration failed', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="Registration-container">  {/* Updated class name */}
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name:</label>
          <input
            type="text"
            name="fullName"
            className="form-control"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Mobile No:</label>
          <input
            type="text"
            name="mobileNo"
            className="form-control"
            value={formData.mobileNo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password:</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Aadhar No:</label>
          <input
            type="text"
            name="aadharNo"
            className="form-control"
            value={formData.aadharNo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">PAN Card No:</label>
          <input
            type="text"
            name="panCardNo"
            className="form-control"
            value={formData.panCardNo}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="Login-btn-primary">Register</button>
      </form>
    </div>
  );
};

export default UserRegisterForm;
