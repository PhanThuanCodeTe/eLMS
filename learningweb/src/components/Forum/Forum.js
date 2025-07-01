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
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-700 animate-pulse">
          Diễn đàn của {course.title}
        </h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 transition-colors duration-300"
        >
          Thêm câu hỏi
        </Button>
      </div>

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <Accordion
              key={post.id}
              className="shadow-md rounded-lg bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
              >
                <Typography className="font-semibold text-indigo-700">
                  {post.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="p-4">
                <Typography className="font-medium text-gray-800 mb-4">
                  {post.body}
                </Typography>
                {replies[post.id] && replies[post.id].length > 0 ? (
                  <div className="space-y-3">
                    {replies[post.id].map((reply) => (
                      <div
                        key={reply.id}
                        className="flex items-start bg-gray-100 p-3 rounded-lg"
                      >
                        <MdSubdirectoryArrowRight
                          className="mr-2 text-gray-600 mt-1"
                        />
                        <div>
                          <Typography className="font-semibold text-gray-700">
                            {reply.user_full_name}:
                          </Typography>
                          <Typography className="text-gray-600">
                            {reply.body}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography className="text-gray-500">
                    Chưa có phản hồi nào cho bài viết này.
                  </Typography>
                )}
                <div className="flex mt-4 space-x-2">
                  <TextField
                    fullWidth
                    placeholder="Nhập câu trả lời"
                    value={replyInput}
                    onChange={handleReplyChange}
                    variant="outlined"
                    className="bg-white"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReplySubmit(post.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                  >
                    Đăng câu trả lời
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography className="text-gray-600">
            Chưa có bài viết nào trong diễn đàn này.
          </Typography>
        )}
      </div>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle className="text-indigo-700 font-bold">
          Thêm câu hỏi mới
        </DialogTitle>
        <DialogContent className="space-y-4">
          <TextField
            fullWidth
            label="Tiêu đề"
            placeholder="Nhập tiêu đề"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            variant="outlined"
            className="bg-white"
          />
          <TextField
            fullWidth
            label="Nội dung"
            placeholder="Nhập nội dung"
            value={newPostBody}
            onChange={(e) => setNewPostBody(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            className="bg-white"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowModal(false)}
            color="secondary"
            className="text-gray-600 hover:text-gray-800"
          >
            Hủy
          </Button>
          <Button
            onClick={handleNewPostSubmit}
            color="primary"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Đăng câu hỏi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Forum;