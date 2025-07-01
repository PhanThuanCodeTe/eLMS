import React, { useState, useCallback } from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Box,
  Fade,
  Slide,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { authAPIs, endpoints } from '../../../configs/APIs';
import AnswerInTest from './AnswerInTest';

const QuestionInTest = ({ questions, setQuestions, testId, testInfo, fetchQuestions, updateTestInfo, handleShowOffcanvas }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, questionId: null });
  const [newQuestion, setNewQuestion] = useState({
    content: '',
    type: testInfo?.test_type || 0,
  });

  const handleQuestionEdit = useCallback((question) => {
    setEditingQuestion(question);
  }, []);

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditingQuestion((prev) => ({ ...prev, content: data }));
  };

  const handleNewQuestionEditorChange = (event, editor) => {
    const data = editor.getData();
    setNewQuestion((prev) => ({ ...prev, content: data }));
  };

  const updateQuestion = async () => {
    try {
      setLoading(true);
      await authAPIs().patch(
        `${endpoints['test-question'](testId)}${editingQuestion.id}/`,
        {
          content: editingQuestion.content,
          type: editingQuestion.type,
        }
      );
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestion.id ? editingQuestion : q
        )
      );
      setEditingQuestion(null);
      setError(null);
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Không thể cập nhật câu hỏi.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.content.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setLoading(true);
      const response = await authAPIs().post(
        endpoints['test-question'](testId),
        {
          content: newQuestion.content,
          type: testInfo.test_type,
        }
      );
      const newQuestions = [...questions, response.data];
      setQuestions(newQuestions);
      updateTestInfo(newQuestions.length);
      setNewQuestion({ content: '', type: testInfo.test_type });
      setError(null);
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Không thể thêm câu hỏi.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      setLoading(true);
      await authAPIs().delete(`${endpoints['test-question'](testId)}${questionId}/`);
      const newQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(newQuestions);
      updateTestInfo(newQuestions.length);
      setDeleteDialog({ open: false, questionId: null });
      setError(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Không thể xóa câu hỏi.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (questionId) => {
    setDeleteDialog({ open: true, questionId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Typography 
          variant="h4" 
          className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold flex items-center"
        >
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
          Danh sách câu hỏi
        </Typography>
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
          <Typography className="text-indigo-700 font-semibold">
            {questions.length} câu hỏi
          </Typography>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <CircularProgress className="text-indigo-600" />
        </div>
      )}

      {error && (
        <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
          <Alert severity="error" className="mb-4 rounded-xl">
            {error}
          </Alert>
        </Slide>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Fade in={true} timeout={500 + index * 100} key={question.id}>
            <Accordion
              className="shadow-lg rounded-2xl bg-white hover:shadow-2xl transition-all duration-500 border border-gray-100"
              elevation={0}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-indigo-600" />}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 rounded-t-2xl"
              >
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <Typography className="text-white font-bold text-sm">
                        {index + 1}
                      </Typography>
                    </div>
                    <Typography className="font-semibold text-indigo-700">
                      Câu hỏi {index + 1}
                    </Typography>
                  </div>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(question.id);
                    }}
                    className="text-red-500 hover:bg-red-100 transition-colors duration-200"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </AccordionSummary>
              <AccordionDetails className="p-6 bg-gradient-to-br from-white to-gray-50">
                {editingQuestion && editingQuestion.id === question.id ? (
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                      <Typography className="text-gray-700 mb-3 font-medium">
                        Nội dung câu hỏi:
                      </Typography>
                      <CKEditor
                        editor={ClassicEditor}
                        data={editingQuestion.content}
                        onChange={handleEditorChange}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="contained"
                        onClick={updateQuestion}
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl px-6 py-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        {loading ? <CircularProgress size={20} /> : 'Lưu thay đổi'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingQuestion(null)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6 py-2 transition-all duration-200"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Box>
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        dangerouslySetInnerHTML={{ __html: question.content }}
                        className="text-gray-700 flex-1 bg-gray-50 p-4 rounded-xl"
                      />
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => handleQuestionEdit(question)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200"
                        >
                          Chỉnh sửa
                        </Button>
                        {testInfo?.test_type === 1 && handleShowOffcanvas && (
                          <Button
                            variant="contained"
                            onClick={() => handleShowOffcanvas(question)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            Chấm bài cho học sinh
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Hiển thị AnswerInTest chỉ khi là câu hỏi trắc nghiệm (test_type === 0) */}
                    {testInfo?.test_type === 0 && (
                      <AnswerInTest questionId={question.id} />
                    )}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Fade>
        ))}

        <Fade in={true} timeout={1000}>
          <Accordion className="shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-500 transform">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className="text-green-600" />}
              className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300 rounded-t-2xl"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <AddCircleOutlineIcon className="text-white" fontSize="small" />
                </div>
                <Typography className="font-semibold text-green-700">
                  Thêm câu hỏi mới
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className="p-6">
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <Typography className="text-gray-700 mb-3 font-medium">
                    Nội dung câu hỏi:
                  </Typography>
                  <CKEditor
                    editor={ClassicEditor}
                    data={newQuestion.content}
                    onChange={handleNewQuestionEditorChange}
                  />
                </div>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addQuestion}
                  disabled={loading || !newQuestion.content.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl px-6 py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? <CircularProgress size={20} /> : 'Thêm câu hỏi'}
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        </Fade>
      </div>

      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, questionId: null })}
        PaperProps={{
          className: "rounded-2xl shadow-2xl"
        }}
      >
        <DialogTitle className="text-red-600 font-bold bg-gradient-to-r from-red-50 to-pink-50">
          Xác nhận xoá
        </DialogTitle>
        <DialogContent className="py-6">
          <Typography className="text-gray-700 pt-4">
            <strong>Bạn có chắc chắn muốn xóa câu hỏi này không? </strong>
          </Typography>
        </DialogContent>
        <DialogActions className="p-4 bg-gray-50">
          <Button
            onClick={() => setDeleteDialog({ open: false, questionId: null })}
            className="text-gray-600 hover:bg-gray-100 rounded-xl px-4 py-2"
          >
            Hủy
          </Button>
          <Button
            onClick={() => deleteQuestion(deleteDialog.questionId)}
            disabled={loading}
            color="error"
            className="bg-red-600 text-white hover:bg-red-700 rounded-xl px-6 py-2 shadow-md"
          >
            {loading ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuestionInTest;