import React, { useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TableWithFeatures.css";
import CommonForm from "../Form";

const TableWithFeatures = ({
  headers,
  data,
  setTableData,
  formTitle,
  currentPage,
  setCurrentPage,
  totalPages,
  onEdit,
  onDelete
}) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

  return (
    <div className="main-table m-4">
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
            {data.map((row) => (
              <tr key={row.consumerId}>
                {headers.map((header) => (
                  <td key={header.key}>
                    {header.key === 'createdBy.name'
                      ? row.createdBy?.name || 'N/A'
                      : row[header.key]}
                  </td>
                ))}
                <td>
                  {onEdit && onDelete && (
                    <>
                      <Button variant="success" onClick={() => onEdit(row)}>Edit</Button>
                      <Button variant="danger" onClick={() => onDelete(row.consumerId)}>Delete</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="pagination-controls">
        <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CommonForm />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TableWithFeatures;
