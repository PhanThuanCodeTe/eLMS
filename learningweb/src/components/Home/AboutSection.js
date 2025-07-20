import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Star, Clock, User } from "lucide-react";
import { useUser } from "../Context/UserContext";

const AboutSection = () => {
    const { user } = useUser();

    return (
        <>
            {/* About Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Tại sao chọn EduPlatform?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất với công nghệ hiện đại và phương pháp giảng dạy tiên tiến
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center group">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Chất lượng hàng đầu</h3>
                            <p className="text-gray-600">
                                Tất cả khóa học được thiết kế bởi các chuyên gia hàng đầu trong ngành, đảm bảo nội dung chất lượng và cập nhật liên tục.
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="bg-gradient-to-br from-green-500 to-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Cộng đồng sôi động</h3>
                            <p className="text-gray-600">
                                Tham gia cộng đồng học viên lớn với hơn 50,000 thành viên, chia sẻ kinh nghiệm và hỗ trợ lẫn nhau trong quá trình học tập.
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Star className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Chứng chỉ uy tín</h3>
                            <p className="text-gray-600">
                                Nhận chứng chỉ hoàn thành được công nhận bởi các doanh nghiệp lớn, giúp nâng cao cơ hội nghề nghiệp của bạn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Features Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Học tập linh hoạt, tiến bộ vượt bậc
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Với nền tảng học tập hiện đại, bạn có thể học mọi lúc, mọi nơi và theo tốc độ của riêng mình.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 rounded-lg p-2 mr-4">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Học 24/7</h4>
                                        <p className="text-gray-600">Truy cập khóa học bất cứ lúc nào, phù hợp với lịch trình bận rộn của bạn.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-green-100 rounded-lg p-2 mr-4">
                                        <User className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Hỗ trợ 1-1</h4>
                                        <p className="text-gray-600">Được mentor cá nhân hướng dẫn và giải đáp thắc mắc trực tiếp.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-purple-100 rounded-lg p-2 mr-4">
                                        <Star className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Theo dõi tiến độ</h4>
                                        <p className="text-gray-600">Hệ thống thông minh theo dõi và phân tích tiến độ học tập của bạn.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                        <h4 className="text-2xl font-bold mb-2">95%</h4>
                                        <p className="text-blue-100">Tỷ lệ hoàn thành</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                        <h4 className="text-2xl font-bold mb-2">4.9 ★</h4>
                                        <p className="text-blue-100">Đánh giá TB</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                        <h4 className="text-2xl font-bold mb-2">24/7</h4>
                                        <p className="text-blue-100">Hỗ trợ</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                        <h4 className="text-2xl font-bold mb-2">100+</h4>
                                        <p className="text-blue-100">Lĩnh vực</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pink-400 rounded-full opacity-20"></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Testimonial Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Học viên nói gì về chúng tôi
                        </h2>
                        <p className="text-xl text-gray-600">
                            Những chia sẻ chân thực từ cộng đồng học viên EduPlatform
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <div className="flex text-yellow-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 italic">
                                "Khóa học lập trình tại EduPlatform đã giúp tôi chuyển đổi sự nghiệp thành công. Nội dung thực tế, giảng viên nhiệt tình!"
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                    A
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Anh Tuấn</h4>
                                    <p className="text-gray-600">Full-stack Developer</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <div className="flex text-yellow-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 italic">
                                "Giao diện dễ sử dụng, video chất lượng cao. Tôi đã học được rất nhiều kỹ năng mới trong thời gian ngắn."
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                    L
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Chị Linh</h4>
                                    <p className="text-gray-600">Digital Marketer</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <div className="flex text-yellow-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 italic">
                                "Cộng đồng học viên rất tích cực, luôn sẵn sàng hỗ trợ. Cảm ơn EduPlatform đã tạo môi trường học tập tuyệt vời!"
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                    M
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Anh Minh</h4>
                                    <p className="text-gray-600">Data Analyst</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* CTA Section - Chỉ hiển thị khi chưa đăng nhập */}
            {!user && (
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Sẵn sàng bắt đầu hành trình học tập?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Tham gia cùng hàng nghìn học viên đang thay đổi cuộc sống thông qua việc học tập
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/login"
                                className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-colors inline-block text-center"
                            >
                                Dùng thử miễn phí
                            </Link>
                            <a 
                                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-colors inline-block text-center"
                            >
                                Xem demo
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AboutSection;