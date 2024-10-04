import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Alert, Container, Row, Col, Modal } from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import Module from "../Module/Module";

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCoverImage, setNewCoverImage] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await authAPIs().get(endpoints["course-detail"](id));
        setCourseData(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          cover_image: response.data.cover_image_url,
        });
      } catch (err) {
        console.error("Lỗi khi lấy thông tin khóa học:", err);
        setError("Không thể tải thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cover_image") {
      setNewCoverImage(files[0]);
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleTextUpdate = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const updatedData = {
      title: formData.title,
      description: formData.description,
    };

    try {
      await authAPIs().patch(`${endpoints["course-detail"](id)}/`, updatedData);
      setSubmitSuccess(true);
      await fetchCourseData(); // Re-fetch the updated data
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin khóa học:", err);
      setSubmitError("Không thể cập nhật thông tin khóa học.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleImageUpdate = async () => {
    if (!newCoverImage) return;

    const formData = new FormData();
    formData.append("cover_image", newCoverImage);

    try {
      await authAPIs().patch(`${endpoints["course-detail"](id)}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSubmitSuccess(true);
      await fetchCourseData(); // Re-fetch the updated data
      setNewCoverImage(null); // Reset the new cover image
    } catch (err) {
      console.error("Lỗi khi cập nhật hình bìa khóa học:", err);
      setSubmitError("Không thể cập nhật hình bìa khóa học.");
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await authAPIs().get(endpoints["course-detail"](id));
      setCourseData(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        cover_image: response.data.cover_image_url,
      });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin khóa học:", err);
      setError("Không thể tải thông tin khóa học.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleTextUpdate();
  };

  const handleImageClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleImageChange = (e) => {
    handleInputChange(e);
  };

  const handleImageSubmit = async () => {
    await handleImageUpdate();
    handleModalClose();
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h2>Chỉnh sửa khóa học</h2>
      {courseData && (
        <>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <img
                  src={formData.cover_image || courseData.cover_image_url}
                  alt="Hình bìa"
                  className="img-fluid"
                  style={{ width: "100%", height: "auto", cursor: "pointer" }}
                  onClick={handleImageClick}
                />
              </Col>
              <Col md={8}>
                <Form.Group controlId="formTitle">
                  <Form.Label>Tiêu đề</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formDescription" className="mt-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                {submitError && <Alert variant="danger" className="mt-3">{submitError}</Alert>}
                {submitSuccess && <Alert variant="success" className="mt-3">Khóa học đã được cập nhật thành công!</Alert>}

                <Button type="submit" className="mt-3" disabled={submitLoading}>
                  {submitLoading ? <Spinner as="span" animation="border" size="sm" /> : "Lưu thay đổi"}
                </Button>
              </Col>
            </Row>
          </Form>

          {/* Section for Module Management */}
          <h2 className="mt-5">Quản lý các module trong khóa học</h2>
          <Module courseId={id} />

          {/* Bootstrap Modal for Image Change */}
          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Thay đổi ảnh bìa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formCoverImage">
                  <Form.Label>Chọn ảnh bìa mới</Form.Label>
                  <Form.Control
                    type="file"
                    name="cover_image"
                    onChange={handleImageChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={handleImageSubmit}
              >
                Lưu hình bìa
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default CourseEdit;
