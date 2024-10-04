import React, { useState, useEffect, useCallback } from "react";
import {
  Spinner,
  Alert,
  Accordion,
  Form,
  Button,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Link } from "react-router-dom";

const Module = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleDetails, setModuleDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [newModule, setNewModule] = useState({
    title: "",
    youtube_url: "",
    description: "",
  });
  const [tests, setTests] = useState({});
  const [newTest, setNewTest] = useState({
    name: "", // The name of the test
    module: null, // Module ID
  });
  const [showAddTestModal, setShowAddTestModal] = useState(false);

  const fetchModules = useCallback(async () => {
    try {
      const response = await authAPIs().get(endpoints["Module-list"](courseId));
      setModules(response.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách module:", err);
      setError("Không thể tải danh sách module.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchTests = useCallback(async (moduleId) => {
    if (tests[moduleId]) return;

    try {
      const response = await authAPIs().get(endpoints["Module-test"](moduleId));
      setTests((prevTests) => ({
        ...prevTests,
        [moduleId]: response.data,
      }));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bài kiểm tra:", err);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const fetchModuleDetails = async (moduleId) => {
    if (moduleDetails[moduleId]) return;

    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await authAPIs().get(
        `${endpoints["Module-list"](courseId)}${moduleId}/`
      );
      setModuleDetails((prevDetails) => ({
        ...prevDetails,
        [moduleId]: response.data,
      }));

      // Fetch tests for the module
      await fetchTests(moduleId);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết module:", err);
      setDetailsError("Không thể tải chi tiết module.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateModuleDetails = async (moduleId) => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await authAPIs().patch(
        `${endpoints["Module-list"](courseId)}${moduleId}/`,
        editingModule
      );
      setModuleDetails((prevDetails) => ({
        ...prevDetails,
        [moduleId]: response.data,
      }));
      setEditingModule(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật module:", err);
      setDetailsError("Không thể cập nhật module.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const deleteModule = async () => {
    if (!moduleToDelete) return;

    setLoadingDetails(true);
    setDetailsError(null);

    try {
      await authAPIs().delete(
        `${endpoints["Module-list"](courseId)}${moduleToDelete}/`
      );
      setModules(modules.filter((module) => module.id !== moduleToDelete));
      setModuleDetails((prevDetails) => {
        const newDetails = { ...prevDetails };
        delete newDetails[moduleToDelete];
        return newDetails;
      });
    } catch (err) {
      console.error("Lỗi khi xóa module:", err);
      setDetailsError("Không thể xóa module.");
    } finally {
      setLoadingDetails(false);
      setShowDeleteModal(false);
      setModuleToDelete(null);
    }
  };

  const deleteTest = async (testId, moduleId) => {
    setLoadingDetails(true);
    setDetailsError(null);
  
    try {
      // Call the delete API using the existing endpoint structure
      await authAPIs().delete(`/modules/${moduleId}/tests/${testId}/`);
  
      // Update the state to remove the deleted test
      setTests((prevTests) => ({
        ...prevTests,
        [moduleId]: prevTests[moduleId].filter((test) => test.id !== testId),
      }));
    } catch (err) {
      console.error("Error deleting test:", err);
      setDetailsError("Không thể xóa bài kiểm tra.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const addTest = async (moduleId) => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const formData = new FormData();
      formData.append("name", newTest.name); // Use name for the test name
      formData.append("module", moduleId); // Include the module ID
      formData.append("test_type", newTest.test_type); // Add test_type

      const response = await authAPIs().post(
        endpoints["Module-test"](moduleId),
        formData
      );

      // Update the state to include the new test
      setTests((prevTests) => ({
        ...prevTests,
        [moduleId]: [...(prevTests[moduleId] || []), response.data],
      }));

      // Reset the new test state
      setNewTest({ name: "", module: null }); // Reset only name and module
      setShowAddTestModal(false);
    } catch (err) {
      console.error("Error creating new test:", err);
      setDetailsError("Cannot create new test.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const createNewModule = async () => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await authAPIs().post(
        endpoints["Module-list"](courseId),
        newModule
      );
      setModules([...modules, response.data]);
      setNewModule({ title: "", youtube_url: "", description: "" });
    } catch (err) {
      console.error("Lỗi khi tạo module mới:", err);
      setDetailsError("Không thể tạo module mới.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingModule((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewModuleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditingModule((prev) => ({ ...prev, description: data }));
  };

  const handleNewModuleEditorChange = (event, editor) => {
    const data = editor.getData();
    setNewModule((prev) => ({ ...prev, description: data }));
  };

  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <Accordion>
        {modules.length > 0 ? (
          modules.map((module) => (
            <Accordion.Item key={module.id} eventKey={module.id.toString()}>
              <Accordion.Header onClick={() => fetchModuleDetails(module.id)}>
                {module.title}
              </Accordion.Header>
              <Accordion.Body>
                {loadingDetails && !moduleDetails[module.id] ? (
                  <Spinner animation="border" />
                ) : detailsError ? (
                  <Alert variant="danger">{detailsError}</Alert>
                ) : moduleDetails[module.id] ? (
                  <div>
                    {editingModule && editingModule.id === module.id ? (
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên Module:</Form.Label>
                          <Form.Control
                            type="text"
                            name="title"
                            value={editingModule.title}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>YouTube URL:</Form.Label>
                          <Form.Control
                            type="text"
                            name="youtube_url"
                            value={editingModule.youtube_url}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Nội dung:</Form.Label>
                          <CKEditor
                            editor={ClassicEditor}
                            data={editingModule.description}
                            onChange={handleEditorChange}
                          />
                        </Form.Group>
                        <Button
                          variant="primary"
                          onClick={() => updateModuleDetails(module.id)}
                        >
                          Lưu thay đổi
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingModule(null)}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="danger"
                          className="float-end"
                          onClick={() => {
                            setModuleToDelete(module.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          Xóa
                        </Button>
                      </Form>
                    ) : (
                      <>
                        <h5>Tên Module: {moduleDetails[module.id].title}</h5>
                        <p>
                          <strong>YouTube URL: </strong>
                          <a
                            href={moduleDetails[module.id].youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {moduleDetails[module.id].youtube_url}
                          </a>
                        </p>
                        {moduleDetails[module.id].youtube_url && (
                          <div className="embed-responsive embed-responsive-16by9 mb-3">
                            <iframe
                              className="embed-responsive-item"
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                                moduleDetails[module.id].youtube_url
                              )}`}
                              allowFullScreen
                              title={moduleDetails[module.id].title}
                            ></iframe>
                          </div>
                        )}
                        <h6>Nội dung:</h6>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: moduleDetails[module.id].description,
                          }}
                        />
                        <Button
                          variant="primary"
                          onClick={() =>
                            setEditingModule(moduleDetails[module.id])
                          }
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="danger" // Style for delete button
                          className="ms-2" // Margin start for spacing
                          onClick={() => {
                            // Handle delete functionality here (not implemented)
                            console.log(`Delete module ${module.id}`);
                          }}
                        >
                          Xóa
                        </Button>
                        <h6 className="mt-3">Danh sách bài kiểm tra:</h6>
                        {tests[module.id] ? (
                          <ListGroup>
                            {tests[module.id].map((test) => (
                              <ListGroup.Item
                                key={test.id}
                                className="d-flex justify-content-between align-items-center"
                              >
                                {test.name}
                                <div>
                                  {test.test_type === 1 ? (
                                    <Link
                                      to={`/essaytest/${test.id}`}
                                      state={{ testInfo: test }}
                                      className="btn btn-sm btn-primary me-2" // Add margin end for spacing
                                    >
                                      Chỉnh sửa
                                    </Link>
                                  ) : (
                                    <Link
                                      to={`/test-edit/${test.id}`}
                                      state={{ testInfo: test }}
                                      className="btn btn-sm btn-primary me-2" // Add margin end for spacing
                                    >
                                      Chỉnh sửa
                                    </Link>
                                  )}
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() =>
                                      deleteTest(test.id, module.id)
                                    } // Call delete function
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p>Chưa có bài kiểm tra nào.</p>
                        )}
                        <Button
                          variant="success"
                          className="mt-3"
                          onClick={() => {
                            setNewTest({ ...newTest, module: module.id });
                            setShowAddTestModal(true);
                          }}
                        >
                          Thêm bài kiểm tra
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <p>Bạn chưa ghi gì vào module này</p>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))
        ) : (
          <Alert variant="info">Không có module nào.</Alert>
        )}

        <Accordion.Item eventKey="new-module">
          <Accordion.Header>Thêm 1 Module mới cho Khóa học</Accordion.Header>
          <Accordion.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tên Module:</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={newModule.title}
                  onChange={handleNewModuleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>YouTube URL:</Form.Label>
                <Form.Control
                  type="text"
                  name="youtube_url"
                  value={newModule.youtube_url}
                  onChange={handleNewModuleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nội dung:</Form.Label>
                <CKEditor
                  editor={ClassicEditor}
                  data={newModule.description}
                  onChange={handleNewModuleEditorChange}
                />
              </Form.Group>
              <Button variant="primary" onClick={createNewModule}>
                Tạo Module Mới
              </Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Modal show={showAddTestModal} onHide={() => setShowAddTestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm Bài Kiểm Tra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên Bài Kiểm Tra:</Form.Label>
              <Form.Control
                type="text"
                value={newTest.name}
                onChange={(e) =>
                  setNewTest({ ...newTest, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Loại Bài Kiểm Tra:</Form.Label>
              <Form.Select
                onChange={(e) =>
                  setNewTest({ ...newTest, test_type: Number(e.target.value) })
                }
              >
                <option value="">Chọn loại</option> {/* Placeholder option */}
                <option value={0}>Trắc Nghiệm</option>
                <option value={1}>Tự Luận</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddTestModal(false)}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={() => addTest(newTest.module)}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn xóa?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={deleteModule}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Module;
