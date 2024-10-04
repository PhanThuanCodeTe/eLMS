import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Accordion,
  Button,
  Form,
  Spinner,
  Alert,
  Offcanvas,
  Modal,
} from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { authAPIs, endpoints } from "../../configs/APIs";

const EssayTest = () => {
  const location = useLocation();
  const { testId } = useParams();
  const testInfo = location.state?.testInfo;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    content: "",
    type: testInfo?.test_type || 1, // Essay test type = 1
  });

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // For grading
  const [studentAnswers, setStudentAnswers] = useState([]); // To store student answers for the selected question
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [gradingAnswer, setGradingAnswer] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = (question) => {
    setSelectedQuestion(question);
    fetchStudentAnswers(question.id);
    setShowOffcanvas(true);
  };

  const fetchStudentAnswers = async (questionId) => {
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
    } finally {
      setLoadingAnswers(false);
    }
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
    }
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPIs().get(endpoints["test-question"](testId));
      setQuestions(response.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Không thể tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (testId) {
      fetchQuestions();
    }
  }, [fetchQuestions, testId]);

  const handleQuestionEdit = (question) => {
    setEditingQuestion(question);
  };

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
      await authAPIs().patch(
        `${endpoints["test-question"](testId)}${editingQuestion.id}/`,
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
    } catch (err) {
      console.error("Error updating question:", err);
      setError("Không thể cập nhật câu hỏi.");
    }
  };

  const addQuestion = async () => {
    try {
      const response = await authAPIs().post(
        endpoints["test-question"](testId),
        {
          content: newQuestion.content,
          type: testInfo.test_type, // Ensure essay type
        }
      );
      setQuestions([...questions, response.data]);
      setNewQuestion({ content: "", type: testInfo.test_type });
    } catch (err) {
      console.error("Error adding question:", err);
      setError("Không thể thêm câu hỏi.");
    }
  };

  return (
    <div>
      <h1>Bài kiểm tra tự luận</h1>
      {testInfo ? (
        <div>
          <p>
            <strong>Tên bài kiểm tra:</strong> {testInfo.name}
          </p>
          <p>
            <strong>Loại bài kiểm tra:</strong> Tự luận
          </p>
          <p>
            <strong>Số lượng câu hỏi:</strong> {testInfo.num_questions}
          </p>
        </div>
      ) : (
        <p>Không có thông tin bài kiểm tra</p>
      )}

      <h2>Câu hỏi</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Accordion>
          {questions.map((question) => (
            <Accordion.Item key={question.id} eventKey={question.id.toString()}>
              <Accordion.Header>Câu hỏi {question.id}</Accordion.Header>
              <Accordion.Body>
                {editingQuestion && editingQuestion.id === question.id ? (
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Nội dung câu hỏi:</Form.Label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={editingQuestion.content}
                        onChange={handleEditorChange}
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={updateQuestion}>
                      Lưu thay đổi
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditingQuestion(null)}
                    >
                      Hủy
                    </Button>
                  </Form>
                ) : (
                  <>
                    <div
                      dangerouslySetInnerHTML={{ __html: question.content }}
                    />
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        variant="primary"
                        onClick={() => handleQuestionEdit(question)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => handleShowOffcanvas(question)}
                      >
                        Chấm bài cho học sinh
                      </Button>
                    </div>
                  </>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}

          <Accordion.Item eventKey="new-question">
            <Accordion.Header>Thêm câu hỏi mới</Accordion.Header>
            <Accordion.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nội dung câu hỏi:</Form.Label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={newQuestion.content}
                    onChange={handleNewQuestionEditorChange}
                  />
                </Form.Group>
                <Button variant="primary" onClick={addQuestion}>
                  Thêm câu hỏi
                </Button>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}

      {/* Offcanvas for grading */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Câu trả lời của học sinh</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedQuestion && (
            <>
              <p>
                <strong>Câu hỏi:</strong>
              </p>
              <div
                dangerouslySetInnerHTML={{ __html: selectedQuestion.content }}
              />
              <hr />
              <h3>Câu trả lời của học sinh:</h3>
              {loadingAnswers ? (
                <Spinner animation="border" />
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : studentAnswers.length > 0 ? (
                studentAnswers.map((answer) => (
                  <div key={answer.id}>
                    <p>
                      <strong>Câu trả lời:</strong>
                    </p>
                    <div
                      dangerouslySetInnerHTML={{ __html: answer.answer_text }}
                    />
                    <p>
                      <strong>Điểm:</strong> {answer.score}
                    </p>
                    <Button onClick={() => handleGradeAnswer(answer)}>
                      Chấm điểm
                    </Button>
                    <hr />
                  </div>
                ))
              ) : (
                <p>Chưa có học sinh nộp bài.</p>
              )}
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal for grading */}
      <Modal show={showGradingModal} onHide={() => setShowGradingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chấm điểm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {gradingAnswer && (
            <>
              <p>
                <strong>Học sinh:</strong> {gradingAnswer.student_name}
              </p>
              <p>
                <strong>Câu trả lời:</strong>
              </p>
              <div
                dangerouslySetInnerHTML={{ __html: gradingAnswer.answer_text }}
              />
              <Form>
                <Form.Group>
                  <Form.Label>Điểm số:</Form.Label>
                  <Form.Control
                    type="number"
                    value={gradingAnswer.score}
                    onChange={handleScoreChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Nhận xét:</Form.Label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={gradingAnswer.teacher_comments}
                    onChange={handleCommentChange}
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGradingModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={submitGrade}>
            Lưu điểm và nhận xét
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EssayTest;
