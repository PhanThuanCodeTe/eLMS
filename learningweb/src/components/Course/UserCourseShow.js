import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Col, Row, Accordion, Tabs, Tab, Spinner, Alert, Button, Modal } from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import Forum from '../Forum/Forum';
import TestShow from '../Test/TestShow';
import { MdClose } from 'react-icons/md';

const UserCourseShow = () => {
    const location = useLocation();
    const { course } = location.state || {};
    const [modules, setModules] = useState([]);
    const [loadingModules, setLoadingModules] = useState(true);
    const [moduleDetails, setModuleDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState(null);
    const [tests, setTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [testError, setTestError] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [moduleToSwitch, setModuleToSwitch] = useState(null); // Track the module user wants to switch to
    const [testToSwitch, setTestToSwitch] = useState(null); // Track the test user wants to switch to

    useEffect(() => {
        const fetchData = async () => {
            if (course && course.id) {
                try {
                    const response = await authAPIs().get(endpoints["Module-list"](course.id));
                    setModules(response.data);
                } catch (error) {
                    console.error("Error fetching modules:", error);
                } finally {
                    setLoadingModules(false);
                }
            }
        };

        fetchData();
    }, [course]);

    const fetchModuleDetails = async (moduleId) => {
        setLoadingDetails(true);
        setDetailsError(null);

        try {
            const response = await authAPIs().get(`${endpoints["Module-list"](course.id)}${moduleId}/`);
            setModuleDetails(response.data);
        } catch (err) {
            console.error("Error fetching module details:", err);
            setDetailsError("Could not load module details.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchTest = async (moduleId) => {
        setLoadingTests(true);
        setTestError(null);

        try {
            const response = await authAPIs().get(endpoints["Module-test"](moduleId));
            setTests(response.data);
        } catch (err) {
            console.error("Error fetching tests:", err);
            setTestError("Could not load tests.");
        } finally {
            setLoadingTests(false);
        }
    };

    const getYouTubeVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const handleCloseTest = () => {
        setShowModal(true); // Show the confirmation modal
    };

    const confirmClose = () => {
        setShowModal(false); // Hide the modal
    
        if (moduleToSwitch) {
            // If the user wanted to switch to a module, load that module
            fetchModuleDetails(moduleToSwitch);
            fetchTest(moduleToSwitch);
            setModuleToSwitch(null); // Reset moduleToSwitch
            setSelectedTest(null); // Reset the selected test before loading a new one
        } else if (testToSwitch) {
            // Reset the selected test first, then load the new one
            setSelectedTest(null); // Reset the selected test before loading a new one
            setTimeout(() => {
                setSelectedTest(testToSwitch); // Set the new test after a short delay to trigger re-render
                setTestToSwitch(null); // Reset testToSwitch
            }, 0); // Timeout is used to ensure the state change is detected
        }
    };
    

    const cancelClose = () => {
        setShowModal(false); // Just hide the modal
        setModuleToSwitch(null); // Reset any intended module switch
        setTestToSwitch(null); // Reset any intended test switch
    };

    const handleModuleClick = (moduleId) => {
        if (selectedTest) {
            // If a test is being displayed, ask for confirmation before switching modules
            setModuleToSwitch(moduleId); // Track the intended module switch
            setShowModal(true); // Show the confirmation modal
        } else {
            fetchModuleDetails(moduleId); // Otherwise, just load the new module
            fetchTest(moduleId);
        }
    };

    const handleTestClick = (test) => {
        if (selectedTest) {
            // If a test is already open, ask for confirmation before switching tests
            setTestToSwitch(test); // Track the intended test switch
            setShowModal(true); // Show the confirmation modal
        } else {
            setSelectedTest(test); // If no test is open, just load the new test
        }
    };

    if (!course) {
        return <h1>No course information available</h1>;
    }

    return (
        <>
            <Tabs defaultActiveKey="content" id="course-tabs" className="my-2">
                <Tab eventKey="content" title="Nội dung">
                    <Row className="m-2">
                        <Col xs={12} md={8}>
                            {selectedTest ? (
                                <Card className="border-success rounded">
                                    <Card.Body>
                                        <Button
                                            variant="link"
                                            className="float-end"
                                            onClick={handleCloseTest} // Show confirmation modal
                                        >
                                            <MdClose size={24} />
                                        </Button>
                                        <TestShow test={selectedTest} />
                                    </Card.Body>
                                </Card>
                            ) : moduleDetails ? (
                                loadingDetails ? (
                                    <Spinner animation="border" />
                                ) : detailsError ? (
                                    <Alert variant="danger">{detailsError}</Alert>
                                ) : (
                                    <Card className="border-primary rounded">
                                        <Card.Body>
                                            <Card.Title>{moduleDetails.title}</Card.Title>
                                            {moduleDetails.youtube_url && (
                                                <div className="embed-responsive" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                                                    <iframe
                                                        title={moduleDetails.title}
                                                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(moduleDetails.youtube_url)}`}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 0,
                                                        }}
                                                        allowFullScreen
                                                    />
                                                </div>
                                            )}
                                            <Card.Text>
                                                <strong>Description:</strong>
                                            </Card.Text>
                                            <div dangerouslySetInnerHTML={{ __html: moduleDetails.description }} />
                                        </Card.Body>
                                    </Card>
                                )
                            ) : (
                                <Card className="border-primary rounded">
                                    <Card.Body>
                                        <Card.Title>{course.title}</Card.Title>
                                        <Card.Img
                                            variant="top"
                                            src={course.cover_image_url}
                                            alt={course.title}
                                            style={{ maxHeight: "20rem", objectFit: "cover", borderRadius: "0.25rem" }}
                                        />
                                        <Card.Text>
                                            <strong>Mô tả khóa học:</strong> {course.description}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Giáo viên:</strong> {course.author.first_name} {course.author.last_name}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Email:</strong> {course.author.email}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>

                        <Col xs={12} md={4}>
                            <h4>Module trong khoá học</h4>
                            {loadingModules ? (
                                <Spinner animation="border" />
                            ) : (
                                <Accordion defaultActiveKey="0" style={{ width: "100%" }}>
                                    {modules.map((module) => (
                                        <Accordion.Item eventKey={module.id.toString()} key={module.id}>
                                            <Accordion.Header onClick={() => handleModuleClick(module.id)}>
                                                {module.title}
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                {loadingTests ? (
                                                    <Spinner animation="border" />
                                                ) : testError ? (
                                                    <Alert variant="danger">{testError}</Alert>
                                                ) : tests.length > 0 ? (
                                                    <div>
                                                        {tests.map((test) => (
                                                            <div
                                                                key={test.id}
                                                                style={{
                                                                    borderBottom: "1px solid #ccc",
                                                                    padding: "10px 0",
                                                                    marginBottom: "10px",
                                                                    cursor: "pointer"
                                                                }}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleTestClick(test); // Handle test click with confirmation
                                                                }}
                                                            >
                                                                {test.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p>Module này không có bài kiểm tra.</p>
                                                )}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            )}
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="forum" title="Diễn đàn môn học">
                    <Forum course={course} />
                </Tab>
            </Tabs>

            <Modal show={showModal} onHide={cancelClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận thoát</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Khi bạn thoát tất cả dữ liệu sẽ bị mất. Bạn chắc chắn chứ?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelClose}>
                        Không
                    </Button>
                    <Button variant="danger" onClick={confirmClose}>
                        Thoát
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserCourseShow;
