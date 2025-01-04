import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Modal, Table, Alert,Dropdown, DropdownButton } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select'; // Importing react-select for the searchable dropdown
import Search from '../search';
import './products.css'; // Import the CSS file
import { FaSearch } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
faEdit,
faTrash,
faUserCheck,
faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';




const Product = () => {
  const headers = [
    { key: 'srNo', displayName: 'SR No' },
    { key: 'productName', displayName: 'Product Name' },
    { key: 'price', displayName: 'Price' },
    { key: 'createdBy.name', displayName: 'Created By' },
    { key: 'createdAt', displayName: 'CreatedAt' },
  ];

  const [pageSize, setPageSize] = useState(10); // Default page size is 10
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId'); // Get the user ID for createdBy field
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    createdBy: { id: userId },
    brand: { brandId: null }, // Add brand field
  });
  const [brands, setBrands] = useState([]); // State for brand options
  const [selectedBrand, setSelectedBrand] = useState(null); // State for selected brand
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState();
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    category: '',
  });

   // Check if the token exists in localStorage
   useEffect(() => {
    if (localStorage.getItem("token") === null) {
      // Redirect to "/"
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    ProductfetchData();
  }, [currentPage, filters ,pageSize]);

  useEffect(() => {
    if (showModal) {
      fetchBrands(); // Fetch brands when the modal opens
    }
  }, [showModal]);

  const ProductfetchData = async (query = search) => {
    try {
      const params = {
        search: query,
        page: currentPage,
        size: pageSize,
        // ...filters
        userId: userId
      };
  
      const response = await axios.get(`${process.env.REACT_APP_URL}/product/list`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const products = response.data.data.productList || [];
      const startingSerialNumber = (currentPage - 1) * 10 + 1; // Calculate starting SR No
  
      setTableData(products.map((product, index) => ({
        ...product,
        srNo: startingSerialNumber + index // Add serial number
      })));
      setTotalPages(response.data.data.totalPages || 1);
      setTotalRecords(response.data.data.TotalRecords );
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch brands from the API
  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/brand/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const brandsData = response.data.data || [];
      setBrands(brandsData.map((brand) => ({ value: brand.brandId, label: brand.brandName })));
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({ productName: '', price: '', brand: { brandId: null } });
    setSelectedBrand(null); // Reset selected brand
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBrandChange = (selectedOption) => {
    setSelectedBrand(selectedOption);
    setFormData({ ...formData, brand: { brandId: selectedOption?.value || null } });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1); // Reset to the first page when filter changes
  };

  const handleSubmit = async () => {
    const { productName, price, brand } = formData;
  
    if (!productName || !price || !brand.brandId) {
      setErrorMessage('Product Name, Price, and Brand are required.');
      toast.error('Product Name, Price, and Brand are required.');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }
  
    try {
      let response;
      if (editMode) {
        // Update existing product
        response = await axios.put(
          `${process.env.REACT_APP_URL}/product/update/${editProductId}`,
          {
            ...formData,
            updatedBy: { id: userId }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new product
        response = await axios.post(
          `${process.env.REACT_APP_URL}/product/create`,
          {
            ...formData,
            createdBy: { id: userId }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      const successMessage = response.data.message || (editMode ? 'Product updated successfully!' : 'Product created successfully!');
      // Show success toast with green color and red progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });
      // setSuccessMessage(successMessage);
      // toast.success(successMessage); // Success toast
  
        handleClose();  // Close modal
  
      ProductfetchData();  // Fetch updated data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error creating/updating product. Please try again.';
      // Show error toast if login fails with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
      // setErrorMessage(errorMessage);
      // toast.error(errorMessage); // Error toast
  
      // setTimeout(() => setErrorMessage(''), 2000);
    }
  };

  const handleEdit = async (productId) => {
    console.log(`Editing product with ID: ${productId}`); // Debug: Log the product ID being edited
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/product/get/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log('Product data fetched successfully:', response.data.data); // Debug: Log the entire API response
  
      const productData = response.data.data;
  
      // Populate the form fields with the fetched product data
      setFormData({
        productName: productData.productName || '',
        price: productData.price || '',
        brand: { brandId: productData.brand?.brandId || null },
        createdBy: { id: userId },
      });
  
      setSelectedBrand({
        value: productData.brand?.brandId,
        label: productData.brand?.brandName,
      });
  
      setEditMode(true);
      setEditProductId(productId);
      setShowModal(true);
      toast.info('Product data loaded successfully!'); // Info toast
    } catch (error) {
      console.error('Error fetching product data:', error); // Debug: Log the error object
      toast.error('Error fetching product data. Please try again.'); // Error toast
    }
  };
  

  const handleDelete = async (productId) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_URL}/product/delete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const successMessage = response.data.message || 'Product deleted successfully!';
      // Show success toast with green color and red progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });
      ProductfetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error deleting product. Please try again.';
      // Show error toast if login fails with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
    }
  };

  const handleSearch = (query) => {
    ProductfetchData(query);
    setCurrentPage(1);
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

  const limitWords = (text) => {
    return text.length > 7 ? text.slice(0, 7) + ".." : text;
  };

  return (
    <div className='main-table m-4'>
      {/* <Row className="mb-3 m-2">
        <Col md={4}>
          <h6 className="filter-label">Filter by</h6>
          <Form.Control as="select" name="priceRange" onChange={handleFilterChange} value={filters.priceRange}>
            <option value="">All</option>
            <option value="0-50">0 - 50</option>
            <option value="50-100">50 - 100</option>
          </Form.Control>
        </Col>
        <Col md={4}>
          <h6 className="filter-label">Filter by</h6>
          <Form.Control as="select" name="category" onChange={handleFilterChange} value={filters.category}>
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
          </Form.Control>
        </Col>
      </Row> */}
      <hr />
      <Row className="mb-3 m-2">
        <Col md={4}>
          <div className="filter-search-input-wrapper">
            <FaSearch className="filter-search-icon" />
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
              }}
              className="filter-search-input"
            />
          </div>
        </Col>
        <Col md={6}></Col>
        <Col md={2}>
          <Button className='filterCreateButton' variant="primary" onClick={handleShow}>
            Create Product
          </Button>
        </Col>
      </Row>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
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
              tableData.map((row) => (
                <tr key={row.productId}>
                  {headers.map((header) => (
                    <td key={header.key}>
                      <span title={row[header.key]}>
                        {header.key === "createdBy.name"
                          ? limitWords(row.createdBy?.name || "N/A")
                          : limitWords(row[header.key] || "N/A")}
                      </span>
                    </td>
                  ))}
                  <td>
                    <Button className="action-button angelic-button"
                        variant="success"  onClick={() => handleEdit(row.productId)}><FontAwesomeIcon icon={faEdit} /></Button>
                    <Button className="action-button angelic-button" variant="danger" onClick={() => handleDelete(row.productId)}><FontAwesomeIcon icon={faTrash} /></Button>
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
      ;

<div className="pagination-controls">
  <Row className="align-items-center">
    {/* Display total records */}
    <Col md="auto">
      <h5 >Total Records: {totalRecords}</h5>
    </Col>

    {/* Previous Button */}
    <Col md="auto">
      <Button variant="primary" onClick={handlePreviousPage} disabled={currentPage === 1}>
        Previous
      </Button>
    </Col>

    {/* Page count display */}
    <Col md="auto">
      <span>Page {currentPage} of {totalPages}</span>
    </Col>

    {/* Next Button */}
    <Col md="auto">
      <Button variant="primary" onClick={handleNextPage} disabled={currentPage === totalPages}>
        Next
      </Button>
    </Col>

    {/* Dropdown for Page Size */}
    <Col md="auto">
      <DropdownButton
        id="dropdown-page-size"
        title={`Page Size: ${pageSize}`}
        onSelect={(e) => {
          setPageSize(Number(e)); // Update the pageSize state
          setCurrentPage(1); // Reset to the first page when page size changes
          ProductfetchData(); // Fetch data based on new page size
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

      {/* Modal for creating/updating product */}
      <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Product' : 'Create Product'}</Modal.Title>
        </Modal.Header>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProductName">
              <Form.Label>Product Name <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                isInvalid={!formData.productName && errorMessage}
                className="custom-placeholder"
              />
              <Form.Control.Feedback type="invalid">
                Product Name is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPrice">
              <Form.Label>Price <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                isInvalid={!formData.price && errorMessage}
                className="custom-placeholder"
              />
              <Form.Control.Feedback type="invalid">
                Price is required.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Brand Dropdown */}
            <Form.Group controlId="formBrand">
              <Form.Label>Brand <span style={{ color: 'red' }}>*</span></Form.Label>
              <Select
                value={selectedBrand}
                onChange={handleBrandChange}
                options={brands}
                placeholder="Select Brand"
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Product;
