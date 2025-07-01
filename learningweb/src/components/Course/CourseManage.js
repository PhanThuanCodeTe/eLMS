import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPIs, endpoints } from "../../configs/APIs";
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
} from "@mui/material";

const CourseManage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    cover_image: null,
    description: "",
  });
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const navigate = useNavigate();

  const handleEditCourse = (course) => {
    const courseNameSlug = course.title.toLowerCase().replace(/ /g, "-");
    navigate(`/manage-course/${courseNameSlug}/edit/${course.id}`);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authAPIs().get(endpoints["category"]);
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh mục.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await authAPIs().get(endpoints["list-course"]);
      setCourses(response.data.courses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Không thể tải danh sách khóa học.");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cover_image") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

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
      const api = authAPIs(true);
      await api.post(endpoints["create-course"], formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Khóa học đã được tạo thành công, đang chờ duyệt từ ADMIN!");
      setFormData({ title: "", cover_image: null, description: "" });
      setSelectedCategories([]);
      fetchCourses();
    } catch (err) {
      setError("Không thể tạo khóa học. Vui lòng thử lại.");
      console.error("Error creating course:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories || loadingCourses) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left half: Course list */}
        <div>
          <h2 className="text-3xl font-bold text-indigo-700 mb-6 animate-pulse">
            Quản lý khóa học
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Card
                  key={course.id}
                  className="shadow-md hover:shadow-xl transition-shadow duration-300"
                  onClick={() => handleEditCourse(course)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.cover_image_url}
                    alt={course.title}
                    className="object-cover h-48 w-full rounded-t-lg"
                  />
                  <CardContent className="bg-white">
                    <Typography variant="h6" className="font-bold text-gray-800">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-2">
                      {course.description}
                    </Typography>
                  </CardContent>
                  <CardActions className="bg-gray-50 p-4">
                    <div className="text-sm text-gray-500">
                      <strong>Đã tạo:</strong> {course.created_at}
                      <br />
                      <strong>Trạng thái:</strong>{" "}
                      {course.is_active ? "Đang hoạt động" : "Đang chờ duyệt"}
                    </div>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography className="text-gray-600">
                Bạn chưa tạo khóa học nào!
              </Typography>
            )}
          </div>
        </div>

        {/* Right half: Create course form */}
        <div>
          <h2 className="text-3xl font-bold text-indigo-700 mb-6 animate-pulse">
            Tạo khóa học
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Tiêu đề"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              variant="outlined"
              className="bg-white rounded-lg"
              InputProps={{
                className: "text-gray-700",
              }}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh bìa
              </label>
              <input
                type="file"
                name="cover_image"
                onChange={handleInputChange}
                required
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              variant="outlined"
              className="bg-white rounded-lg"
              InputProps={{
                className: "text-gray-700",
              }}
            />
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(option) => option.name}
              value={selectedCategories}
              onChange={(event, newValue) => setSelectedCategories(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Danh mục"
                  placeholder="Chọn danh mục"
                  variant="outlined"
                  className="bg-white"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    className="bg-indigo-100 text-indigo-700"
                  />
                ))
              }
              className="bg-white rounded-lg"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
              startIcon={submitting && <CircularProgress size={20} />}
            >
              {submitting ? "Đang tạo..." : "Tạo khóa học"}
            </Button>
            {success && (
              <Alert severity="success" className="mt-4">
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" className="mt-4">
                {error}
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseManage;