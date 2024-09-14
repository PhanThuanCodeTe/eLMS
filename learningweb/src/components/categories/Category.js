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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    scrollToTop(); // Scroll to top when letter is clicked
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const vietnameseLetters = ['Ă', 'Â', 'Đ', 'Ê', 'Ô', 'Ơ', 'Ư'];

  return loading ? (
    <Spinner />
  ) : error ? (
    <p className="text-red-500">Error: {error}</p>
  ) : (
    <div className="flex p-4">
      {/* Left Column: Alphabet */}
      <div className="w-fit p-3 rounded bg-gray-200">
        {[...alphabet, ...vietnameseLetters].map((letter) => (
          <p 
            key={letter} 
            className={`text-center py-1 text-lg font-semibold cursor-pointer ${selectedLetter === letter ? 'bg-gray-300' : ''}`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </p>
        ))}
      </div>

      {/* Right Column: Categories */}
      <div className="flex-1 px-4">
        {categories.length > 0 ? (
          Object.keys(categories.reduce((acc, category) => {
            const firstLetter = category.name[0].toUpperCase();
            if (!acc[firstLetter]) {
              acc[firstLetter] = [];
            }
            acc[firstLetter].push(category);
            return acc;
          }, {})).sort().map((letter) => (
            <div key={letter} className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{letter}</h2>
              <ul>
                {categories.filter(category => category.name[0].toUpperCase() === letter).map((category) => (
                  <li key={category.id} className="ml-4 text-base">
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>Tôi vẫn chưa thêm danh mục này, xin cảm ơn!</p>
        )}
      </div>
    </div>
  );
};

export default Category;
