import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { authAPIs, endpoints } from "../../configs/APIs";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files[0]) {
      const file = files[0];
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, avatar: "Chỉ chấp nhận file JPEG hoặc PNG" }));
        return;
      }
      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, avatar: "File không được lớn hơn 5MB" }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
    const fileInput = document.querySelector('input[name="avatar"]');
    if (fileInput) fileInput.value = "";
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const validateTab = (tab) => {
    const errs = {};

    if (tab === 0) {
      if (!formData.email) {
        errs.email = "Bạn chưa điền email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errs.email = "Email không hợp lệ";
      }
      if (!formData.password) errs.password = "Bạn chưa điền mật khẩu";
      if (!formData.confirmPassword) errs.confirmPassword = "Bạn chưa điền xác nhận mật khẩu";
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errs.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    } else if (tab === 1) {
      if (!formData.firstName) errs.firstName = "Bạn chưa điền họ";
      if (!formData.lastName) errs.lastName = "Bạn chưa điền tên";
      if (!formData.dateOfBirth) errs.dateOfBirth = "Bạn chưa điền ngày sinh";
      if (!formData.gender) errs.gender = "Bạn chưa chọn giới tính";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();

    if (tabValue === 0) {
      if (validateTab(0)) {
        setTabValue(1);
        setErrors({});
      } else {
        setErrors((prev) => ({ ...prev, submit: "Bạn chưa điền đầy đủ thông tin" }));
      }
    } else {
      if (validateTab(1)) {
        setLoading(true);
        const payload = new FormData();
        Object.entries({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
        }).forEach(([k, v]) => payload.append(k, v));
        if (formData.avatar) payload.append("avatar", formData.avatar);

        try {
          await authAPIs().post(endpoints.register, payload, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setOpen(true);
        } catch (err) {
          const errorMessage = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
          setErrors({ submit: errorMessage });
        } finally {
          setLoading(false);
        }
      } else {
        setErrors((prev) => ({ ...prev, submit: "Bạn chưa điền đầy đủ thông tin" }));
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/login");
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-up hover:scale-105 duration-300">
        <div className="text-center mb-8">
          <Typography
            variant="h4"
            className="font-black mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse"
          >
            Đăng Ký Tài Khoản
          </Typography>
          <Typography variant="body2" className="text-gray-500 pt-1 animate-fade-in-up">
            Tạo tài khoản mới để bắt đầu hành trình của bạn
          </Typography>
        </div>

        <div className="flex mb-8 bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => handleTabChange(0)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${tabValue === 0 ? "bg-white text-indigo-600 shadow-lg" : "text-gray-500 hover:text-gray-700"
              }`}
            aria-label="Chuyển sang tab thông tin tài khoản"
          >
            Thông Tin Tài Khoản
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${tabValue === 1 ? "bg-white text-indigo-600 shadow-lg" : "text-gray-500 hover:text-gray-700"
              }`}
            aria-label="Chuyển sang tab thông tin cá nhân"
          >
            Thông Tin Cá Nhân
          </button>
        </div>

        <form onSubmit={handleButtonClick}>
          <div className="mb-8">
            {tabValue === 0 && (
              <Box className="h-full flex flex-col justify-center space-y-6 animate-fade-in">
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  label="Email cá nhân"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  className="bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md"
                />
                <TextField
                  fullWidth
                  type="password"
                  name="password"
                  label="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                  className="bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md"
                />
                <TextField
                  fullWidth
                  type="password"
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  className="bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md"
                />
              </Box>
            )}

            {tabValue === 1 && (
              <Box className="h-full flex flex-col justify-center space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    name="firstName"
                    label="Họ"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    className="bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md"
                  />
                  <TextField
                    fullWidth
                    name="lastName"
                    label="Tên"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    className="bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md"
                  />
                </div>
                <TextField
                  fullWidth
                  type="date"
                  name="dateOfBirth"
                  label="Ngày sinh"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  className="bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md"
                />
                <FormControl fullWidth className="bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-md" error={!!errors.gender}>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    name="gender"
                    label="Giới tính"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="">
                      <em>Chọn giới tính</em>
                    </MenuItem>
                    <MenuItem value="0">Nam</MenuItem>
                    <MenuItem value="1">Nữ</MenuItem>
                  </Select>
                  {errors.gender && (
                    <Typography color="error" variant="caption">
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>
                <div className="flex flex-col items-center space-y-3 pt-2">
                  <div className="relative">
                    {!avatarPreview ? (
                      <Button
                        variant="outlined"
                        component="label"
                        className="w-32 h-32 border-4 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 rounded-full flex flex-col items-center justify-center transform hover:scale-105"
                      >
                        <CameraAltIcon sx={{ fontSize: 40, mb: 1 }} />
                        <input
                          type="file"
                          name="avatar"
                          hidden
                          onChange={handleChange}
                          accept="image/*"
                          aria-label="Tải lên ảnh đại diện"
                        />
                      </Button>
                    ) : (
                      <div className="relative">
                        <div
                          className="w-32 h-32 rounded-full border-4 border-indigo-200 shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl overflow-hidden relative"
                          onClick={() => document.querySelector('input[name="avatar"]').click()}
                          style={{
                            backgroundImage: `url(${avatarPreview})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 rounded-full flex items-center justify-center">
                            <div className="text-white text-sm font-semibold opacity-0 hover:opacity-100 transition-opacity duration-300 text-center">
                              <CameraAltIcon sx={{ fontSize: 24, mb: 1 }} />
                              <div>Thay đổi</div>
                            </div>
                          </div>
                        </div>
                        <IconButton
                          onClick={handleRemoveAvatar}
                          size="small"
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white shadow-lg transform hover:scale-110 transition-all duration-300"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <input
                          type="file"
                          name="avatar"
                          hidden
                          onChange={handleChange}
                          accept="image/*"
                          aria-label="Tải lên ảnh đại diện"
                        />
                      </div>
                    )}
                    {errors.avatar && (
                      <Typography color="error" variant="caption" className="mt-2">
                        {errors.avatar}
                      </Typography>
                    )}
                  </div>
                </div>
              </Box>
            )}
          </div>

          {errors.submit && (
            <Typography color="error" className="text-center mb-4 animate-shake">
              {errors.submit}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className="py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            sx={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : tabValue === 0 ? (
              <>Tiếp Theo</>
            ) : (
              <>Đăng Ký Ngay</>
            )}
          </Button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-gray-100 animate-fade-in-up">
          <Typography className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Đăng nhập ngay
            </Link>
          </Typography>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: "rounded-3xl bg-gradient-to-b from-white to-gray-50 animate-slide-up",
        }}
        aria-describedby="dialog-success-description"
      >
        <DialogTitle className="text-center pt-8">
          <Typography variant="h5" className="font-bold text-gray-800">
            Chúc Mừng!
          </Typography>
        </DialogTitle>
        <DialogContent className="text-center px-8">
          <Typography id="dialog-success-description" className="text-gray-700 text-lg animate-fade-in">
            Đăng ký tài khoản thành công!
          </Typography>
          <Typography className="text-gray-500 text-sm mt-2 animate-fade-in-up">
            Bạn sẽ được chuyển đến trang đăng nhập
          </Typography>
        </DialogContent>
        <DialogActions className="justify-center pb-8">
          <Button
            onClick={handleClose}
            variant="contained"
            className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
            }}
          >
            <CheckIcon sx={{ mr: 1 }} />
            Tiếp Tục
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Register;