import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Accordion, Button, Form, Spinner, Alert, Modal } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { authAPIs, endpoints } from "../../configs/APIs";

const Test = () => {
  const location = useLocation();
  const { testId } = useParams();
  const testInfo = location.state?.testInfo;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    content: "",
    type: testInfo?.test_type || 0,
  });
  const [answers, setAnswers] = useState({});
  const [newAnswer, setNewAnswer] = useState({ choice: "", isCorrect: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [answerToDelete, setAnswerToDelete] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPIs().get(endpoints["test-question"](testId));
      setQuestions(response.data);
      response.data.forEach((question) => fetchAnswers(question.id));
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Unable to load questions.");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const fetchAnswers = async (questionId) => {
    try {
      const response = await authAPIs().get(
        endpoints["question-answer"](questionId)
      );
      console.log(`Answers for question ${questionId}:`, response.data);
      setAnswers((prev) => ({ ...prev, [questionId]: response.data.answers }));
    } catch (err) {
      console.error(`Error fetching answers for question ${questionId}:`, err);
      setAnswers((prev) => ({ ...prev, [questionId]: [] }));
    }
  };

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
      setError("Unable to update question.");
    }
  };

  const addQuestion = async () => {
    try {
      const response = await authAPIs().post(
        endpoints["test-question"](testId),
        {
          content: newQuestion.content,
          type: testInfo.test_type,
        }
      );
      setQuestions([...questions, response.data]);
      setNewQuestion({ content: "", type: testInfo.test_type });
    } catch (err) {
      console.error("Error adding question:", err);
      setError("Unable to add question.");
    }
  };

  const updateAnswer = async (questionId, answerId, updatedAnswer) => {
    try {
      const response = await authAPIs().patch(
        `${endpoints["question-answer"](questionId)}${answerId}/`,
        updatedAnswer
      );
      setAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId].map((a) =>
          a.id === answerId ? response.data : a
        ),
      }));
      setEditingAnswer(null);
    } catch (err) {
      console.error("Error updating answer:", err);
      setError("Unable to update answer.");
    }
  };

  const addAnswer = async (questionId) => {
    try {
      const response = await authAPIs().post(
        endpoints["question-answer"](questionId),
        {
          choice: newAnswer.choice,
          is_correct: newAnswer.isCorrect  // This will send a boolean value
        }
      );
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), response.data],
      }));
      setNewAnswer({ choice: "", isCorrect: false });
    } catch (err) {
      console.error("Error adding answer:", err);
      setError("Unable to add answer.");
    }
  };

  const handleEditAnswer = (answer) => {
    setEditingAnswer(answer);
  };

  const handleDeleteClick = (questionId, answer) => {
    setAnswerToDelete({ questionId, answer });
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setAnswerToDelete(null);
  };

  const deleteAnswer = async (questionId, answerId) => {
    try {
      await authAPIs().delete(
        `${endpoints["question-answer"](questionId)}${answerId}/`
      );
      setAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId].filter((a) => a.id !== answerId),
      }));
      setShowDeleteModal(false);
      setAnswerToDelete(null);
    } catch (err) {
      console.error("Error deleting answer:", err);
      setError("Unable to delete answer.");
    }
  };

  return (
    <div>
      <h1>Bài kiểm tra</h1>
      {testInfo ? (
        <div>
          <p>
            <strong>Tên bài kiểm tra:</strong> {testInfo.name}
          </p>
          <p>
            <strong>Loại bài kiểm tra:</strong>{" "}
            {testInfo.test_type === 0 ? "Trắc Nghiệm" : "Tự luận"}
          </p>
          <p>
            <strong>Số lượng câu hỏi:</strong> {testInfo.num_questions}
          </p>
        </div>
      ) : (
        <p>No test information available</p>
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
                    <Button
                      variant="primary"
                      onClick={() => handleQuestionEdit(question)}
                    >
                      Chỉnh sửa
                    </Button>
                  </>
                )}

                <h4 className="mt-3">Đáp án:</h4>
                {answers[question.id] && answers[question.id].length > 0 ? (
                  <>
                    {answers[question.id].map((answer) => (
                      <div key={answer.id} className="mb-2 d-flex justify-content-between align-items-center">
                        {editingAnswer && editingAnswer.id === answer.id ? (
                          <Form
                            onSubmit={(e) => {
                              e.preventDefault();
                              updateAnswer(question.id, answer.id, editingAnswer);
                            }}
                            className="w-100"
                          >
                            <Form.Control
                              type="text"
                              value={editingAnswer.choice}
                              onChange={(e) =>
                                setEditingAnswer((prev) => ({
                                  ...prev,
                                  choice: e.target.value,
                                }))
                              }
                            />
                            <Form.Check
                              type="checkbox"
                              label="Đáp án đúng"
                              checked={editingAnswer.is_correct}
                              onChange={(e) =>
                                setEditingAnswer((prev) => ({
                                  ...prev,
                                  is_correct: e.target.checked,
                                }))
                              }
                              className="mt-2"
                            />
                            <div className="mt-2">
                              <Button type="submit" variant="primary" className="me-2">
                                Lưu
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => setEditingAnswer(null)}
                              >
                                Hủy
                              </Button>
                            </div>
                          </Form>
                        ) : (
                          <>
                            <Form.Check
                              type="checkbox"
                              id={`answer-${answer.id}`}
                              label={answer.choice}
                              checked={answer.is_correct}
                              onChange={() => updateAnswer(question.id, answer.id, { is_correct: !answer.is_correct })}
                            />
                            <div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleEditAnswer(answer)}
                                className="me-2"
                              >
                                Chỉnh sửa
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(question.id, answer)}
                              >
                                Xóa
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <Alert variant="warning">
                    Câu hỏi này chưa có đáp án, hãy thêm ngay
                  </Alert>
                )}

                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addAnswer(question.id);
                  }}
                >
                  <Form.Group className="mt-3">
                    <Form.Control
                      type="text"
                      name="newAnswer"
                      placeholder="Thêm đáp án mới"
                      value={newAnswer.choice}
                      onChange={(e) =>
                        setNewAnswer((prev) => ({
                          ...prev,
                          choice: e.target.value,
                        }))
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      label="Đáp án đúng"
                      checked={newAnswer.isCorrect}
                      onChange={(e) =>
                        setNewAnswer((prev) => ({
                          ...prev,
                          isCorrect: e.target.checked,
                        }))
                      }
                      className="mt-2"
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" className="mt-2">
                    Thêm đáp án
                  </Button>
                </Form>
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

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa đáp án</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa đáp án này không?
          <br />
          <strong>{answerToDelete?.answer.choice}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteAnswer(answerToDelete.questionId, answerToDelete.answer.id)}
          >
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Test;