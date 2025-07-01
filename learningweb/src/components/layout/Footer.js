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
  Loader2
} from "lucide-react";

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
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Cột 1 - Về chúng tôi */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                EduPlatform
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Nền tảng học trực tuyến hàng đầu, kết nối tri thức với công nghệ hiện đại. 
              Cùng nhau xây dựng tương lai giáo dục số.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center text-sm text-gray-400">
                <Users className="w-4 h-4 mr-2" />
                <span>50K+ học viên</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>1000+ khóa học</span>
              </div>
            </div>
          </div>

          {/* Cột 2 - Dành cho giáo viên */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">Dành cho giáo viên</h3>
            <div className="space-y-3">
              <button
                onClick={toggleModal}
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
              >
                <div className="bg-blue-500/20 p-2 rounded-lg mr-3 group-hover:bg-blue-500/30 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <span>Đăng ký làm giáo viên</span>
              </button>
              <a href="#" className="flex items-center text-gray-300 hover:text-purple-400 transition-colors duration-200 group">
                <div className="bg-purple-500/20 p-2 rounded-lg mr-3 group-hover:bg-purple-500/30 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Tạo khóa học</span>
              </a>
              <a href="#" className="flex items-center text-gray-300 hover:text-green-400 transition-colors duration-200 group">
                <div className="bg-green-500/20 p-2 rounded-lg mr-3 group-hover:bg-green-500/30 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span>Hướng dẫn giảng dạy</span>
              </a>
            </div>
          </div>

          {/* Cột 3 - Liên hệ */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">Liên hệ với chúng tôi</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-red-500/20 p-2 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
                    36 Phan Huy Thực, Quận 7<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <a href="mailto:thuanpmt0711@gmail.com" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  thuanpmt0711@gmail.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <a href="tel:+84364646138" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  +84 364 646 138
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-gray-300 text-sm">Thứ 2 - 6: 9:00 - 17:00</p>
              </div>
            </div>
          </div>

          {/* Cột 4 - Kết nối */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">Kết nối với chúng tôi</h3>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="#" 
                className="flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Facebook className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center bg-sky-500/20 hover:bg-sky-500/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Twitter className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center bg-pink-500/20 hover:bg-pink-500/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Instagram className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 p-3 rounded-xl transition-all duration-200 group"
              >
                <Youtube className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              </a>
            </div>
            
            {/* Newsletter */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
              <h4 className="text-sm font-semibold text-white mb-2">Nhận thông tin mới nhất</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-r-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2024 EduPlatform | 2151050441 - Được thiết kế với{" "}
              <span className="text-red-400 animate-pulse">❤️</span> bởi Nhóm phát triển
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Đăng ký làm giáo viên</h2>
                  <p className="text-blue-100 mt-1">Chia sẻ kiến thức, lan tỏa tri thức</p>
                </div>
                <button 
                  onClick={toggleModal} 
                  className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="front_degree_image" className="block font-semibold mb-2 text-gray-800 flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-blue-600" />
                      Ảnh bằng cấp (mặt trước)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="front_degree_image"
                        name="front_degree_image"
                        onChange={handleFileChange}
                        required
                        accept="image/*"
                        className="w-full text-sm text-gray-700 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors file:bg-blue-50 file:border-0 file:px-4 file:py-2 file:rounded-lg file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="back_degree_image" className="block font-semibold mb-2 text-gray-800 flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-blue-600" />
                      Ảnh bằng cấp (mặt sau)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="back_degree_image"
                        name="back_degree_image"
                        onChange={handleFileChange}
                        required
                        accept="image/*"
                        className="w-full text-sm text-gray-700 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors file:bg-blue-50 file:border-0 file:px-4 file:py-2 file:rounded-lg file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 flex items-center">
                      <X className="w-5 h-5 mr-2" />
                      {error}
                    </p>
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-800 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      {successMessage}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isLoading ? "Đang gửi..." : "Gửi đăng ký"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer;