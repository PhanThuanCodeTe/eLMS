import React from 'react';
import { Typography, Card, CardContent, Chip, Box } from '@mui/material';
import { Quiz, Assignment, Numbers } from '@mui/icons-material';

const TestInfo = ({ testInfo }) => {
  const getTestTypeIcon = (type) => {
    return type === 0 ? <Quiz className="mr-2" /> : <Assignment className="mr-2" />;
  };

  const getTestTypeColor = (type) => {
    return type === 0 ? 'primary' : 'secondary';
  };

  return (
    <Card 
      className="bg-gradient-to-r from-white to-blue-50 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
      elevation={8}
    >
      <CardContent className="p-6">
        {testInfo ? (
          <Box className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography 
                variant="h5" 
                className="text-gray-800 font-bold flex items-center"
              >
                {testInfo.name}
              </Typography>
              <Chip
                icon={getTestTypeIcon(testInfo.test_type)}
                label={testInfo.test_type === 0 ? "Trắc Nghiệm" : "Tự luận"}
                color={getTestTypeColor(testInfo.test_type)}
                variant="filled"
                className="font-semibold"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <div>
                  <Typography variant="caption" className="text-gray-600 font-medium">
                    Loại bài kiểm tra
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-bold">
                    {testInfo.test_type === 0 ? "Trắc Nghiệm" : "Tự luận"}
                  </Typography>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <div>
                  <Typography variant="caption" className="text-gray-600 font-medium">
                    Số lượng câu hỏi
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-bold">
                    {testInfo.num_questions} câu
                  </Typography>
                </div>
              </div>
            </div>
          </Box>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Quiz className="text-white text-2xl" />
              </div>
              <Typography className="text-gray-500 font-medium">
                Không có thông tin bài kiểm tra
              </Typography>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestInfo;