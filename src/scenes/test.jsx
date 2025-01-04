import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
      phone_number: phone,
      password: password
    };

    try {
      const response = await axios.post('https://api.fiind.app/api/v1/store/auth/login', loginData);
      if (response.data.success) {
        const { access_token, profile } = response.data.data[0];
        // Save the token or user details for future use
        setUserData({
          token: access_token,
          profile
        });
        setErrorMessage('');
      } else {
        setErrorMessage('Invalid login credentials');
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {userData && (
        <div className="user-details">
          <h3>User Profile</h3>
          <p>Name: {userData.profile.name}</p>
          <p>Email: {userData.profile.email}</p>
          <p>Phone: {userData.profile.phone_number}</p>
          <p>Website: {userData.profile.website}</p>
          {/* <img
            src={`${response.data.data[0].image_base_url}${userData.profile.image}`}
            alt="Profile"
          /> */}
          {/* You can display other details like schedules, categories, etc. */}
        </div>
      )}
    </div>
  );
};

export default Login;
