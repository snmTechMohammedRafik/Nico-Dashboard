import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Role = () => {
  const headers = [
    { key: "srNo", displayName: "SR No." },  // Add SR No. column
    { key: "name", displayName: "Project Name" },  // Keep Project Name column
  ];
  const [searchQuery, setSearchQuery] = useState(""); // State to store search query
  const [pageSize, setPageSize] = useState(10); // Default page size is 10
  const token = localStorage.getItem("token");
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Update this based on your API response
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [roleName, setRoleName] = useState(""); // State to store role name from form
  const [id, setId] = useState(null); // Changed from editingRoleId to id
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  // Fetch data from the API when the component mounts
  const fetchData = async (query = "") => {
    try {
      setIsLoading(true); // Start loading
      const response = await fetch(`${process.env.REACT_APP_URL}/roles/list?search=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage, // Include pagination parameters
          size: pageSize,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Data fetched successfully:", data);
        setTableData(data.data.roles || []); // Update the table data state
        setTotalPages(data.data.totalPages); // Calculate total pages based on pageSize
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchData(searchQuery); // Call fetchData with search query when component mounts
  }, [currentPage, pageSize, token, searchQuery]);

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

  const limitWords = (text) => {
    return text.length > 7 ? text.slice(0, 18) + ".." : text;
  };

  const handleEdit = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/roles/get/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Role details fetched:", data);
        setRoleName(data.data.name); // Set the role name to the state
        setId(id); // Set the id so we know which role we're editing
        setShowModal(true); // Open the modal for editing
      } else {
        toast.error("Failed to fetch role details.");
      }
    } catch (error) {
      console.error("Error fetching role details:", error);
      toast.error("Error fetching role details.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/roles/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove the deleted role from the table data
        setTableData(tableData.filter((row) => row.Id !== id));
        toast.success("Role deleted successfully.");
      } else {
        toast.error("Failed to delete role.");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Error deleting role.");
    }
  };

  // Handle form submission to save role
  const handleSaveRole = async () => {
    try {
        const url = id
            ? `${process.env.REACT_APP_URL}/roles/edit/${id}` // Use the correct edit endpoint here
            : `${process.env.REACT_APP_URL}/roles/save`;

        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ roleName: roleName }), // Send roleName instead of name
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Response data:", data); // Log the response data for debugging

            // Handle success message from backend
            toast.success(data.message || "Role saved successfully.");

            // Check if data is not null before accessing properties
            if (data.data) {
                const updatedRoleName = data.data.roleName ? data.data.roleName : "N/A"; // Fallback to 'N/A' if roleName is null

                if (id) {
                    // Update the existing role in the table
                    setTableData((prevData) =>
                        prevData.map((row) =>
                            row.Id === id
                                ? { ...row, name: updatedRoleName, Id: data.data.Id }
                                : row
                        )
                    );
                } else {
                    // Add the new role to the table
                    setTableData([...tableData, { ...data.data, name: updatedRoleName }]);
                }
            } else {
                console.log("No role data returned, likely a successful message.");
            }

            setShowModal(false); // Close the modal
            setRoleName(""); // Clear the form
            setId(null); // Clear the id

            // Refresh the table by fetching the latest data
            fetchData(); // Call fetchData to refresh the table
        } else {
            const errorData = await response.json();
            toast.error(errorData.message || "Failed to save role.");
        }
    } catch (error) {
        console.error("Error saving role:", error);
        toast.error("Error saving role.");
    }
};


  return (
    <div className="main-table m-4">
      <ToastContainer /> {/* Add ToastContainer to render toasts */}
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
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          />
        </Col>
        <Col md={6}></Col>
        <Col md={2}>
          <Button
            className="filterCreateButton"
            variant="primary"
            onClick={() => setShowModal(true)} // Open modal on click
          >
            Create Role
          </Button>
        </Col>
      </Row>

      <div className="table-container">
        {isLoading ? (
          <div>Loading data...</div> // Loading message or spinner
        ) : (
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
      <tr key={row.Id}>
        <td>{(currentPage - 1) * pageSize + (index + 1)}</td> {/* Calculate SR No. */}
        <td>{row.name || "N/A"}</td> {/* Display Project Name */}
        <td>
          <Button
            className="action-button angelic-button"
            variant="success"
            onClick={() => handleEdit(row.Id)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button
            className="action-button angelic-button"
            variant="danger"
            onClick={() => handleDelete(row.Id)}
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
        )}
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
            setPageSize(Number(e)); // Update pageSize when user selects a new option
            setCurrentPage(1); // Reset to page 1 when page size changes
            fetchData(); // Fetch new data based on new page size
          }}
        >
          <Dropdown.Item eventKey={10}>10</Dropdown.Item>
          <Dropdown.Item eventKey={20}>20</Dropdown.Item>
          <Dropdown.Item eventKey={30}>30</Dropdown.Item>
          <Dropdown.Item eventKey={50}>50</Dropdown.Item>
          <Dropdown.Item eventKey={100}>100</Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Modal for creating/editing a role */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false} // Prevent closing with the Escape key.
      >
        <Modal.Header closeButton>
          <Modal.Title>{id ? "Edit Role" : "Create Role"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="roleName">
            <Form.Label>Role Name</Form.Label>
            <Form.Control
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveRole}>
            Save Role
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Role;
