import logo from './logo.svg';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Category from './components/categories/Category';
import Login from './components/User/Login';
import Register from './components/User/Register'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";


import Home from './components/Home/Home';

const App = () => {

  return (
      <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
      </Router>
    
  );
}

export default App