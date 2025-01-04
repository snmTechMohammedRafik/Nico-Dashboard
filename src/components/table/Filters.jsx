import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Filters = ({ search, setSearch }) => {
  return (
    <>
      <Row className="mb-3">
        <Col md={2}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control as="select">
            <option>hello</option>
            {/* Add filter options here */}
          </Form.Control>
        </Col>
        <Col md={2}>
          <h6 style={{ color: "#000000" }}>Filter by ____</h6>
          <Form.Control as="select">
            <option>Hello</option>
            {/* Add filter options here */}
          </Form.Control>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Control
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
        </Col>
        <Col md={6}></Col>
      </Row>
    </>
  );
};

export default Filters;
