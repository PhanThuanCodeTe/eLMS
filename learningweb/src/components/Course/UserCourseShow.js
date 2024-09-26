import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Col, Row, Accordion, Tabs, Tab, Spinner, Alert, Button } from "react-bootstrap";
import { authAPIs, endpoints } from "../../configs/APIs";
import Forum from '../Forum/Forum'; // Make sure to update this path to your Forum component

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
            const response = await authAPIs().get(
                `${endpoints["Module-list"](course.id)}${moduleId}/`
            );
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

    if (!course) {
        return <h1>No course information available</h1>;
    }

    return (
        <Tabs defaultActiveKey="content" id="course-tabs" className="my-2">
            {/* Tab: Nội dung */}
            <Tab eventKey="content" title="Nội dung">
                <Row className="m-2">
                    {/* Left Column: Course Information or Module Details */}
                    <Col xs={12} md={8}>
                        {moduleDetails ? (
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
                                    <Card.Title>
                                        {course.title}
                                    </Card.Title>
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

                    {/* Right Column: Module List */}
                    <Col xs={12} md={4}>
                        <h4>Modules</h4>
                        {loadingModules ? (
                            <p>Loading modules...</p>
                        ) : (
                            <Accordion defaultActiveKey="0" style={{ width: "100%" }}>
                                {modules.map((module) => (
                                    <Accordion.Item eventKey={module.id.toString()} key={module.id}>
                                        <Accordion.Header onClick={() => {
                                            fetchModuleDetails(module.id);
                                            fetchTest(module.id);
                                        }}>
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
                                                                marginBottom: "10px"
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

            {/* Tab: Diễn đàn môn học */}
            <Tab eventKey="forum" title="Diễn đàn môn học">
    <Forum course={course} /> {/* Pass the course prop to the Forum component */}
</Tab>
        </Tabs>
    );
};

export default UserCourseShow;
