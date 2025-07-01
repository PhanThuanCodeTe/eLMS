import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Fade,
  CircularProgress,
  Alert as MuiAlert,
} from "@mui/material";
import { School as SchoolIcon, PlayCircleFilled as PlayIcon, Person as PersonIcon, Email as EmailIcon } from "@mui/icons-material";

// Helper function để trích xuất YouTube video ID
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const ModuleContent = ({ course, moduleDetails, loadingDetails, detailsError, modules }) => {
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Fade in timeout={800}>
          <Card className="p-8 shadow-xl">
            <Typography color="error" align="center" variant="h5">
              <SchoolIcon className="mr-2" />
              Không có thông tin khóa học
            </Typography>
          </Card>
        </Fade>
      </div>
    );
  }

  if (loadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <CircularProgress size={60} thickness={4} className="mb-4" />
        <Typography variant="h6" className="text-gray-600">
          Đang tải nội dung...
        </Typography>
      </div>
    );
  }

  if (detailsError) {
    return (
      <Fade in timeout={500}>
        <MuiAlert severity="error" className="shadow-lg">
          {detailsError}
        </MuiAlert>
      </Fade>
    );
  }

  if (moduleDetails) {
    return (
      <Fade in timeout={500}>
        <Card className="shadow-xl bg-white border border-blue-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <PlayIcon className="text-3xl" />
              <Typography variant="h4" className="font-bold">
                {moduleDetails.title}
              </Typography>
            </div>
          </div>
          
          <CardContent className="p-8">
            {moduleDetails.youtube_url && (
              <div className="mb-8">
                <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
                  <div style={{ position: "relative", paddingBottom: "56.25%" }}>
                    <iframe
                      title={moduleDetails.title}
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(moduleDetails.youtube_url)}?rel=0&modestbranding=1`}
                      style={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        width: "100%", 
                        height: "100%"
                      }}
                      allowFullScreen
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-xl p-6">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">
                Nội dung bài học
              </Typography>
              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: moduleDetails.description }}
              />
            </div>
          </CardContent>
        </Card>
      </Fade>
    );
  }

  return (
    <Fade in timeout={600}>
      <Card className="shadow-xl bg-white border border-indigo-200">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 bg-white/20">
              <SchoolIcon className="text-3xl" />
            </Avatar>
            <div>
              <Typography variant="h3" className="font-bold mb-2">
                {course.title}
              </Typography>
              <Chip label={`${modules.length} Module`} className="bg-white/20 text-white" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-8">
          <div className="mb-8">
            <img
              src={course.cover_image_url}
              alt={course.title}
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">
                Mô tả khóa học
              </Typography>
              <Typography className="text-gray-700 leading-relaxed">
                {course.description}
              </Typography>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">
                Giảng viên
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <PersonIcon />
                  </Avatar>
                  <Typography className="font-medium text-gray-800">
                    {course.author.first_name} {course.author.last_name}
                  </Typography>
                </div>
                <div className="flex items-center space-x-3">
                  <Avatar className="bg-gradient-to-r from-green-500 to-blue-500">
                    <EmailIcon />
                  </Avatar>
                  <Typography className="text-gray-700">
                    {course.author.email}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default ModuleContent;