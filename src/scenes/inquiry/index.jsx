import React, { useState, useEffect, useRef } from "react";
import {
  faEdit,
  faTrash,
  faUserCheck,
  faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";

import {
  Form,
  Button,
  Modal,
  Table,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import axios from "axios";
import { FaEye, FaSearch } from "react-icons/fa";
import "./inquiry.css";
import "../../components/table/TableWithFeatures.css";
import { Alert } from "react-bootstrap";
import Select from "react-select"; // Importing react-select
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";

const Inquiry = () => {
  const token = localStorage.getItem("token");
  const userId = parseInt(localStorage.getItem("userId"), 10); // Convert userId to integer
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedQuotationFilter, setSelectedQuotationFilter] = useState("");
  const [selectedFollowUpUserFilter, setSelectedFollowUpUserFilter] =
    useState("");
  const [totalData, setTotalData] = useState("");
  const [followUpUserData, setFollowUpUserData] = useState([]); // To store IDs and active flags
  const [followUpQuotationData, setFollowUpQuotationData] = useState([]); // To store IDs and active flags
  const location = useLocation();
  const { status } = location.state || {}; // Safely retrieve status from navigation state
  const [showWinLossModal, setShowWinLossModal] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const [isWin, setIsWin] = useState(null);
  const [currentInquiryId, setCurrentInquiryId] = useState(null);

  const handleButtonClick = (winStatus, inquiryId) => {
    setIsWin(winStatus);
    setCurrentInquiryId(inquiryId);
    setShowWinLossModal(true);
  };

  // Inside your component
  const handleModalSubmit = () => {
    fetch(
      `${process.env.REACT_APP_URL}/inquiry/winorloss/${currentInquiryId}?userId=${userId}&isWin=${isWin}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: modalDescription }),
      }
    )
      .then((response) => {
        if (response.ok) {
          toast.success("Status updated successfully!");
          fetchTableData(currentPage, search); // Refresh table data after successful update
        } else {
          toast.error("Error updating status.");
        }
      })
      .catch((error) => {
        toast.error("Error: " + error.message);
      })
      .finally(() => {
        setShowWinLossModal(false);
        setModalDescription("");
      });
  };

  const [formData, setFormData] = useState({
    projectName: "",
    // inquiryType: "",
    inquiryStatus: "",
    consumerId: "",
    productId: "",
    consultantId: "",
    remark: "",
    createdBy: userId,
    followUpUser: "",
    followUpQuotation: "",
    description: "", // Add description here
  });

  const [formDataProduct, setformDataProduct] = useState({});
  const [errors, setErrors] = useState({});
  const [tableData, setTableData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // For Product Modal
  const [showProductModal, setShowProductModal] = useState(false);

  // const [showHelloWorldModal, setShowHelloWorldModal] = useState(false);

  // Function to handle opening the modal
  // const handleShowHelloWorldModal = () => {
  //   setShowHelloWorldModal(true);
  // };

  // const [inquiryDetails, setInquiryDetails] = useState(null);
  // const [loadingDetails, setLoadingDetails] = useState(false);
  // const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();
  const [userType, setUserType] = useState(""); // or "Quotation"
  const userRole = localStorage.getItem("userRole"); // You can set this based on your logic
  // console.log("User role:", userRole);
  const [quotationDescription, setQuotationDescription] = useState(""); // Quotation description for modal
  const [followUpDescription, setFollowUpDescription] = useState(""); // Follow-up description for modal

  // Function to handle marking quotation as done
  const handleQuotationDone = async (inquiryId, followUpUserId) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/inquiry/quotation/done/${inquiryId}`,
        {
          followUpUser: followUpUserId, // ID of the follow-up user
          userId: userId, // Login User ID
          description: quotationDescription, // Quotation description from modal input
          isQuotationGiven: true, // Set quotation as given
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass auth token
          },
        }
      );

      // console.log("Quotation done response:", response.data);

      // Check for response status and show appropriate toast
      if (response.status === 200) {
        toast.success(response.data.message || "Quotation successful", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false, // Show progress bar
          className: "toast-success", // Custom class for green background
          progressStyle: { backgroundColor: "green" }, // Green progress bar
        });

        // Reset and refresh data
        setQuotationDescription(""); // Reset modal description
        setshowStatusQuartationChangeModal(false); // Close the modal

        // Call the function to refresh table data
        fetchTableData(currentPage); // Fetch the latest data for the current page
      } else {
        // If response status is not 200, show error toast
        toast.error("Error in response, status code: " + response.status, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false, // Show progress bar
          progressStyle: { backgroundColor: "red" }, // Red progress bar
        });
      }
    } catch (error) {
      console.error("Error marking quotation as done:", error);

      // Show error toast if there's an exception
      toast.error("Error failed", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
    }
  };

  // Check if the token exists in localStorage
  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      // Redirect to "/"
      navigate("/");
    }
  }, [navigate]);

  // Function to handle reassigning follow-up
  const handleFollowUpReassign = async (inquiryId, followUpQuotationId) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/inquiry/quotation/reassing/${inquiryId}`,
        {
          followUpQuotation: followUpQuotationId, // Ensure follow-up quotation ID is passed correctly
          userId: userId, // Login User ID
          description: followUpDescription, // Description from the modal input
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("Follow-up reassigned successfully:", response.data);

      // Show success toast
      toast.success(
        response.data.message || "Follow-up reassigned successfully",
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false, // Show progress bar
          className: "toast-success", // Custom class for green background
          progressStyle: { backgroundColor: "green" }, // Green progress bar
        }
      );

      // Close modal after success
      setshowStatusQuartationChangeModal(false);

      // Refresh the table data
      fetchTableData(currentPage);
    } catch (error) {
      console.error("Error reassigning follow-up:", error);

      // Show error toast in case of failure
      toast.error("Error reassigning follow-up", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
    }
  };

  const handleDetailsClick = (id) => {
    // Navigate to the inquiry details page by ID
    navigate(`/inquiry/${id}`);
  };

  // const fetchInquiryDetails = async (id) => {
  //   setLoadingDetails(true);
  //   try {
  //     const response = await axios.get(
  //       `${process.env.REACT_APP_URL}/inquiry/get/${id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("Inquiry details:", response.data.data);
  //     setInquiryDetails(response.data.data);
  //     setLoadingDetails(false);
  //     setShowDetailsModal(true); // Show modal with details
  //   } catch (error) {
  //     setLoadingDetails(false);
  //     console.error("Error fetching inquiry details:", error);
  //   }
  // };

  // const handleDetailsClick = (id) => {
  //   fetchInquiryDetails(id); // Fetch details on button click
  // };

  const timeoutRef = useRef(null);
  const debounceSearch = (fetchFunction, inputValue, setIsLoading) => {
    // Clear previous timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to delay the search API call by 2 seconds
    timeoutRef.current = setTimeout(() => {
      fetchFunction(inputValue); // Call the fetch function with the input value
      setIsLoading(false);
    }, 500); // 2000ms delay = 2 seconds
  };

  const handleSubmitProduct = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/product/create`,
        formDataProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        }
      );

      // Success message from backend
      const successMessage =
        response.data.message || "Product created successfully!";
      setSuccessMessage(successMessage);

      setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3 seconds
      fetchDropdownOptions(); // Refresh the product dropdown list with the new product
      setShowProductModal(false); // Close the modal after successful save
      setformDataProduct({}); // Reset the product form data
    } catch (error) {
      // Error message from backend
      const errorMessage =
        error.response?.data?.message ||
        "Error submitting product. Please try again.";
      setErrorMessage(errorMessage);

      setTimeout(() => setErrorMessage(""), 3000); // Clear error message after 3 seconds
    }
  };

  // ////////////////////////
  // for consumer add more
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModalConsumer, setShowModalConsumer] = useState(false);

  const [formDataConsumer, setFormDataConsumer] = useState({
    consumerName: "",
    emailId: "",
    address: "",
    contact: "",
  });

  const handleConsumerInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataConsumer({ ...formDataConsumer, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim())
      newErrors.projectName = "Project Name is required.";
    if (!formData.inquiryStatus)
      newErrors.inquiryStatus = "Inquiry Status is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.consumerId) newErrors.consumerId = "Consumer is required.";
    if (!formData.brandId) newErrors.brandId = "Brand is required.";
    if (!formData.productId) newErrors.productId = "Product is required.";
    if (!formData.consultantId)
      newErrors.consultantId = "Consultant is required.";
    if (!formData.followUpQuotation)
      newErrors.followUpQuotation = "Follow-up Quotation is required.";
    if (!formData.followUpUser)
      newErrors.followUpUser = "Follow-up User is required.";
    if (!formData.remark.trim()) newErrors.remark = "Remark is required.";

    setErrors(newErrors);

    // If no errors, return true, else false
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler for consumer form
  const handleSubmitConsumer = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/consumer/save`,
        formDataConsumer,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Success message from backend
      const successMessage =
        response.data.message || "Consumer saved successfully!";

      // Show success toast with green progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000, // Automatically close after 2 seconds
        hideProgressBar: false, // Show progress bar
        className: "toast-success",
        progressStyle: { backgroundColor: "green" }, // Green progress bar
      });

      setFormDataConsumer({
        consumerName: "",
        emailId: "",
        address: "",
        contact: "",
      });
      setShowModalConsumer(false); // Close modal after successful save
      fetchDropdownOptions(); // Refresh the consumer dropdown options
    } catch (error) {
      // Error message from backend
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save consumer. Please try again.";

      // Show error toast with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000, // Automatically close after 3 seconds
        hideProgressBar: false, // Show progress bar
        className: "toast-error",
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
    }
  };

  const handleCloseConsumer = () => {
    setShowModalConsumer(false); // Close only the consumer modal
    setFormDataConsumer({
      consumerName: "",
      emailId: "",
      address: "",
      contact: "",
    });
    setFormErrors({});
    setErrorMessage("");
    setSuccessMessage("");
  };

  // ////////////////////////////////

  // for conslutant add more

  // State variables
  const [consultantformData, setconsultantFormData] = useState({
    consultantName: "",
    contactPerson: "",
    contactNumber: "",
    createdBy: { id: userId },
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showModalConsultant, setShowModalConsultant] = useState(false);
  // const [errors, setErrors] = useState({});
  const [consltanterrors, setConsultantErrors] = useState({});

  // Function to close consultant modal
  const handleCloseConsultant = () => {
    setShowModalConsultant(false);
    setconsultantFormData({
      consultantName: "",
      contactPerson: "",
      contactNumber: "",
      createdBy: { id: userId },
    });
    setConsultantErrors({});
    setMessage("");
    setMessageType("");
  };

  // Function to handle form input changes
  const handleConsultantInputChange = (e) => {
    const { name, value } = e.target;
    setconsultantFormData({
      ...consultantformData,
      [name]: value,
    });
  };

  // Validation for consultant form fields
  const validateConsultantFields = () => {
    const consltanterrors = {};
    if (!consultantformData.consultantName) {
      consltanterrors.consultantName = "Consultant Name is required.";
    }
    if (!consultantformData.contactPerson) {
      consltanterrors.contactPerson = "Contact Person is required.";
    }
    if (!consultantformData.contactNumber) {
      consltanterrors.contactNumber = "Contact Number is required.";
    }
    setConsultantErrors(consltanterrors);
    return Object.keys(consltanterrors).length === 0;
  };

  // Function to add validation class based on errors
  const getValidationClass = (fieldName) => {
    return consltanterrors[fieldName] ? "is-invalid" : "";
  };

  // Submit the consultant form
  const consultantHandleSubmit = async () => {
    const isValid = validateConsultantFields();
    if (!isValid) {
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/consultant/save`,
        consultantformData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success message from backend
      const successMessage =
        response.data.message || "Consultant saved successfully!";

      // Show success toast with green progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000, // Automatically close after 2 seconds
        hideProgressBar: false, // Show progress bar
        className: "toast-success",
        progressStyle: { backgroundColor: "green" }, // Green progress bar
      });

      // Reset the form after successful submission
      setconsultantFormData({
        consultantName: "",
        contactPerson: "",
        contactNumber: "",
        createdBy: { id: userId },
      });

      handleCloseConsultant(); // Close the modal
    } catch (error) {
      // Error message from backend
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save consultant. Please try again.";

      // Show error toast with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000, // Automatically close after 3 seconds
        hideProgressBar: false, // Show progress bar
        className: "toast-error",
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
    }
  };

  // ///////////////////////////////

  // fro user add more
  const [newUserData, setNewUserData] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    designation: "",
    roleId: "",
    mobileNo: "",
  });
  const [showUserModal, setShowUserModal] = useState(false);

  // fatch Roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/roles/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Roles fetched successfully:", response.data.data);
      const rolesData = response.data.data.roles;
      const rolesArray = rolesData.map((role) => ({
        id: role.Id,
        name: role.name.trim(),
      }));
      // console.log("Roles array:", rolesArray);
      setRoleOptions(rolesArray);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };
  useEffect(() => {
    fetchRoles();
  }, []);
  const [roleOptions, setRoleOptions] = useState([]);
  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData({ ...newUserData, [name]: value });
  };

  const handleSubmitNewUser = async () => {
    const submissionData = {
      id: newUserData.userId,
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password || undefined, // Optionally pass password
      designation: newUserData.designation,
      role: { id: newUserData.roleId },
      mobileNo: newUserData.mobileNo,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/user/signup`,
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success message from backend
      const successMessage =
        response.data.message || "User saved successfully!";

      // Show success toast with green progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000, // Automatically close after 2 seconds
        hideProgressBar: false, // Show progress bar
        className: "toast-success",
        progressStyle: { backgroundColor: "green" }, // Green progress bar
      });

      // Reset form data after successful submission
      setNewUserData({
        userId: "",
        name: "",
        email: "",
        password: "",
        designation: "",
        roleId: "",
        mobileNo: "",
      });

      // Fetch updated user list for the dropdown
      fetchDropdownOptions();
      setShowUserModal(false); // Close modal after save
    } catch (error) {
      // Error message from backend
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save new user. Please try again.";

      // Show error toast with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000, // Automatically close after 3 seconds
        hideProgressBar: false, // Show progress bar
        className: "toast-error",
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });

      console.error("Error saving new user:", error);
    }
  };

  // ////////////////////////////////

  // followup

  const [isFollowUpUser, setIsFollowUpUser] = useState(true); // Track if it's for Follow-up User or Quotation

  // const demo = () => {
  //   console.log("demolll");
  // };

  useEffect(() => {
    fetchTableData(currentPage, search);
    // fetchDropdownOptions();
    // console.log(currentPage);
  }, [currentPage, search, pageSize]);

  const handleStatusFilterChange = (e) => {
    const selectedStatus = e.target.value;
    setSelectedStatusFilter(selectedStatus);
    fetchTableData(1, search); // Fetch table data with updated status filter
  };

  const handleQuotationFilterChange = (value) => {
    setSelectedQuotationFilter(value);
    fetchTableData(1, search); // Update table data with updated quotation filter
  };

  const handleFollowUpUserFilterChange = (value) => {
    setSelectedFollowUpUserFilter(value); // Update follow-up user filter state
    fetchTableData(1, search); // Fetch table data with updated follow-up user filter
  };

  useEffect(() => {
    fetchTableData(1, search); // Fetch table data whenever filters change
  }, [
    selectedStatusFilter,
    selectedQuotationFilter,
    selectedFollowUpUserFilter,
    search,
  ]);

  const fetchTableData = async (page, searchQuery) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/inquiry/all`,
        {
          params: {
            page: page,
            size: pageSize,
            search: searchQuery,
            userId: userId, // User filter
            "inquiry-status": selectedStatusFilter || status || "", // Pass empty string if no filter selected
            QuotationPerson: selectedQuotationFilter || "", // Pass empty string if no filter selected
            followUpPerson: selectedFollowUpUserFilter || "", // Pass empty string if no filter selected
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const inquiryContent = response.data.data.inquiries.content;
      const userData = inquiryContent.map((inquiry) => ({
        id: inquiry.followUpUser?.id || "N/A",
        active: inquiry.followUpUser?.active || false,
      }));

      const quotationData = inquiryContent.map((inquiry) => ({
        id: inquiry.followUpQuotation?.id || "N/A",
        active: inquiry.followUpQuotation?.active || false,
      }));

      setFollowUpUserData(userData);
      setFollowUpQuotationData(quotationData);

      setTotalData(response.data.data.totalItems);
      setTableData(inquiryContent);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      const [consumers, products, consultants, users] = await Promise.all([
        axios.get(`${process.env.REACT_APP_URL}/consumer/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_URL}/product/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_URL}/consultant/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_URL}/user/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setConsumerOptions(consumers.data.data.consumers);
      // setProductOptions(products.data.data.productList);
      // console.log("sss", products.data);
      setConsultantOptions(consultants.data.data.Consultants);
      setUserOptions(users.data.data.list);
      // console.log(users.data.data.list);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm(); // Reset the form when the modal is closed
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Stop form submission if validation fails
    }

    try {
      let response;
      if (editMode) {
        const updateData = { ...formData, updatedBy: userId };
        response = await axios.put(
          `${process.env.REACT_APP_URL}/inquiry/update/${selectedInquiryId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_URL}/inquiry/save`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Success message from backend
      const successMessage =
        response.data.message || "Inquiry processed successfully!";

      // Show success toast with green color and red progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });

      fetchTableData(currentPage); // Refresh the table
      handleModalClose(); // Close modal
    } catch (error) {
      // Error message from backend
      const errorMessage =
        error.response?.data?.message ||
        "Error processing the inquiry. Please try again.";

      // Show error toast if login fails with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      // inquiryType: "",
      inquiryStatus: "",
      consumerId: "",
      productId: "",
      consultantId: "",
      remark: "",
      createdBy: userId,
      followUpUser: "",
      followUpQuotation: "",
      description: "",
    });
    setSelectedFollowUpUser(null);
    setSelectedFollowUpQuotation(null);
    setErrors({}); // Clear validation errors
    setEditMode(false); // Ensure it's not in edit mode
    setSelectedInquiryId(null);
  };

  const handleEdit = (inquiry) => {
    console.log("Inquiry object:", inquiry);
    // Initialize the form with pre-existing values from the inquiry
    setSelectedInquiryId(inquiry.inquiryId); // or inquiry.id, depending on your data structure

    setFormData({
      projectName: inquiry.projectName,
      inquiryStatus: inquiry.inquiryStatus,
      consumerId: inquiry.consumer ? inquiry.consumer.consumerId : "", // Handle if consumer is not available
      brandId: inquiry.brand ? inquiry.brand.brandId : "", // Add brandId here
      productId: inquiry.product ? inquiry.product.productId : "",
      consultantId: inquiry.consultant ? inquiry.consultant.consultantId : "",
      remark: inquiry.remark,
      followUpUser: inquiry.followUpUser ? inquiry.followUpUser.id : "",
      followUpQuotation: inquiry.followUpQuotation
        ? inquiry.followUpQuotation.id
        : "",
      description: inquiry.description || "", // Add description field for editing
    });

    // Pre-select the dropdown values based on inquiry data
    setSelectedConsumer(
      inquiry.consumer
        ? {
            value: inquiry.consumer.consumerId,
            label: inquiry.consumer.consumerName,
          }
        : null
    );
    setSelectedBrand(
      inquiry.product && inquiry.product.brand
        ? {
            value: inquiry.product.brand.brandId,
            label: inquiry.product.brand.brandName,
          }
        : null
    );
    setFormData((prevState) => ({
      ...prevState,
      brandId:
        inquiry.product && inquiry.product.brand
          ? inquiry.product.brand.brandId
          : "",
    }));

    setSelectedProduct(
      inquiry.product
        ? {
            value: inquiry.product.productId,
            label: inquiry.product.productName,
          }
        : null
    );
    setSelectedConsultant(
      inquiry.consultant
        ? {
            value: inquiry.consultant.consultantId,
            label: inquiry.consultant.consultantName,
          }
        : null
    );
    setSelectedFollowUpUser(
      inquiry.followUpUser
        ? { value: inquiry.followUpUser.id, label: inquiry.followUpUser.name }
        : null
    );
    setSelectedFollowUpQuotation(
      inquiry.followUpQuotation
        ? {
            value: inquiry.followUpQuotation.id,
            label: inquiry.followUpQuotation.name,
          }
        : null
    );

    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_URL}/inquiry/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success message from backend
      const successMessage =
        response.data.message || "Inquiry deleted successfully!";
      // Show success toast with green color and red progress bar
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false, // Show progress bar
        className: "toast-success", // Custom class for green background
        progressStyle: { backgroundColor: "green" }, // Red progress bar
      });
      // setSuccessMessage(successMessage);

      setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3 seconds
      fetchTableData(currentPage); // Refresh the table data
    } catch (error) {
      // Error message from backend
      const errorMessage =
        error.response?.data?.message ||
        "Error deleting the inquiry. Please try again.";

      // Show error toast if login fails with red progress bar
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false, // Show progress bar
        progressStyle: { backgroundColor: "red" }, // Red progress bar
      });
      // setErrorMessage(errorMessage);

      setTimeout(() => setErrorMessage(""), 3000); // Clear error message after 3 seconds
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

  const limitWords = (text) => {
    // Add null or undefined check
    if (!text) {
      return "";
    }
    return text.length > 7 ? text.slice(0, 7) + ".." : text;
  };

  const renderTooltip = (props, text) => <Tooltip {...props}>{text}</Tooltip>;

  // State for storing dropdown options
  const [consumerOptions, setConsumerOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [consultantOptions, setConsultantOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  // console.log("userOptions", userOptions);

  // Dropdown refs for scroll tracking
  const consumerDropdownRef = useRef(null);
  const productDropdownRef = useRef(null);
  const consultantDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Helper function to get the appropriate dropdown ref

  // Initial load of data
  useEffect(() => {
    if (showModal === true) {
      // Fetch necessary dropdown options when modal opens
      fetchConsumers();
      fetchProducts();
      fetchConsultants();
      fetchUsers();
    }
  }, [showModal]);
  useEffect(() => {
    fetchUsers();
  }, []);

  // ////////////////////////////////
  // const [consumerOptions, setConsumerOptions] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null); // Track selected consumer separately
  const [isLoadingConsumers, setIsLoadingConsumers] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Get the name and value from the event target
    setFormData({
      ...formData, // Spread the existing form data
      [name]: value, // Dynamically update the specific form field by its name
    });
  };

  const handleConsumerChange = (selectedOption) => {
    setSelectedConsumer(selectedOption); // Set the selected consumer in the state
    setFormData({
      ...formData,
      consumerId: selectedOption ? selectedOption.value : "", // Correctly update formData with the selected consumer's ID
    });
  };

  const handleConsumerSearch = (inputValue) => {
    debounceSearch(fetchConsumers, inputValue, setIsLoadingConsumers);
  };

  const fetchConsumers = async (inputValue = "") => {
    setIsLoadingConsumers(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/consumer/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: inputValue,
          },
        }
      );
      const consumers = response.data.data.consumers.map((consumer) => ({
        value: consumer.consumerId,
        label: consumer.consumerName,
      }));
      setConsumerOptions(consumers);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setIsLoadingConsumers(false);
    }
  };
  // //////////////////////

  // selectedProduct

  const handleSearch = (fetchFunc, inputValue) => {
    fetchFunc(inputValue); // Invoke the fetch function with the search input
  };

  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false); // For showing the modal
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/inquiry/get/${inquiryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Debug: Log the fetched inquiry data
      // console.log("Fetched inquiry data:", response.data.data);

      // Set the fetched inquiry data and update inquiryStatus
      const inquiryData = response.data.data;

      setStatusChangeData({
        ...inquiryData, // store the full inquiry data
        inquiryStatus: newStatus, // Update only the status
      });

      setShowStatusChangeModal(true); // Show the modal
    } catch (error) {
      console.error("Error fetching inquiry details:", error);
      alert(
        "Failed to fetch inquiry details. Please check your connection or try again."
      );
    }
  };

  const submitStatusChange = async () => {
    if (!isFollowUpUser && !quotationDescription) {
      setStatusChangeError("Description is required.");
      return;
    }
    if (!description) {
      setStatusChangeError("Description is required.");
      return; // Stop the function if description is empty
    }

    try {
      // Make an API call to update the inquiry status and description
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/inquiry/update/${statusChangeData.inquiryId}`,
        {
          ...statusChangeData, // Include the full inquiry data
          inquiryStatus: statusChangeData.inquiryStatus, // Updated status
          description, // Updated description
          updatedBy: userId, // Update the user ID
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(response.data.message);

      setSuccessMessage(response.data.message);

      // Hide the modal and reset
      setShowStatusChangeModal(false);
      setDescription("");

      // Update table data with new status
      setTableData((prevData) =>
        prevData.map((inquiry) =>
          inquiry.inquiryId === statusChangeData.inquiryId
            ? { ...inquiry, inquiryStatus: statusChangeData.inquiryStatus }
            : inquiry
        )
      );

      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      setErrorMessage("Failed to update status. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const submitStatusDropdownChange = async () => {
    const {
      inquiryId,
      inquiryStatus,
      projectName,
      // inquiryType,
      description,
      consumer,
      product,
      consultant,
      followUpUser,
      followUpQuotation,
      remark,
      updatedBy,
    } = statusChangeData;

    if (!description) {
      setStatusChangeError("Description is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Ensure token is available
      // console.log("Token being sent:", token); // Debug token

      // Prepare the request payload in the correct format
      const requestData = {
        projectName,
        // inquiryType,
        inquiryStatus,
        description,
        consumerId: consumer?.consumerId, // Use consumerId directly
        productId: product?.productId, // Use productId directly
        consultantId: consultant?.consultantId, // Use consultantId directly
        followUpUser: followUpUser?.id, // Use followUpUser ID directly
        followUpQuotation: followUpQuotation?.id, // Use followUpQuotation ID directly
        remark,
        updatedBy: updatedBy?.id || userId, // Use updatedBy or fallback to current user ID
      };

      // console.log("Sending data:", requestData); // Debug request data

      const response = await axios.put(
        `${process.env.REACT_APP_URL}/inquiry/update/${inquiryId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is correct
          },
        }
      );

      // console.log("Response from backend:", response.data);

      toast.success(response.data.message || "Inquiry updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Hide the modal and reset
      setShowStatusChangeModal(false);

      // Update the table with new data
      setTableData((prevData) =>
        prevData.map((inquiry) =>
          inquiry.inquiryId === inquiryId
            ? { ...inquiry, inquiryStatus, description }
            : inquiry
        )
      );
    } catch (error) {
      console.error("Error updating inquiry:", error.response || error);

      // Show error message from backend
      toast.error(
        error.response?.data?.message ||
          "Failed to update inquiry. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const [showStatusQuartationChangeModal, setshowStatusQuartationChangeModal] =
    useState(false); // For showing the modal
  const [statusChangeData, setStatusChangeData] = useState({}); // Store the inquiry ID and new status
  const [description, setDescription] = useState(""); // Store the mandatory description
  const [statusChangeError, setStatusChangeError] = useState(""); // Store validation errors

  // Fetch products and update product options
  // Fetch products
  const fetchProducts = async (inputValue = "") => {
    setIsLoadingProducts(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/product/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: inputValue,
          },
        }
      );
      const products = response.data.data.productList.map((product) => ({
        value: product.productId,
        label: product.productName,
      }));
      // setProductOptions(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductDropdownOpen = () => {
    if (productOptions.length === 0) {
      fetchProducts(); // Fetch data only when dropdown opens and if it's not fetched already
    }
  };

  const handleConsultantDropdownOpen = () => {
    if (consultantOptions.length === 0) {
      fetchConsultants(); // Fetch data only when dropdown opens and if it's not fetched already
    }
  };
  // Fetch consultants
  const fetchConsultants = async (inputValue = "") => {
    setIsLoadingConsultants(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/consultant/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: inputValue,
          },
        }
      );
      const consultants = response.data.data.Consultants.map((consultant) => ({
        value: consultant.consultantId,
        label: consultant.consultantName,
      }));
      setConsultantOptions(consultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
    } finally {
      setIsLoadingConsultants(false);
    }
  };

  // Handling search for Follow-up User and Quotation

  const fetchUsers = async (inputValue = "") => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/user/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: inputValue,
          },
        }
      );
      const users = response.data.data.list.map((user) => ({
        value: user.Id,
        label: user.name,
      }));
      setUserOptions(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleQuotationSearch = (inputValue) => {
    // fetchFollowUpQuotations(inputValue); // Fetch data based on search input

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchFollowUpQuotations(inputValue); // Fetch users based on the input value
    }, 500); // Debounce the search by 500ms
  };

  const fetchFollowUpQuotations = async (inputValue = "") => {
    setIsLoadingQuotations(true); // Start loading
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/user/list`, // Use the API to fetch data
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: inputValue, // Send search input if needed
          },
        }
      );

      // Map the response data to the format expected by react-select
      const quotations = response.data.data.list.map((user) => ({
        value: user.Id, // Ensure this is the correct unique identifier
        label: user.name, // Display name in the dropdown
      }));

      setQuotationOptions(quotations); // Set the options for react-select
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setIsLoadingQuotations(false); // Stop loading
    }
  };

  const [quotationOptions, setQuotationOptions] = useState([]);
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false);
  const [selectedFollowUpQuotation, setSelectedFollowUpQuotation] =
    useState(null);

  // Inside the Select onChange event

  const handleProductSearch = (inputValue) => {
    debounceSearch(fetchProducts, inputValue, setIsLoadingProducts);
  };
  const handleConsultantSearch = (inputValue) => {
    debounceSearch(fetchConsultants, inputValue, setIsLoadingConsultants);
  };
  const handleUserSearch = (inputValue) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchUsers(inputValue); // Fetch users based on the input value
    }, 500); // Debounce the search by 500ms
  };

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingConsultants, setIsLoadingConsultants] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedFollowUpUser, setSelectedFollowUpUser] = useState(null); // Track selected follow-up user

  const isModalOpen =
    showProductModal ||
    showModalConsumer ||
    showModalConsultant ||
    showUserModal;

  const [brandOptions, setBrandOptions] = useState([]); // State to store fetched brands
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);

  const fetchBrands = async (searchQuery = "") => {
    setIsLoadingBrands(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/brand/list`,
        {
          params: {
            search: searchQuery,
            page: 1,
            size: 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(";;;;;;;;;;", response.data);
      const brands = response.data.data.map((brand) => ({
        value: brand.brandId,
        label: brand.brandName,
      }));
      setBrandOptions(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Fetch Products by selected brand
  const fetchProductsByBrand = async (brandId) => {
    if (!brandId) return;
    setIsLoadingProducts(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/product/listByBrand/${brandId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const products = response.data.data.map((product) => ({
        value: product.productId,
        label: `${product.productName} - $${product.price}`, // Show product name and price
      }));
      setProductOptions(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };
  // Handle brand change
  const handleBrandChange = (selectedOption) => {
    setSelectedBrand(selectedOption);
    setFormData({
      ...formData,
      brandId: selectedOption ? selectedOption.value : "",
    });
    setSelectedProduct(null); // Reset the selected product when brand changes
    fetchProductsByBrand(selectedOption ? selectedOption.value : ""); // Fetch products for the selected brand
  };

  // Handle product change
  const handleProductChange = (selectedOption) => {
    setSelectedProduct(selectedOption);
    setFormData({
      ...formData,
      productId: selectedOption ? selectedOption.value : "",
    });
  };

  // Handle brand search
  const handleBrandSearch = (inputValue) => {
    fetchBrands(inputValue); // Fetch brands based on search query
  };

  // Handle product search

  // Initial load of brands
  useEffect(() => {
    fetchBrands();
  }, []);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleExport = async () => {
    if (!month || !year) {
      alert("Please select both month and year.");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/inquiry/excel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { month, year },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inquiry_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the Excel file:", error);
    }
  };

  return (
    <>
      <div className={`main-table m-4 `}>
        <Row className="mb-3 m-2">
          <Col md={4}>
            <h6 style={{ color: "#000000" }}>Filter by Status</h6>
            <Form.Control
              as="select"
              value={selectedStatusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">All</option>
              <option value="TENDER">TENDER</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="PROCUREMENT">PROCUREMENT</option>
              <option value="URGENT">URGENT</option>
            </Form.Control>
          </Col>

          <Col md={4}>
            <h6 style={{ color: "#000000" }}>Filter by Quotation</h6>
            <Select
              name="quotationFilter"
              value={userOptions.find(
                (option) => option.value === selectedQuotationFilter
              )} // Bind selected value
              onChange={(selectedOption) =>
                handleQuotationFilterChange(
                  selectedOption ? selectedOption.value : ""
                )
              } // Update on selection or clear
              options={[{ value: "", label: "All" }, ...userOptions]} // Include default "All" option
              placeholder="Search and Select Quotation"
              isSearchable
              isClearable
              styles={{
                option: (provided) => ({ ...provided, color: "black" }),
                singleValue: (provided) => ({ ...provided, color: "black" }),
              }}
            />
          </Col>

          <Col md={4}>
            <h6 style={{ color: "#000000" }}>Filter by Follow Up User</h6>
            <Select
              name="followUpUserFilter"
              value={userOptions.find(
                (option) => option.value === selectedFollowUpUserFilter
              )} // Bind selected value
              onChange={(selectedOption) =>
                handleFollowUpUserFilterChange(
                  selectedOption ? selectedOption.value : ""
                )
              } // Update on selection or clear
              options={[{ value: "", label: "All" }, ...userOptions]} // Include default "All" option
              placeholder="Search and Select Follow-Up User"
              isSearchable
              isClearable
              styles={{
                option: (provided) => ({ ...provided, color: "black" }),
                singleValue: (provided) => ({ ...provided, color: "black" }),
              }}
            />
          </Col>
        </Row>

        <hr style={{ color: "#000000" }} />
        <Row className="mb-3 m-2">
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

          <Col md={6}>
            <div className="export-container">
              <label className="export-label">
                Month:
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="export-select-month"
                >
                  <option value="">Select Month</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label className="export-label">
                Year:
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="export-select"
                >
                  <option value="">Select Year</option>
                  {[...Array(5)].map((_, i) => {
                    const currentYear = new Date().getFullYear();
                    return (
                      <option key={i} value={currentYear - i}>
                        {currentYear - i}
                      </option>
                    );
                  })}
                </select>
              </label>
              <button onClick={handleExport} className="export-button">
                Export to Excel
              </button>
            </div>
          </Col>
          <Col md={2}>
            <Button
              className="filterCreateButton"
              variant="primary"
              onClick={() => {
                // Reset form data for a new inquiry
                setFormData({
                  projectName: "",
                  // inquiryType: "",
                  inquiryStatus: "",
                  consumerId: "",
                  productId: "",
                  consultantId: "",
                  remark: "",
                  createdBy: userId,
                  followUpUser: "",
                  followUpQuotation: "",
                  description: "",
                });

                // Reset selected dropdown options
                setSelectedConsumer(null);
                setSelectedProduct(null);
                setSelectedConsultant(null);
                setSelectedFollowUpUser(null);
                setSelectedFollowUpQuotation(null);

                setEditMode(false); // Make sure it's not in edit mode
                setShowModal(true); // Show the modal for creating a new inquiry
                resetForm();
              }}
            >
              Create Inquiry
            </Button>
          </Col>
        </Row>
        {/* Success and Error Messages */}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <div className="table-container">
          <Table striped bordered hover className="table">
            <thead className="table-header">
              <tr>
                <th>Sr.No</th>
                <th>Project Name</th>
                {/* <th>Inquiry Type</th> */}
                <th>Consumer</th>
                <th>Product</th>
                <th>Consultant</th>
                <th>Inquiry Status</th> {/* Updated Status column */}
                <th>WIN/LOSS</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <tr key={row.id}>
                    <td>
                      {(currentPage - 1) * tableData.length + (index + 1)}
                    </td>

                    {/* Project Name Cell with Tooltip */}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={(props) =>
                          renderTooltip(props, row.projectName)
                        }
                      >
                        <span>{limitWords(row.projectName)}</span>
                      </OverlayTrigger>
                    </td>

                    {/* Consumer Name with Tooltip */}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={(props) =>
                          renderTooltip(
                            props,
                            row.consumer?.consumerName || "N/A"
                          )
                        }
                      >
                        <span>
                          {limitWords(row.consumer?.consumerName || "N/A")}
                        </span>
                      </OverlayTrigger>
                    </td>

                    {/* Product Name with Tooltip */}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={(props) =>
                          renderTooltip(
                            props,
                            row.product?.productName || "N/A"
                          )
                        }
                      >
                        <span>
                          {limitWords(row.product?.productName || "N/A")}
                        </span>
                      </OverlayTrigger>
                    </td>

                    {/* Consultant Name with Tooltip */}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={(props) =>
                          renderTooltip(
                            props,
                            row.consultant?.consultantName || "N/A"
                          )
                        }
                      >
                        <span>
                          {limitWords(row.consultant?.consultantName || "N/A")}
                        </span>
                      </OverlayTrigger>
                    </td>

                    {/* Inquiry Status */}
                    <td>
                      <Form.Select
                        style={{ width: "100%" }}
                        value={row.inquiryStatus}
                        onChange={(e) =>
                          handleStatusChange(row.inquiryId, e.target.value)
                        } // Trigger modal
                      >
                        <option value="">All</option>
                        <option value="TENDER">TENDER</option>
                        <option value="PURCHASE">PURCHASE</option>
                        <option value="PROCUREMENT">PROCUREMENT</option>
                        <option value="Rejected">URGENT</option>
                      </Form.Select>
                    </td>

                    {/* winLoss */}
                    {/* winLoss */}
<td>
  {row.isWin === null ? ( // Check if isWin is null
    <>
      <button
        style={{
          backgroundColor: "#2cbb1f",
          color: "white",
          border: "none",
          padding: "5px 10px",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "5px",
          marginRight: "5px",
        }}
        onClick={() => handleButtonClick(true, row.inquiryId)} // Handle win button click
      >
        <FontAwesomeIcon icon={faThumbsUp} />
      </button>
      <button
        style={{
          backgroundColor: "red",
          color: "white",
          border: "none",
          padding: "5px 10px",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "5px",
        }}
        onClick={() => handleButtonClick(false, row.inquiryId)} // Handle loss button click
      >
        <FontAwesomeIcon icon={faThumbsDown} />
      </button>
    </>
  ) : row.isWin ? ( // Check if isWin is true
    <button
      style={{
        backgroundColor: "#2cbb1f",
        color: "white",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer",
        fontSize: "16px",
        borderRadius: "5px",
        marginRight: "5px",
      }}
      onClick={() => handleButtonClick(true, row.inquiryId)} // Handle win button click
    >
      <FontAwesomeIcon icon={faThumbsUp} />
    </button>
  ) : ( // Check if isWin is false
    <button
      style={{
        backgroundColor: "red",
        color: "white",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer",
        fontSize: "16px",
        borderRadius: "5px",
      }}
      onClick={() => handleButtonClick(false, row.inquiryId)} // Handle loss button click
    >
      <FontAwesomeIcon icon={faThumbsDown} />
    </button>
  )}
</td>


                    {/* Actions */}
                    <td>
                      <Button
                        className="action-button angelic-button"
                        variant="info"
                        onClick={() => handleDetailsClick(row.inquiryId)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        className="action-button angelic-button"
                        variant="success"
                        onClick={() => handleEdit(row)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      {userRole === "ADMIN" && (
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(row.inquiryId)}
                          className="action-button angelic-button"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}

                      {/* Conditionally Render Follow-up Button */}

                      {/* Conditionally Render Quotation Button */}
                      {/* Conditionally Render Quotation Button */}
                      {row.followUpQuotation?.id === userId && (
                        <Button
                          variant="primary"
                          onClick={() => {
                            // Reset data and open modal for marking quotation as done
                            setQuotationDescription(row.description || ""); // Fill description
                            setStatusChangeData({
                              inquiryId: row.inquiryId,
                              followUpQuotationId: row.followUpQuotation.id, // Set follow-up quotation ID
                              followUpUserId: null, // Clear follow-up user ID since it's a quotation
                            });
                            setSelectedFollowUpUser({
                              value: row.followUpQuotation.id,
                              label: row.followUpQuotation.name,
                            }); // Set selected follow-up quotation user
                            setIsFollowUpUser(false); // Set context for quotation
                            setshowStatusQuartationChangeModal(true); // Open modal
                          }}
                          className="action-button angelic-button"
                        >
                          <FontAwesomeIcon icon={faFileInvoice} />
                        </Button>
                      )}

                      {/* Conditionally Render Follow-up Button */}
                      {row.followUpUser?.id === userId && (
                        <Button
                          variant="primary"
                          onClick={() => {
                            // Reset data and open modal for reassigning follow-up
                            setFollowUpDescription(row.description || ""); // Fill description
                            setStatusChangeData({
                              inquiryId: row.inquiryId,
                              followUpQuotationId: null, // Clear follow-up quotation ID since it's follow-up
                              followUpUserId: row.followUpUser.id, // Set follow-up user ID
                            });
                            setSelectedFollowUpUser({
                              value: row.followUpUser.id,
                              label: row.followUpUser.name,
                            }); // Set selected follow-up user
                            setIsFollowUpUser(true); // Set context for follow-up
                            setshowStatusQuartationChangeModal(true); // Open modal
                          }}
                          className="action-button angelic-button"
                        >
                          <FontAwesomeIcon icon={faUserCheck} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="pagination-controls">
          <Row className="align-items-center">
            {" "}
            {/* Center align all items vertically */}
            <Col md="auto">
              {" "}
              {/* Use 'auto' to make the columns adjust based on content */}
              <h5>Total Records: {totalData}</h5>
            </Col>
            <Col md="auto">
              <Button
                variant="primary"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
            </Col>
            <Col md="auto">
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </Col>
            <Col md="auto">
              <Button
                variant="primary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Col>
            <Col md="auto">
              <DropdownButton
                id="dropdown-page-size"
                title={`Page Size: ${pageSize}`}
                onSelect={(e) => {
                  setPageSize(e); // Update the pageSize state when the user selects a new size
                  fetchTableData(1, search, e); // Fetch data based on new page size
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
      </div>
      {/* main fom */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        className={`${isModalOpen ? "dimmer" : ""}`}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false} // Prevent closing with the Escape key
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Edit Inquiry" : "Create Inquiry"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="inquiry-form">
            <Form.Group controlId="formProjectName">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Project name"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className="custom-placeholder"
                required
              />
              {errors.projectName && (
                <div style={{ color: "red" }}>{errors.projectName}</div>
              )}
            </Form.Group>

            {/* 
            <Form.Group controlId="formInquiryType">
              <Form.Label>Inquiry Type</Form.Label>
              <Form.Control
                as="select"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleInputChange}
                className="custom-placeholder"
              >
                <option value="">Select Inquiry Type</option>{" "}
                <option value="Tendering">Tendering</option>
                <option value="Urgent">Urgent</option>
                <option value="Procurement">Procurement</option>
              </Form.Control>
              {errors.inquiryType && (
                <div style={{ color: "red" }}>{errors.inquiryType}</div>
              )}
            </Form.Group>
             */}

            <Form.Group controlId="formInquiryStatus">
              <Form.Label>Inquiry Status</Form.Label>
              <Form.Select
                name="inquiryStatus"
                value={formData.inquiryStatus}
                onChange={handleInputChange}
                className="custom-placeholder"
                required
              >
                <option value="">Select Inquiry Status</option>
                <option value="TENDER">TENDER</option>
                <option value="PURCHASE">PURCHASE</option>
                <option value="PROCUREMENT">PROCUREMENT</option>
                <option value="Rejected">URGENT</option>
                {/* Conditionally render Rejected */}
                {formData.isEditing && (
                  <option value="Rejected">Rejected</option>
                )}

                {/* Add more option */}
              </Form.Select>
              {errors.inquiryStatus && (
                <div style={{ color: "red" }}>{errors.inquiryStatus}</div>
              )}
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Description"
                name="description"
                value={formData.description} // Bind description to formData
                onChange={handleInputChange} // Use the same handleInputChange function
                required
              />
              {errors.description && (
                <div style={{ color: "red" }}>{errors.description}</div>
              )}
            </Form.Group>

            {/* Consumer Dropdown */}
            <Form.Group controlId="formConsumerId">
              <Form.Label>Consumer</Form.Label>
              <Select
              required
                name="consumerId"
                value={selectedConsumer}
                onChange={(selectedOption) => {
                  if (selectedOption.value === "add_more") {
                    setShowModalConsumer(true);
                  } else {
                    handleConsumerChange(selectedOption);
                  }
                }}
                onInputChange={handleConsumerSearch}
                options={[
                  ...consumerOptions,
                  { value: "add_more", label: "Add More" },
                ]}
                placeholder="Search and Select Consumer"
                isLoading={isLoadingConsumers}
                isClearable
                styles={{
                  option: (provided) => ({ ...provided, color: "black" }),
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
              {errors.consumerId && (
                <div style={{ color: "red" }}>{errors.consumerId}</div>
              )}
            </Form.Group>

            {/* Brand Dropdown */}
            <Form.Group controlId="formBrandId">
              <Form.Label>Brand</Form.Label>
              <Select
              required
                name="brandId"
                value={selectedBrand}
                onChange={handleBrandChange}
                options={brandOptions}
                placeholder="Search and Select Brand"
                isLoading={isLoadingBrands}
                isClearable
                styles={{
                  option: (provided) => ({ ...provided, color: "black" }),
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
              {errors.brandId && (
                <div style={{ color: "red" }}>{errors.brandId}</div>
              )}
            </Form.Group>

            {/* Product Dropdown */}
            <Form.Group controlId="formProductId">
              <Form.Label>Product</Form.Label>
              <Select
              required
                name="productId"
                value={selectedProduct}
                onChange={handleProductChange}
                onInputChange={handleProductSearch}
                options={productOptions}
                placeholder="Search and Select Product"
                isLoading={isLoadingProducts}
                isClearable
                isDisabled={!selectedBrand}
                styles={{
                  option: (provided) => ({ ...provided, color: "black" }),
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
              {errors.productId && (
                <div style={{ color: "red" }}>{errors.productId}</div>
              )}
            </Form.Group>

            {/* Consultant Dropdown */}
            <Form.Group controlId="formConsultantId">
              <Form.Label>Consultant</Form.Label>
              <Select
              required
                name="consultantId"
                value={selectedConsultant}
                onChange={(selectedOption) => {
                  if (selectedOption.value === "add_more") {
                    setShowModalConsultant(true);
                  } else {
                    setSelectedConsultant(selectedOption);
                    setFormData({
                      ...formData,
                      consultantId: selectedOption ? selectedOption.value : "",
                    });
                  }
                }}
                onInputChange={handleConsultantSearch}
                options={[
                  ...consultantOptions,
                  { value: "add_more", label: "Add More" },
                ]}
                placeholder="Search and Select Consultant"
                isLoading={isLoadingConsultants}
                isClearable
                styles={{
                  option: (provided) => ({ ...provided, color: "black" }),
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
              {errors.consultantId && (
                <div style={{ color: "red" }}>{errors.consultantId}</div>
              )}
            </Form.Group>

            {/* Follow-up Quotation Dropdown */}
            <Form.Group controlId="formFollowUpQuotation">
              <Form.Label>Follow-up Quotation</Form.Label>
              <Select
              required
                name="followUpQuotation"
                value={selectedFollowUpQuotation}
                onChange={(selectedOption) => {
                  if (selectedOption.value === "add_more") {
                    setShowUserModal(true);
                  } else {
                    setSelectedFollowUpQuotation(selectedOption);
                    setFormData({
                      ...formData,
                      followUpQuotation: selectedOption
                        ? selectedOption.value
                        : "",
                    });
                  }
                }}
                onInputChange={handleQuotationSearch}
                options={[
                  ...quotationOptions,
                  { value: "add_more", label: "Add More" },
                ]}
                placeholder="Search and Select Follow-up Quotation"
                isLoading={isLoadingQuotations}
                isClearable
                styles={{
                  option: (provided) => ({ ...provided, color: "black" }),
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
              {errors.followUpQuotation && (
                <div style={{ color: "red" }}>{errors.followUpQuotation}</div>
              )}
            </Form.Group>

            {/* Follow-up User Dropdown */}
            <Form.Group controlId="formFollowUpUser">
              <Form.Label>Follow-up User</Form.Label>
              <Select
              required
                name="followUpUser"
                value={selectedFollowUpUser}
                onChange={(selectedOption) => {
                  if (selectedOption.value === "add_more") {
                    setShowUserModal(true);
                  } else {
                    setSelectedFollowUpUser(selectedOption);
                    setFormData({
                      ...formData,
                      followUpUser: selectedOption ? selectedOption.value : "",
                    });
                  }
                }}
                onInputChange={handleUserSearch}
                options={[
                  ...userOptions,
                  { value: "add_more", label: "Add More" },
                ]}
                placeholder="Search and Select Follow-up User"
                isLoading={isLoadingUsers}
                isClearable
                styles={{
                  option: (provided) => ({ ...provided, color: "black" }),
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
              {errors.followUpUser && (
                <div style={{ color: "red" }}>{errors.followUpUser}</div>
              )}
            </Form.Group>

            {/* Remark */}
            <Form.Group controlId="formRemark">
              <Form.Label>Remark</Form.Label>
              <Form.Control
              required
                as="textarea"
                rows={3}
                placeholder="Enter Remark"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
              />
              {errors.remark && (
                <div style={{ color: "red" }}>{errors.remark}</div>
              )}
              <option value="add_more">Add More</option> {/* Add more option */}
            </Form.Group>

            <div className="savebuttonDiv">
              <Button
                className="savebutton"
                variant="primary"
                onClick={handleSubmit}
              >
                {/* editssss */}
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* for Prodict Modal */}
      <Modal
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNewProductName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter product name"
                value={formDataProduct.productName || ""} // Bind input to formDataProduct
                onChange={(e) =>
                  setformDataProduct({
                    ...formDataProduct,
                    productName: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="formNewProductPrice">
              <Form.Label>Product Price</Form.Label>
              <Form.Control
              required
                type="number" // Ensure the input is a number
                placeholder="Enter product price"
                value={formDataProduct.price || ""} // Bind input to formDataProduct
                onChange={(e) =>
                  setformDataProduct({
                    ...formDataProduct,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Button
              variant="primary"
              onClick={() => {
                handleSubmitProduct(); // Call the product submission function
              }}
            >
              Save Product
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* for consumer add more  */}
      <Modal
        show={showModalConsumer}
        onHide={handleCloseConsumer}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Edit Consumer" : "Create Consumer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Success and Error Messages */}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form>
            <Form.Group controlId="formConsumerName">
              <Form.Label>
                Consumer Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter Consumer Name"
                name="consumerName"
                value={formDataConsumer.consumerName}
                onChange={handleConsumerInputChange}
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
              required
                type="email"
                placeholder="Enter Email"
                name="emailId"
                value={formDataConsumer.emailId}
                onChange={handleConsumerInputChange}
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
              required
                type="text"
                placeholder="Enter Address"
                name="address"
                value={formDataConsumer.address}
                onChange={handleConsumerInputChange}
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
              required
                type="text"
                placeholder="Enter Contact"
                name="contact"
                value={formDataConsumer.contact}
                onChange={handleConsumerInputChange}
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
          <Button variant="secondary" onClick={handleCloseConsumer}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmitConsumer}>
            Save Consumer
          </Button>
        </Modal.Footer>
      </Modal>
      {/* for consultant add more  */}
      <Modal
        show={showModalConsultant}
        onHide={handleCloseConsultant}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Consultant</Modal.Title>
        </Modal.Header>
        {message && (
          <div
            className={`alert ${
              messageType === "success" ? "alert-success" : "alert-danger"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
        <Modal.Body>
          <Form>
            <Form.Group controlId="formConsultantName">
              <Form.Label>Consultant Name</Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter consultant name"
                name="consultantName"
                value={consultantformData.consultantName}
                onChange={handleConsultantInputChange}
                className={getValidationClass("consultantName")}
              />
            </Form.Group>

            <Form.Group controlId="formContactPerson">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter contact person"
                name="contactPerson"
                value={consultantformData.contactPerson}
                onChange={handleConsultantInputChange}
                className={getValidationClass("contactPerson")}
              />
            </Form.Group>

            <Form.Group controlId="formContactNumber">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter contact number"
                name="contactNumber"
                value={consultantformData.contactNumber}
                onChange={handleConsultantInputChange}
                className={getValidationClass("contactNumber")}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConsultant}>
            Close
          </Button>
          <Button variant="primary" onClick={consultantHandleSubmit}>
            Save Consultant
          </Button>
        </Modal.Footer>
      </Modal>
      {/* for user */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isFollowUpUser
              ? "Create Follow-up User"
              : "Create Follow-up Quotation"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUserName">
              <Form.Label>Name</Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter name"
                name="name"
                value={newUserData.name}
                onChange={handleNewUserInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
              required
                type="email"
                placeholder="Enter email"
                name="email"
                value={newUserData.email}
                onChange={handleNewUserInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formDesignation">
              <Form.Label>Designation</Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter designation"
                name="designation"
                value={newUserData.designation}
                onChange={handleNewUserInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formRoleId">
              <Form.Label>Role</Form.Label>
              <Form.Control
              required
                as="select"
                name="roleId"
                value={newUserData.roleId}
                onChange={handleNewUserInputChange}
              >
                <option value="">Select Role</option>
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formMobileNo">
              <Form.Label>Mobile No</Form.Label>
              <Form.Control
              required
                type="text"
                placeholder="Enter mobile number"
                name="mobileNo"
                value={newUserData.mobileNo}
                onChange={handleNewUserInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
              required
                type="password"
                placeholder="Enter password"
                name="password"
                value={newUserData.password}
                onChange={handleNewUserInputChange}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleSubmitNewUser}>
              Save {isFollowUpUser ? "User" : "Quotation"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Description Modal */}
      <Modal
        show={showStatusQuartationChangeModal}
        onHide={() => setshowStatusQuartationChangeModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isFollowUpUser ? "Reassign Follow-up" : "Mark Quotation Done"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Description Field */}
            <Form.Group controlId="statusChangeDescription">
              <Form.Label>Description (Required)</Form.Label>
              <Form.Control
              required
                as="textarea"
                rows={3}
                placeholder="Enter a description for the status change"
                value={
                  isFollowUpUser ? followUpDescription : quotationDescription
                } // Use respective state
                onChange={(e) =>
                  isFollowUpUser
                    ? setFollowUpDescription(e.target.value)
                    : setQuotationDescription(e.target.value)
                } // Update respective state
              />
            </Form.Group>

            {/* User Dropdown - Always visible */}
            <Form.Group controlId="followUpUser">
              <Form.Label>
                {isFollowUpUser
                  ? "Reassign Follow-up User"
                  : "Select Follow-up Quotation User"}
              </Form.Label>
              <Select
                name="followUpUser"
                value={selectedFollowUpUser} // Track the selected follow-up user
                onChange={(selectedOption) => {
                  setSelectedFollowUpUser(selectedOption); // Update the selected user
                  setStatusChangeData((prevState) => ({
                    ...prevState,
                    followUpQuotationId: selectedOption
                      ? selectedOption.value
                      : null, // Update follow-up quotation ID
                  }));
                }}
                onInputChange={handleUserSearch} // Handle search input
                options={[
                  ...userOptions,
                  { value: "add_more", label: "Add More" },
                ]}
                placeholder="Search and Select Follow-up User"
                isLoading={isLoadingUsers} // Show loading spinner
                isClearable
                isSearchable
                styles={{
                  option: (provided) => ({ ...provided, color: "black" }),
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setshowStatusQuartationChangeModal(false)}
          >
            Cancel
          </Button>

          {/* Conditional submit button */}
          <Button
            variant="primary"
            onClick={() =>
              isFollowUpUser
                ? handleFollowUpReassign(
                    statusChangeData.inquiryId,
                    selectedFollowUpUser
                      ? selectedFollowUpUser.value
                      : statusChangeData.followUpQuotationId // Ensure follow-up quotation is passed
                  )
                : handleQuotationDone(
                    statusChangeData.inquiryId,
                    selectedFollowUpUser
                      ? selectedFollowUpUser.value
                      : statusChangeData.followUpUserId // Ensure follow-up user is passed
                  )
            }
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />

      {/* Edit Description Modal */}
      <Modal
        show={showStatusChangeModal}
        onHide={() => setShowStatusChangeModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="statusChangeDescription">
              <Form.Label>Description (Required)</Form.Label>
              <Form.Control
              required
                as="textarea"
                rows={3}
                placeholder="Enter a description for the status change"
                value={statusChangeData.description} // Use description from state
                onChange={(e) =>
                  setStatusChangeData({
                    ...statusChangeData,
                    description: e.target.value, // Update only the description
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowStatusChangeModal(false)}
          >
            Cancel
          </Button>

          <Button variant="primary" onClick={submitStatusDropdownChange}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for taking description */}
      <Modal show={showWinLossModal} onHide={() => setShowWinLossModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isWin ? "Mark as Won" : "Mark as Lost"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
              required
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowWinLossModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Inquiry;
