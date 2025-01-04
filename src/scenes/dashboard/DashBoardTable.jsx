import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit, faEye } from "@fortawesome/free-solid-svg-icons"; // Import icons
import Select from "react-select"; // Import Select for the dropdown
import "./ReminderTable.css"; // Import the custom CSS
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReminderTable = () => {
  const headers = [
    { key: "generalFollowUpName", displayName: "FollowUp Name" },
    { key: "description", displayName: "Description" },
    { key: "dueDate", displayName: "Due Date" },
  ];

  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // Modal for viewing details
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [users, setUsers] = useState([]); // To store user data for the dropdown
  const [loadingUsers, setLoadingUsers] = useState(false); // To track the user loading state
  const userId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("token");

  const [DoneModel, setDoneModel] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [totalPages, setTotalPages] = useState(1); // Total pages from API response
 

  // Fetch reminders
  const GenralfollowUpTable = async (page = 1) => {
    const currentDate = new Date().toISOString().split("T")[0];
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/generalFollowUp/getall`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            userId: userId,
            dueDate: currentDate,
            page: page, // Include current page in API call
            size: pageSize, // Include page size in API call
          },
        }
      );
      setReminders(response.data.data.list);
      setTotalPages(response.data.data.totalPages); // Set total pages
    } catch (error) {
      console.error("Error fetching the reminders:", error);
    }
  };

  // Fetch users for FollowUp Person dropdown
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/user/list`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const userOptions = response.data.data.list.map((user) => ({
        value: user.Id,
        label: user.name,
      }));
      setUsers(userOptions);
      setLoadingUsers(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoadingUsers(false);
    }
  };

  const handleModifyClick = (reminder) => {
    const date = new Date(reminder.dueDate);
    const formattedDateTime = date.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:MM'
  
    setSelectedReminder({
      ...reminder,
      dueDate: formattedDateTime, // Set dueDate as 'YYYY-MM-DDTHH:MM'
    });
    fetchUsers(); // Fetch users when editing a reminder
    setShowModal(true);
  };
  

  const handleDoneClick = (reminder) => {
    setSelectedReminder(reminder); // Set the selected reminder data
    setDoneModel(true); // Open the modal
  };

  const handleViewClick = (reminder) => {
    setSelectedReminder(reminder);
    setShowViewModal(true); // Open the view details modal
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedReminder(null);
  };

  const handleViewModalClose = () => {
    setShowViewModal(false);
    setSelectedReminder(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const updatedData = {
        generalFollowUpName: selectedReminder.generalFollowUpName,
        description: selectedReminder.description,
        statusNotes: selectedReminder.statusNotes,
        followUpPerson: { id: selectedReminder.followUpPerson.id },
        dueDate: new Date(selectedReminder.dueDate).toISOString(),
        createdAt: selectedReminder.createdAt,
        createdBy: { id: selectedReminder.createdBy.id },
        status: selectedReminder.status,
        updatedAt: new Date().toISOString(),
        updatedBy: { id: userId },
      };
  
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/generalFollowUp/update/${selectedReminder.generalFollowUpId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      // Extract success message from backend response
      const successMessage = response.data.message || "Reminder updated successfully";
  
      // Show success toast with green progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        className: "toast-success",
        progressStyle: { backgroundColor: "green" },
      });
  
      handleModalClose();
      GenralfollowUpTable(); // Refresh the table data
    } catch (error) {
      console.error("Error updating reminder:", error);
  
      // Extract error message from backend response, if available
      const backendError = error.response?.data?.message || "Error updating reminder";
  
      // Show error toast with red progress bar
      toast.error(backendError, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        className: "toast-error",
        progressStyle: { backgroundColor: "red" },
      });
    }
  };
  
  

  const handleMarkAsDone = async (e) => {
    e.preventDefault();
  
    const userId = localStorage.getItem("userId"); // Login user ID
    try {
      const updatedData = {
        description: selectedReminder.description || "Mark As Done", // Description as required
        updatedBy: {
          id: userId, // The ID of the user marking it as done
        },
        status: "COMPLETED", // Mark the status as COMPLETED
      };
  
      await axios.put(
        `${process.env.REACT_APP_URL}/generalFollowUp/make/done/${selectedReminder.generalFollowUpId}`, // Correct API endpoint
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      setDoneModel(false); // Close modal after successful submission
      GenralfollowUpTable(); // Refresh the table data
      console.log("Marked as done successfully.");
    } catch (error) {
      console.error("Error marking as done:", error);
    }
  };
  


const handleInputChange = (e) => {
  const { name, value } = e.target;
  setSelectedReminder((prev) => ({
    ...prev,
    [name]: value, // Update the state with the new value
  }));
};


  const handleFollowUpPersonChange = (selectedOption) => {
    setSelectedReminder((prev) => ({
      ...prev,
      followUpPerson: { id: selectedOption.value, name: selectedOption.label },
    }));
  };

  useEffect(() => {
    GenralfollowUpTable(currentPage); // Fetch reminders when page changes
  }, [currentPage, pageSize]);
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value)); // Update page size
    setCurrentPage(1); // Reset to page 1
  };

  const getDueDateColor = (dueDate) => {
    const currentDate = new Date();
    const due = new Date(dueDate);
    const diffTime = due - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 2) {
      return "";
    } else if (diffDays >= 0 && diffDays <= 2) {
      return "yellow";
    } else if (diffDays < 0) {
      return "red";
    }
    return "";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const limitWords = (text) => {
    return text.length > 7 ? text.slice(0, 7) + ".." : text;
  };

  return (
    <div className="genralfollowup-table-container">
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th style={{ width: "10%" }}>Sr.</th>
            <th style={{ width: "15%" }}>FollowUp Name</th>
            <th style={{ width: "25%" }}>Description</th>
            <th style={{ width: "15%" }}>Due Date</th>
            <th style={{ width: "35%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
    {reminders.map((reminder, index) => (
      <tr key={reminder.generalFollowUpId}>
        <td>
          <span
            className="due-date-dot"
            style={{ backgroundColor: getDueDateColor(reminder.dueDate) }}
          ></span>
          {(currentPage - 1) * pageSize + index + 1}
        </td>
        <td>
          <span className="due-date-dot"></span>
          <OverlayTrigger
            key={index}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-name`}>
                {reminder.generalFollowUpName}
              </Tooltip>
            }
          >
            <span>{limitWords(reminder.generalFollowUpName)}</span>
          </OverlayTrigger>
        </td>
        <td>
          <span className="due-date-dot"></span>
          <OverlayTrigger
            key={index}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-description`}>
                {reminder.description}
              </Tooltip>
            }
          >
            <span>{limitWords(reminder.description)}</span>
          </OverlayTrigger>
        </td>
        <td>
          <span className="due-date-dot"></span>
          {(formatDate(reminder.dueDate))}
        </td>
        <td>
          <span className="due-date-dot"></span>
          <Button
            variant="success"
            className="mr-2"
            onClick={() => handleDoneClick(reminder)}
          >
            <FontAwesomeIcon icon={faCheck} />
          </Button>
          <Button
            variant="primary"
            className="mr-2"
            onClick={() => handleModifyClick(reminder)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button variant="info" onClick={() => handleViewClick(reminder)}>
            <FontAwesomeIcon icon={faEye} />
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
      </Table>
      {/* Pagination Controls */}
      <div className="pagination-controls">
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
          GenralfollowUpTable(1); // Fetch data with the new page size
        }}
      >
        <Dropdown.Item eventKey={10}>10</Dropdown.Item>
        <Dropdown.Item eventKey={20}>20</Dropdown.Item>
        <Dropdown.Item eventKey={30}>30</Dropdown.Item>
        <Dropdown.Item eventKey={50}>50</Dropdown.Item>
        <Dropdown.Item eventKey={100}>100</Dropdown.Item>
      </DropdownButton>
      </div>

      {/* Modal for editing/reminder modification */}
      <Modal show={showModal} onHide={handleModalClose}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Reminder</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedReminder && (
    <Form
    onSubmit={handleFormSubmit}
    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
  >
    <Form.Group style={{ width: "100%" }}>
      <Form.Label>FollowUp Name</Form.Label>
      <Form.Control
        type="text"
        name="generalFollowUpName"
        value={selectedReminder.generalFollowUpName || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
    <Form.Group style={{ width: "100%" }}>
      <Form.Label>Description</Form.Label>
      <Form.Control
        as="textarea"
        type="text"
        name="description"
        value={selectedReminder.description || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  
    {/* Date and Time Input */}
    <Form.Group style={{ width: "100%" }}>
      <Form.Label>Due Date and Time</Form.Label>
      <Form.Control
        type="datetime-local"
        name="dueDate"
        value={selectedReminder.dueDate || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  
    <Form.Group style={{ width: "100%" }}>
      <Form.Label>Status Notes</Form.Label>
      <Form.Control
        type="text"
        name="statusNotes"
        value={selectedReminder.statusNotes || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
    <Form.Group style={{ width: "100%" }}>
      <Form.Label>Follow Up Person</Form.Label>
      <Select
        name="followUpPerson"
        value={users.find(
          (user) => user.value === selectedReminder.followUpPerson.id
        )}
        onChange={handleFollowUpPersonChange}
        options={users}
        isLoading={loadingUsers}
        placeholder="Select Follow Up Person"
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
    <Button
      variant="primary"
      type="submit"
      style={{
        marginTop: "20px",
        alignSelf: "center", // Ensures the button is centered within the flex container
      }}
    >
      Save Changes
    </Button>
  </Form>
  
   
    )}
  </Modal.Body>
</Modal>


      {/* Modal for viewing details */}
      <Modal show={showViewModal} onHide={handleViewModalClose} centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            Reminder Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedReminder && (
            <>
              <div className="modal-detail-container">
                <div className="modal-detail">
                  <strong className="modal-label">FollowUp Name:</strong>
                  <span className="modal-value">
                    {selectedReminder.generalFollowUpName}
                  </span>
                </div>
                <div className="modal-detail">
                  <strong className="modal-label">Description:</strong>
                  <span className="modal-value">
                    {selectedReminder.description}
                  </span>
                </div>
                <div className="modal-detail">
                  <strong className="modal-label">Due Date:</strong>
                  <span className="modal-value">
                    {formatDate(selectedReminder.dueDate)}
                  </span>
                </div>
                <div className="modal-detail">
                  <strong className="modal-label">Status Notes:</strong>
                  <span className="modal-value">
                    {selectedReminder.statusNotes}
                  </span>
                </div>
                <div className="modal-detail">
                  <strong className="modal-label">Follow Up Person:</strong>
                  <span className="modal-value">
                    {selectedReminder.followUpPerson.name}
                  </span>
                </div>
              </div>
              <div className="modal-button-wrapper">
                <Button
                  variant="primary"
                  onClick={handleViewModalClose}
                  className="modal-close-button"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal for marking as done */}
      <Modal show={DoneModel} onHide={() => setDoneModel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mark As Done</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReminder && (
            <Form
            onSubmit={handleMarkAsDone}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Form.Group style={{ width: "100%" }}>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                type="text"
                name="description"
                value={selectedReminder.description || ""}
                onChange={(e) =>
                  setSelectedReminder({
                    ...selectedReminder,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Button
              variant="success"
              type="submit"
              style={{
                marginTop: "20px",
                alignSelf: "center", // Ensures the button is centered
              }}
            >
              Mark As Done
            </Button>
          </Form>
          
          )}
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default ReminderTable;
