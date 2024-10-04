import React, { useEffect, useState } from "react";
import { Spinner, Alert, Button } from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";

const TestShow = ({ test }) => {
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [userSelections, setUserSelections] = useState({});
  const [essayAnswers, setEssayAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setQuestionsError(null);

      try {
        const response = await authAPIs().get(
          endpoints["test-question"](test.id)
        );
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestionsError("Could not load questions.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (test) {
      fetchQuestions();
    }
  }, [test]);

  useEffect(() => {
    const fetchAnswersAndScore = async () => {
      const updatedQuestions = await Promise.all(
        questions.map(async (question) => {
          try {
            if (question.type === 0) {
              const response = await authAPIs().get(
                endpoints["question-answer"](question.id)
              );
              return {
                ...question,
                answers: response.data.answers,
                result: response.data.result,
              };
            } else if (question.type === 1) {
              const response = await authAPIs().get(
                endpoints["get-essay-answer"](question.id)
              );
              return {
                ...question,
                existingAnswer: response.data.answer_text || null,
                teacherComments: response.data.teacher_comments || null,
                score: response.data.score || null,
              };
            }
          } catch (error) {
            console.error(`Error fetching answers for question ${question.id}:`, error);
            return {
              ...question,
              answers: [],
              result: "no correct answer",
              existingAnswer: null,
              teacherComments: null,
              score: null,
            };
          }
        })
      );
      setQuestions(updatedQuestions);

      // Fetch score of the student
      try {
        const scoreResponse = await authAPIs().get(endpoints.score(test.id));
        setScore(scoreResponse.data.score);
      } catch (error) {
        console.error("Error fetching score:", error);
      }
    };

    if (questions.length) {
      fetchAnswersAndScore();
    }
  }, [questions.length, test.id]);

  const handleRadioSelectionChange = (questionId, answerId) => {
    setUserSelections((prev) => ({
      ...prev,
      [questionId]: [answerId],
    }));
  };

  const handleCheckboxSelectionChange = (questionId, answerId) => {
    setUserSelections((prev) => {
      const selectedAnswers = prev[questionId] || [];
      if (selectedAnswers.includes(answerId)) {
        return {
          ...prev,
          [questionId]: selectedAnswers.filter((id) => id !== answerId),
        };
      } else {
        return {
          ...prev,
          [questionId]: [...selectedAnswers, answerId],
        };
      }
    });
  };

  const handleEssayChange = (questionId, data) => {
    setEssayAnswers((prev) => ({
      ...prev,
      [questionId]: data,
    }));
  };

  const handleSubmit = async () => {
    setSubmissionLoading(true);
    setSubmissionError(null);
    setScore(null);
    setSubmissionMessage(null); // Reset submission message
  
    try {
      for (const question of questions) {
        if (question.type === 0) {
          const selectedAnswers = userSelections[question.id];
          
          if (selectedAnswers && selectedAnswers.length > 0) {
            try {
              // Stringify selectedAnswers before sending
              const payload = {
                question: question.id,
                selected_answer: JSON.stringify(selectedAnswers),
              };
  
              // Post the selected answers to the 'choice-answer' endpoint
              await authAPIs().post(endpoints["choice-awnswer"], payload);
            } catch (error) {
              console.error(`Error submitting answers for question ${question.id}:`, error);
              setSubmissionError("An error occurred during submission.");
            }
          }
        }
  
        if (question.type === 1) {
          // Handle essay questions
          const essayAnswer = essayAnswers[question.id];
          if (essayAnswer) {
            try {
              await authAPIs().post(endpoints["essay-awnswer"], {
                question: question.id,
                answer_text: essayAnswer,
              });
              setSubmissionMessage("Giáo viên sẽ chấm bài của bạn sớm nhất có thể");
            } catch (error) {
              if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.warning
              ) {
                console.warn(error.response.data.warning); // Log the warning
                setSubmissionError(error.response.data.warning); // Set the warning message
  
                // Fetch the previously submitted essay answer
                const essayResponse = await authAPIs().get(
                  endpoints["get-essay-answer"](question.id)
                );
                setEssayAnswers((prev) => ({
                  ...prev,
                  [question.id]: essayResponse.data.answer_text,
                }));
              } else {
                setSubmissionError("An error occurred during submission.");
                console.error("Error during submission:", error);
              }
            }
          }
        }
      }
  
      // Fetch the score after submission
      const scoreResponse = await authAPIs().get(endpoints.score(test.id));
      setScore(scoreResponse.data.score);
    } catch (error) {
      setSubmissionError("Could not submit answers or fetch score.");
      console.error("Error during submission:", error);
    } finally {
      setSubmissionLoading(false);
    }
  };
  
  if (loadingQuestions) {
    return <Spinner animation="border" />;
  }

  if (questionsError) {
    return <Alert variant="danger">{questionsError}</Alert>;
  }

  return (
    <>
      <h3>{test.name}</h3>
      {questions.map((question) => (
        <div key={question.id} style={{ marginBottom: "20px" }}>
          <h5>Câu hỏi:</h5>
          <div dangerouslySetInnerHTML={{ __html: question.content }} />

          {/* Display existing essay answer if available */}
          {question.type === 1 && question.existingAnswer && (
            <div className="bg-light p-2 mb-2">
              <strong>Bài làm của bạn:</strong>
              <div
                dangerouslySetInnerHTML={{ __html: question.existingAnswer }}
              />
            </div>
          )}

          {/* Display teacher comments and score if available */}
          {question.type === 1 && question.teacherComments && (
            <div className="bg-light p-2 mb-2">
              <strong>Nhận xét của giáo viên:</strong>
              <div
                dangerouslySetInnerHTML={{ __html: question.teacherComments }}
              />
            </div>
          )}
          {question.type === 1 && question.score !== null && (
            <div className="bg-light p-2 mb-2">
              <strong>Điểm của bạn:</strong> {question.score}
            </div>
          )}

          {question.answers && question.answers.length > 0 && (
            <div>
              {question.result === 1 && (
                <div>
                  {question.answers.map((answer) => (
                    <div key={answer.id} style={{ marginBottom: "10px" }}>
                      <input
                        type="radio"
                        style={{ transform: "scale(1.5)", marginRight: "10px" }}
                        checked={userSelections[question.id]?.[0] === answer.id}
                        onChange={() =>
                          handleRadioSelectionChange(question.id, answer.id)
                        }
                      />
                      <label style={{ fontSize: "16px" }}>
                        {answer.choice}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {question.result === 2 && (
                <div>
                  {question.answers.map((answer) => (
                    <div key={answer.id} style={{ marginBottom: "10px" }}>
                      <input
                        type="checkbox"
                        checked={userSelections[question.id]?.includes(
                          answer.id
                        )}
                        onChange={() =>
                          handleCheckboxSelectionChange(question.id, answer.id)
                        }
                        style={{ marginRight: "10px" }}
                      />
                      <label>{answer.choice}</label>
                    </div>
                  ))}
                </div>
              )}
              {question.result === 0 && (
                <div
                  style={{
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  Bạn đã chọn đúng câu trả lời!
                </div>
              )}
            </div>
          )}

          {question.type === 1 && (
            <div style={{ marginTop: "15px" }}>
              <h5>Viết bài làm:</h5>
              <CKEditor
                editor={ClassicEditor}
                data={essayAnswers[question.id] || ""}
                onChange={(event, editor) =>
                  handleEssayChange(question.id, editor.getData())
                }
              />
            </div>
          )}
        </div>
      ))}

      {submissionError && <Alert variant="danger">{submissionError}</Alert>}
      {submissionMessage && <Alert variant="success">{submissionMessage}</Alert>}

      {/* Display current score before the submit button */}
      {score !== null && (
        <div className="my-3">
          <h5>Điểm của bạn: {score}</h5>
        </div>
      )}

      <div className="flex justify-end p-2">
      <Button
        variant="Nộp bài"
        disabled={submissionLoading}
        onClick={handleSubmit}
        className="btn btn-success"
      >
        {submissionLoading ? "Đang nộp bài..." : "Nộp"}
      </Button>
      </div>
    </>
  );
};

export default TestShow;
