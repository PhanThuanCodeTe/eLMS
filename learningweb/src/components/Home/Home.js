import React, { useEffect, useState } from "react";
import { endpoints, authAPIs } from "../../configs/APIs";
import HeroSection from "./HeroSection";
import CoursesSection from "./CoursesSection";
import AboutSection from "./AboutSection";

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

    // Check if user is currently searching
    const isSearching = searchQuery.trim() !== "";

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

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection
                searchInput={searchInput}
                handleSearchInputChange={handleSearchInputChange}
                handleSearchClick={handleSearchClick}
                handleClearSearch={handleClearSearch}
            />
            <CoursesSection
                courses={courses}
                loading={loading}
                error={error}
                handleCourseClick={handleCourseClick}
                showModal={showModal}
                selectedCourse={selectedCourse}
                handleCloseModal={handleCloseModal}
                joinSuccess={joinSuccess}
                joinCourse={joinCourse}
            />
            {/* Chỉ hiển thị AboutSection khi không đang tìm kiếm */}
            {!isSearching && <AboutSection />}
        </div>
    );
};

export default Home;