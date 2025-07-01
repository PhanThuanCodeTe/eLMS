import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Typography, Fade, Grow } from '@mui/material';
import TestInfo from './components/TestInfo';
import QuestionInTest from './components/QuestionInTest';
import { authAPIs, endpoints } from '../../configs/APIs';

const Test = () => {
  const location = useLocation();
  const { testId } = useParams();
  const initialTestInfo = location.state?.testInfo;
  const [questions, setQuestions] = useState([]);
  const [testInfo, setTestInfo] = useState(initialTestInfo);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authAPIs().get(endpoints['test-question'](testId));
      setQuestions(response.data);
      
      // Cập nhật số lượng câu hỏi trong testInfo
      setTestInfo(prev => ({
        ...prev,
        num_questions: response.data.length
      }));
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const updateTestInfo = useCallback((newQuestionCount) => {
    setTestInfo(prev => ({
      ...prev,
      num_questions: newQuestionCount
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
              {testInfo?.test_type === 0 ? "Bài kiểm tra trắc nghiệm" : "Bài kiểm tra"}
            </Typography>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
        </Fade>
        
        <Grow in={true} timeout={1000}>
          <div className="mb-6">
            <TestInfo testInfo={testInfo} />
          </div>
        </Grow>
        
        <Fade in={!loading} timeout={1200}>
          <div>
            <QuestionInTest 
              questions={questions} 
              setQuestions={setQuestions} 
              testId={testId} 
              testInfo={testInfo} 
              fetchQuestions={fetchQuestions}
              updateTestInfo={updateTestInfo}
            />
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default Test;