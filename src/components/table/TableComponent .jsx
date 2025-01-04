// import React from 'react';
// import { Table, Button, Form ,Row, Col, Modal} from 'react-bootstrap';
// import { Sort } from "@mui/icons-material";

// const TableComponent = ({
//   headers,
//   data,
//   editingRow,
//   handleEdit,
//   handleSave,
//   handleDelete,
//   setEditingRow,
//   requestSort,
//   handleShow
// }) => {
//   return (
//     <>
//       <Row className="mb-3">
//         <Col md={6}></Col>
//         <Col md={4}>
//           <Row>
//             <Col md={6}>
//               <Button variant=" " style={{border:"1px solid black"}}><Sort /> Sort</Button>
//             </Col>
//             <Col md={6}>
//               <Button variant="primary" onClick={handleShow}>Create User</Button>
//             </Col>
//           </Row>
//         </Col>
//       </Row>

//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             {headers.map((header) => (
//               <th key={header.key} onClick={() => requestSort(header.key)}>
//                 {header.displayName}
//               </th>
//             ))}
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row) => (
//             <tr key={row.id}>
//               {editingRow && editingRow.id === row.id
//                 ? headers.map((header) => (
//                     <td key={header.key}>
//                       <Form.Control
//                         type="text"
//                         value={editingRow[header.key]}
//                         onChange={(e) =>
//                           setEditingRow({
//                             ...editingRow,
//                             [header.key]: e.target.value,
//                           })
//                         }
//                       />
//                     </td>
//                   ))
//                 : headers.map((header) => (
//                     <td key={header.key}>{row[header.key]}</td>
//                   ))}
//               <td>
//                 {editingRow && editingRow.id === row.id ? (
//                   <>
//                     <Button variant="success" onClick={handleSave}>
//                       Save
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       onClick={() => setEditingRow(null)}
//                     >
//                       Cancel
//                     </Button>
//                   </>
//                 ) : (
//                   <>
//                     <Button variant="success" onClick={() => handleEdit(row)}>
//                       Edit
//                     </Button>
//                     <Button
//                       variant="danger"
//                       onClick={() => handleDelete(row.id)}
//                     >
//                       Delete
//                     </Button>
//                   </>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </>
//   );
// };

// export default TableComponent;
