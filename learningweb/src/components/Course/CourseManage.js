import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Dropdown,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import { useNavigate } from "react-router-dom";

const CourseManage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Spinner state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    cover_image: null,
    description: "",
  });
  const [courses, setCourses] = useState([]); // State to store fetched courses
  const [loadingCourses, setLoadingCourses] = useState(true); // State to track course loading

  const navigate = useNavigate();

  const handleEditCourse = (course) => {
    const courseNameSlug = course.title.toLowerCase().replace(/ /g, "-"); // Create URL-friendly name
    navigate(`/manage-course/${courseNameSlug}/edit/${course.id}`);
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authAPIs().get(endpoints["category"]);
        setCategories(response.data);
        setFilteredCategories(response.data); // Initially show all categories
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      const response = await authAPIs().get(endpoints["list-course"]); // Assuming you have an endpoint for fetching courses
      setCourses(response.data.courses); // Update to access 'courses' key
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses.");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cover_image") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] })); // Handle file input
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Handle search and filter categories
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term === "") {
      setFilteredCategories(categories);
      setShowDropdown(false); // Hide dropdown when search is cleared
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategories(filtered);
      setShowDropdown(true); // Show dropdown when filtering
    }
  };

  // Handle selecting a category
  const handleCategorySelect = (category) => {
    if (!selectedCategories.some((cat) => cat.id === category.id)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setSearchTerm(""); // Reset search term after selection
    setFilteredCategories(categories); // Reset filtered categories
    setShowDropdown(false); // Hide dropdown after selection
  };

  // Handle removing a selected category
  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(
      selectedCategories.filter((category) => category.id !== categoryId)
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("cover_image", formData.cover_image);
    formDataToSend.append("description", formData.description);
    formDataToSend.append(
      "category",
      JSON.stringify(selectedCategories.map((category) => category.id))
    );

    try {
      const api = authAPIs(true); // Use authAPIs with authorization header
      await api.post(endpoints["create-course"], formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }, // Ensure it's sent as form data
      });
      setSuccess("Khóa học đã được tạo thành công, đang chờ duyệt từ ADMIN!");
      setFormData({ title: "", cover_image: null, description: "" });
      setSelectedCategories([]); // Reset form fields on success
      fetchCourses(); // Refetch courses to update the list
    } catch (err) {
      setError("Failed to create course. Please try again.");
      console.error("Error creating course:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories || loadingCourses) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Container fluid className="mt-5">
      <Row>
        {/* Left half: Course list */}
        <Col md={6}>
          <h2>Quản lý khóa học</h2>
          <Row>
            {courses.length > 0 ? (
              courses.map((course) => (
                <Col md={6} key={course.id} className="mb-4">
                  <Card
                    className="h-100"
                    onClick={() => handleEditCourse(course)}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Img
                      variant="top"
                      src={course.cover_image_url}
                      className="card-img-top"
                      style={{ objectFit: "cover", height: "200px" }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{course.title}</Card.Title>
                      <Card.Text className="flex-grow-1">
                        {course.description}
                      </Card.Text>
                      <Card.Footer className="text-muted">
                        <div>
                          <strong>Đã tạo:</strong> {course.created_at}
                        </div>
                        <div>
                          <strong>Trạng thái:</strong>{" "}
                          {course.is_active
                            ? "Đang hoạt động"
                            : "Đang chờ duyệt"}
                        </div>
                      </Card.Footer>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>Bạn Chưa tạo khóa học nào!</p>
            )}
          </Row>
        </Col>

        {/* Right half: Create course form */}
        <Col md={6}>
          <h2>Tạo khóa học</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTitle">
              <Form.Label>
                <strong>Tiêu đề:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formCoverImage" className="mt-3">
              <Form.Label>
                <strong>Ảnh bìa:</strong>
              </Form.Label>
              <Form.Control
                type="file"
                name="cover_image"
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mt-3">
              <Form.Label>
                <strong>Mô tả:</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </Form.Group>

            {/* Selected categories */}
            <h5 className="mt-4">Danh mục:</h5>
            <div className="mb-3">
              {selectedCategories.length === 0 ? (
                <p>Chưa có danh mục nào được chọn.</p>
              ) : (
                selectedCategories.map((category) => (
                  <Badge
                    key={category.id}
                    bg="primary"
                    className="me-2 mb-2"
                    onClick={() => handleRemoveCategory(category.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {category.name} &times;
                  </Badge>
                ))
              )}
            </div>

            {/* Search and filter categories */}
            <Form.Group
              controlId="formCategorySearch"
              className="position-relative"
            >
              <Form.Label>Tìm kiếm danh mục</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên danh mục"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setShowDropdown(true)} // Show dropdown on input focus
              />
              {/* Dropdown showing filtered categories */}
              {showDropdown && filteredCategories.length > 0 && (
                <Dropdown.Menu
                  show
                  className="w-100 position-absolute"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    top: "100%",
                    left: 0,
                  }}
                >
                  {filteredCategories.map((category) => (
                    <Dropdown.Item
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )}
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              disabled={submitting}
            >
              {submitting ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Tạo khóa học"
              )}
            </Button>

            {/* Success and Error Messages */}
            {success && (
              <Alert variant="success" className="mt-3">
                {success}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseManage;
