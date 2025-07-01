import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPIs, endpoints } from "../../configs/APIs";
import Module from "../Module/Module";
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  Box,
  Fade,
  Slide,
  Zoom,
  Backdrop,
  Paper,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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
        showSnackbar("Không thể tải thông tin khóa học", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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
      await fetchCourseData();
      showSnackbar("Cập nhật thông tin khóa học thành công!", "success");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin khóa học:", err);
      setSubmitError("Không thể cập nhật thông tin khóa học.");
      showSnackbar("Không thể cập nhật thông tin khóa học", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleImageUpdate = async () => {
    if (!newCoverImage) {
      showSnackbar("Vui lòng chọn hình ảnh để cập nhật", "warning");
      return;
    }

    const formDataImage = new FormData();
    formDataImage.append("cover_image", newCoverImage);

    try {
      await authAPIs().patch(`${endpoints["course-detail"](id)}/`, formDataImage, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSubmitSuccess(true);
      await fetchCourseData();
      setNewCoverImage(null);
      showSnackbar("Cập nhật hình bìa thành công!", "success");
    } catch (err) {
      console.error("Lỗi khi cập nhật hình bìa khóa học:", err);
      setSubmitError("Không thể cập nhật hình bìa khóa học.");
      showSnackbar("Không thể cập nhật hình bìa khóa học", "error");
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
      showSnackbar("Không thể tải thông tin khóa học", "error");
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
    setNewCoverImage(null);
  };

  const handleImageChange = (e) => {
    handleInputChange(e);
  };

  const handleImageSubmit = async () => {
    await handleImageUpdate();
    handleModalClose();
  };

  if (loading) {
    return (
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box className="flex flex-col items-center space-y-4">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" className="animate-pulse">
            Đang tải thông tin khóa học...
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Fade in={true} timeout={800}>
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            className="shadow-lg rounded-xl"
            action={
              <Button color="inherit" size="small" onClick={() => navigate(-1)}>
                Quay lại
              </Button>
            }
          >
            <Typography variant="h6" component="div">
              {error}
            </Typography>
          </Alert>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <Fade in={true} timeout={1000}>
        <Box>
          {/* Header Section */}
          <Slide direction="down" in={true} timeout={800}>
            <Paper 
              elevation={8} 
              className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl"
            >
              <Box className="flex items-center space-x-4">
                <Zoom in={true} timeout={1200}>
                  <SchoolIcon sx={{ fontSize: 48 }} className="animate-bounce" />
                </Zoom>
                <Box>
                  <Typography variant="h3" className="font-bold mb-2 animate-pulse">
                    Chỉnh sửa khóa học
                  </Typography>
                  <Typography variant="h6" className="opacity-90">
                    Cập nhật thông tin và quản lý nội dung khóa học
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Slide>

          {courseData && (
            <>
              {/* Main Content */}
              <Slide direction="up" in={true} timeout={1000}>
                <Card elevation={12} className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <CardContent className="p-0">
                    <Box component="form" onSubmit={handleSubmit}>
                      <Grid container spacing={0}>
                        {/* Image Section */}
                        <Grid item xs={12} md={4}>
                          <Box className="relative h-full min-h-[400px] bg-gradient-to-br from-gray-100 to-gray-200">
                            <Box className="absolute inset-4 group cursor-pointer" onClick={handleImageClick}>
                              <img
                                src={formData.cover_image || courseData.cover_image_url}
                                alt="Hình bìa khóa học"
                                className="w-full h-full object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-500 group-hover:shadow-2xl"
                              />
                              <Box className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl">
                                <Box className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                  <PhotoCameraIcon sx={{ fontSize: 48 }} className="mb-2" />
                                  <Typography variant="h6" className="font-semibold">
                                    Thay đổi ảnh bìa
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Tooltip title="Chỉnh sửa ảnh bìa" arrow>
                              <IconButton 
                                className="absolute top-6 right-6 bg-white shadow-lg hover:bg-gray-50 transform hover:scale-110 transition-all duration-300"
                                onClick={handleImageClick}
                              >
                                <EditIcon className="text-indigo-600" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>

                        {/* Form Section */}
                        <Grid item xs={12} md={8}>
                          <Box className="p-8 space-y-6 bg-gradient-to-br from-white to-indigo-50">
                            <Zoom in={true} timeout={1200} style={{ transitionDelay: '200ms' }}>
                              <TextField
                                fullWidth
                                label="Tiêu đề khóa học"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                className="transform hover:scale-105 transition-transform duration-300"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    '&:hover': {
                                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)',
                                    },
                                    '&.Mui-focused': {
                                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
                                    }
                                  }
                                }}
                              />
                            </Zoom>

                            <Zoom in={true} timeout={1200} style={{ transitionDelay: '400ms' }}>
                              <TextField
                                fullWidth
                                label="Mô tả khóa học"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                multiline
                                rows={6}
                                variant="outlined"
                                className="transform hover:scale-105 transition-transform duration-300"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    '&:hover': {
                                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)',
                                    },
                                    '&.Mui-focused': {
                                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
                                    }
                                  }
                                }}
                              />
                            </Zoom>

                            {/* Error Alert */}
                            {submitError && (
                              <Slide direction="left" in={Boolean(submitError)} timeout={500}>
                                <Alert 
                                  severity="error" 
                                  icon={<ErrorIcon />}
                                  className="rounded-xl shadow-lg animate-pulse"
                                  onClose={() => setSubmitError(null)}
                                >
                                  {submitError}
                                </Alert>
                              </Slide>
                            )}

                            {/* Success Alert */}
                            {submitSuccess && (
                              <Slide direction="left" in={submitSuccess} timeout={500}>
                                <Alert 
                                  severity="success" 
                                  icon={<CheckCircleIcon />}
                                  className="rounded-xl shadow-lg animate-pulse"
                                  onClose={() => setSubmitSuccess(false)}
                                >
                                  Khóa học đã được cập nhật thành công!
                                </Alert>
                              </Slide>
                            )}

                            {/* Submit Button */}
                            <Zoom in={true} timeout={1200} style={{ transitionDelay: '600ms' }}>
                              <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={submitLoading}
                                startIcon={submitLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
                                sx={{
                                  background: 'linear-gradient(45deg, #4F46E5 30%, #7C3AED 90%)',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #4338CA 30%, #6D28D9 90%)',
                                  }
                                }}
                              >
                                {submitLoading ? "Đang lưu..." : "Lưu thay đổi"}
                              </Button>
                            </Zoom>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>

              {/* Module Management Section */}
              <Slide direction="up" in={true} timeout={1200} style={{ transitionDelay: '400ms' }}>
                <Card elevation={12} className="rounded-2xl overflow-hidden shadow-2xl">
                  <Box className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <Typography variant="h4" className="font-bold flex items-center space-x-3">
                      <SchoolIcon sx={{ fontSize: 36 }} />
                      <span>Quản lý các module trong khóa học</span>
                    </Typography>
                  </Box>
                  <CardContent>
                    <Module courseId={id} />
                  </CardContent>
                </Card>
              </Slide>

              {/* Image Upload Modal */}
              <Dialog 
                open={showModal} 
                onClose={handleModalClose}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Zoom}
                transitionDuration={500}
                PaperProps={{
                  sx: {
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }
                }}
              >
                <DialogTitle className="text-white font-bold text-xl bg-transparent flex items-center justify-between">
                  <Box className="flex items-center space-x-2">
                    <ImageIcon />
                    <span>Thay đổi ảnh bìa</span>
                  </Box>
                  <IconButton onClick={handleModalClose} className="text-white">
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                
                <DialogContent className="bg-white">
                  <Box className="py-4">
                    <input
                      type="file"
                      name="cover_image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-50 file:to-purple-50 file:text-indigo-700 hover:file:from-indigo-100 hover:file:to-purple-100 file:transition-all file:duration-300 file:cursor-pointer file:shadow-md hover:file:shadow-lg"
                    />
                    {newCoverImage && (
                      <Fade in={Boolean(newCoverImage)} timeout={500}>
                        <Box className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <Typography className="text-green-700 font-medium">
                            Đã chọn: {newCoverImage.name}
                          </Typography>
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </DialogContent>
                
                <DialogActions className="bg-gray-50 p-4 space-x-2">
                  <Button
                    onClick={handleModalClose}
                    variant="outlined"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleImageSubmit}
                    variant="contained"
                    disabled={!newCoverImage}
                    startIcon={<SaveIcon />}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    sx={{
                      background: 'linear-gradient(45deg, #4F46E5 30%, #7C3AED 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #4338CA 30%, #6D28D9 90%)',
                      }
                    }}
                  >
                    Lưu hình bìa
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Snackbar for notifications */}
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                TransitionComponent={Slide}
              >
                <Alert
                  onClose={handleSnackbarClose}
                  severity={snackbarSeverity}
                  variant="filled"
                  className="rounded-xl shadow-lg"
                  sx={{ minWidth: '300px' }}
                >
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default CourseEdit;