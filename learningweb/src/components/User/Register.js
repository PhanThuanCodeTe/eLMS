import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

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

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === "file" ? files[0] : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <Row className="w-100">
                <Col xs={12} md={8} lg={6} xl={4} className="mx-auto">
                    <div className="p-4 bg-white rounded shadow-lg" style={{ width: "80%", maxWidth: "500px" }}>
                        <h2 className="text-center mb-4">Đăng ký</h2>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formFirstName">
                                <Form.Label>Họ</Form.Label>
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
                                <Form.Label>Tên</Form.Label>
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
                                <Form.Label>Email</Form.Label>
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
                                <Form.Label>Mật khẩu</Form.Label>
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
                                <Form.Label>Xác nhận mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Xác nhận mật khẩu"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formDateOfBirth">
                                <Form.Label>Ngày sinh</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formGender">
                                <Form.Label>Giới tính</Form.Label>
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
                                <Form.Label>Avatar</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="avatar"
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100">
                                Đăng ký
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
