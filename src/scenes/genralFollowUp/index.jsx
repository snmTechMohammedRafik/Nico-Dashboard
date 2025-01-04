import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Modal,
  Table,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import axios from "axios";
import { FaSearch } from "react-icons/fa"; // Importing search icon
import "./GenralFollowUp.css";
import Select from "react-select"; // Importing react-select
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faUserCheck,
  faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const GenralFollowUp = () => {
  const [pageSize, setPageSize] = useState(10); // Default page size is 10
  const userId = localStorage.getItem("userId");
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    generalFollowUpName: "",
    followUpPerson: "", // followUpPerson ID
    generalFollowUpId: "",
    description: "",
    status: "PENDING",
    statusNotes: "",
    dueDate: "",
    createdBy: { id: userId }, // createdBy ID as object
  });
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState("");
  const [message, setMessage] = useState(null);
  const token = localStorage.getItem("token");
  const [isFormValid, setIsFormValid] = useState(true); // State to track form validity
  const [followUpPersons, setFollowUpPersons] = useState([]);
  const [userOptions, setUserOptions] = useState([]); // Store options for Select dropdown
  const [selectedFollowUpPerson, setSelectedFollowUpPerson] = useState(null); // Track selected person
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Loading state for users
  const navigate = useNavigate();

   // Check if the token exists in localStorage
   useEffect(() => {
    if (localStorage.getItem("token") === null) {
      // Redirect to "/"
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    // fetchFollowUpUsers(); // Fetch users on component mount
    if (message) {
      // Automatically hide the message after 2 seconds
      const timer = setTimeout(() => {
        setMessage(null);
      }, 2000); // 2 seconds

      // Cleanup the timer if the component unmounts or message changes
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch follow-up users from the API
  // Fetch follow-up users from the API
  const fetchFollowUpUsers = async (inputValue = "") => {
    console.log("Searching for:", inputValue); // Log search input
    setIsLoadingUsers(true); // Show loading spinner

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/user/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: inputValue, // Pass search input to the API
          },
        }
      );

      const users = response.data.data.list.map((user) => ({
        value: user.Id,
        label: user.name,
      }));

      console.log("Fetched users:", users); // Log fetched users
      setUserOptions(users); // Update the dropdown options with fetched data
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false); // Hide loading spinner
    }
  };

  // Handle Select dropdown changes
  // Handle Select dropdown changes
  const handleUserChange = (selectedOption) => {
    console.log("Selected user:", selectedOption); // Log the selected user

    setSelectedFollowUpPerson(selectedOption); // Set the selected user

    setFormData((prevState) => ({
      ...prevState,
      followUpPerson: selectedOption
        ? { id: selectedOption.value, name: selectedOption.label }
        : null, // Ensure the formData is updated with both id and name
    }));
  };

  // Helper function to extract description
  const extractDescription = (descriptionString) => {
    const match = descriptionString.match(/description='(.*?)'/);
    return match ? match[1] : "N/A"; // Return the matched description or "N/A" if not found
  };

  const headers = [
    { key: "srNo", displayName: "Sr. No" },
    { key: "generalFollowUpName", displayName: "GeneralFollowUp Name" },
    { key: "createdBy", displayName: "Created By" },
    { key: "description", displayName: "Description." },
    { key: "updatedBy", displayName: "Updated By" },
  ];

  // Fetch data whenever currentPage or search term changes
  useEffect(() => {
    console.log(
      "Fetching data with currentPage:",
      currentPage,
      "and search:",
      search
    ); // Debug statement
    fetchTableData();
  }, [currentPage, search, pageSize]);

  // useEffect(() => {
  //   const fetchFollowUpPersons = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_URL}/user/list`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       setFollowUpPersons(response.data.data.list);
  //     } catch (error) {
  //       console.error("Error fetching follow-up persons:", error);
  //     }
  //   };

  //   fetchFollowUpPersons();
  // }, []);

  // Fetch data with search term and pagination
  const fetchTableData = async () => {
    try {
      const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

      const response = await axios.get(
        `${process.env.REACT_APP_URL}/generalFollowUp/getall`,
        {
          params: {
            page: currentPage,
            size: pageSize, // Use pageSize state here
            search: search || "", // Add search query to the API call, fallback to empty string if null
            userId: userId,
            // dueDate: currentDate, // Add the current date as a parameter
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data); // Debug statement
      setTableData(response.data.data.list);
      setTotalPages(response.data.data.totalPages);
      setTotalData(response.data.data.totalRecords);

      console.log(
        "Table data set successfully with results:",
        response.data.data.list
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Open the form popup for creating/editing
  const handleOpenPopup = () => {
    setShowPopup(true);
    setFormData({
      generalFollowUpName: "",
      followUpPerson: "",
      generalFollowUpId: "",
      description: "",
      status: "PENDING",
      statusNotes: "",
      dueDate: "",
      createdBy: userId,
    });
    fetchFollowUpUsers(); // Fetch users only when the form is opened
  };

  const handleClosePopup = () => setShowPopup(false);

  // Handle form changes
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate the form on field change
    validateForm();
  };

  const validateForm = () => {
    const { generalFollowUpName, followUpPerson, description } = formData;
    setIsFormValid(generalFollowUpName && followUpPerson && description); // Check required fields
  };

  // Submit form
  const handleSubmit = async () => {
    validateForm();
    if (!isFormValid) {
      // Show error toast with red progress bar
      toast.error("Please fill in all required fields.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
      setMessage({
        text: "Please fill in all required fields.",
        type: "danger",
      });
      return;
    }

    // Prepare the data to submit
    const dataToSubmit = {
      generalFollowUpName: formData.generalFollowUpName,
      followUpPerson: { id: formData.followUpPerson.id },
      description: formData.description,
      status: formData.status,
      statusNotes: formData.statusNotes,
      dueDate: formData.dueDate,
      createdBy: { id: userId }, // createdBy is set to the current user ID
    };

    // If editing an existing follow-up, include the updatedBy field
    if (formData.generalFollowUpId) {
      dataToSubmit.updatedBy = { id: userId }; // updatedBy is set to the current user ID
    }

    try {
      let response;
      if (formData.generalFollowUpId) {
        // Update the existing follow-up
        response = await axios.put(
          `${process.env.REACT_APP_URL}/generalFollowUp/update/${formData.generalFollowUpId}`,
          dataToSubmit,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create a new follow-up
        response = await axios.post(
          `${process.env.REACT_APP_URL}/generalFollowUp/save`,
          dataToSubmit,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const successMessage =
        response.data.message || "Follow-up saved successfully!";

      // Show success toast with green color and red progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });

      // setMessage({
      //   text: successMessage,
      //   type: "success",
      // });

      // Clear message after 2 seconds
      // setTimeout(() => setMessage(null), 2000);

      fetchTableData(); // Refresh the table after submission
      setShowPopup(false); // Close the form modal
    } catch (error) {
      console.error("Error submitting form:", error);
      const backendError =
        error.response?.data?.message ||
        "An error occurred while saving the follow-up.";

      // Show error toast if submission fails with red progress bar
      toast.error(backendError, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });

      // setMessage({ text: backendError, type: "danger" });

      // Clear message after 2 seconds
      // setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleEdit = async (row) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/generalFollowUp/get/${row.generalFollowUpId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = response.data.data || {};
      const followUpPerson = data.followUpPerson || {};
  
      // Set the form data with the fetched values, including follow-up person details
      setFormData({
        generalFollowUpName: data.generalFollowUpName || "",
        followUpPerson: followUpPerson.id ? { id: followUpPerson.id, name: followUpPerson.name } : null, // Properly set followUpPerson with id and name
        generalFollowUpId: data.generalFollowUpId || "",
        description: data.description || "",
        status: data.status || "PENDING", // Default status to "PENDING" if not available
        statusNotes: data.statusNotes || "", // Set statusNotes
        dueDate: data.dueDate || "",
        createdBy: data.createdBy?.id || userId,
      });
  
      // Set the selected follow-up person in the Select dropdown
      setSelectedFollowUpPerson({
        value: followUpPerson.id,
        label: followUpPerson.name,
      });
  
      setShowPopup(true); // Open the modal for editing
  
      // Ensure the dropdown options for follow-up users are fetched
      fetchFollowUpUsers();
  
    } catch (error) {
      console.error("Error fetching follow-up data for editing:", error);
      setMessage({
        text: "Error loading follow-up data. Please try again.",
        type: "danger",
      });
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_URL}/generalFollowUp/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success toast with green background and red progress bar
      toast.success("Follow-up deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        className: "toast-success",
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });

      // setMessage({ text: "Follow-up deleted successfully!", type: "success" });

      // Clear message after 2 seconds
      // setTimeout(() => setMessage(null), 2000);

      fetchTableData(); // Refresh the table after deletion
    } catch (error) {
      console.error("Error deleting follow-up:", error);

      // Show error toast with red progress bar
      toast.error("Error deleting follow-up. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });

      setMessage({
        text: "Error deleting follow-up. Please try again.",
        type: "danger",
      });

      // Clear message after 2 seconds
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      console.log("Navigating to next page:", currentPage + 1); // Debug statement
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      console.log("Navigating to previous page:", currentPage - 1); // Debug statement
    }
  };

  const limitWords = (text) => {
    if (!text) return "N/A"; // Handle null or undefined text
    return text.length > 7 ? text.slice(0, 7) + "..." : text;
  };

  // Search input change handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    setCurrentPage(1); // Reset to the first page when search term changes
    console.log("Search term updated:", query); // Debug statement
  };

  return (
    <div className="main-table m-4">
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
      </Row> */}
      {/* <hr style={{ color: "#000000" }} /> */}
      <Row className="mb-3 m-2 mt-5">
        <Col md={4}>
          <div className="filter-search-input-wrapper">
            <FaSearch className="filter-search-icon" />
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              onChange={handleSearchChange} // Trigger search on change
              className="filter-search-input"
            />
          </div>
        </Col>
        <Col md={6}></Col>
        <Col md={2}>
          <Button
            className="filterCreaateButton"
            variant="primary"
            onClick={handleOpenPopup}
          >
            Create Follow Up
          </Button>
        </Col>
      </Row>
      {message && (
        <div
          className={`alert alert-${message.type} alert-dismissible fade show`}
          role="alert"
        >
          {message.text}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setMessage(null)}
          ></button>
        </div>
      )}
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
                <tr key={row.generalFollowUpId || index}>
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  {/* Sr. No */}
                  <td title={row.generalFollowUpName}>
                    {limitWords(row.generalFollowUpName)}
                  </td>
                  <td title={row.createdBy?.name || "N/A"}>
                    {limitWords(row.createdBy?.name || "N/A")}
                  </td>
                  <td title={row.description}>{limitWords(row.description)}</td>
                  <td title={row.updatedBy?.name || "N/A"}>
                    {limitWords(row.updatedBy?.name || "N/A")}
                  </td>
                  <td>
                    <Button
                      variant="success"
                      onClick={() => handleEdit(row)}
                      className="action-button angelic-button"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(row.generalFollowUpId)}
                      className="action-button angelic-button"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
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
        <h5>Total Records: {totalData}</h5>
        <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
        <DropdownButton
          id="dropdown-page-size"
          title={`Page Size: ${pageSize}`}
          onSelect={(e) => {
            setPageSize(Number(e)); // Update the pageSize state when a new size is selected
            setCurrentPage(1); // Reset to the first page when page size changes
            fetchTableData(1); // Fetch data with the new page size
          }}
        >
          <Dropdown.Item eventKey={10}>10</Dropdown.Item>
          <Dropdown.Item eventKey={20}>20</Dropdown.Item>
          <Dropdown.Item eventKey={30}>30</Dropdown.Item>
          <Dropdown.Item eventKey={50}>50</Dropdown.Item>
          <Dropdown.Item eventKey={100}>100</Dropdown.Item>
        </DropdownButton>
      </div>

      <Modal
        show={showPopup}
        onHide={handleClosePopup}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false} // Prevent closing with the Escape key
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.generalFollowUpId ? "Edit Follow Up" : "Create Follow Up"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="generalFollowUpName">
              <Form.Label>General Follow Up Name</Form.Label>
              <Form.Control
                type="text"
                name="generalFollowUpName"
                value={formData.generalFollowUpName}
                onChange={handleFormChange}
                placeholder="General Follow Up Name"
                required
              />
            </Form.Group>
            <Form.Group controlId="followUpPerson">
              <Form.Label>Follow Up Person</Form.Label>
              <Select
                name="followUpPerson"
                value={
                  formData.followUpPerson
                    ? {
                        value: formData.followUpPerson.id,
                        label: formData.followUpPerson.name,
                      }
                    : null
                } // Correctly map value with both id and name
                onChange={handleUserChange} // Handle changes when a user is selected
                onInputChange={(inputValue) => {
                  console.log("Input value changed:", inputValue); // Log input change
                  fetchFollowUpUsers(inputValue); // Call fetch function when input changes
                }}
                options={userOptions} // Dynamically update options as user types
                placeholder="Search and Select Follow-up Person"
                isLoading={isLoadingUsers} // Display loading spinner while fetching users
                isClearable
                styles={{
                  option: (provided) => ({
                    ...provided,
                    color: "black", // Set text color to black
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black", // Set single value text color to black
                  }),
                }}
              />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Description"
              />
            </Form.Group>
            <Form.Group controlId="status">
              <Form.Label>Status</Form.Label>
              {formData.generalFollowUpId ? (
                // Show dropdown only if editing (generalFollowUpId exists)
                <Form.Select
                  name="status"
                  value={formData.status} // Use formData.status to bind the selected value
                  onChange={handleFormChange} // Update formData when the dropdown value changes
                >
                  <option value="PENDING">Pending</option>{" "}
                  {/* Dropdown option for Pending */}
                  <option value="DONE">Done</option>{" "}
                  {/* Dropdown option for Done */}
                  <option value="MODIFY">Modify</option>{" "}
                  {/* Dropdown option for Modify */}
                </Form.Select>
              ) : (
                // On create, set status as "PENDING" and make it read-only
                <Form.Control
                  type="text"
                  name="status"
                  value="PENDING" // Set to "PENDING"
                  readOnly // Make it read-only
                />
              )}
            </Form.Group>

            <Form.Group controlId="statusNotes">
              <Form.Label>Status Notes</Form.Label>
              <Form.Control
                type="text"
                name="statusNotes"
                value={formData.statusNotes}
                onChange={handleFormChange}
                placeholder="Status Notes"
              />
            </Form.Group>
            <Form.Group controlId="dueDate">
              <Form.Label>Due Date and Time</Form.Label>
              <Form.Control
                type="datetime-local" // This will allow users to pick both date and time
                name="dueDate"
                value={formData.dueDate}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePopup}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GenralFollowUp;
