import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Table,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { Switch } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const User = () => {
  const [pageSize, setPageSize] = useState(10); 
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState(""); 
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1); 
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    designation: "",
    mobileNo: "",
    roleId: "",
  });

  const [roles, setRoles] = useState([]);
  const [tableData, setTableData] = useState([]); 
  const navigate = useNavigate();

  const headers = [
    { key: "srNo", displayName: "Sr. No." }, 
    { key: "userName", displayName: "User Name" },
  ];

  useEffect(() => {
    fetchRoles();
    fetchUsers(currentPage, search); 
  }, [pageSize, currentPage]);

  useEffect(() => {
    setCurrentPage(1); 
    fetchUsers(1, search); 
  }, [search]);

   // Check if the token exists in localStorage
   useEffect(() => {
    if (localStorage.getItem("token") === null) {
      // Redirect to "/"
      navigate("/");
    }
  }, [navigate]); 

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/roles/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rolesData = response.data.data.roles;
      const rolesArray = rolesData.map((role) => ({
        id: role.Id,
        name: role.name.trim(),
      }));
      setRoles(rolesArray);
    } catch (error) {
      toast.error("Error fetching roles", { position: "top-right", autoClose: 3000 });
    }
  };

  const fetchUsers = async (page, searchQuery) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/user/list`, {
        params: { page, size: pageSize, search: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTableData(response.data.data.list); 
      setTotalPages(response.data.data.totalPages); 
    } catch (error) {
      toast.error("Error fetching users", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setIsEditing(false);
    setFormData({
      userId: "",
      name: "",
      email: "",
      password: "",
      designation: "",
      mobileNo: "",
      roleId: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNo") {
      const numericValue = value.replace(/\D/g, ""); 
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEdit = async (userId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/user/get/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.data;
      setFormData({
        userId: user.Id || user.userId || user.id || user.userid,
        name: user.name,
        email: user.email,
        password: "",
        designation: user.designation,
        mobileNo: user.mobileNo,
        roleId: user.role.id,
      });
      setIsEditing(true);
      setShow(true);
    } catch (error) {
      toast.error("Error fetching user data", { position: "top-right", autoClose: 3000 });
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["name", "email", "designation", "roleId"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field.`, { position: "top-right", autoClose: 3000 });
        return;
      }
    }

    try {
      const submissionData = {
        id: formData.userId,
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        designation: formData.designation,
        role: { id: formData.roleId },
        mobileNo: formData.mobileNo,
      };

      let response;
      if (isEditing) {
        response = await axios.put(`${process.env.REACT_APP_URL}/user/editProfile`, submissionData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.post(`${process.env.REACT_APP_URL}/user/signup`, submissionData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success(
        response.data.message || (isEditing ? "User updated successfully" : "User created successfully"),
        { position: "top-right", autoClose: 3000 }
      );

      handleClose();
      fetchUsers(currentPage, search); 
    } catch (error) {
      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        "Error processing the request. Please try again.";
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_URL}/user/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully", { position: "top-right", autoClose: 3000 });
      fetchUsers(currentPage, search); 
    } catch (error) {
      toast.error("Error deleting user", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus; 
      await axios.put(
        `${process.env.REACT_APP_URL}/user/active/${userId}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`User ${newStatus ? "activated" : "deactivated"} successfully`, { position: "top-right", autoClose: 3000 });
      fetchUsers(currentPage, search); 
    } catch (error) {
      toast.error("Error toggling user status", { position: "top-right", autoClose: 3000 });
    }
  };

  return (
    <div className="main-table m-4">
      <ToastContainer />
      <Row className="mb-3 m-2 mt-5">
        <Col md={4}>
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
        </Col>
        <Col md={6}></Col>
        <Col md={2}>
          <Button className="filterCreateButton" variant="primary" onClick={handleShow}>
            {isEditing ? "Edit User" : "Create User"}
          </Button>
        </Col>
      </Row>
      <div className="table-container">
        <Table striped bordered hover className="table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.key} style={header.key === "srNo" ? { width: "20px" } : {}}>
                  {header.displayName}
                </th>
              ))}
              <th>Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((user, index) => (
              <tr key={index}>
                <td style={{ width: "50px" }}>{(currentPage - 1) * pageSize + index + 1}</td>
                <td>{user.name}</td>
                <td>
                  <Button variant="success" onClick={() => handleEdit(user.Id)} className="action-button angelic-button">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(user.Id)} className="action-button angelic-button">
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </td>
                <td>
                  <Switch checked={user.status} onChange={() => handleToggleStatus(user.Id, user.status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="pagination-controls">
          <Button variant="primary" onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="primary" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </Button>
          <DropdownButton
            id="dropdown-page-size"
            title={`Page Size: ${pageSize}`}
            onSelect={(e) => {
              setPageSize(Number(e));
              setCurrentPage(1);
              fetchUsers();
            }}
          >
            <Dropdown.Item eventKey={10}>10</Dropdown.Item>
            <Dropdown.Item eventKey={20}>20</Dropdown.Item>
            <Dropdown.Item eventKey={30}>30</Dropdown.Item>
            <Dropdown.Item eventKey={50}>50</Dropdown.Item>
            <Dropdown.Item eventKey={100}>100</Dropdown.Item>
          </DropdownButton>
        </div>
      </div>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit User" : "Create User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>
                Name <span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>
                Email <span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>
                Password <span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
            </Form.Group>
            <Form.Group controlId="formDesignation">
              <Form.Label>
                Designation <span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Designation"
              />
            </Form.Group>
            <Form.Group controlId="formMobileNo">
              <Form.Label>Mobile No</Form.Label>
              <Form.Control
                type="text"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                placeholder="Mobile No"
              />
            </Form.Group>
            <Form.Group controlId="formRole">
              <Form.Label>
                Role <span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control
                as="select"
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default User;
