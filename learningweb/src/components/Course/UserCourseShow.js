import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  CircularProgress,
  Alert as MuiAlert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Fade,
  Slide,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import Forum from "../Forum/Forum";
import ModuleContent from "./components/ModuleContent";
import TestDetails from "./components/TestDetails";
import { authAPIs, endpoints } from "../../configs/APIs";

const UserCourseShow = () => {
  const { state: { course } = {} } = useLocation();

  // Khởi tạo state với giá trị mặc định để tránh lỗi controlled/uncontrolled
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [testError, setTestError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [tabValue, setTabValue] = useState("content");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: "",
    message: ""
  });

  // Lấy danh sách module
  useEffect(() => {
    if (!course?.id) return;

    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        setModules([]); // Reset modules trước khi fetch
        const res = await authAPIs().get(endpoints["Module-list"](course.id));
        setModules(res.data || []); // Đảm bảo luôn có array
      } catch (error) {
        console.error("Lỗi khi lấy danh sách module:", error);
        setModules([]); // Set empty array khi có lỗi
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [course?.id]);

  // Hàm lấy chi tiết module
  const fetchModuleDetails = useCallback(async (moduleId) => {
    if (!moduleId) return;

    setLoadingDetails(true);
    setDetailsError(null);
    setModuleDetails(null); // Reset chi tiết module

    try {
      const res = await authAPIs().get(`${endpoints["Module-list"](course.id)}${moduleId}/`);
      setModuleDetails(res.data || null);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết module:", error);
      setDetailsError("Không thể tải nội dung module.");
      setModuleDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, [course?.id]);

  // Hàm lấy danh sách bài kiểm tra
  const fetchTests = useCallback(async (moduleId) => {
    if (!moduleId) return;

    setLoadingTests(true);
    setTestError(null);
    setTests([]); // Reset tests trước khi fetch

    try {
      const res = await authAPIs().get(endpoints["Module-test"](moduleId));
      setTests(res.data || []); // Đảm bảo luôn có array
    } catch (error) {
      console.error("Lỗi khi lấy bài kiểm tra:", error);
      setTestError("Không thể tải bài kiểm tra.");
      setTests([]);
    } finally {
      setLoadingTests(false);
    }
  }, []);

  // Xử lý khi click vào module
  const handleModuleClick = useCallback(
    (moduleId) => {
      if (!moduleId) return;

      if (selectedTest) {
        setConfirmDialog({
          open: true,
          title: "Xác nhận chuyển module",
          message: "Bạn đang làm bài kiểm tra. Chuyển module sẽ làm mất dữ liệu hiện tại. Bạn có chắc chắn?",
          action: () => {
            setSelectedTest(null);
            fetchModuleDetails(moduleId);
            fetchTests(moduleId);
          },
        });
      } else {
        fetchModuleDetails(moduleId);
        fetchTests(moduleId);
      }
    },
    [fetchModuleDetails, fetchTests, selectedTest]
  );

  // Xử lý khi click vào bài kiểm tra
  const handleTestClick = useCallback(
    (test) => {
      if (!test) return;

      if (selectedTest && selectedTest.id !== test.id) {
        setConfirmDialog({
          open: true,
          title: "Xác nhận chuyển bài kiểm tra",
          message: "Bạn đang làm bài kiểm tra khác. Chuyển bài sẽ làm mất dữ liệu hiện tại. Bạn có chắc chắn?",
          action: () => setSelectedTest(test),
        });
      } else if (!selectedTest) {
        setSelectedTest(test);
      }
    },
    [selectedTest]
  );

  // Đóng dialog xác nhận
  const closeDialog = useCallback(() => {
    setConfirmDialog({
      open: false,
      action: null,
      title: "",
      message: ""
    });
  }, []);

  // Xác nhận hành động trong dialog
  const confirmAction = useCallback(() => {
    const action = confirmDialog.action;
    if (action && typeof action === 'function') {
      action();
    }
    closeDialog();
  }, [confirmDialog.action, closeDialog]);

  // Xử lý thay đổi tab
  const handleTabChange = useCallback((event, newValue) => {
    if (selectedTest && newValue !== tabValue) {
      setConfirmDialog({
        open: true,
        title: "Xác nhận chuyển tab",
        message: "Bạn đang làm bài kiểm tra. Chuyển tab sẽ làm mất dữ liệu hiện tại. Bạn có chắc chắn?",
        action: () => {
          setSelectedTest(null);
          setTabValue(newValue);
        },
      });
    } else {
      setTabValue(newValue);
    }
  }, [selectedTest, tabValue]);

  // Component hiển thị danh sách module
  const renderModuleList = useCallback(() => (
    <div className="space-y-4">
      <Card className="shadow-lg bg-white">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-bold text-gray-800 mb-6">
            Danh sách Module
          </Typography>

          {loadingModules ? (
            <div className="flex flex-col items-center py-12">
              <CircularProgress size={40} className="mb-4" />
              <Typography className="text-gray-600">Đang tải...</Typography>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8">
              <Typography variant="body2" className="text-gray-500">
                Không có module nào
              </Typography>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod, index) => (
                <Fade in timeout={200 + index * 100} key={mod.id || index}>
                  <Accordion
                    expanded={moduleDetails?.id === mod.id}
                    onChange={() => handleModuleClick(mod.id)}
                    className="shadow border border-gray-200 rounded-lg overflow-hidden"
                    sx={{
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': {
                        margin: 0,
                        '& .MuiAccordionSummary-root': {
                          background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                          color: 'white',
                        }
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className="hover:bg-blue-50 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {index + 1}
                        </Avatar>
                        <Typography variant="subtitle1" className="font-medium">
                          {mod.title || `Module ${index + 1}`}
                        </Typography>
                      </div>
                    </AccordionSummary>

                    <AccordionDetails className="bg-blue-50 p-4">
                      {moduleDetails?.id === mod.id && (
                        <div>
                          {loadingTests ? (
                            <div className="flex justify-center py-4">
                              <CircularProgress size={30} />
                            </div>
                          ) : testError ? (
                            <MuiAlert severity="error" className="shadow">
                              {testError}
                            </MuiAlert>
                          ) : tests.length > 0 ? (
                            <div className="space-y-2">
                              <Typography variant="subtitle2" className="font-bold text-gray-700 mb-3">
                                Bài kiểm tra:
                              </Typography>
                              {tests.map((test, testIndex) => (
                                <div
                                  key={test.id || testIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTestClick(test);
                                  }}
                                  className={`bg-white rounded-lg p-3 shadow hover:shadow-md cursor-pointer transition-all duration-300 ${selectedTest?.id === test.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                    }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                                      <QuizIcon />
                                    </Avatar>
                                    <Typography variant="subtitle2" className="font-medium">
                                      {test.name || `Bài kiểm tra ${testIndex + 1}`}
                                    </Typography>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Typography variant="body2" className="text-gray-500">
                                Không có bài kiểm tra
                              </Typography>
                            </div>
                          )}
                        </div>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Fade>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  ), [modules, loadingModules, moduleDetails, tests, loadingTests, testError, selectedTest, handleModuleClick, handleTestClick]);

  // Kiểm tra dữ liệu course
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <Typography variant="h6" className="text-center text-gray-600">
            Không tìm thấy thông tin khóa học
          </Typography>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-none p-6">
        <Fade in timeout={400}>
          <Card className="mb-6 shadow-lg bg-white/95 backdrop-blur-sm">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              className="border-b border-gray-200"
              variant="fullWidth"
              sx={{
                '& .MuiTabs-flexContainer': {
                  width: '100%',
                },
                '& .MuiTab-root': {
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  minHeight: 60,
                  flex: 1,
                  maxWidth: 'none',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                    color: 'white',
                    borderRadius: '8px 8px 0 0',
                  }
                }
              }}
            >
              <Tab label="Nội dung" value="content" />
              <Tab label="Diễn đàn" value="forum" />
            </Tabs>
          </Card>
        </Fade>

        {tabValue === "content" && (
          <Slide direction="up" in timeout={600}>
            <div className="grid grid-cols-12 gap-6">
              <div className={selectedTest ? "col-span-12 lg:col-span-9" : "col-span-12 lg:col-span-8"}>
                {selectedTest ? (
                  <TestDetails
                    test={selectedTest}
                    moduleDetails={moduleDetails}
                    handleModuleClick={handleModuleClick}
                    onTestComplete={() => setSelectedTest(null)}
                  />
                ) : (
                  <ModuleContent
                    course={course}
                    moduleDetails={moduleDetails}
                    loadingDetails={loadingDetails}
                    detailsError={detailsError}
                    modules={modules}
                  />
                )}
              </div>
              <div className={selectedTest ? "col-span-12 lg:col-span-3" : "col-span-12 lg:col-span-4"}>
                {renderModuleList()}
              </div>
            </div>
          </Slide>
        )}

        {tabValue === "forum" && (
          <Fade in timeout={400}>
            <div>
              <Forum course={course} />
            </div>
          </Fade>
        )}

        <Dialog
          open={confirmDialog.open}
          onClose={closeDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: "rounded-xl shadow-2xl"
          }}
        >
          <DialogTitle
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-center py-4"
            sx={{
              '& .MuiTypography-root': {
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }
            }}
          >
            {confirmDialog.title || "Xác nhận"}
          </DialogTitle>
          <DialogContent className="p-6 text-center">
            <div className="py-4">
              <Typography>
                {confirmDialog.message || "Bạn có chắc chắn muốn thực hiện hành động này?"}
              </Typography>
            </div>
          </DialogContent>
          <DialogActions className="p-4 gap-3">
            <MuiButton
              variant="contained"
              onClick={closeDialog}
              color="error"
              className="flex-1 py-2 rounded-lg"
            >
              Hủy
            </MuiButton>
            <MuiButton
              color="primary"
              variant="contained"
              onClick={confirmAction}
              className="flex-1 py-2 rounded-lg"
            >
              Xác nhận
            </MuiButton>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default UserCourseShow;