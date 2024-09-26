import React, { useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Spinner,
} from "react-bootstrap";
import { endpoints, authAPIs } from "../../configs/APIs";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    avatar: null,
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({}); // State to hold validation errors

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Prevent submission if validation fails

    setLoading(true);

    // Create a new FormData object
    const formDataToSend = new FormData();

    // Append the form data fields to FormData
    formDataToSend.append("first_name", formData.firstName);
    formDataToSend.append("last_name", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("date_of_birth", formData.dateOfBirth);
    formDataToSend.append("gender", formData.gender);

    // Append the file (avatar)
    if (formData.avatar) {
      formDataToSend.append("avatar", formData.avatar);
    }

    try {
      // Use authAPIs to create an Axios instance with the Authorization header
      const api = authAPIs();

      // Send POST request to the register endpoint
      await api.post(endpoints.register, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data", // Set content type for file upload
        },
      });

      // Handle successful registration
      setShowModal(true);
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error(
        "Registration error",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/login");
  };

  return (
    <Container
  fluid
  className="d-flex justify-content-center align-items-center, mt-5"
  style={{ height: "calc(100vh - [header height] - [footer height])", paddingTop: "[header height]", paddingBottom: "[footer height]" }}
>
      <Row className="w-100">
        <Col xs={12} md={8} lg={6} xl={4} className="mx-auto">
          <div
            className="p-4 bg-white rounded shadow-lg"
            style={{ width: "80%", maxWidth: "500px" }}
          >
            <h2 className="text-center mb-4">Đăng ký tài khoản</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formFirstName">
                <Form.Label className="my-2">
                  <strong>Họ: </strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Nhập họ"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formLastName">
                <Form.Label className="my-2">
                  <strong>Tên:</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nhập tên"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label className="my-2">
                  <strong>Email:</strong>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label className="my-2">
                  <strong>Mật khẩu:</strong>
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formConfirmPassword">
                <Form.Label className="my-2">
                  <strong>Xác nhận mật khẩu:</strong>
                </Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu"
                  required
                  isInvalid={!!errors.confirmPassword} // Show error if validation fails
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formDateOfBirth">
                <Form.Label className="my-2">
                  <strong>Ngày sinh:</strong>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formGender">
                <Form.Label className="my-2">
                  <strong>Giới tính:</strong>
                </Form.Label>
                <Form.Control
                  as="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="0">Nam</option>
                  <option value="1">Nữ</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formAvatar">
                <Form.Label className="my-2">
                  <strong>Avatar:</strong>
                </Form.Label>
                <Form.Control
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 my-3"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Đăng ký"}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Đăng ký tài khoản thành công</p>
          <Button variant="primary" onClick={handleModalClose}>
            Đồng ý
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Register;
