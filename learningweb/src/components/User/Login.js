import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import { Spinner, Modal, Button, Form } from 'react-bootstrap';
import { authAPIs, endpoints } from '../../configs/APIs'; // Import authAPIs and endpoints

const Login = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false); // Manage loading state
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Modal state
  const [emailForPasscode, setEmailForPasscode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [passcodeSent, setPasscodeSent] = useState(false); // Manage passcode sent state
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when login starts
    try {
      await login(formData.email, formData.password);
      setLoading(false); // Set loading to false after successful login
      navigate('/'); // Redirect to home page
    } catch (error) {
      setLoading(false); // Set loading to false if login fails
      alert('Đăng nhập thất bại. Tài khoản hoặc mật khẩu sai!');
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    try {
      const api = authAPIs();
      await api.post(endpoints["forget-password-get-code"], { email: emailForPasscode });
      setPasscodeSent(true); // Update state to show the next form
      setError("Mã xác thực đã được gửi qua email.");
    } catch (error) {
      console.error("Error sending passcode:", error);
      setError("Gửi mã xác thực thất bại.");
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    try {
      const api = authAPIs();
      const payload = {
        new_password: newPassword,
        code: passcode
      };
      await api.post(endpoints["forget-password-change-password"], payload);
      setShowForgotPassword(false);
      setError("Mật khẩu đã được thay đổi thành công.");
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Thay đổi mật khẩu thất bại.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="p-4 bg-white rounded shadow-lg" style={{ width: "80%", maxWidth: "500px" }}>
        <h2 className="text-center mb-4">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group mt-3">
            <label>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Đăng nhập"}
          </button>

          <button
            type="button"
            className="btn btn-link mt-3"
            onClick={() => setShowForgotPassword(true)}
          >
            Quên mật khẩu?
          </button>
        </form>
      </div>

      {/* Modal for password recovery */}
      <Modal show={showForgotPassword} onHide={() => setShowForgotPassword(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Quên mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {error && <p className="text-danger">{error}</p>}
            {!passcodeSent ? (
              <>
                <Form.Group controlId="forgotEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={emailForPasscode}
                    onChange={(e) => setEmailForPasscode(e.target.value)}
                    placeholder="Nhập email để nhận mã xác thực"
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleForgotPassword} className="mt-3">
                  Gửi mã xác thực
                </Button>
              </>
            ) : (
              <>
                <Form.Group controlId="newPassword">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </Form.Group>
                <Form.Group controlId="passcode" className="mt-3">
                  <Form.Label>Mã xác thực</Form.Label>
                  <Form.Control
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Nhập mã xác thực"
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleChangePassword} className="mt-3">
                  Thay đổi mật khẩu
                </Button>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForgotPassword(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
