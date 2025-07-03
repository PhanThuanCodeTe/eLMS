import React, { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Button,
  Drawer,
  Menu,
  MenuItem,
  Modal,
  TextField,
  Typography,
  IconButton,
  Box,
  Divider,
  Badge,
  Chip,
  Fade,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import { useUser } from "../Context/UserContext";
import { authAPIs, endpoints } from "../../configs/APIs";
import Logo from "../../assets/Image/Logo.png";
import LockResetIcon from "@mui/icons-material/LockReset";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Lazy load Notification để giảm tải ban đầu
const Notification = lazy(() => import("./Notifications"));

const Header = () => {
  const { user, loading, logout } = useUser();

  const [anchorEl, setAnchorEl] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (passwords.new_password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const api = authAPIs(true);
      await api.patch(endpoints["update-info"], {
        old_password: passwords.current_password,
        new_password: passwords.new_password,
      });

      setSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess(false);
        setPasswords({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.non_field_errors?.[0] || "Lỗi khi đổi mật khẩu."
      );
    } finally {
      setUpdating(false);
    }
  };

  const userMenuOpen = Boolean(anchorEl);

  const navigationLinks = [
    { to: "/", label: "Trang chủ", icon: <HomeIcon className="w-4 h-4" /> },
    { to: "/categories", label: "Danh mục", icon: <CategoryIcon className="w-4 h-4" /> },
  ];

  const userMenuItems = [
    { to: "/info", label: "Trang cá nhân", icon: <PersonIcon /> },
    { to: "/mycourse", label: "Khóa học của tôi", icon: <SchoolIcon /> },
    ...(user?.role === 1 ? [{ to: "/manage-course", label: "Quản lý khóa học", icon: <ManageAccountsIcon /> }] : []),
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="h-10 w-10 rounded-full ring-2 ring-blue-400/30 group-hover:ring-blue-400/60 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 group-hover:from-blue-400/30 group-hover:to-purple-400/30 transition-all duration-300"></div>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                  EduPlatform
                </span>
              </Link>

              <nav className="hidden md:flex space-x-1">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <CircularProgress size={20} className="text-blue-400" />
                  <span className="text-gray-300">Đang tải...</span>
                </div>
              ) : user ? (
                <>
                  <IconButton
                    onClick={() => setShowDrawer(true)}
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    size="medium"
                  >
                    <Badge variant="dot" color="error" className="animate-pulse">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-medium text-white">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.role === 1 ? 'Giảng viên' : 'Học viên'}
                      </div>
                    </div>

                    <IconButton
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      className="ring-2 ring-blue-400/30 hover:ring-blue-400/60 transition-all duration-300"
                      size="small"
                    >
                      <Avatar
                        alt="User Avatar"
                        src={user.avatar}
                        className="w-10 h-10 ring-2 ring-white/20"
                      >
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </Avatar>
                    </IconButton>
                  </div>

                  <Menu
                    anchorEl={anchorEl}
                    open={userMenuOpen}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                      className: "mt-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-xl min-w-[250px]",
                      elevation: 0,
                    }}
                    TransitionComponent={Fade}
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Avatar src={user.avatar} className="w-12 h-12">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <Chip
                            label={user.role === 1 ? 'Giảng viên' : 'Học viên'}
                            size="small"
                            color={user.role === 1 ? 'primary' : 'secondary'}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {userMenuItems.map((item, index) => (
                      <MenuItem
                        key={index}
                        component={Link}
                        to={item.to}
                        onClick={() => setAnchorEl(null)}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-600">{item.icon}</div>
                          <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                      </MenuItem>
                    ))}

                    <Divider className="my-1" />

                    <MenuItem
                      onClick={() => {
                        setShowPasswordModal(true);
                        setAnchorEl(null);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <LockResetIcon className="text-gray-600" />
                        <span className="font-medium text-gray-700">Đổi mật khẩu</span>
                      </div>
                    </MenuItem>

                    <MenuItem
                      onClick={logout}
                      className="px-4 py-3 hover:bg-red-50 transition-colors duration-200 text-red-600"
                    >
                      <div className="flex items-center space-x-3">
                        <ExitToAppIcon />
                        <span className="font-medium">Đăng xuất</span>
                      </div>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="group relative px-4 py-2 rounded-lg font-medium text-gray-300 transition-all duration-500 ease-out overflow-hidden">
                    <span className="relative z-10 group-hover:text-white">Đăng nhập</span>
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-gradient-to-t from-blue-600 to-purple-600 transition-[height] duration-500 ease-out" />
                  </Link>
                  <Link to="/register" className="group relative px-4 py-2 rounded-lg font-medium text-gray-300 transition-all duration-500 ease-out overflow-hidden">
                    <span className="relative z-10 group-hover:text-white">Đăng ký</span>
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-gradient-to-t from-blue-600 to-purple-600 transition-[height] duration-500 ease-out" />
                  </Link>
                </div>
              )}

              <div className="md:hidden">
                <IconButton onClick={() => setMobileMenuOpen(true)} className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                  <MenuIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer (lazy loaded content) */}
      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        PaperProps={{
          className: "bg-white/95 backdrop-blur-md",
          sx: { width: { xs: '100%', sm: 380 } }
        }}
        SlideProps={{
          direction: "left"
        }}
      >
        <Box className="h-full">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <NotificationsIcon />
                <Typography variant="h6" fontWeight={600}>
                  Thông báo
                </Typography>
              </div>
              <IconButton onClick={() => setShowDrawer(false)} className="text-white hover:bg-white/20" size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          <div className="flex-1 p-4">
            <Suspense fallback={<div className="text-center text-gray-500">Đang tải thông báo...</div>}>
              <Notification />
            </Suspense>
          </div>
        </Box>
      </Drawer>

      {/* Các phần còn lại (modal đổi mật khẩu và mobile drawer) giữ nguyên không thay đổi */}
    </>
  );
};

export default Header;
