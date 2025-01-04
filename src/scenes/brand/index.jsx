import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import Search from '../search';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const Brand = () => {
  const headers = [
    { key: 'srNo', displayName: 'Sr. No.' }, 
    { key: 'brandName', displayName: 'Brand Name' },
  ];
  const [pageSize, setPageSize] = useState(10); 
  const token = localStorage.getItem('token');
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    setCurrentPage(1); // Reset to the first page when search term changes
  
    // Debounce search to prevent too many API calls
    clearTimeout(window.debounceTimeout); // Clear previous timeout
    window.debounceTimeout = setTimeout(() => {
      fetchData(); // Fetch data after typing has stopped
    }, 500); // Delay of 500ms before calling fetchData
  };
  
  // Fetch data from the API
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/brand/list?search=${search}&page=${currentPage}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        setTableData(data.data);
        setTotalPages(data.totalPages); // Ensure total pages are updated
      } else {
        const errorData = await response.json(); // Parse JSON to get the error message
        if (errorData && errorData.message) {
          toast.error(errorData.message); // Show the error message from the API
        } else {
          toast.error("Failed to fetch data."); // Generic error message
        }
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    }
  };
  
  
  // Update useEffect to trigger on search change as well
  useEffect(() => {
    fetchData(); // Trigger fetch on search term change, page change, etc.
  }, [currentPage, token, pageSize, search]);
  
  


   // Check if the token exists in localStorage
   useEffect(() => {
    if (localStorage.getItem("token") === null) {
      // Redirect to "/"
      navigate("/");
    }
  }, [navigate]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const limitWords = (text) => text.length > 7 ? text.slice(0, 7) + ".." : text;

  const handleEdit = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/brand/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBrandName(data.data.brandName);
        setSelectedBrandId(id);
        setModalMode('edit');
        setShowModal(true);
      } else {
        const errorMessage = await response.text();
        toast.error(`Failed to fetch brand details: ${errorMessage}`);
      }
    } catch (error) {
      toast.error('Error fetching brand details. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/brand/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Brand deleted successfully!");
        fetchData(); // Refresh the table data
      } else {
        const errorMessage = await response.text();
        toast.error(`Error deleting brand: ${errorMessage}`);
      }
    } catch (error) {
      toast.error('Error deleting brand. Please try again.');
    }
  };

  const handleSaveBrand = async () => {
    try {
      const url = modalMode === 'create' 
        ? `${process.env.REACT_APP_URL}/brand/save?userId=1`
        : `${process.env.REACT_APP_URL}/brand/edit/${selectedBrandId}?userId=1`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ brandName }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowModal(false);
        setBrandName('');
        setSelectedBrandId(null);
        setModalMode('create');
        fetchData(); // Refresh the table
        toast.success(result.message || `Brand ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      } else {
        const errorMessage = await response.text();
        toast.error(`Error ${modalMode === 'create' ? 'creating' : 'updating'} brand: ${errorMessage}`);
      }
    } catch (error) {
      toast.error(`Error saving brand. Please try again.`);
    }
  };

  
  

  return (
    <div className='main-table m-4'>
      <ToastContainer />
      {/* <Row className="mb-3 m-2">
        <Col md={4}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control as="select">
            <option>hello</option>
          </Form.Control>
        </Col>
        <Col md={4}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control as="select">
            <option>Hello</option>
          </Form.Control>
        </Col>
      </Row>
      <hr style={{ color: "#000000" }} /> */}
      <Row className="mb-3 m-2 mt-5">
        <Col md={4}>
        <div className="filter-search-input-wrapper">
      <FaSearch className="filter-search-icon" />
      <Form.Control
        type="text"
        placeholder="Search"
        value={search}
        onChange={handleSearchChange} // Update search input
        className="filter-search-input"
      />
    </div>
        </Col>
        <Col md={6}></Col>
        <Col md={2}>
          <Button
            className='filterCreateButton'
            variant="primary"
            onClick={() => {
              setBrandName('');
              setModalMode('create');
              setShowModal(true);
            }}
          >
            Create Brand
          </Button>
        </Col>
      </Row>

      <div className="table-container">
        <Table striped bordered hover className="table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.key}>{header.displayName}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                row && row.brandId ? (
                  <tr key={row.brandId}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>
                      <span title={row.brandName}>
                        {limitWords(row.brandName || "N/A")}
                      </span>
                    </td>
                    <td>
                      <Button
                        className="action-button angelic-button"
                        variant="success"
                        onClick={() => handleEdit(row.brandId)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        className="action-button angelic-button"
                        variant="danger"
                        onClick={() => handleDelete(row.brandId)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ) : null
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1}>No data available</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div className="pagination-controls">
        <Button
          variant="primary"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="primary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
        <DropdownButton
          id="dropdown-page-size"
          title={`Page Size: ${pageSize}`}
          onSelect={(e) => {
            setPageSize(Number(e));
            setCurrentPage(1);
            fetchData(1); 
          }}
        >
          <Dropdown.Item eventKey={10}>10</Dropdown.Item>
          <Dropdown.Item eventKey={20}>20</Dropdown.Item>
          <Dropdown.Item eventKey={30}>30</Dropdown.Item>
          <Dropdown.Item eventKey={50}>50</Dropdown.Item>
          <Dropdown.Item eventKey={100}>100</Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Modal for creating or editing a brand */}
      <Modal show={showModal} onHide={() => setShowModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'create' ? 'Create Brand' : 'Edit Brand'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="brandName">
            <Form.Label>Brand Name</Form.Label>
            <Form.Control
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveBrand}>
            {modalMode === 'create' ? 'Save Brand' : 'Update Brand'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Brand;
