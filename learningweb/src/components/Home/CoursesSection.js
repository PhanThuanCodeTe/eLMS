import React, { useState, useMemo } from "react";
import { BookOpen, Users, Star, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";

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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Memoize visible courses
    const visibleCourses = useMemo(() => {
        const maxVisibleCourses = 8;
        return courses.slice(0, maxVisibleCourses);
    }, [courses]);

    // Calculate slides per view based on screen size
    const getSlidesPerView = () => {
        if (typeof window === 'undefined') return 4;
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 768) return 2;
        if (window.innerWidth < 1024) return 3;
        return 4;
    };

    const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView);

    React.useEffect(() => {
        const handleResize = () => {
            setSlidesPerView(getSlidesPerView());
            setCurrentIndex(0); // Reset to first slide on resize
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalSlides = visibleCourses.length;
    const maxIndex = Math.max(0, totalSlides - slidesPerView);

    const goToNext = () => {
        setCurrentIndex(prev => {
            // If at the end, go back to beginning (infinite loop)
            if (prev >= maxIndex) {
                return 0;
            }
            return prev + 1;
        });
    };

    const goToPrev = () => {
        setCurrentIndex(prev => {
            // If at the beginning, go to the end (infinite loop)
            if (prev <= 0) {
                return maxIndex;
            }
            return prev - 1;
        });
    };

    const goToSlide = (index) => {
        setCurrentIndex(Math.min(index, maxIndex));
    };

    // Touch/Swipe handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            setIsDragging(false);
            return;
        }
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrev();
        }
        
        setIsDragging(false);
    };

    // Handle click vs swipe
    const handleCourseCardClick = (course) => {
        if (!isDragging) {
            handleCourseClick(course);
        }
    };

    // Handle backdrop click to close modal
    const handleBackdropClick = (e) => {
        // Only close if clicking on the backdrop itself, not the modal content
        if (e.target === e.currentTarget) {
            handleCloseModal();
        }
    };

    // Calculate transform percentage
    const getTransformValue = () => {
        return (currentIndex * 100) / slidesPerView;
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
                    <div className="text-red-800 text-center">{error}</div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Khóa học phổ biến
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                    Khám phá những khóa học được yêu thích nhất từ cộng đồng học viên
                </p>
            </div>
            
            {visibleCourses.length === 0 ? (
                <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy khóa học</h3>
                    <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Navigation buttons - hide on mobile for swipe experience */}
                    {visibleCourses.length > slidesPerView && (
                        <>
                            <button
                                onClick={goToPrev}
                                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 hover:shadow-xl hover:bg-blue-50 hidden sm:block"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </button>
                            
                            <button
                                onClick={goToNext}
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 hover:shadow-xl hover:bg-blue-50 hidden sm:block"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </button>
                        </>
                    )}

                    {/* Slider Container */}
                    <div 
                        className="overflow-hidden mx-6 sm:mx-16"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div 
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ 
                                transform: `translateX(-${getTransformValue()}%)`
                            }}
                        >
                            {visibleCourses.map((course, index) => (
                                <div
                                    key={course.id}
                                    className={`flex-shrink-0 px-2 ${
                                        slidesPerView === 1 ? 'w-full' :
                                        slidesPerView === 2 ? 'w-1/2' :
                                        slidesPerView === 3 ? 'w-1/3' : 'w-1/4'
                                    }`}
                                >
                                    <div
                                        onClick={() => handleCourseCardClick(course)}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden transform hover:-translate-y-2 h-full flex flex-col select-none"
                                    >
                                        <div className="relative overflow-hidden flex-shrink-0">
                                            <div className="w-full h-48 sm:h-52 bg-gray-200">
                                                <img
                                                    src={course.cover_image_url}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                                                <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                                    Phổ biến
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 sm:p-6 flex flex-col flex-grow">
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors flex-shrink-0">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3 flex-grow">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex-shrink-0">
                                                <div className="flex items-center">
                                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                    <span>2.5k học viên</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                    <span>12 giờ</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between flex-shrink-0">
                                                <div className="flex items-center">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                                                        ))}
                                                    </div>
                                                    <span className="text-gray-600 ml-2 text-xs sm:text-sm">4.8</span>
                                                </div>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm">
                                                    Xem
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dots indicator */}
                    {visibleCourses.length > slidesPerView && maxIndex > 0 && (
                        <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                            {Array.from({ length: maxIndex + 1 }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                                        index === currentIndex 
                                            ? 'bg-blue-600 scale-125' 
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Course Detail Modal */}
            {showModal && selectedCourse && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={handleBackdropClick}
                >
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                            <img
                                src={selectedCourse.cover_image_url}
                                alt={selectedCourse.title}
                                className="w-full h-48 sm:h-64 object-cover"
                            />
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                {selectedCourse.title}
                            </h2>
                            <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                                {selectedCourse.description}
                            </p>
                            {selectedCourse.author && (
                                <div className="flex items-center bg-gray-50 rounded-xl p-4 mb-6">
                                    <img
                                        src={selectedCourse.author.avatar}
                                        alt={`${selectedCourse.author.first_name} ${selectedCourse.author.last_name}`}
                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-4 flex-shrink-0"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                                            {selectedCourse.author.first_name} {selectedCourse.author.last_name}
                                        </h4>
                                        <p className="text-gray-600 text-sm sm:text-base">Giảng viên</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">2.5k</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Học viên</div>
                                </div>
                                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">12 giờ</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Thời lượng</div>
                                </div>
                                <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-xl">
                                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mx-auto mb-2" />
                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">4.8</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Đánh giá</div>
                                </div>
                            </div>
                            {joinSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800 text-sm sm:text-base">
                                    {joinSuccess}
                                </div>
                            )}
                            <button
                                onClick={() => joinCourse(selectedCourse.id)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
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