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
    setSelectedCategory(null); // Reset danh mục được chọn khi đổi chữ cái
    setCourses([]); // Reset danh sách khóa học
    scrollToTop();
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null); // Nếu click lại vào danh mục đang chọn, ẩn danh sách khóa học
      setCourses([]);
    } else {
      setSelectedCategory(category);
      fetchCoursesByCategory(category.id); // Gọi API để lấy khóa học
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return loading ? (
    <Spinner />
  ) : error ? (
    <p className="text-red-500 text-center mt-10">Lỗi: {error}</p>
  ) : (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* Left Sidebar: Alphabet */}
      <div className="w-full md:w-1/6 bg-white shadow-md rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-3 text-gray-700 text-center">Chọn chữ cái</h3>
        <div className="grid grid-cols-6 gap-2">
          {alphabet.map((letter) => (
            <button
              key={letter}
              className={`text-sm font-medium px-2 py-1 rounded transition-all duration-200
                ${selectedLetter === letter ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Right Content: Categories and Courses */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6 overflow-auto">
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
              <div key={letter} className="mb-6">
                <h2 className="text-2xl font-bold text-blue-700 border-b border-gray-200 pb-1 mb-3">{letter}</h2>
                <ul className="space-y-1 ml-4">
                  {categories
                    .filter((cat) => cat.name[0].toUpperCase() === letter)
                    .map((category) => (
                      <div key={category.id}>
                        <li
                          className={`text-gray-800 text-base hover:underline hover:text-blue-600 transition-colors duration-150 cursor-pointer ${
                            selectedCategory && selectedCategory.id === category.id ? 'font-bold text-blue-600' : ''
                          }`}
                          onClick={() => handleCategoryClick(category)}
                        >
                          {category.name}
                        </li>
                        {/* Hiển thị danh sách khóa học nếu danh mục được chọn */}
                        {selectedCategory && selectedCategory.id === category.id && (
                          <div className="ml-6 mt-2">
                            {coursesLoading ? (
                              <Spinner />
                            ) : coursesError ? (
                              <p className="text-red-500 text-sm">Lỗi: {coursesError}</p>
                            ) : courses.length > 0 ? (
                              <ul className="space-y-1">
                                {courses.map((course) => (
                                  <li
                                    key={course.id}
                                    className="text-gray-700 text-sm hover:text-blue-500 transition-colors duration-150"
                                  >
                                    {course.title}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 italic text-sm">Không có khóa học nào trong danh mục này.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </ul>
              </div>
            ))
        ) : (
          <p className="text-gray-500 italic text-center">Tôi vẫn chưa thêm danh mục này, xin cảm ơn!</p>
        )}
      </div>
    </div>
  );
};

export default Category;