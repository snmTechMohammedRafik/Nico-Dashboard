import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Row, Col, Alert, Dropdown ,DropdownButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
faEdit,
faTrash,
faUserCheck,
faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ConsultantTable = () => {
  const headers = [
    { key: "srNo", displayName: "Sr No" }, // Add Sr No column
    { key: "consultantName", displayName: "Consultant Name" },
    { key: "contactNumber", displayName: "Contact Number" },
    { key: "contactPerson", displayName: "Contact Person" },
    { key: "createdAt", displayName: "Created At" },
    { key: "updatedAt", displayName: "Updated At" },
    { key: "createdBy.name", displayName: "Created By" }
  ];
  
  const [pageSize, setPageSize] = useState(10); // Default page size is 10
  const token = localStorage.getItem("token");
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [formData, setFormData] = useState({
    consultantName: '',
    contactPerson: '',
    contactNumber: ''
  });
  const [editingId, setEditingId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState('');
const [messageType, setMessageType] = useState(''); // 'success' or 'error'


  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleShow = () => setShowModal(true);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/consultant/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: currentPage,
          size: pageSize,
          search: search, // Pass search here
          filter1: filter1, // Pass filter1 here
          filter2: filter2, // Pass filter2 here
        },
      });
      console.log("API Response:", response);
      setData(Array.isArray(response.data.data.Consultants) ? response.data.data.Consultants : []);
      setTotalPages(response.data.data.totalPages || 1);
      setTotalRecords(response.data.data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, [currentPage, search, filter1, filter2 , pageSize]);

  const handleEdit = async (row) => {
    setEditingId(row.consultantId);

    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/consultant/get/${row.consultantId}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const consultant = response.data.data;
      
      setFormData({
        consultantName: consultant.consultantName || '',
        contactPerson: consultant.contactPerson || '',
        contactNumber: consultant.contactNumber || ''
      });

      handleShow();
    } catch (error) {
      console.error("Error fetching consultant details:", error);
      setErrorMessage("Failed to load consultant details.");
      
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_URL}/consultant/delete/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchData();
      setSuccessMessage("Consultant deleted successfully.");
       // Show success toast with green color and red progress bar
       toast.success("Consultant deleted successfully.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting data:", error);
      setErrorMessage("Failed to delete consultant.");
      // Show error toast if login fails with red progress bar
      toast.error("Failed to delete consultant.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
      // setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, ""); // Remove any non-digit characters
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const { consultantName, contactPerson, contactNumber } = formData;
  
    // Validation logic
    const newErrors = {};
    if (!consultantName) newErrors.consultantName = 'Consultant Name is required';
    if (!contactPerson) newErrors.contactPerson = 'Contact Person is required';
    if (!contactNumber) newErrors.contactNumber = 'Contact Number is required';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Don't hit the API if there are errors
    }
  
    const userId = localStorage.getItem('userId');
    const payload = { ...formData, createdBy: { id: userId } };
  
    try {
      let response;
      if (editingId) {
        response = await axios.put(`${process.env.REACT_APP_URL}/consultant/update/${editingId}`, payload ,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        response = await axios.post(`${process.env.REACT_APP_URL}/consultant/save`, payload,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      // setMessage(response.data.message || 'Operation successful');

      const successMessage = response.data.message || 'Operation successful';
       // Show success toast with green color and red progress bar
       toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });
      setMessageType('success');
      handleClose();
      setFormData({
        consultantName: '',
        contactPerson: '',
        contactNumber: ''
      });
      setErrors({}); // Clear errors
      fetchData();
    } catch (error) {
      const backendError = error.response?.data?.message || 'An error occurred';
      // setMessage(error.response?.data?.message || 'An error occurred');
      // Show error toast if login fails with red progress bar
      toast.error(backendError, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
      setMessageType('error');
    }
  
    // Hide the message after 3 seconds
    // setTimeout(() => {
    //   setMessage('');
    // }, 3000);
  };
  

const getValidationClass = (field) => {
  return errors[field] ? 'is-invalid' : '';
};

const limitWords = (text) => {
  return text.length > 7 ? text.slice(0, 7) + ".." : text;
};
  

  return (
    <>
      {/* <Row className="mb-3 m-2">
        <Col md={2}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control as="select" value={filter1} onChange={(e) => setFilter1(e.target.value)}>
            <option value="">Select</option>
            <option value="filter1Option1">Option 1</option>
            <option value="filter1Option2">Option 2</option>
          </Form.Control>
        </Col>
        <Col md={2}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control as="select" value={filter2} onChange={(e) => setFilter2(e.target.value)}>
            <option value="">Select</option>
            <option value="filter2Option1">Option 1</option>
            <option value="filter2Option2">Option 2</option>
          </Form.Control>
        </Col>
      </Row> */}
      <Row className="mb-3 m-2 mt-5">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
        </Col>
        <Col md={6}></Col>
        <Col md={2}>
          <Button className='filterCreateButton' variant="primary" onClick={() => {
            setEditingId(null); // Reset editingId when creating a new entry
            setFormData({
              consultantName: '',
              contactPerson: '',
              contactNumber: ''
            });
            handleShow();
          }}>
            Create Consult
          </Button>
        </Col>
      </Row>

      {/* Display Success or Error Messages */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <>
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
            {data && data.map((row, index) => (
    <tr key={index}>
      {headers.map((header) => (
        <td key={header.key}>
          <span title={row[header.key] || "N/A"}>
            {header.key === "srNo"
              ? (currentPage - 1) * 10 + index + 1 // Calculate Sr No based on pagination
              : header.key === "createdBy.name"
              ? row.createdBy?.name || "N/A"
              : limitWords(row[header.key] || "N/A")}
          </span>
        </td>
      ))}
      <td>
        <Button className="action-button angelic-button" variant="success" onClick={() => handleEdit(row)}><FontAwesomeIcon icon={faEdit} /></Button>
        <Button className="action-button angelic-button" variant="danger" onClick={() => handleDelete(row.consultantId)}><FontAwesomeIcon icon={faTrash} /></Button>
      </td>
    </tr>
  ))}
</tbody>
          </Table>
        </div>

        <div className="pagination-controls">
      <Row className="align-items-center">
        {/* Total Records */}
        <Col xs={12} md={3} className="mb-2">
          <h5>Total Records: {totalRecords}</h5>
        </Col>

        {/* Previous and Next Buttons with Page Info */}
        <Col xs={12} md={6} className="text-center mb-2">
          <Button
            variant="primary"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="mx-3">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="primary"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Col>

        {/* Page Size Dropdown */}
        <Col xs={12} md={3} className="text-md-end text-center mb-2">
          <DropdownButton
            id="dropdown-page-size"
            title={`Page Size: ${pageSize}`}
            onSelect={(e) => {
              setPageSize(Number(e)); // Update the pageSize state when a new size is selected
              setCurrentPage(1); // Reset to the first page when page size changes
              fetchData(1); // Fetch data with the new page size
            }}
          >
            <Dropdown.Item eventKey={10}>10</Dropdown.Item>
            <Dropdown.Item eventKey={20}>20</Dropdown.Item>
            <Dropdown.Item eventKey={30}>30</Dropdown.Item>
            <Dropdown.Item eventKey={50}>50</Dropdown.Item>
            <Dropdown.Item eventKey={100}>100</Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>
    </div>

        <Modal show={showModal} onHide={handleClose}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false} // Prevent closing with the Escape key
        >

  <Modal.Header closeButton>
    <Modal.Title>{editingId ? 'Edit Consultant' : 'Create Consultant'}</Modal.Title>
  </Modal.Header>
        {message && (
  <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
    {message}
  </div>
)}
  <Modal.Body>
    <Form>
      <Form.Group controlId="formConsultantName">
        <Form.Label>Consultant Name <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter consultant name"
          name="consultantName"
          value={formData.consultantName}
          onChange={handleInputChange}
          className={getValidationClass('consultantName')}
        />
        {errors.consultantName && (
          <div className="invalid-feedback">{errors.consultantName}</div>
        )}
      </Form.Group>

      <Form.Group controlId="formContactPerson">
        <Form.Label>Contact Person <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter contact person"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleInputChange}
          className={getValidationClass('contactPerson')}
        />
        {errors.contactPerson && (
          <div className="invalid-feedback">{errors.contactPerson}</div>
        )}
      </Form.Group>

      <Form.Group controlId="formContactNumber">
        <Form.Label>Contact Number <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter contact number"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleInputChange}
          className={getValidationClass('contactNumber')}
        />
        {errors.contactNumber && (
          <div className="invalid-feedback">{errors.contactNumber}</div>
        )}
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
      Close
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      {editingId ? 'Update Consultant' : 'Create Consultant'}
    </Button>
  </Modal.Footer>
</Modal>

<ToastContainer />
      </>
    </>
  );
};

export default ConsultantTable;
