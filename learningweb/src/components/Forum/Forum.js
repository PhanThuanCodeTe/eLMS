import React, { useEffect, useState } from "react";
import { Spinner, Alert, Accordion, Button, Modal, Form } from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs"; // Adjust the path accordingly
import { MdSubdirectoryArrowRight } from "react-icons/md"; // Import right arrow icon

const Forum = ({ course }) => {
  const [forumId, setForumId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyInput, setReplyInput] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [newPostTitle, setNewPostTitle] = useState(""); // New post title
  const [newPostBody, setNewPostBody] = useState(""); // New post body

  useEffect(() => {
    const fetchForumId = async () => {
      try {
        const response = await authAPIs().get(endpoints["forum"](course.id));
        setForumId(response.data.id); // Assuming the response contains the forum ID
      } catch (err) {
        console.error("Error fetching forum ID:", err);
        setError("Could not load forum ID.");
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
        setPosts(response.data); // Assuming the response contains the posts
      } catch (err) {
        console.error("Error fetching forum posts:", err);
        setError("Could not load forum posts.");
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
        setReplies((prev) => ({ ...prev, [postId]: response.data })); // Store replies indexed by post ID
      } catch (err) {
        console.error(`Error fetching replies for post ${postId}:`, err);
      }
    };

    // Fetch replies for each post
    posts.forEach((post) => {
      fetchReplies(post.id);
    });
  }, [posts]);

  const handleReplyChange = (e) => {
    setReplyInput(e.target.value); // Update the reply input value
  };

  const handleReplySubmit = async (postId) => {
    if (!replyInput) return; // Don't submit if the input is empty

    try {
      await authAPIs().post(endpoints["post-reply"](postId), {
        body: replyInput, // Sending the reply input as form data
      });

      // Optionally, you can fetch the replies again or optimistically update the state
      setReplies((prev) => ({
        ...prev,
        [postId]: [
          ...prev[postId],
          { user_full_name: "Bạn", body: replyInput }, // Add the new reply locally
        ],
      }));

      setReplyInput(""); // Clear the input field after submission
    } catch (err) {
      console.error(`Error submitting reply for post ${postId}:`, err);
      setError("Could not submit reply.");
    }
  };

  const handleNewPostSubmit = async () => {
    if (!newPostTitle || !newPostBody) return; // Don't submit if fields are empty

    try {
      await authAPIs().post(endpoints["forum-post"](forumId), {
        title: newPostTitle,
        body: newPostBody,
      });

      setShowModal(false); // Close modal after successful submission
      setNewPostTitle(""); // Clear the inputs
      setNewPostBody("");
      // Optionally refetch posts or optimistically add the new post to the list
      setPosts([...posts, { title: newPostTitle, body: newPostBody }]); // Add the new post locally
    } catch (err) {
      console.error("Error submitting new post:", err);
      setError("Could not submit new post.");
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-between">
        <h2>Diễn đàn của {course.title}</h2>
        <Button className="btn btn-success mr-3" onClick={() => setShowModal(true)}>
          Thêm câu hỏi
        </Button>
      </div>
      <Accordion className="m-3">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <Accordion.Item key={post.id} eventKey={index.toString()}>
              <Accordion.Header>{post.title}</Accordion.Header>
              <Accordion.Body>
                <p>
                  <strong>{post.body}</strong>
                </p>
                {replies[post.id] && replies[post.id].length > 0 ? (
                  <div>
                    {replies[post.id].map((reply) => (
                      <div
                        key={reply.id}
                        className="d-flex align-items-start my-3"
                      >
                        <MdSubdirectoryArrowRight
                          style={{ marginRight: "10px", color: "black" }}
                        />
                        <div className="bg-gray-100 rounded p-3 flex-grow-1">
                          <strong>{reply.user_full_name}:</strong>{" "}
                          <div className="ml-2">{reply.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Chưa có phản hồi nào cho bài viết này.</p>
                )}
                <div className="d-flex">
                  <input
                    type="text"
                    placeholder="Nhập câu trả lời"
                    className="flex-grow-1 p-2 mr-1"
                    value={replyInput}
                    onChange={handleReplyChange}
                  />
                  <Button
                    className="btn btn-primary"
                    onClick={() => handleReplySubmit(post.id)}
                  >
                    Đăng câu trả lời
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))
        ) : (
          <p>Chưa có bài viết nào trong diễn đàn này.</p>
        )}
      </Accordion>

      {/* Modal for adding a new post */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm câu hỏi mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="newPostTitle">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="newPostBody">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập nội dung"
                value={newPostBody}
                onChange={(e) => setNewPostBody(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleNewPostSubmit}>
            Đăng câu hỏi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Forum;
