import React, { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas"; // Import Offcanvas
import { useUser } from "../Context/UserContext";
import { authAPIs, endpoints } from "../../configs/APIs";
import { MdNotifications } from "react-icons/md"; // Import notification icon
import Logo from "../../assets/Image/Logo.png";
import Notification from "./Notifications"; // Import Notification component

const Header = () => {
  const { user, loading, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false); // State for offcanvas

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setUpdating(true);
    try {
      const api = authAPIs(true);
      const payload = {
        old_password: passwords.current_password,
        new_password: passwords.new_password,
      };
      await api.patch(endpoints["update-info"], payload);
      setShowPasswordModal(false);
      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setError(null);
    } catch (error) {
      if (error.response && error.response.data.non_field_errors) {
        setError(error.response.data.non_field_errors[0]);
      } else {
        setError("Failed to change password.");
      }
      console.error("Error changing password:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex-shrink-0">
              <img src={Logo} alt="Logo" className="h-16 w-16 rounded-full" />
            </Link>
            <Nav className="flex items-center">
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/"
                  className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Trang chủ
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/categories"
                  className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Danh mục
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <Nav className="flex items-center">
            {loading ? (
              <div className="text-white px-3 py-2">Loading...</div>
            ) : user ? (
              <div className="d-flex align-items-center">
                {/* Notification Icon */}
                <MdNotifications
                  size={24}
                  color="white"
                  className="mr-3 cursor-pointer"
                  title="Thông báo"
                  onClick={() => setShowOffcanvas(true)} // Open offcanvas on click
                />

                <Dropdown show={showDropdown} onClick={() => setShowDropdown(!showDropdown)}>
                  <Dropdown.Toggle
                    as="a"
                    className="text-white flex items-center cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="ml-2">
                      Xin chào, {user.first_name} {user.last_name}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} to="/info">Trang cá nhân</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/mycourse">Khóa học của tôi</Dropdown.Item>
                    {user.role === 1 && (
                      <Dropdown.Item as={Link} to="/manage-course">Quản lý khóa học</Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={() => setShowPasswordModal(true)}>
                      Đổi mật khẩu
                    </Dropdown.Item>
                    <Dropdown.Item onClick={logout}>Đăng xuất tài khoản</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Đăng nhập
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/register"
                    className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Đăng ký
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </div>
      </div>

      {/* Offcanvas for notifications */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Thông báo</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Notification /> {/* Render Notification component */}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal for password change */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="currentPassword">
              <Form.Label>Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                name="current_password"
                value={passwords.current_password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="newPassword" className="mt-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                value={passwords.new_password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="confirmPassword" className="mt-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                value={passwords.confirm_password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
          {error && <p className="text-danger mt-2">{error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleChangePassword} disabled={updating}>
            {updating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
};

export default Header;
