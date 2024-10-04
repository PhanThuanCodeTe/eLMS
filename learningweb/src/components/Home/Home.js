import React, { useEffect, useState } from "react";
import { Spinner, Container, Row, Col, Button, Form, InputGroup, Alert, Offcanvas } from "react-bootstrap"; // Import Bootstrap components
import { endpoints, authAPIs } from "../../configs/APIs";

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [originalCourses, setOriginalCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedCourse, setSelectedCourse] = useState(null); // Store selected course data
    const [showOffcanvas, setShowOffcanvas] = useState(false); // Control the offcanvas visibility
    const [joinSuccess, setJoinSuccess] = useState(null); // State to show join success/failure

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

    // Handle selecting a course and show offcanvas
    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setShowOffcanvas(true);
    };

    // Close the offcanvas
    const handleCloseOffcanvas = () => {
        setShowOffcanvas(false);
        setSelectedCourse(null);
        setJoinSuccess(null); // Reset success message
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

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="text-center py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <div>
            {/* Top Section - Gradient Background with Search Bar */}
            <div
                className="d-flex justify-content-center align-items-center bg-gradient-primary"
                style={{
                    background: "linear-gradient(45deg, #00f260, #0575e6)",
                    height: "50vh",
                    color: "white",
                    textAlign: "center",
                    flexDirection: "column",
                }}
            >
                <h1>Tìm Khóa Học Của Bạn</h1>
                <InputGroup className="mt-3" style={{ maxWidth: "400px" }}>
                    {/* Search bar */}
                    <Form.Control
                        type="text"
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        placeholder="Tìm kiếm khóa học"
                        className="rounded-start"
                    />
                    {/* Clear button (X) */}
                    {searchInput && (
                        <Button 
                            variant="light" 
                            onClick={handleClearSearch} 
                            className="rounded-0"
                        >
                            &times;
                        </Button>
                    )}
                    <Button 
                        variant="light" 
                        onClick={handleSearchClick} 
                        className="rounded-end ms-1"
                    >
                        Tìm Kiếm
                    </Button>
                </InputGroup>
            </div>

            {/* Bottom Section - Course List */}
            <Container className="py-5">
                <h2 className="text-center mb-4">Khóa Học</h2>
                {joinSuccess && <Alert variant="success" className="text-center">{joinSuccess}</Alert>}
                <Row>
                    {courses.length === 0 && !loading ? (
                        <Col>
                            <p className="text-center">Không có khóa học nào</p>
                        </Col>
                    ) : (
                        courses.map(course => (
                            <Col md={4} className="mb-4" key={course.id}>
                                <div className="card h-100 shadow-sm" onClick={() => handleCourseClick(course)}>
                                    {/* Display the course image */}
                                    <img 
                                        src={course.cover_image_url} 
                                        alt={course.title} 
                                        className="card-img-top" 
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{course.title}</h5>
                                        <p className="card-text">{course.description}</p>
                                    </div>
                                </div>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>

            {/* Offcanvas for course details */}
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Thông tin khóa học</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {selectedCourse && (
                        <>
                            <img 
                                src={selectedCourse.cover_image_url} 
                                alt={selectedCourse.title} 
                                className="img-fluid mb-3"
                            />
                            <h5>{selectedCourse.title}</h5>
                            <p>{selectedCourse.description}</p>
                            {selectedCourse.author && (
                                <div className="mb-3">
                                    <p><strong>Tác giả:</strong> {selectedCourse.author.first_name} {selectedCourse.author.last_name}</p>
                                    <img 
                                        src={selectedCourse.author.avatar} 
                                        alt={`${selectedCourse.author.first_name} ${selectedCourse.author.last_name}`} 
                                        style={{ width: "50px", borderRadius: "50%" }}
                                    />
                                </div>
                            )}
                            <Button 
                                variant="primary" 
                                onClick={() => joinCourse(selectedCourse.id)}
                                className="w-100"
                            >
                                Tham gia khóa học
                            </Button>
                            {joinSuccess && <Alert variant="success" className="mt-3">{joinSuccess}</Alert>}
                        </>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default Home;
