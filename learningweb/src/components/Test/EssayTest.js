import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Accordion, Button, Form, Spinner, Alert } from "react-bootstrap";
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
                    <div dangerouslySetInnerHTML={{ __html: question.content }} />
                    <Button
                      variant="primary"
                      onClick={() => handleQuestionEdit(question)}
                    >
                      Chỉnh sửa
                    </Button>
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
    </div>
  );
};

export default EssayTest;
