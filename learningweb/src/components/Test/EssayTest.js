import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { authAPIs, endpoints } from "../../configs/APIs";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  Typography,
  CircularProgress,
  Alert,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  Grow,
  Button,
} from "@mui/material";
import TestInfo from "./components/TestInfo";
import QuestionInTest from "./components/QuestionInTest";

const EssayTest = () => {
  const location = useLocation();
  const { testId } = useParams();
  const initialTestInfo = location.state?.testInfo;
  const [questions, setQuestions] = useState([]);
  const [testInfo, setTestInfo] = useState(initialTestInfo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [gradingAnswer, setGradingAnswer] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);

  const fetchStudentAnswers = async (questionId) => {
    if (!questionId) return;
    setLoadingAnswers(true);
    setError(null);
    try {
      const response = await authAPIs().get(
        `${endpoints["essay-awnswer"]}get-student-answer/?question_id=${questionId}`
      );
      const sortedAnswers = response.data.sort((a, b) => a.score - b.score);
      setStudentAnswers(sortedAnswers);
    } catch (err) {
      console.error("Error fetching student answers:", err);
      setError("Không thể tải các câu trả lời của học sinh.");
      setTimeout(() => setError(null), 5000); // Xóa lỗi sau 5 giây
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleShowOffcanvas = (question) => {
    setSelectedQuestion(question);
    fetchStudentAnswers(question.id);
    setShowOffcanvas(true);
  };

  const handleGradeAnswer = (answer) => {
    setGradingAnswer(answer);
    setShowGradingModal(true);
  };

  const handleScoreChange = (e) => {
    setGradingAnswer((prev) => ({ ...prev, score: e.target.value }));
  };

  const handleCommentChange = (_, editor) => {
    const data = editor.getData();
    setGradingAnswer((prev) => ({ ...prev, teacher_comments: data }));
  };

  const submitGrade = async () => {
    try {
      const response = await authAPIs().patch(
        `${endpoints["essay-awnswer"]}${gradingAnswer.id}/update-score/`,
        {
          score: gradingAnswer.score,
          teacher_comments: gradingAnswer.teacher_comments,
        }
      );
      setStudentAnswers(
        (prev) =>
          prev
            .map((answer) =>
              answer.id === gradingAnswer.id ? response.data : answer
            )
            .sort((a, b) => a.score - b.score)
      );
      setShowGradingModal(false);
      setGradingAnswer(null);
    } catch (err) {
      console.error("Error updating grade:", err);
      setError("Không thể cập nhật điểm số.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authAPIs().get(endpoints["test-question"](testId));
      setQuestions(response.data);
      setTestInfo((prev) => ({
        ...prev,
        num_questions: response.data.length,
      }));
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Không thể tải câu hỏi.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const updateTestInfo = useCallback((newQuestionCount) => {
    setTestInfo((prev) => ({
      ...prev,
      num_questions: newQuestionCount,
    }));
  }, []);

  useEffect(() => {
    if (testId) {
      fetchQuestions();
    }
  }, [fetchQuestions, testId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <Fade in={true} timeout={800}>
          <div className="mb-8">
            <Typography
              variant="h3"
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-center mb-2"
            >
              Bài kiểm tra tự luận
            </Typography>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
        </Fade>

        <Grow in={true} timeout={1000}>
          <div className="mb-6">
            <TestInfo testInfo={testInfo} />
          </div>
        </Grow>

        {error && (
          <Fade in={!!error} timeout={500}>
            <Alert severity="error" className="mb-4 rounded-xl">
              {error}
            </Alert>
          </Fade>
        )}

        <Fade in={!loading} timeout={1200}>
          <div>
            {loading ? (
              <div className="flex justify-center py-8">
                <CircularProgress className="text-indigo-600" />
              </div>
            ) : (
              <QuestionInTest
                questions={questions}
                setQuestions={setQuestions}
                testId={testId}
                testInfo={testInfo}
                fetchQuestions={fetchQuestions}
                updateTestInfo={updateTestInfo}
                handleShowOffcanvas={handleShowOffcanvas}
              />
            )}
          </div>
        </Fade>

        <Drawer
          anchor="right"
          open={showOffcanvas}
          onClose={() => setShowOffcanvas(false)}
          PaperProps={{
            className: "w-full max-w-md p-6 bg-gradient-to-b from-blue-50 to-indigo-50",
          }}
        >
          <Typography
            variant="h6"
            className="text-indigo-700 font-bold mb-4"
          >
            Câu trả lời của học sinh
          </Typography>
          {selectedQuestion && (
            <div className="space-y-4">
              <Typography className="text-gray-700 font-medium">
                <strong>Câu hỏi:</strong>
              </Typography>
              <div
                dangerouslySetInnerHTML={{ __html: selectedQuestion.content }}
                className="text-gray-600 bg-white p-4 rounded-xl shadow-sm"
              />
              <hr className="border-gray-300" />
              <Typography variant="h6" className="text-gray-800 font-medium">
                Câu trả lời của học sinh:
              </Typography>
              {loadingAnswers ? (
                <div className="flex justify-center py-4">
                  <CircularProgress className="text-indigo-600" />
                </div>
              ) : error ? (
                <Alert severity="error" className="rounded-xl">
                  {error}
                </Alert>
              ) : studentAnswers.length > 0 ? (
                studentAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    className="bg-white p-4 rounded-xl shadow-md"
                  >
                    <Typography className="text-gray-700 font-medium">
                      <strong>Học sinh:</strong> {answer.student_name}
                    </Typography>
                    <Typography className="text-gray-700 mt-2">
                      <strong>Câu trả lời:</strong>
                    </Typography>
                    <div
                      dangerouslySetInnerHTML={{ __html: answer.answer_text }}
                      className="text-gray-600 bg-gray-50 p-3 rounded-lg"
                    />
                    <Typography className="text-gray-700 mt-2">
                      <strong>Điểm:</strong> {answer.score || "Chưa chấm"}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleGradeAnswer(answer)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mt-3 rounded-xl px-4 py-2 shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      Chấm điểm
                    </Button>
                  </div>
                ))
              ) : (
                <Typography className="text-gray-600">
                  Chưa có học sinh nộp bài.
                </Typography>
              )}
            </div>
          )}
        </Drawer>

        <Dialog
          open={showGradingModal}
          onClose={() => setShowGradingModal(false)}
          PaperProps={{
            className: "rounded-2xl shadow-2xl max-w-lg",
          }}
        >
          <DialogTitle className="text-indigo-600 font-bold bg-gradient-to-r from-blue-50 to-indigo-50">
            Chấm điểm
          </DialogTitle>
          <DialogContent className="space-y-4 py-6">
            {gradingAnswer && (
              <>
                <Typography className="text-gray-700 font-medium">
                  <strong>Học sinh:</strong> {gradingAnswer.student_name}
                </Typography>
                <Typography className="text-gray-700 font-medium">
                  <strong>Câu trả lời:</strong>
                </Typography>
                <div
                  dangerouslySetInnerHTML={{ __html: gradingAnswer.answer_text }}
                  className="text-gray-600 bg-gray-50 p-4 rounded-xl shadow-sm"
                />
                <TextField
                  fullWidth
                  label="Điểm số"
                  type="number"
                  value={gradingAnswer.score || ""}
                  onChange={handleScoreChange}
                  variant="outlined"
                  className="bg-white rounded-xl"
                  inputProps={{ min: 0, max: 10 }}
                />
                <div>
                  <Typography className="text-gray-700 font-medium mb-2">
                    Nhận xét:
                  </Typography>
                  <CKEditor
                    editor={ClassicEditor}
                    data={gradingAnswer.teacher_comments || ""}
                    onChange={handleCommentChange}
                  />
                </div>
              </>
            )}
          </DialogContent>
          <DialogActions className="p-4 bg-gray-50">
            <Button
              onClick={() => setShowGradingModal(false)}
              className="text-gray-600 hover:bg-gray-100 rounded-xl px-4 py-2"
            >
              Hủy
            </Button>
            <Button
              onClick={submitGrade}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl px-6 py-2 shadow-md transform hover:scale-105 transition-all duration-200"
            >
              Lưu điểm và nhận xét
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default EssayTest;