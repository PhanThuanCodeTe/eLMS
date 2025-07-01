import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { authAPIs, endpoints } from '../../configs/APIs';

const Login = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailForPasscode, setEmailForPasscode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [passcodeSent, setPasscodeSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      setLoading(false);
      navigate('/');
    } catch (error) {
      setLoading(false);
      setError("Đăng nhập thất bại. Tài khoản hoặc mật khẩu sai!");
    }
  };

  const handleOpenForgotPassword = () => {
    setError(null); // Reset error khi mở dialog
    setShowForgotPassword(true);
  };

  const handleForgotPassword = async () => {
    setError(null);
    try {
      const api = authAPIs();
      await api.post(endpoints["forget-password-get-code"], { email: emailForPasscode });
      setPasscodeSent(true);
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
      await api.post(endpoints["forget-password-change-password"], {
        new_password: newPassword,
        code: passcode,
      });
      setShowForgotPassword(false);
      setError("Mật khẩu đã được thay đổi thành công.");
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Thay đổi mật khẩu thất bại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl transform transition-all hover:scale-105 duration-300">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Đăng Nhập</h2>

        {error && (
          <Alert severity={passcodeSent ? "success" : "error"} className="mb-6 rounded-lg">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-lg"
            InputProps={{
              className: "bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all",
            }}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            variant="outlined"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="rounded-lg"
            InputProps={{
              className: "bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all",
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg shadow-md transition-all duration-300"
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Button
            variant="text"
            onClick={handleOpenForgotPassword} // Sử dụng hàm mới
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Quên mật khẩu?
          </Button>
          <Typography variant="body2" className="text-gray-600">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Đăng ký ngay
            </Link>
          </Typography>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-xl bg-gradient-to-b from-white to-gray-50",
        }}
      >
        <DialogTitle className="text-2xl font-bold text-gray-800">Quên Mật Khẩu</DialogTitle>
        <DialogContent className="space-y-6 p-6">
          {error && (
            <Alert severity={passcodeSent ? "success" : "error"} className="rounded-lg">
              {error}
            </Alert>
          )}
          {!passcodeSent ? (
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={emailForPasscode}
              onChange={(e) => setEmailForPasscode(e.target.value)}
              placeholder="Nhập email để nhận mã xác thực"
              className="rounded-lg"
              InputProps={{
                className: "bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all",
              }}
            />
          ) : (
            <>
              <TextField
                fullWidth
                label="Mật khẩu mới"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-lg"
                InputProps={{
                  className: "bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all",
                }}
              />
              <TextField
                fullWidth
                label="Mã xác thực"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="rounded-lg"
                InputProps={{
                  className: "bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all",
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions className="p-6">
          <Button
            onClick={() => setShowForgotPassword(false)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </Button>
          {!passcodeSent ? (
            <Button
              onClick={handleForgotPassword}
              variant="contained"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all duration-300"
            >
              Gửi mã xác thực
            </Button>
          ) : (
            <Button
              onClick={handleChangePassword}
              variant="contained"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all duration-300"
            >
              Thay đổi mật khẩu
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;