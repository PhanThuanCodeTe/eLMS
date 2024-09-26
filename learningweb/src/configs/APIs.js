import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "http://127.0.0.1:8000/";

export const endpoints = {
    "category": "/categories",
    "register": "/users/",
    "login": "/o/token/",
    "user-info": "/current-user/info",
    "update-info": "/current-user/update_info/",
    "forget-password-get-code": "/password-reset/request_passcode/",
    "forget-password-change-password": "/password-reset/reset_password/",
    "list-course": "/courses",
    "create-course": "/create-course/",
    "course-detail":(id) => `/courses/${id}`,
    "Module-list": (courseId) => `/courses/${courseId}/module/`,
    "Module-test": (moduleId) => `/modules/${moduleId}/tests/`,
    "test-question": (testId) => `/tests/${testId}/questions/`,
    "question-answer": (questionId) => `/questions/${questionId}/answers/`,
    "course-member": "/user-membership-courses/",
    "forum" : (courseId) => `/courses/${courseId}/forum/`,
    "forum-post" : (forumId) => `/forums/${forumId}/posts/`,
    "post-reply": (postId) => `posts/${postId}/replies/`,
    "notifications" : "/notifications/",
};

export const authAPIs = (includeAuth = true) => {
    const token = cookie.load('authToken');
    
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': includeAuth && token ? `Bearer ${token}` : ''
        }
    });
};

export default axios.create({
    baseURL: BASE_URL
});
