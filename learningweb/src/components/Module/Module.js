import React, { useState, useEffect, useCallback } from "react";
import { 
  CircularProgress, 
  Alert, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  Button, 
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Card,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { authAPIs, endpoints } from "../../configs/APIs";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import ModuleDetails from "./components/ModuleDetails";
import TestInModule from "./components/TestInModule";

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`module-tabpanel-${index}`}
      aria-labelledby={`module-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Module = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleDetails, setModuleDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  
  // Delete confirmation states
  const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false);
  const [showDeleteTestModal, setShowDeleteTestModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [testToDelete, setTestToDelete] = useState({ testId: null, moduleId: null });
  
  const [newModule, setNewModule] = useState({
    title: "",
    youtube_url: "",
    description: "",
  });
  const [tests, setTests] = useState({});
  const [newTest, setNewTest] = useState({
    name: "",
    module: null,
    test_type: "",
  });
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  
  // Tab states for each module
  const [moduleTabs, setModuleTabs] = useState({});

  const fetchModules = useCallback(async () => {
    try {
      const response = await authAPIs().get(endpoints["Module-list"](courseId));
      setModules(response.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách module:", err);
      setError("Không thể tải danh sách module.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchTests = useCallback(async (moduleId) => {
    if (tests[moduleId]) return;

    try {
      const response = await authAPIs().get(endpoints["Module-test"](moduleId));
      setTests((prevTests) => ({
        ...prevTests,
        [moduleId]: response.data,
      }));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bài kiểm tra:", err);
    }
  }, [tests]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const fetchModuleDetails = async (moduleId) => {
    if (moduleDetails[moduleId]) return;

    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await authAPIs().get(
        `${endpoints["Module-list"](courseId)}${moduleId}/`
      );
      setModuleDetails((prevDetails) => ({
        ...prevDetails,
        [moduleId]: response.data,
      }));
      await fetchTests(moduleId);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết module:", err);
      setDetailsError("Không thể tải chi tiết module.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateModuleDetails = async (moduleId) => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await authAPIs().patch(
        `${endpoints["Module-list"](courseId)}${moduleId}/`,
        editingModule
      );
      setModuleDetails((prevDetails) => ({
        ...prevDetails,
        [moduleId]: response.data,
      }));
      setEditingModule(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật module:", err);
      setDetailsError("Không thể cập nhật module.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const confirmDeleteModule = (moduleId) => {
    setModuleToDelete(moduleId);
    setShowDeleteModuleModal(true);
  };

  const deleteModule = async () => {
    if (!moduleToDelete) return;

    setLoadingDetails(true);
    setDetailsError(null);

    try {
      await authAPIs().delete(
        `${endpoints["Module-list"](courseId)}${moduleToDelete}/`
      );
      setModules(modules.filter((module) => module.id !== moduleToDelete));
      setModuleDetails((prevDetails) => {
        const newDetails = { ...prevDetails };
        delete newDetails[moduleToDelete];
        return newDetails;
      });
      setTests((prevTests) => {
        const newTests = { ...prevTests };
        delete newTests[moduleToDelete];
        return newTests;
      });
    } catch (err) {
      console.error("Lỗi khi xóa module:", err);
      setDetailsError("Không thể xóa module.");
    } finally {
      setLoadingDetails(false);
      setShowDeleteModuleModal(false);
      setModuleToDelete(null);
    }
  };

  const confirmDeleteTest = (testId, moduleId) => {
    setTestToDelete({ testId, moduleId });
    setShowDeleteTestModal(true);
  };

  const deleteTest = async () => {
    const { testId, moduleId } = testToDelete;
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      await authAPIs().delete(`/modules/${moduleId}/tests/${testId}/`);
      setTests((prevTests) => ({
        ...prevTests,
        [moduleId]: prevTests[moduleId].filter((test) => test.id !== testId),
      }));
    } catch (err) {
      console.error("Error deleting test:", err);
      setDetailsError("Không thể xóa bài kiểm tra.");
    } finally {
      setLoadingDetails(false);
      setShowDeleteTestModal(false);
      setTestToDelete({ testId: null, moduleId: null });
    }
  };

  const addTest = async (moduleId) => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const formData = new FormData();
      formData.append("name", newTest.name);
      formData.append("module", moduleId);
      formData.append("test_type", newTest.test_type);

      const response = await authAPIs().post(
        endpoints["Module-test"](moduleId),
        formData
      );

      setTests((prevTests) => ({
        ...prevTests,
        [moduleId]: [...(prevTests[moduleId] || []), response.data],
      }));

      setNewTest({ name: "", module: null, test_type: "" });
      setShowAddTestModal(false);
    } catch (err) {
      console.error("Error creating new test:", err);
      setDetailsError("Không thể tạo bài kiểm tra.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const createNewModule = async () => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await authAPIs().post(
        endpoints["Module-list"](courseId),
        newModule
      );
      setModules([...modules, response.data]);
      setNewModule({ title: "", youtube_url: "", description: "" });
    } catch (err) {
      console.error("Lỗi khi tạo module mới:", err);
      setDetailsError("Không thể tạo module mới.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleNewModuleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewModuleEditorChange = (event, editor) => {
    const data = editor.getData();
    setNewModule((prev) => ({ ...prev, description: data }));
  };

  const handleTabChange = (moduleId, newValue) => {
    setModuleTabs(prev => ({
      ...prev,
      [moduleId]: newValue
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Module List */}
      {modules.length > 0 ? (
        <Box sx={{ mb: 4 }}>
          {modules.map((module, index) => (
            <Card key={module.id} sx={{ mb: 3, boxShadow: 2 }}>
              <Accordion 
                sx={{ 
                  boxShadow: 'none',
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  onClick={() => fetchModuleDetails(module.id)}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Module {index + 1}: {module.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs 
                        value={moduleTabs[module.id] || 0} 
                        onChange={(e, newValue) => handleTabChange(module.id, newValue)}
                        aria-label="module tabs"
                      >
                        <Tab label="Nội dung Module" />
                        <Tab label="Bài kiểm tra" />
                      </Tabs>
                    </Box>
                    
                    <TabPanel value={moduleTabs[module.id] || 0} index={0}>
                      <ModuleDetails
                        module={module}
                        moduleDetails={moduleDetails[module.id]}
                        editingModule={editingModule}
                        setEditingModule={setEditingModule}
                        loadingDetails={loadingDetails}
                        detailsError={detailsError}
                        updateModuleDetails={updateModuleDetails}
                        setModuleToDelete={setModuleToDelete}
                        setShowDeleteModal={setShowDeleteModuleModal}
                      />
                    </TabPanel>
                    
                    <TabPanel value={moduleTabs[module.id] || 0} index={1}>
                      <TestInModule
                        moduleId={module.id}
                        tests={tests[module.id] || []}
                        deleteTest={deleteTest}
                        showAddTestModal={showAddTestModal}
                        setShowAddTestModal={setShowAddTestModal}
                        newTest={newTest}
                        setNewTest={setNewTest}
                        addTest={addTest}
                        showDeleteTestModal={showDeleteTestModal}
                        setShowDeleteTestModal={setShowDeleteTestModal}
                        confirmDeleteTest={confirmDeleteTest}
                        loadingDetails={loadingDetails}
                        detailsError={detailsError}
                      />
                    </TabPanel>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Card>
          ))}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Không có module nào.
        </Alert>
      )}

      {/* Add New Module Section */}
      <Card sx={{ boxShadow: 2 }}>
        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              backgroundColor: '#e8f5e8',
              '&:hover': { backgroundColor: '#d4edda' },
              borderRadius: '4px 4px 0 0'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#28a745' }}>
              ➕ Thêm Module Mới cho Khóa học
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Tên Module"
                name="title"
                value={newModule.title}
                onChange={handleNewModuleInputChange}
                fullWidth
                variant="outlined"
                required
              />
              <TextField
                label="YouTube URL"
                name="youtube_url"
                value={newModule.youtube_url}
                onChange={handleNewModuleInputChange}
                fullWidth
                variant="outlined"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Nội dung Module:
                </Typography>
                <CKEditor
                  editor={ClassicEditor}
                  data={newModule.description}
                  onChange={handleNewModuleEditorChange}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setNewModule({ title: "", youtube_url: "", description: "" })}
                >
                  Xóa form
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={createNewModule}
                  disabled={!newModule.title.trim()}
                  sx={{ minWidth: 150 }}
                >
                  Tạo Module Mới
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Card>

      {/* Delete Module Confirmation Dialog */}
      <Dialog
        open={showDeleteModuleModal}
        onClose={() => setShowDeleteModuleModal(false)}
        aria-labelledby="delete-module-dialog"
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          ⚠️ Xác nhận xóa Module
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa module này không? 
            <br />
            <strong>Hành động này không thể hoàn tác và sẽ xóa tất cả bài kiểm tra trong module.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowDeleteModuleModal(false)}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={deleteModule} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading and Error Display */}
      {loadingDetails && (
        <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {detailsError && (
        <Alert severity="error" sx={{ position: 'fixed', top: 20, left: 20, right: 20, zIndex: 9999 }}>
          {detailsError}
        </Alert>
      )}
    </Box>
  );
};

export default Module;