import React, { useEffect, useState } from "react";
import { Spinner, Card, Row, Col, ProgressBar } from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import { Link } from "react-router-dom";

const UserCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [membershipDetails, setMembershipDetails] = useState(null); // State to store membership details

  // Fetch the list of course memberships
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

  // Fetch membership details when a course is selected
  const fetchMembershipDetails = async (course) => {
    try {
      setSelectedCourse(course);
      const response = await authAPIs().get(`${endpoints["course-membership"]}${course.id}/`);
      setMembershipDetails(response.data); // Set membership details fetched for the selected course
    } catch (error) {
      console.error("Error fetching membership details:", error);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div className="d-flex">
      {/* Course list on the left */}
      <div style={{ flex: 1, padding: "1rem" }}>
        <Row xs={1} md={2} className="g-4">
          {courses.map((course) => (
            <Col key={course.id}>
              <Card border="primary" onClick={() => fetchMembershipDetails(course)}>
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

      {/* Selected course details on the right */}
      <div style={{ flex: 1, padding: "1rem" }}>
        {selectedCourse && membershipDetails ? (
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

            {/* Display Attend Date */}
            <p>
              <strong>Ngày tham gia:</strong>{" "}
              {new Date(membershipDetails.attend_date).toLocaleDateString()}
            </p>

            {/* Conditionally render Finish Date if available */}
            {membershipDetails.finish_date ? (
              <p>
                <strong>Ngày hoàn thành:</strong>{" "}
                {new Date(membershipDetails.finish_date).toLocaleDateString()}
              </p>
            ) : (
              <p>
                <strong>Ngày hoàn thành:</strong> Chưa hoàn thành
              </p>
            )}

            {/* Display Progress with ProgressBar */}
            <p>
              <strong>Tiến độ học tập:</strong>
              <ProgressBar
                now={membershipDetails.progress}
                label={`${Math.round(membershipDetails.progress)}%`}
                variant="success"
                style={{ height: "20px" }}
              />
            </p>
          </div>
        ) : (
          <div className="border border-secondary p-3 rounded">
            Nhấn vào 1 khóa học để xem thông tin khóa học.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCourse;
