import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, Row, Col, Card } from "react-bootstrap";
import { BiArrowBack } from "react-icons/bi";
import "./inquaryDetails.css";

const InquiryDetails = () => {
  const { id } = useParams();
  const [inquiryDetails, setInquiryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInquiryDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/inquiry/get/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setInquiryDetails(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching inquiry details:", error);
        setLoading(false);
      }
    };

    fetchInquiryDetails();
  }, [id, token]);

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!inquiryDetails) {
    return <p className="no-details-text">No inquiry details found.</p>;
  }

  return (
    <>
      {/* Back Button */}
      <div className="back-button-container">
        <Button
          variant="secondary"
          className="back-button"
          onClick={() => window.history.back()}
        >
          <BiArrowBack />
        </Button>
      </div>

      <div className="inquiry-details-container">
        {/* Inquiry Details Card */}
        <Card className="digital-clock mb-4">
          <Card.Body>
            <h2 className="details-title">Inquiry Details</h2>
            <Row>
              <Col md={6}>
                <p><strong>Project Name:</strong> {inquiryDetails.projectName || "N/A"}</p>
                <p><strong>Inquiry Status:</strong> {inquiryDetails.inquiryStatus || "N/A"}</p>
                <p><strong>Consumer Name:</strong> {inquiryDetails.consumer?.consumerName || "N/A"}</p>
                <p><strong>Product Name:</strong> {inquiryDetails.product?.productName || "N/A"}</p>
                <p><strong>Consultant Name:</strong> {inquiryDetails.consultant?.consultantName || "N/A"}</p>
              </Col>
              <Col md={6}>
                <p><strong>Assigned To (Follow-Up User):</strong> {inquiryDetails.followUpUser?.name || "N/A"}</p>
                <p><strong>Quotation By:</strong> {inquiryDetails.followUpQuotation?.name || "N/A"}</p>
                <p><strong>Created By:</strong> {inquiryDetails.createdBy?.name || "N/A"}</p>
                <p><strong>Created At:</strong> {new Date(inquiryDetails.createdAt).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> {inquiryDetails.updatedAt ? new Date(inquiryDetails.updatedAt).toLocaleString() : "N/A"}</p>
                <p><strong>Remark:</strong> {inquiryDetails.remark || "N/A"}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* History Card */}
        <Card className="digital-clock mb-4">
          <Card.Body>
            <h2 className="details-title">History</h2>
            <Row>
              <Col md={12}>
                <p><strong>Description:</strong> {inquiryDetails.description || "No description available."}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default InquiryDetails;
