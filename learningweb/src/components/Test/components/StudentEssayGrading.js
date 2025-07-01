import React from "react";
import { Typography, CircularProgress, Alert, Drawer, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const StudentEssayGrading = ({
  showOffcanvas,
  handleCloseOffcanvas,
  selectedQuestion,
  studentAnswers,
  loadingAnswers,
  error,
  handleGradeAnswer,
  gradingAnswer,
  showGradingModal,
  setShowGradingModal,
  handleScoreChange,
  handleCommentChange,
  submitGrade
}) => (
  <>
    <Drawer
      anchor="right"
      open={showOffcanvas}
      onClose={handleCloseOffcanvas}
      PaperProps={{
        className: "w-full max-w-md p-4 bg-gradient-to-b from-blue-50 to-indigo-50",
      }}
    >
      <Typography variant="h6" className="text-indigo-700 font-bold mb-4">
        Câu trả lời của học sinh
      </Typography>
      {selectedQuestion && (
        <div className="space-y-4">
          <Typography className="text-gray-700">
            <strong>Câu hỏi:</strong>
          </Typography>
          <div
            dangerouslySetInnerHTML={{ __html: selectedQuestion.content }}
            className="text-gray-600"
          />
          <hr className="border-gray-300" />
          <Typography variant="h6" className="text-gray-800">
            Câu trả lời của học sinh:
          </Typography>
          {loadingAnswers ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : studentAnswers.length > 0 ? (
            studentAnswers.map((answer) => (
              <div key={answer.id} className="bg-white p-4 rounded-lg shadow-md">
                <Typography className="text-gray-700">
                  <strong>Câu trả lời:</strong>
                </Typography>
                <div
                  dangerouslySetInnerHTML={{ __html: answer.answer_text }}
                  className="text-gray-600"
                />
                <Typography className="text-gray-700 mt-2">
                  <strong>Điểm:</strong> {answer.score}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleGradeAnswer(answer)}
                  className="bg-indigo-600 hover:bg-indigo-700 mt-2"
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

    <Dialog open={showGradingModal} onClose={() => setShowGradingModal(false)}>
      <DialogTitle className="text-indigo-700 font-bold">
        Chấm điểm
      </DialogTitle>
      <DialogContent className="space-y-4">
        {gradingAnswer && (
          <>
            <Typography className="text-gray-700">
              <strong>Học sinh:</strong> {gradingAnswer.student_name}
            </Typography>
            <Typography className="text-gray-700">
              <strong>Câu trả lời:</strong>
            </Typography>
            <div
              dangerouslySetInnerHTML={{ __html: gradingAnswer.answer_text }}
              className="text-gray-600"
            />
            <TextField
              fullWidth
              label="Điểm số"
              type="number"
              value={gradingAnswer.score}
              onChange={handleScoreChange}
              variant="outlined"
              className="bg-white"
            />
            <div>
              <Typography className="text-gray-700 mb-2">Nhận xét:</Typography>
              <CKEditor
                editor={ClassicEditor}
                data={gradingAnswer.teacher_comments}
                onChange={handleCommentChange}
              />
            </div>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setShowGradingModal(false)}
          color="secondary"
          className="text-gray-600 hover:text-gray-800"
        >
          Đóng
        </Button>
        <Button
          onClick={submitGrade}
          color="primary"
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Lưu điểm và nhận xét
        </Button>
      </DialogActions>
    </Dialog>
  </>
);

export default StudentEssayGrading; 