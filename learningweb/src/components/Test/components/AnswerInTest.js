import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Alert,
  TextField,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Chip,
  Fade,
  Grow,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { authAPIs, endpoints } from '../../../configs/APIs';

const AnswerInTest = ({ questionId }) => {
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState({ choice: '', isCorrect: false });
  const [editingAnswers, setEditingAnswers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [answerToDelete, setAnswerToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      try {
        const response = await authAPIs().get(
          endpoints['question-answer'](questionId)
        );
        setAnswers(response.data.answers);
        setEditingAnswers(response.data.answers.map(a => ({ ...a })));
      } catch (err) {
        console.error(`Error fetching answers for question ${questionId}:`, err);
        setAnswers([]);
        setEditingAnswers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [questionId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditingAnswers(answers.map(a => ({ ...a })));
    }
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedEditingAnswers = [...editingAnswers];
    updatedEditingAnswers[index] = {
      ...updatedEditingAnswers[index],
      [field]: value,
    };
    setEditingAnswers(updatedEditingAnswers);
  };

  const saveEditedAnswers = async () => {
    setLoading(true);
    try {
      for (const answer of editingAnswers) {
        await authAPIs().patch(
          `${endpoints['question-answer'](questionId)}${answer.id}/`,
          {
            choice: answer.choice,
            is_correct: answer.is_correct,
          }
        );
      }
      setAnswers([...editingAnswers]);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating answers:', err);
      setError('Không thể cập nhật đáp án.');
    } finally {
      setLoading(false);
    }
  };

  const addAnswer = async () => {
    if (!newAnswer.choice.trim()) return;
    
    setLoading(true);
    try {
      const response = await authAPIs().post(
        endpoints['question-answer'](questionId),
        {
          choice: newAnswer.choice,
          is_correct: newAnswer.isCorrect,
        }
      );
      setAnswers([...answers, response.data]);
      setEditingAnswers([...editingAnswers, response.data]);
      setNewAnswer({ choice: '', isCorrect: false });
      setError(null);
    } catch (err) {
      console.error('Error adding answer:', err);
      setError('Không thể thêm đáp án.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnswer = async (answerId) => {
    setLoading(true);
    try {
      await authAPIs().delete(
        `${endpoints['question-answer'](questionId)}${answerId}/`
      );
      setAnswers(answers.filter((a) => a.id !== answerId));
      setEditingAnswers(editingAnswers.filter((a) => a.id !== answerId));
      setShowDeleteModal(false);
      setAnswerToDelete(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting answer:', err);
      setError('Không thể xóa đáp án.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (answer) => {
    setAnswerToDelete({ questionId, answer });
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setAnswerToDelete(null);
  };

  const correctAnswersCount = answers.filter(a => a.is_correct).length;

  return (
    <div className="mt-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Typography variant="h5" className="text-gray-800 font-semibold">
            Đáp án
          </Typography>
          <Chip 
            label={`${answers.length} đáp án`}
            size="small"
            className="bg-blue-100 text-blue-800"
          />
          {correctAnswersCount > 0 && (
            <Chip 
              label={`${correctAnswersCount} đúng`}
              size="small"
              icon={<CheckCircleIcon />}
              className="bg-green-100 text-green-800"
            />
          )}
        </div>
        
        {answers.length > 0 && !isEditing && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditToggle}
            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400"
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            className="mb-4 rounded-lg"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Answers List */}
      {answers.length > 0 ? (
        <div className="space-y-3 mb-6">
          {isEditing ? (
            <>
              {editingAnswers.map((answer, index) => (
                <Grow key={answer.id} in={true} timeout={300 * (index + 1)}>
                  <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 space-y-3">
                          <TextField
                            fullWidth
                            value={answer.choice}
                            onChange={(e) =>
                              handleAnswerChange(index, 'choice', e.target.value)
                            }
                            variant="outlined"
                            size="small"
                            placeholder="Nhập nội dung đáp án..."
                            className="bg-white"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: '#6366f1',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#6366f1',
                                },
                              },
                            }}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={answer.is_correct}
                                onChange={(e) =>
                                  handleAnswerChange(index, 'is_correct', e.target.checked)
                                }
                                sx={{
                                  color: '#10b981',
                                  '&.Mui-checked': {
                                    color: '#10b981',
                                  },
                                }}
                              />
                            }
                            label={
                              <span className={`text-sm font-medium ${answer.is_correct ? 'text-green-700' : 'text-gray-600'}`}>
                                Đáp án đúng
                              </span>
                            }
                          />
                        </div>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(answer)}
                          className="hover:bg-red-50"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </CardContent>
                  </Card>
                </Grow>
              ))}
              
              {/* Edit Mode Actions */}
              <div className="flex items-center space-x-3 pt-4">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={saveEditedAnswers}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? 'Đang lưu...' : 'Lưu tất cả'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleEditToggle}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </Button>
              </div>
            </>
          ) : (
            <>
              {answers.map((answer, index) => (
                <Grow key={answer.id} in={true} timeout={200 * (index + 1)}>
                  <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-indigo-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {answer.is_correct ? (
                            <CheckCircleIcon className="text-green-500 text-xl" />
                          ) : (
                            <RadioButtonUncheckedIcon className="text-gray-400 text-xl" />
                          )}
                          <Typography 
                            variant="body1" 
                            className={`${answer.is_correct ? 'text-green-700 font-medium' : 'text-gray-700'} flex-1`}
                          >
                            {answer.choice}
                          </Typography>
                          {answer.is_correct && (
                            <Chip 
                              label="Đúng" 
                              size="small" 
                              className="bg-green-100 text-green-800 font-medium"
                            />
                          )}
                        </div>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(answer)}
                          className="hover:bg-red-50 ml-2"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </CardContent>
                  </Card>
                </Grow>
              ))}
            </>
          )}
        </div>
      ) : (
        <Fade in={true}>
          <Alert 
            severity="info" 
            className="mb-6 rounded-lg bg-blue-50 border border-blue-200"
            icon={<AddIcon />}
          >
            <Typography variant="body2" className="text-blue-800">
              Câu hỏi này chưa có đáp án. Hãy thêm đáp án đầu tiên bên dưới.
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Add New Answer Section */}
      <Card className="shadow-md border-2 border-gray-300 hover:border-indigo-400 transition-colors duration-200 pb-2">
        <CardContent className="p-6">
          <Typography variant="h6" className="text-gray-800 mb-4 flex items-center">
            <AddIcon className="mr-2 text-indigo-600" />
            Thêm đáp án mới
          </Typography>
          
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Nội dung đáp án"
              value={newAnswer.choice}
              onChange={(e) =>
                setNewAnswer((prev) => ({
                  ...prev,
                  choice: e.target.value,
                }))
              }
              variant="outlined"
              placeholder="Nhập nội dung đáp án..."
              className="bg-white"
            />
            
            <div className="flex items-center justify-between">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newAnswer.isCorrect}
                    onChange={(e) =>
                      setNewAnswer((prev) => ({
                        ...prev,
                        isCorrect: e.target.checked,
                      }))
                    }
                    sx={{
                      color: '#10b981',
                      '&.Mui-checked': {
                        color: '#10b981',
                      },
                    }}
                  />
                }
                label={
                  <span className={`font-medium ${newAnswer.isCorrect ? 'text-green-700' : 'text-gray-600'}`}>
                    Đây là đáp án đúng
                  </span>
                }
              />
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addAnswer}
                disabled={loading || !newAnswer.choice.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                {loading ? 'Đang thêm...' : 'Thêm đáp án'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteModal} 
        onClose={handleCloseDeleteModal}
        PaperProps={{
          className: "rounded-xl shadow-2xl"
        }}
      >
        <DialogTitle className="text-red-700 font-bold bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2">
            <DeleteIcon className="text-red-600" />
            <span>Xác nhận xóa đáp án</span>
          </div>
        </DialogTitle>
        <DialogContent className="pt-6">
          <Typography variant="body1" className="text-gray-700 mb-2">
            Bạn có chắc chắn muốn xóa đáp án này không?
          </Typography>
          <Box className="bg-gray-50 p-3 rounded-lg border-l-4 border-red-400">
            <Typography variant="body2" className="font-medium text-gray-800">
              "{answerToDelete?.answer.choice}"
            </Typography>
          </Box>
          <Typography variant="body2" className="text-red-600 mt-3 font-medium">
            Hành động này không thể hoàn tác!
          </Typography>
        </DialogContent>
        <DialogActions className="p-6 pt-2">
          <Button
            onClick={handleCloseDeleteModal}
            variant="outlined"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            onClick={() => deleteAnswer(answerToDelete.answer.id)}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={<DeleteIcon />}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
          >
            {loading ? 'Đang xóa...' : 'Xóa đáp án'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AnswerInTest;