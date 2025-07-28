import React, { useEffect, useState } from "react";
import { CircularProgress, LinearProgress, Typography, Button, Collapse } from "@mui/material";
import { authAPIs, endpoints } from "../../configs/APIs";
import { Link } from "react-router-dom";

const UserCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [membershipDetails, setMembershipDetails] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  const fetchMembershipDetails = async (course) => {
    try {
      setSelectedCourse(course);
      const response = await authAPIs().get(`${endpoints["course-membership"]}${course.id}/`);
      setMembershipDetails(response.data);
    } catch (error) {
      console.error("Error fetching membership details:", error);
    }
  };

  const toggleCourseExpansion = (courseId) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
      // Fetch membership details when expanding
      const course = courses.find(c => c.id === courseId);
      if (course) {
        fetchMembershipDetails(course);
      }
    }
    setExpandedCourses(newExpanded);
  };

  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-lg overflow-hidden shadow-md bg-white border border-gray-200"
            >
              <img src={course.cover_image_url} alt={course.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-3">
                  {truncateText(course.description)}
                </p>
                
                <div className="flex gap-2 mb-3">
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    onClick={() => toggleCourseExpansion(course.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    {expandedCourses.has(course.id) ? 'Thu gọn' : 'Xem chi tiết'}
                  </Button>
                  <Link to={`/course/${course.id}`} state={{ course }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Vào khóa học
                    </Button>
                  </Link>
                </div>

                <Collapse in={expandedCourses.has(course.id)}>
                  <div className="border-t pt-3 mt-3">
                    <p className="text-gray-600 mb-3">
                      <span className="font-semibold">Mô tả đầy đủ:</span> {course.description}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Giáo viên:</span>{" "}
                      {course.author.first_name} {course.author.last_name}
                    </p>
                    
                    {membershipDetails && selectedCourse?.id === course.id && (
                      <>
                        <p className="text-gray-600 mb-2">
                          <span className="font-semibold">Ngày tham gia:</span>{" "}
                          {new Date(membershipDetails.attend_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 mb-3">
                          <span className="font-semibold">Ngày hoàn thành:</span>{" "}
                          {membershipDetails.finish_date
                            ? new Date(membershipDetails.finish_date).toLocaleDateString()
                            : "Chưa hoàn thành"}
                        </p>
                        <div>
                          <span className="font-semibold block mb-2 text-gray-800">Tiến độ học tập:</span>
                          <LinearProgress
                            variant="determinate"
                            value={membershipDetails.progress}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <p className="text-right mt-1 text-sm text-gray-600">
                            {Math.round(membershipDetails.progress)}%
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Collapse>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6">
      {/* Course List */}
      <div className="md:w-1/2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-200"
              onClick={() => fetchMembershipDetails(course)}
            >
              <img src={course.cover_image_url} alt={course.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-indigo-700 hover:text-indigo-900 transition">
                  {course.title}
                </h3>
                <p className="text-gray-600 mt-2">{course.description}</p>
                <Link to={`/course/${course.id}`} state={{ course }} className="mt-4 block">
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2, textTransform: 'none' }}
                  >
                    Xem khóa học
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Details */}
      <div className="md:w-1/2 bg-white shadow-md p-6 rounded-lg border border-gray-200">
        {selectedCourse && membershipDetails ? (
          <>
            <Typography variant="h5" className="text-indigo-800 font-bold mb-4">
              {selectedCourse.title}
            </Typography>
            <img
              src={selectedCourse.cover_image_url}
              alt={selectedCourse.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <p className="mb-2">
              <span className="font-semibold">Mô tả khóa học:</span> {selectedCourse.description}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Giáo viên:</span>{" "}
              {selectedCourse.author.first_name} {selectedCourse.author.last_name}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Ngày tham gia:</span>{" "}
              {new Date(membershipDetails.attend_date).toLocaleDateString()}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Ngày hoàn thành:</span>{" "}
              {membershipDetails.finish_date
                ? new Date(membershipDetails.finish_date).toLocaleDateString()
                : "Chưa hoàn thành"}
            </p>
            <div className="mt-4">
              <span className="font-semibold block mb-2">Tiến độ học tập:</span>
              <LinearProgress
                variant="determinate"
                value={membershipDetails.progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <p className="text-right mt-1 text-sm text-gray-600">
                {Math.round(membershipDetails.progress)}%
              </p>
            </div>
          </>
        ) : (
          <div className="text-gray-600 text-center py-10">
            Nhấn vào một khóa học để xem thông tin chi tiết.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCourse;