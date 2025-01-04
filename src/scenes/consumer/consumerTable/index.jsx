import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
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

const ConsumerTable = () => {
  const headers = [
    { key: "srNo", displayName: "Sr No" }, // New Sr No column
    { key: "consumerName", displayName: "Consumer Name" },
    { key: "emailId", displayName: "Email" },
    { key: "address", displayName: "Address" },
    { key: "contact", displayName: "Contact" },
    { key: "createdByName", displayName: "Created By" },
  ];

  const token = localStorage.getItem("token");
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState("");
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    consumerName: "",
    emailId: "",
    address: "",
    contact: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [pageSize, setPageSize] = useState(10); // Default page size is 10

  const validateForm = () => {
    const errors = {};
    if (!formData.consumerName)
      errors.consumerName = "Consumer Name is required";
    // if (!formData.emailId) errors.emailId = "Email is required";
    //
    // Email Validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!formData.emailId) {
      errors.emailId = "Email is required";
    } else if (!emailPattern.test(formData.emailId)) {
      errors.emailId = "Email must be a valid @gmail.com address";
    }
    if (!formData.address) errors.address = "Address is required";
    if (!formData.contact) errors.contact = "Contact is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const fetchData = async (page) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/consumer/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: page,
            size: pageSize,
            search: search, // Include search query
            filter1: filter1, // Include filter1 if necessary
            filter2: filter2, // Include filter2 if necessary
          },
        }
      );
      console.log("Fetched data:", response.data);
      if (response.data && response.data.data) {
        const updatedData = response.data.data.consumers.map((item) => ({
          ...item,
          createdByName: item.createdBy?.name || "N/A",
        }));
        setTableData(updatedData);
        const totalRecords = response.data.data.totalRecords || 0;
        setTotalPages(response.data.data.totalPages || 1);
        setTotalRecords(response.data.data.totalRecords || 0);
      } else {
        console.error("Unexpected data structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when performing a new search
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, search, filter1, filter2, pageSize]);

  const handleEdit = async (row) => {
    setEditingId(row.consumerId);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/consumer/get/${row.consumerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const consumer = response.data.data;

      setFormData({
        consumerName: consumer.consumerName || "",
        emailId: consumer.emailId || "",
        address: consumer.address || "",
        contact: consumer.contact || "",
      });

      handleShow();
    } catch (error) {
      console.error("Error fetching consumer details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      const numericValue = value.replace(/\D/g, ""); // Remove any non-digit characters
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setErrorMessage("User ID not found in localStorage");
      toast.error("User ID not found in localStorage");
      return;
    }
  
    try {
      let response;
      if (editingId) {
        // Update consumer
        response = await axios.put(
          `${process.env.REACT_APP_URL}/consumer/update/${editingId}`,
          { ...formData, createdBy: { id: parseInt(userId, 10) } },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const successMessage =
          response.data.message || "Consumer updated successfully";
        // setSuccessMessage(successMessage);
        // toast.success(successMessage);
        // Show success toast with green color and red progress bar
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false, // Show progress bar
          className: "toast-success", // Custom class for green background
          progressStyle: { backgroundColor: "green" }, // Red progress bar
        });
      } else {
        // Create new consumer
        response = await axios.post(
          `${process.env.REACT_APP_URL}/consumer/save`,
          { ...formData, createdBy: { id: parseInt(userId, 10) } },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const successMessage =
          response.data.message || "Consumer created successfully";
         // Show success toast with green color and red progress bar
         toast.success(successMessage, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false, // Show progress bar
          className: "toast-success", // Custom class for green background
          progressStyle: { backgroundColor: "green" }, // Red progress bar
        });
      }
  
      setErrorMessage("");
      setShowModal(false);
      setFormData({ consumerName: "", emailId: "", address: "", contact: "" });
      fetchData(currentPage);
    } catch (error) {
      const backendError =
        error.response?.data?.message ||
        "Error submitting consumer. Please try again later.";
      // Show error toast if login fails with red progress bar
      toast.error(backendError, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
      setSuccessMessage("");
    }
  
    // Hide messages after 2 seconds
    setTimeout(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, 2000);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_URL}/consumer/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);
      const successMessage =
        response.data.message || "Consumer deleted successfully";
       // Show success toast with green color and red progress bar
       toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });
      fetchData(currentPage);
    } catch (error) {
      const backendError =
        error.response?.data?.message ||
        "Error deleting consumer. Please try again later.";
     // Show error toast if login fails with red progress bar
     toast.error(backendError, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false, // Show progress bar
      progressStyle: { backgroundColor: "red" }, // Red progress bar
    });
    }

    // Hide messages after 2 seconds
    // setTimeout(() => {
    //   setErrorMessage("");
    //   setSuccessMessage("");
    // }, 2000);
  };

  const limitWords = (text) => {
    return text.length > 7 ? text.slice(0, 7) + ".." : text;
  };

  return (
    <>
      {/* <Row className="mb-3 m-2">
        <Col md={2}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control
            as="select"
            value={filter1}
            onChange={(e) => setFilter1(e.target.value)}
          >
            <option value="">Select</option>
            <option value="filter1Option1">Option 1</option>
            <option value="filter1Option2">Option 2</option>
          </Form.Control>
        </Col>
        <Col md={2}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control
            as="select"
            value={filter2}
            onChange={(e) => setFilter2(e.target.value)}
          >
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
            onChange={handleSearchChange} // Updated handler
            className="mb-3"
          />
        </Col>
        <Col md={6}></Col>
        <Col md={2}>
          <Button
            className="filterCreateButton"
            variant="primary"
            onClick={() => {
              setEditingId(null);
              setFormData({
                consumerName: "",
                emailId: "",
                address: "",
                contact: "",
              });
              handleShow();
            }}
          >
            Create Consumer
          </Button>
        </Col>
      </Row>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

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
              {tableData &&
                tableData.map((row, index) => (
                  <tr key={row.consumerId}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>{" "}
                    {/* Sr No Calculation */}
                    {headers.slice(1).map(
                      (
                        header // Skip the first header (which is now Sr No)
                      ) => (
                        <td key={header.key}>
                          <span title={row[header.key]}>
                            {header.key === "createdBy.name"
                              ? limitWords(row.createdBy?.name || "N/A")
                              : limitWords(row[header.key] || "N/A")}
                          </span>
                        </td>
                      )
                    )}
                    <td>
                      <Button
                        className="action-button angelic-button"
                        variant="success"
                        onClick={() => handleEdit(row)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(row.consumerId)}
                        className="action-button angelic-button"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>

        <div className="pagination-controls">
          <Row className="align-items-center">
            {/* Total Records */}
            <Col md="auto">
              <h5>Total Records: {totalRecords}</h5>
            </Col>

            {/* Previous Button */}
            <Col md="auto">
              <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Previous
              </Button>
            </Col>

            {/* Page Information */}
            <Col md="auto">
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </Col>

            {/* Next Button */}
            <Col md="auto">
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Col>

            {/* Page Size Dropdown */}
            <Col md="auto">
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
        <Modal
          show={showModal}
          onHide={handleClose}
          backdrop="static" // Prevent closing when clicking outside
          keyboard={false} // Prevent closing with the Escape key
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingId ? "Edit Consumer" : "Create Consumer"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Success and Error Messages */}
            {successMessage && (
              <Alert variant="success">{successMessage}</Alert>
            )}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Form>
              <Form.Group controlId="formConsumerName">
                <Form.Label>
                  Consumer Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Consumer Name"
                  name="consumerName"
                  value={formData.consumerName}
                  onChange={handleInputChange}
                  className={formErrors.consumerName ? "is-invalid" : ""}
                />
                {formErrors.consumerName && (
                  <Form.Text className="text-danger">
                    {formErrors.consumerName}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  className={formErrors.emailId ? "is-invalid" : ""}
                />
                {formErrors.emailId && (
                  <Form.Text className="text-danger">
                    {formErrors.emailId}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group controlId="formAddress">
                <Form.Label>
                  Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={formErrors.address ? "is-invalid" : ""}
                />
                {formErrors.address && (
                  <Form.Text className="text-danger">
                    {formErrors.address}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group controlId="formContact">
                <Form.Label>
                  Contact <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className={formErrors.contact ? "is-invalid" : ""}
                />
                {formErrors.contact && (
                  <Form.Text className="text-danger">
                    {formErrors.contact}
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <ToastContainer />
      </>
    </>
  );
};

export default ConsumerTable;
