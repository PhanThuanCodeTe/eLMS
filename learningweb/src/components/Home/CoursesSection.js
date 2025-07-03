import React from "react";
import { BookOpen, Users, Star, Clock, X, User } from "lucide-react";

const CoursesSection = ({
    courses,
    loading,
    error,
    handleCourseClick,
    showModal,
    selectedCourse,
    handleCloseModal,
    joinSuccess,
    joinCourse
}) => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Khóa học phổ biến
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Khám phá những khóa học được yêu thích nhất từ cộng đồng học viên
                </p>
            </div>
            {courses.length === 0 ? (
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
                                        <p className="text-gray-600">Giảng viên</p>
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

export default CoursesSection; 