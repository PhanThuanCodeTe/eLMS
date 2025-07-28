import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPIs, endpoints } from "../../configs/APIs";
import cookie from "react-cookies";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  BookOpen,
  Users,
  HelpCircle,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { Button, TextField, Box, Typography, Modal, IconButton } from "@mui/material";
import { useUser } from "../Context/UserContext";

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    front_degree_image: null,
    back_degree_image: null,
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();


  // Hàm kiểm tra user có phải teacher không
  const isTeacher = (user) => {
    return user?.role === 1 || 
           user?.role === 'teacher' || 
           user?.is_teacher === true || 
           user?.user_type === 'teacher' ||
           user?.type === 'teacher' ||
           user?.account_type === 'teacher';
  };

  const toggleModal = () => {
    const token = cookie.load("authToken");
    if (!token) {
      navigate("/login");
    } else {
      setShowModal(!showModal);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleCreateCourse = () => {
    const token = cookie.load("authToken");
    if (!token) {
      navigate("/login");
    } else {
      console.log('Is user a teacher?', isTeacher(user));
      
      if (isTeacher(user)) {
        navigate("/manage-course");
      } else {
        // Nếu không phải teacher thì mở form đăng ký
        setShowModal(true);
        setError(null);
        setSuccessMessage(null);
      }
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const apiUrl = endpoints["teacher-register"];
    const api = authAPIs();
    const data = new FormData();
    data.append("front_degree_image", formData.front_degree_image);
    data.append("back_degree_image", formData.back_degree_image);

    try {
      const response = await api.post(apiUrl, data);
      if (response.status === 201) {
        setSuccessMessage("Đăng ký làm giáo viên thành công!");
        // Có thể cập nhật lại user context ở đây nếu cần
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Cột 1 - Về chúng tôi */}
          <Box className="space-y-4">
            <Box className="flex items-center space-x-2 mb-6">
              <Box className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </Box>
              <Typography variant="h5" className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                EduPlatform
              </Typography>
            </Box>
            <Typography className="text-gray-300 leading-relaxed">
              Nền tảng học trực tuyến hàng đầu, kết nối tri thức với công nghệ hiện đại.
              Cùng nhau xây dựng tương lai giáo dục số.
            </Typography>
          </Box>

          {/* Cột 2 - Dành cho giáo viên */}
          <Box className="space-y-4">
            <Typography variant="h6" className="font-bold text-white mb-6">
              Dành cho giáo viên
            </Typography>
            <Box className="space-y-3">
              {/* Chỉ hiển thị nút đăng ký nếu chưa đăng nhập hoặc chưa phải là teacher */}
              {(!user || !isTeacher(user)) && (
                <Button
                  onClick={toggleModal}
                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors group"
                >
                  <Box className="bg-blue-500/20 p-2 rounded-lg mr-3 group-hover:bg-blue-500/30 transition-colors">
                    <Users className="w-4 h-4" />
                  </Box>
                  Đăng ký làm giáo viên
                </Button>
              )}
              
              <Button
                onClick={handleCreateCourse}
                className="flex items-center text-gray-300 hover:text-purple-400 transition-colors group"
              >
                <Box className="bg-purple-500/20 p-2 rounded-lg mr-3 group-hover:bg-purple-500/30 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </Box>
                {isTeacher(user) ? 'Quản lý khóa học' : 'Tạo khóa học'}
              </Button>
              
              <Button
                onClick={() => navigate("/teaching-guide")}
                className="flex items-center text-gray-300 hover:text-green-400 transition-colors group"
              >
                <Box className="bg-green-500/20 p-2 rounded-lg mr-3 group-hover:bg-green-500/30 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </Box>
                Hướng dẫn giảng dạy
              </Button>
            </Box>
          </Box>

          {/* Cột 3 - Liên hệ */}
          <Box className="space-y-4">
            <Typography variant="h6" className="font-bold text-white mb-6">
              Liên hệ với chúng tôi
            </Typography>
            <Box className="space-y-4">
              <Box className="flex items-start space-x-3">
                <Box className="bg-red-500/20 p-2 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                </Box>
                <Typography className="text-gray-300 text-sm">
                  36 Phan Huy Thực, Quận 7<br />
                  TP. Hồ Chí Minh, Việt Nam
                </Typography>
              </Box>
              <Box className="flex items-center space-x-3">
                <Box className="bg-blue-500/20 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-400" />
                </Box>
                <a href="mailto:thuanpmt0711@gmail.com" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  thuanpmt0711@gmail.com
                </a>
              </Box>
              <Box className="flex items-center space-x-3">
                <Box className="bg-green-500/20 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-green-400" />
                </Box>
                <a href="tel:+84364646138" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  +84 364 646 138
                </a>
              </Box>
              <Box className="flex items-center space-x-3">
                <Box className="bg-yellow-500/20 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </Box>
                <Typography className="text-gray-300 text-sm">Thứ 2 - 6: 9:00 - 17:00</Typography>
              </Box>
            </Box>
          </Box>

          {/* Cột 4 - Kết nối */}
          <Box className="space-y-4">
            <Typography variant="h6" className="font-bold text-white mb-6">
              Kết nối với chúng tôi
            </Typography>
            <Box className="grid grid-cols-2 gap-3">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Facebook className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-sky-500/20 hover:bg-sky-500/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Twitter className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-pink-500/20 hover:bg-pink-500/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Instagram className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Youtube className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              </a>
            </Box>
            {/* Newsletter */}
            <Box className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
              <Typography className="text-sm font-semibold text-white mb-2">
                Nhận thông tin mới nhất
              </Typography>
              <Box className="flex">
                <TextField
                  type="email"
                  placeholder="Email của bạn"
                  variant="outlined"
                  className="flex-1"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px 0 0 8px",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                      "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                    },
                    "& .MuiInputBase-input": { color: "white", padding: "8px 12px" },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    background: "linear-gradient(to right, #3b82f6, #9333ea)",
                    borderRadius: "0 8px 8px 0",
                    padding: "8px 16px",
                    "&:hover": { background: "linear-gradient(to right, #2563eb, #7e22ce)" },
                  }}
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom Bar */}
      <Box className="border-t border-gray-700 bg-gray-900/50">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Box className="flex flex-col md:flex-row items-center justify-between">
            <Typography className="text-gray-400 text-sm">
            2024 EduPlatform | 2151050441 - Được thiết kế bởi Nhóm phát triển
            </Typography>
            <Box className="flex items-center space-x-6 mt-4 md:mt-0">
              <Button
                onClick={() => navigate("/privacy-policy")}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Chính sách bảo mật
              </Button>
              <Button
                onClick={() => navigate("/terms-of-use")}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Điều khoản sử dụng
              </Button>
              <Button
                onClick={() => navigate("/support")}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Hỗ trợ
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={toggleModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <Box className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <Box className="flex justify-between items-center">
              <Box>
                <Typography variant="h5" className="text-white font-bold">
                  Đăng ký làm giáo viên
                </Typography>
                <Typography className="text-blue-100 mt-1">Chia sẻ kiến thức, lan tỏa tri thức</Typography>
              </Box>
              <IconButton onClick={toggleModal} className="text-white/80 hover:text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </IconButton>
            </Box>
          </Box>
          <Box className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Box className="space-y-4">
                <Box>
                  <Typography className="block font-semibold mb-2 text-gray-800 flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Ảnh bằng cấp (mặt trước)
                  </Typography>
                  <input
                    type="file"
                    id="front_degree_image"
                    name="front_degree_image"
                    onChange={handleFileChange}
                    required
                    accept="image/*"
                    className="w-full text-sm text-gray-700 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors file:bg-blue-50 file:border-0 file:px-4 file:py-2 file:rounded-lg file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                  />
                </Box>
                <Box>
                  <Typography className="block font-semibold mb-2 text-gray-800 flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Ảnh bằng cấp (mặt sau)
                  </Typography>
                  <input
                    type="file"
                    id="back_degree_image"
                    name="back_degree_image"
                    onChange={handleFileChange}
                    required
                    accept="image/*"
                    className="w-full text-sm text-gray-700 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors file:bg-blue-50 file:border-0 file:px-4 file:py-2 file:rounded-lg file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                  />
                </Box>
              </Box>
              {error && (
                <Box className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <Typography className="text-red-800 flex items-center">
                    <X className="w-5 h-5 mr-2" />
                    {error}
                  </Typography>
                </Box>
              )}
              {successMessage && (
                <Box className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <Typography className="text-green-800 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    {successMessage}
                  </Typography>
                </Box>
              )}
              <Box className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={toggleModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Đang gửi..." : "Gửi đăng ký"}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Footer;