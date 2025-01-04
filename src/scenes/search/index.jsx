import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import './Search.css';

const Search = ({ setTableData, apiEndpoint }) => {
  const [search, setSearch] = useState('');
  const token = localStorage.getItem("token");

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(`${apiEndpoint}?search=${query}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const updatedData = response.data.data.map(item => ({
        ...item,
        createdByName: item.createdBy?.name || 'N/A'
      }));
      setTableData(updatedData);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  // Trigger search when search term changes
  useEffect(() => {
    if (search.trim() === '') {
      // Handle empty search term, if needed, to fetch all data
      handleSearch('');
    } else {
      handleSearch(search);
    }
  }, [search]);

  return (
    <div className="filter-search-input-wrapper">
      <FaSearch className="filter-search-icon" />
      <Form.Control
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-search-input"
      />
    </div>
  );
};

export default Search;
