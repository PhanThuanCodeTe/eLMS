import React, { useEffect, useState } from "react";
import { authAPIs, endpoints } from "../../configs/APIs";
import Spinner from "../Spinner";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState('');

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    scrollToTop();
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const vietnameseLetters = ['Ă', 'Â', 'Đ', 'Ê', 'Ô', 'Ơ', 'Ư'];
  const allLetters = [...alphabet, ...vietnameseLetters];

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
          {allLetters.map((letter) => (
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

      {/* Right Content: Categories */}
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
                      <li
                        key={category.id}
                        className="text-gray-800 text-base hover:underline hover:text-blue-600 transition-colors duration-150"
                      >
                        {category.name}
                      </li>
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
