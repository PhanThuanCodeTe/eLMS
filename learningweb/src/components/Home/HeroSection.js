import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

const HeroSection = ({ searchInput, handleSearchInputChange, handleSearchClick, handleClearSearch }) => {
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowStats(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white min-h-[420px] flex items-center py-8">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center flex flex-col items-center justify-center min-h-[320px]">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Khám phá tri thức
                        <span className="block text-yellow-300">không giới hạn</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                        Tham gia hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu
                    </p>
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto w-full">
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
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto w-full transition-opacity duration-700 ${showStats ? 'opacity-100' : 'opacity-0'}`}>
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
    );
};

export default HeroSection; 