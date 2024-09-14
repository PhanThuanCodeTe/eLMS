import React from "react";
import { Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Logo from "../../assets/Image/Logo.png"; // Adjust the path as needed

const Header = () => {
  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Left section: Logo and Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Logo / Brand */}
            <Link to="/" className="flex-shrink-0">
              <img src={Logo} alt="Logo" className="h-16 w-16 rounded-full" />
            </Link>

            {/* Navigation Links using react-bootstrap */}
            <Nav className="flex items-center">
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/"
                  className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Trang chủ
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/categories"
                  className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Danh mục
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Search Bar */}
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Search..."
                className="px-3 py-2 w-60 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right section: User Buttons */}
          <Nav className="flex items-center">
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/login"
                className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Đăng nhập
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/register"
                className="text-white no-underline px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Đăng ký
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
      </div>

      {/* Mobile menu can be handled separately */}
    </nav>
  );
};

export default Header;
