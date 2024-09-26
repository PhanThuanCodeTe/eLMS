import React, { useEffect, useState } from "react";
import { useUser } from "../Context/UserContext"; // Adjust the path as needed
import { Container, Row, Col, Card, Button, Modal, Form, Spinner } from "react-bootstrap";
import { endpoints, authAPIs } from "../../configs/APIs"; // Add authAPIs and endpoints

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const UserInfo = () => {
  const { user, loading, fetchUserInfo } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false); // Avatar modal state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
  });
  const [avatar, setAvatar] = useState(null); // State for avatar
  const [avatarPreview, setAvatarPreview] = useState(null); // State for avatar preview
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      // Set the initial form data from the user information
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        date_of_birth: user.date_of_birth,
      });
    } else {
      fetchUserInfo(); // Fetch user info if not already fetched
    }
  }, [user, fetchUserInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (key = "") => {
    setUpdating(true);
    try {
      const api = authAPIs(true); // Use authAPIs with authorization
      let payload = { ...formData };

      if (key === "avatar" && avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        await api.patch(endpoints["update-info"], formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.patch(endpoints["update-info"], payload); // Send update request
      }
      
      await fetchUserInfo(); // Refresh user info after successful update
      setShowModal(false);
      setShowAvatarModal(false); // Close avatar modal
    } catch (error) {
      console.error("Error updating user information:", error);
      setError("Failed to update user information.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <p>No user information available.</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              {/* Avatar */}
              <Row className="mb-4">
                <Col className="d-flex justify-content-center mb-3">
                  <Card.Img
                    variant="top"
                    src={user.avatar}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    onClick={() => setShowAvatarModal(true)} // Open avatar modal on click
                  />
                </Col>
              </Row>

              {/* User Full Name */}
              <Row className="mb-2">
                <Col>
                  <div className="d-flex justify-content-between">
                    <strong>Họ và tên:</strong>
                    <span>{user.first_name} {user.last_name}</span>
                  </div>
                </Col>
              </Row>

              {/* User Information */}
              <Row className="mb-2">
                <Col>
                  <div className="d-flex justify-content-between">
                    <strong>Email:</strong>
                    <span>{user.email}</span>
                  </div>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <div className="d-flex justify-content-between">
                    <strong>Ngày sinh:</strong>
                    <span>{formatDate(user.date_of_birth)}</span>
                  </div>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <div className="d-flex justify-content-between">
                    <strong>Giới tính:</strong>
                    <span>{user.gender === 1 ? 'Nam' : 'Nữ'}</span>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="d-flex justify-content-between">
                    <strong>Vai trò:</strong>
                    <span>{user.role === 1 ? 'Giáo viên' : 'Học viên'}</span>
                  </div>
                </Col>
              </Row>

              {/* Button to trigger the modal */}
              <Row className="mt-3">
                <Col className="text-end">
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    Thay đổi thông tin cá nhân
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for updating user information */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi thông tin cá nhân</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="firstName">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="lastName" className="mt-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="dateOfBirth" className="mt-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
          {error && <p className="text-danger mt-2">{error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => handleSubmit()} disabled={updating}>
            {updating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for updating avatar */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {avatarPreview && (
            <div className="d-flex justify-content-center mb-3">
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="rounded-circle"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            </div>
          )}
          <Form>
            <Form.Group controlId="avatar">
              <Form.Label>Chọn ảnh mới</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => handleSubmit("avatar")} disabled={updating}>
            {updating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserInfo;
