import React, { useEffect, useState } from "react";
import { 
  CircularProgress, 
  Alert, 
  Button, 
  Typography, 
  Radio, 
  Checkbox, 
  FormControlLabel,
  Chip,
  Divider
} from "@mui/material";
import { 
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioIcon,
  CheckBox as CheckBoxIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Star as StarIcon
} from "@mui/icons-material";
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
        const response = await authAPIs().get(endpoints["test-question"](test.id));
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestionsError("Không thể tải câu hỏi.");
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
              const response = await authAPIs().get(endpoints["question-answer"](question.id));
              return {
                ...question,
                answers: response.data.answers,
                result: response.data.result,
              };
            } else if (question.type === 1) {
              const response = await authAPIs().get(endpoints["get-essay-answer"](question.id));
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
    setSubmissionMessage(null);

    try {
      for (const question of questions) {
        if (question.type === 0) {
          const selectedAnswers = userSelections[question.id];
          if (selectedAnswers && selectedAnswers.length > 0) {
            try {
              const payload = {
                question: question.id,
                selected_answer: JSON.stringify(selectedAnswers),
              };
              await authAPIs().post(endpoints["choice-awnswer"], payload);
            } catch (error) {
              console.error(`Error submitting answers for question ${question.id}:`, error);
              setSubmissionError("Đã xảy ra lỗi khi nộp bài.");
            }
          }
        }

        if (question.type === 1) {
          const essayAnswer = essayAnswers[question.id];
          if (essayAnswer) {
            try {
              await authAPIs().post(endpoints["essay-awnswer"], {
                question: question.id,
                answer_text: essayAnswer,
              });
              setSubmissionMessage("Giáo viên sẽ chấm bài của bạn sớm nhất có thể");
            } catch (error) {
              if (error.response && error.response.status === 400 && error.response.data.warning) {
                console.warn(error.response.data.warning);
                setSubmissionError(error.response.data.warning);
                const essayResponse = await authAPIs().get(endpoints["get-essay-answer"](question.id));
                setEssayAnswers((prev) => ({
                  ...prev,
                  [question.id]: essayResponse.data.answer_text,
                }));
              } else {
                setSubmissionError("Đã xảy ra lỗi khi nộp bài.");
                console.error("Error during submission:", error);
              }
            }
          }
        }
      }

      const scoreResponse = await authAPIs().get(endpoints.score(test.id));
      setScore(scoreResponse.data.score);
    } catch (error) {
      setSubmissionError("Không thể nộp bài hoặc lấy điểm.");
      console.error("Error during submission:", error);
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <CircularProgress size={48} className="text-blue-600" />
        <Typography variant="h6" className="mt-3 text-gray-600">
          Đang tải câu hỏi...
        </Typography>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <Alert severity="error" className="rounded-lg shadow-sm">
          {questionsError}
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <QuizIcon className="text-blue-600 mr-2" style={{ fontSize: 32 }} />
              <Typography variant="h4" className="text-gray-800 font-bold">
                {test.name}
              </Typography>
            </div>
            {score !== null && (
              <div className="flex items-center justify-center">
                <StarIcon className="text-yellow-500 mr-1" />
                <Typography variant="h6" className="text-blue-600 font-semibold">
                  Điểm của bạn: {score}
                </Typography>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <Typography variant="body2" className="text-white font-bold">
                      {index + 1}
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-2">
                    {question.type === 0 ? (
                      <Chip 
                        icon={question.result === 1 ? <RadioIcon /> : <CheckBoxIcon />} 
                        label={question.result === 1 ? "Một lựa chọn" : "Nhiều lựa chọn"} 
                        size="small" 
                        className="bg-white bg-opacity-20 text-white border-white border-opacity-30"
                      />
                    ) : (
                      <Chip 
                        icon={<EditIcon />} 
                        label="Tự luận" 
                        size="small" 
                        className="bg-white bg-opacity-20 text-white border-white border-opacity-30"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-4">
                <div 
                  dangerouslySetInnerHTML={{ __html: question.content }} 
                  className="text-gray-700 mb-4 prose prose-sm max-w-none"
                />

                {/* Essay Answer Display */}
                {question.type === 1 && question.existingAnswer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <Typography variant="subtitle2" className="text-blue-800 font-semibold mb-2">
                    Bài làm của bạn:
                    </Typography>
                    <div 
                      dangerouslySetInnerHTML={{ __html: question.existingAnswer }} 
                      className="text-gray-700 prose prose-sm max-w-none"
                    />
                  </div>
                )}

                {/* Teacher Comments */}
                {question.type === 1 && question.teacherComments && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <Typography variant="subtitle2" className="text-green-800 font-semibold mb-2">
                    Nhận xét của giáo viên:
                    </Typography>
                    <div 
                      dangerouslySetInnerHTML={{ __html: question.teacherComments }} 
                      className="text-gray-700 prose prose-sm max-w-none"
                    />
                  </div>
                )}

                {/* Individual Question Score */}
                {question.type === 1 && question.score !== null && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <StarIcon className="text-yellow-600 mr-2" />
                      <Typography variant="subtitle2" className="text-yellow-800 font-semibold">
                        Điểm của bạn: {question.score}
                      </Typography>
                    </div>
                  </div>
                )}

                {/* Multiple Choice Answers */}
                {question.answers && question.answers.length > 0 && (
                  <div className="space-y-2">
                    {question.result === 0 ? (
                      <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3">
                        <CheckCircleIcon className="text-green-600 mr-2" />
                        <Typography className="text-green-700 font-semibold">
                          Bạn đã chọn đúng câu trả lời!
                        </Typography>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="hover:bg-gray-50 rounded-lg transition-colors">
                            <FormControlLabel
                              control={
                                question.result === 1 ? (
                                  <Radio
                                    checked={userSelections[question.id]?.[0] === answer.id}
                                    onChange={() => handleRadioSelectionChange(question.id, answer.id)}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <Checkbox
                                    checked={userSelections[question.id]?.includes(answer.id)}
                                    onChange={() => handleCheckboxSelectionChange(question.id, answer.id)}
                                    className="text-blue-600"
                                  />
                                )
                              }
                              label={answer.choice}
                              className="text-gray-700 ml-2"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Essay Editor */}
                {question.type === 1 && (
                  <div className="mt-4">
                    <Typography variant="subtitle1" className="text-gray-800 font-semibold mb-2 flex items-center">
                      <EditIcon className="mr-2 text-blue-600" />
                      Viết bài làm:
                    </Typography>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <CKEditor
                        editor={ClassicEditor}
                        data={essayAnswers[question.id] || ""}
                        onChange={(event, editor) => handleEssayChange(question.id, editor.getData())}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Messages */}
        {submissionError && (
          <Alert severity="error" className="mt-4 rounded-lg shadow-sm">
            {submissionError}
          </Alert>
        )}
        {submissionMessage && (
          <Alert severity="success" className="mt-4 rounded-lg shadow-sm">
            {submissionMessage}
          </Alert>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="contained"
            size="large"
            disabled={submissionLoading}
            onClick={handleSubmit}
            startIcon={submissionLoading ? <CircularProgress size={20} /> : <SendIcon />}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
          >
            {submissionLoading ? "Đang nộp bài..." : "Nộp bài"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestShow;