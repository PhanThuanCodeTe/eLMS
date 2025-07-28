import "./App.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Category from "./components/categories/Category";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Home from "./components/Home/Home";
import UserInfo from "./components/User/UserInfo";
import UserCourse from "./components/Course/UserCourse";
import CourseManage from "./components/Course/CourseManage";
import CourseEdit from "./components/Course/CourseEdit";
import Test from "./components/Test/Test";
import { UserProvider } from "./components/Context/UserContext";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Module from "./components/Module/Module";
import EssayTest from "./components/Test/EssayTest";
import UserCourseShow from "./components/Course/UserCourseShow";
import Forum from "./components/Forum/Forum";
import Notification from "./components/layout/Notifications";
import TestShow from "./components/Test/TestShow";
import { useEffect } from "react";

// Component để cuộn lên đầu trang
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => {
  return (
    <Router>
      <UserProvider>
        <ScrollToTop /> {/* Thêm component này */}
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/info" element={<UserInfo />} />
          <Route path="/mycourse" element={<UserCourse />} />
          <Route path="/manage-course" element={<CourseManage />} />
          <Route path="/test-edit/:testId" element={<Test />} />
          <Route path="/essaytest/:testId" element={<EssayTest />} />
          <Route path="/course/:courseId" element={<UserCourseShow />} />
          <Route path="/test" element={<TestShow />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/manage-course/:courseName/edit/:id" element={<CourseEdit />}>
            <Route path="modules" element={<Module />} />
          </Route>
        </Routes>
        <Footer />
      </UserProvider>
    </Router>
  );
};

export default App;