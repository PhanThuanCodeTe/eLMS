import React, { useEffect, useState } from "react";
import { Spinner, Card, Row, Col } from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import { Link } from "react-router-dom";

const UserCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await authAPIs().get(endpoints["course-member"]);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div className="d-flex">
      <div style={{ flex: 1, padding: "1rem" }}>
        <Row xs={1} md={2} className="g-4">
          {courses.map((course) => (
            <Col key={course.id}>
              <Card border="primary" onClick={() => setSelectedCourse(course)}>
                <Card.Img variant="top" src={course.cover_image_url} />
                <Card.Body>
                  <Card.Title>
                    <Link
                      to={`/course/${course.id}`}
                      state={{ course }} // Pass the entire course object as state
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {course.title}
                    </Link>
                  </Card.Title>
                  <Card.Text>{course.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <div style={{ flex: 1, padding: "1rem" }}>
        {selectedCourse ? (
          <div>
            <h3>{selectedCourse.title}</h3>
            <img
              src={selectedCourse.cover_image_url}
              alt={selectedCourse.title}
              style={{ width: "100%" }}
            />
            <p>
              <strong>Mô tả khóa học:</strong> {selectedCourse.description}
            </p>
            <p>
              <strong>Giáo viên:</strong> {selectedCourse.author.first_name}{" "}
              {selectedCourse.author.last_name}
            </p>
          </div>
        ) : (
          <>
            <div className="border border-secondary p-3 rounded">
              Nhấn vào 1 khóa học để xem thông tin khóa học.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserCourse;
