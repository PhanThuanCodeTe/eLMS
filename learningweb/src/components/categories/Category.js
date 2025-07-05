import React, { useEffect, useState } from "react";
import { authAPIs, endpoints } from "../../configs/APIs";
import Spinner from "../Spinner";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authAPIs().get(`${endpoints.category}?letter=${encodeURIComponent(selectedLetter)}`);
        setCategories(response.data);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedLetter]);

  const fetchCoursesByCategory = async (categoryId) => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const response = await authAPIs().get(`${endpoints.category}/${categoryId}/courses/`);
      setCourses(response.data.courses);
    } catch (err) {
      setCoursesError(err.message || "Không thể tải danh sách khóa học");
    } finally {
      setCoursesLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setSelectedCategory(null);
    setCourses([]);
    scrollToTop();
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null);
      setCourses([]);
    } else {
      setSelectedCategory(category);
      fetchCoursesByCategory(category.id);
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return loading ? (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Spinner />
    </div>
  ) : error ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Danh mục</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar: Alphabet */}
          <div className="lg:w-80 w-full">
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-white/20 sticky top-8">
              
              <div className="grid grid-cols-6 gap-2">
                {alphabet.map((letter) => (
                  <button
                    key={letter}
                    className={`relative text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105
                      ${selectedLetter === letter 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-600'
                      }`}
                    onClick={() => handleLetterClick(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              
              {selectedLetter && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    Đang hiển thị danh mục cho chữ: <span className="font-bold">{selectedLetter}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Content: Categories and Courses */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-8">
                {categories.length > 0 ? (
                  Object.keys(
                    categories.reduce((acc, category) => {
                      const firstLetter = category.name[0].toUpperCase();
                      if (!acc[firstLetter]) acc[firstLetter] = [];
                      acc[firstLetter].push(category);
                      return acc;
                    }, {})
                  )
                    .sort()
                    .map((letter) => (
                      <div key={letter} className="mb-10 last:mb-0">
                        <div className="flex items-center mb-6">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                            <span className="text-white font-bold text-lg">{letter}</span>
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          {categories
                            .filter((cat) => cat.name[0].toUpperCase() === letter)
                            .map((category) => (
                              <div key={category.id} className="group">
                                <div
                                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                                    selectedCategory && selectedCategory.id === category.id
                                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20'
                                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                  }`}
                                  onClick={() => handleCategoryClick(category)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className={`w-3 h-3 rounded-full mr-3 ${
                                        selectedCategory && selectedCategory.id === category.id
                                          ? 'bg-blue-500'
                                          : 'bg-gray-300 group-hover:bg-blue-400'
                                      }`}></div>
                                      <span className={`text-lg font-semibold ${
                                        selectedCategory && selectedCategory.id === category.id
                                          ? 'text-blue-700'
                                          : 'text-gray-800 group-hover:text-blue-600'
                                      }`}>
                                        {category.name}
                                      </span>
                                    </div>
                                    <svg 
                                      className={`w-5 h-5 transition-transform duration-300 ${
                                        selectedCategory && selectedCategory.id === category.id
                                          ? 'rotate-90 text-blue-500'
                                          : 'text-gray-400 group-hover:text-blue-500'
                                      }`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>

                                {/* Courses List */}
                                {selectedCategory && selectedCategory.id === category.id && (
                                  <div className="mt-4 ml-6 animate-in slide-in-from-top-2 duration-300">
                                    {coursesLoading ? (
                                      <div className="flex justify-center py-8">
                                        <Spinner />
                                      </div>
                                    ) : coursesError ? (
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <p className="text-red-600 font-medium">{coursesError}</p>
                                        </div>
                                      </div>
                                    ) : courses.length > 0 ? (
                                      <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-700 mb-3">
                                          Khóa học ({courses.length})
                                        </h4>
                                        <div className="grid gap-3">
                                          {courses.map((course) => (
                                            <div
                                              key={course.id}
                                              className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-blue-300 cursor-pointer group"
                                            >
                                              <div className="flex items-start space-x-4">
                                                {course.cover_image_url && (
                                                  <img
                                                    src={course.cover_image_url}
                                                    alt={course.title}
                                                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                                  />
                                                )}
                                                <div className="flex-1">
                                                  <h5 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                                                    {course.title}
                                                  </h5>
                                                  {course.description && (
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                      {course.description}
                                                    </p>
                                                  )}
                                                  <div className="flex items-center mt-2 text-xs text-gray-500">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {course.created_at}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                          </svg>
                                        </div>
                                        <p className="text-gray-600 font-medium">Không có khóa học nào trong danh mục này</p>
                                        <p className="text-sm text-gray-500 mt-1">Khóa học sẽ được cập nhật sớm</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có danh mục nào</h3>
                    <p className="text-gray-500 text-lg">Tôi vẫn chưa thêm danh mục này, xin cảm ơn!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;