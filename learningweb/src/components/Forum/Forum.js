import React, { useEffect, useState } from "react";
import { authAPIs, endpoints } from "../../configs/APIs";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Forum = ({ course }) => {
  const [forumId, setForumId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyInput, setReplyInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");

  useEffect(() => {
    const fetchForumId = async () => {
      try {
        const response = await authAPIs().get(endpoints["forum"](course.id));
        setForumId(response.data.id);
      } catch (err) {
        console.error("Error fetching forum ID:", err);
        setError("Không thể tải ID diễn đàn.");
      } finally {
        setLoading(false);
      }
    };

    fetchForumId();
  }, [course.id]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!forumId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await authAPIs().get(endpoints["forum-post"](forumId));
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching forum posts:", err);
        setError("Không thể tải bài viết diễn đàn.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [forumId]);

  useEffect(() => {
    const fetchReplies = async (postId) => {
      try {
        const response = await authAPIs().get(endpoints["post-reply"](postId));
        setReplies((prev) => ({ ...prev, [postId]: response.data }));
      } catch (err) {
        console.error(`Error fetching replies for post ${postId}:`, err);
      }
    };

    posts.forEach((post) => {
      fetchReplies(post.id);
    });
  }, [posts]);

  const handleReplyChange = (e) => {
    setReplyInput(e.target.value);
  };

  const handleReplySubmit = async (postId) => {
    if (!replyInput) return;

    try {
      await authAPIs().post(endpoints["post-reply"](postId), {
        body: replyInput,
      });

      setReplies((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          { user_full_name: "Bạn", body: replyInput },
        ],
      }));

      setReplyInput("");
    } catch (err) {
      console.error(`Error submitting reply for post ${postId}:`, err);
      setError("Không thể gửi phản hồi.");
    }
  };

  const handleNewPostSubmit = async () => {
    if (!newPostTitle || !newPostBody) return;

    try {
      await authAPIs().post(endpoints["forum-post"](forumId), {
        title: newPostTitle,
        body: newPostBody,
      });

      setShowModal(false);
      setNewPostTitle("");
      setNewPostBody("");
      setPosts([...posts, { title: newPostTitle, body: newPostBody }]);
    } catch (err) {
      console.error("Error submitting new post:", err);
      setError("Không thể gửi bài viết mới.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-lg">
      {/* Header section với responsive design */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
            Diễn đàn: {course.title}
          </h2>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            size="medium"
          >
            <span className="hidden sm:inline">Thêm câu hỏi</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </div>
      </div>

      {/* Posts section */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <Accordion
              key={post.id}
              className="shadow-sm rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 px-4 py-3"
              >
                <Typography className="font-semibold text-gray-800 text-sm sm:text-base break-words pr-4">
                  {post.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="p-4 sm:p-6">
                <Typography className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
                  {post.body}
                </Typography>
                
                {/* Replies section */}
                {replies[post.id] && replies[post.id].length > 0 ? (
                  <div className="space-y-3 mb-4">
                    <Typography className="font-medium text-gray-600 text-sm">
                      Phản hồi:
                    </Typography>
                    {replies[post.id].map((reply) => (
                      <div
                        key={reply.id}
                        className="flex items-start bg-gray-50 p-3 rounded-md border-l-4 border-blue-200"
                      >
                        <MdSubdirectoryArrowRight
                          className="mr-2 text-gray-500 mt-1 flex-shrink-0"
                          size={16}
                        />
                        <div className="min-w-0 flex-1">
                          <Typography className="font-medium text-gray-700 text-sm">
                            {reply.user_full_name}:
                          </Typography>
                          <Typography className="text-gray-600 text-sm break-words">
                            {reply.body}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography className="text-gray-500 text-sm mb-4">
                    Chưa có phản hồi nào cho bài viết này.
                  </Typography>
                )}
                
                {/* Reply input section */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <TextField
                    fullWidth
                    placeholder="Nhập câu trả lời"
                    value={replyInput}
                    onChange={handleReplyChange}
                    variant="outlined"
                    size="small"
                    className="bg-white"
                    multiline
                    minRows={1}
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReplySubmit(post.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 whitespace-nowrap"
                    size="small"
                  >
                    Trả lời
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <Typography className="text-gray-500">
              Chưa có bài viết nào trong diễn đàn này.
            </Typography>
          </div>
        )}
      </div>

      {/* Modal for new post */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "m-4"
        }}
      >
        <DialogTitle className="text-gray-800 font-semibold border-b border-gray-200 pb-2">
          Thêm câu hỏi mới
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <TextField
            fullWidth
            label="Tiêu đề"
            placeholder="Nhập tiêu đề câu hỏi"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Nội dung"
            placeholder="Nhập nội dung chi tiết"
            value={newPostBody}
            onChange={(e) => setNewPostBody(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions className="p-4 border-t border-gray-200">
          <Button
            onClick={() => setShowModal(false)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Hủy
          </Button>
          <Button
            onClick={handleNewPostSubmit}
            variant="contained"
            className="bg-blue-600 text-white hover:bg-blue-700 font-medium ml-2"
          >
            Đăng câu hỏi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Forum;