import React from "react";
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert
} from "@mui/material";
import { Link } from "react-router-dom";

const TestInModule = ({ 
  moduleId, 
  tests, 
  deleteTest, 
  showAddTestModal,
  setShowAddTestModal, 
  newTest,
  setNewTest,
  addTest,
  showDeleteTestModal,
  setShowDeleteTestModal,
  confirmDeleteTest,
  loadingDetails,
  detailsError
}) => {
  const handleAddTestClick = () => {
    setNewTest({ ...newTest, module: moduleId });
    setShowAddTestModal(true);
  };

  const handleCloseAddTestModal = () => {
    setShowAddTestModal(false);
    setNewTest({ name: "", module: null, test_type: "" });
  };

  const handleAddTest = () => {
    addTest(moduleId);
  };

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
        Danh sách bài kiểm tra:
      </Typography>
      
      {detailsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {detailsError}
        </Alert>
      )}

      {tests.length > 0 ? (
        <List>
          {tests.map((test) => (
            <ListItem key={test.id} className="flex justify-between items-center">
              <ListItemText 
                primary={test.name}
                secondary={`Loại: ${test.test_type === 1 ? 'Tự luận' : 'Trắc nghiệm'}`}
              />
              <ListItemSecondaryAction className="flex gap-2">
                {test.test_type === 1 ? (
                  <Button
                    component={Link}
                    to={`/essaytest/${test.id}`}
                    state={{ testInfo: test }}
                    variant="outlined"
                    size="small"
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to={`/test-edit/${test.id}`}
                    state={{ testInfo: test }}
                    variant="outlined"
                    size="small"
                  >
                    Chỉnh sửa
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => confirmDeleteTest(test.id, moduleId)}
                  disabled={loadingDetails}
                >
                  Xóa
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary">
          Chưa có bài kiểm tra nào.
        </Typography>
      )}
      
      <Button
        variant="contained"
        color="success"
        sx={{ mt: 2 }}
        onClick={handleAddTestClick}
        disabled={loadingDetails}
      >
        Thêm bài kiểm tra
      </Button>

      {/* Add Test Modal */}
      <Modal
        open={showAddTestModal}
        onClose={handleCloseAddTestModal}
        aria-labelledby="add-test-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Thêm Bài Kiểm Tra
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Tên Bài Kiểm Tra"
              value={newTest.name}
              onChange={(e) =>
                setNewTest({ ...newTest, name: e.target.value })
              }
              fullWidth
              variant="outlined"
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Loại Bài Kiểm Tra</InputLabel>
              <Select
                value={newTest.test_type}
                onChange={(e) =>
                  setNewTest({ ...newTest, test_type: e.target.value })
                }
                label="Loại Bài Kiểm Tra"
              >
                <MenuItem value="">Chọn loại</MenuItem>
                <MenuItem value={0}>Trắc Nghiệm</MenuItem>
                <MenuItem value={1}>Tự Luận</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleCloseAddTestModal}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTest}
              disabled={!newTest.name.trim() || newTest.test_type === ""}
            >
              Thêm Bài Kiểm Tra
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Test Confirmation Dialog */}
      <Dialog
        open={showDeleteTestModal}
        onClose={() => setShowDeleteTestModal(false)}
        aria-labelledby="delete-test-dialog"
      >
        <DialogTitle sx={{ color: 'error.main' }}>
        Xác nhận xóa Bài kiểm tra
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bài kiểm tra này không?
            <br />
            <strong>Hành động này không thể hoàn tác.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowDeleteTestModal(false)}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={deleteTest} 
            variant="contained" 
            color="error"
            autoFocus
            disabled={loadingDetails}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TestInModule;