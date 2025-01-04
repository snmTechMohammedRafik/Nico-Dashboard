import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import InquiryForm from './forms/InquiryForm';
import UserForm from './forms/UserForm';
import ConsumerForm from './forms/ConsumerForm';
import ConsultForm from './forms/ConsultForm';
import GeneralFollowupForm from './forms/GeneralFollowupForm';

const MainComponent = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const renderForm = () => {
    switch (location.pathname) {
      case '/inquiry':
        return <InquiryForm />;
      case '/user':
        return <UserForm />;
      case '/consumer':
        return <ConsumerForm />;
      case '/consult':
        return <ConsultForm />;
      case '/generalFollowup':
        return <GeneralFollowupForm />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={handleShow}>Create User</Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
      </Modal>
    </div>
  );
};

export default MainComponent;
