import React, { useEffect, useState } from "react";
import { CircularProgress, LinearProgress, Typography, Button } from "@mui/material";
import { authAPIs, endpoints } from "../../configs/APIs";
import { Link } from "react-router-dom";

const UserCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [membershipDetails, setMembershipDetails] = useState(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
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