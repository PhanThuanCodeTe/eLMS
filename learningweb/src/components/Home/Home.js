import React, { useEffect, useState } from "react";
import { Search, X, BookOpen, Users, Star, Clock, User } from "lucide-react";
import { endpoints, authAPIs } from "../../configs/APIs";

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [originalCourses, setOriginalCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(null);

    // Function to fetch courses with an optional query
    const fetchCourses = async (query = "") => {
        try {
            const api = authAPIs(false);
            const url = query ? `${endpoints["list-course"]}?q=${query}` : endpoints["list-course"];
            const response = await api.get(url);
            setCourses(response.data.courses);
            if (!query) {
                setOriginalCourses(response.data.courses);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch courses when the search button is clicked
    useEffect(() => {
        setLoading(true);
        fetchCourses(searchQuery);
    }, [searchQuery]);

    // Handle the search button click
    const handleSearchClick = () => {
        setSearchQuery(searchInput);
    };

    // Handle search input change
    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    // Clear search input and reset courses
    const handleClearSearch = () => {
        setSearchInput("");
        setSearchQuery("");
        setCourses(originalCourses);
    };

    // Handle selecting a course and show modal
    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    // Close the modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
        setJoinSuccess(null);
    };

    // Function to handle joining a course
    const joinCourse = async (courseId) => {
        try {
            const api = authAPIs(true);
            const formData = new FormData();
            formData.append("course_id", courseId);

            await api.post(endpoints["join-course"], formData);
            setJoinSuccess(`Bạn đã tham gia khóa học thành công!`);
        } catch (error) {
            setError(`Không thể tham gia khóa học: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="text-red-800">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Khám phá tri thức
                            <span className="block text-yellow-300">không giới hạn</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                            Tham gia hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={handleSearchInputChange}
                                        placeholder="Tìm kiếm khóa học, chủ đề..."
                                        className="w-full pl-14 pr-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300">1000+</div>
                                <div className="text-blue-100 mt-1">Khóa học</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300">50K+</div>
                                <div className="text-blue-100 mt-1">Học viên</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300">100+</div>
                                <div className="text-blue-100 mt-1">Giảng viên</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300">4.8★</div>
                                <div className="text-blue-100 mt-1">Đánh giá</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {joinSuccess && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-center">
                        {joinSuccess}
                    </div>
                </div>
            )}

            {/* Courses Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Khóa học phổ biến
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Khám phá những khóa học được yêu thích nhất từ cộng đồng học viên
                    </p>
                </div>

                {courses.length === 0 && !loading ? (
                    <div className="text-center py-16">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy khóa học</h3>
                        <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => handleCourseClick(course)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden transform hover:-translate-y-2"
                            >
                                <div className="relative overflow-hidden">
                                    <img
                                        src={course.cover_image_url}
                                        alt={course.title}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            Phổ biến
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {course.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-1" />
                                            <span>2.5k học viên</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span>12 giờ</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-current" />
                                                ))}
                                            </div>
                                            <span className="text-gray-600 ml-2 text-sm">4.8</span>
                                        </div>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Sẵn sàng bắt đầu hành trình học tập?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Tham gia cùng hàng nghìn học viên đang thay đổi cuộc sống thông qua việc học tập
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-colors">
                            Dùng thử miễn phí
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-colors">
                            Xem demo
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Detail Modal */}
            {showModal && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                            <img
                                src={selectedCourse.cover_image_url}
                                alt={selectedCourse.title}
                                className="w-full h-64 object-cover"
                            />
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {selectedCourse.title}
                            </h2>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                {selectedCourse.description}
                            </p>
                            
                            {selectedCourse.author && (
                                <div className="flex items-center bg-gray-50 rounded-xl p-4 mb-6">
                                    <img
                                        src={selectedCourse.author.avatar}
                                        alt={`${selectedCourse.author.first_name} ${selectedCourse.author.last_name}`}
                                        className="w-16 h-16 rounded-full object-cover mr-4"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-lg">
                                            {selectedCourse.author.first_name} {selectedCourse.author.last_name}
                                        </h4>
                                        <p className="text-gray-600">Gi강ng viên</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <div className="font-semibold text-gray-900">2.5k</div>
                                    <div className="text-sm text-gray-600">Học viên</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <div className="font-semibold text-gray-900">12 giờ</div>
                                    <div className="text-sm text-gray-600">Thời lượng</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                    <div className="font-semibold text-gray-900">4.8</div>
                                    <div className="text-sm text-gray-600">Đánh giá</div>
                                </div>
                            </div>
                            
                            {joinSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800">
                                    {joinSuccess}
                                </div>
                            )}
                            
                            <button
                                onClick={() => joinCourse(selectedCourse.id)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Tham gia khóa học ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;