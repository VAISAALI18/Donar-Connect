import React, { useState } from 'react';
import './GetBlood.css'; // Import the CSS for styling
import axios from 'axios'; // Import axios for making HTTP requests

const GetBlood = () => {
  const [formData, setFormData] = useState({
    pincode: '',
    bloodType: '',
  });
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pincode || !formData.bloodType) {
      setErrors('Pincode and Blood Type are required');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5014/api/search', {
        params: {
          pincode: formData.pincode,
          bloodType: formData.bloodType,
        },
      });

      if (response.status === 200) {
        setResults(response.data);
      } else {
        setErrors('No matching donations found');
      }
    } catch (error) {
      console.error('Error searching donations:', error);
      setErrors('An error occurred while searching for donations.');
    }
  };

  return (
    <div>
      <h1>Get Blood</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Pincode:
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Blood Type:
          <select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </label>
        <br />
        <button type="submit">Search</button>
      </form>

      {errors && <p style={{ color: 'red' }}>{errors}</p>}

      <h2>Search Results:</h2>
      {results.length > 0 ? (
        <ul>
          {results.map((donation) => (
            <li key={donation._id}>
              <div>Name: {donation.name}</div>
              <div>Blood Type: {donation.bloodType}</div>
              
              <div>Units: {donation.units}</div>
              <div>Phone: {donation.phone}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default GetBlood;
