// components/Home/Home.js
import React, { useEffect, useState } from "react";
import { endpoints, authAPIs } from "../../configs/APIs";

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const api = authAPIs(false); // Use authAPIs without authorization header
                const response = await api.get(endpoints["list-course"]);
                setCourses(response.data.courses); // Access courses array from response
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) return <p>Loading courses...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Home PAGE</h1>
            <ul>
                {courses.map(course => (
                    <li key={course.id}>
                        <img src={course.cover_image_url} alt={course.title} style={{ width: "100px", height: "100px" }} />
                        <h2>{course.title}</h2>
                        <p>{course.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
