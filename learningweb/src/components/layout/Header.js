import React, { useState } from "react";
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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import { useUser } from "../Context/UserContext";
import { authAPIs, endpoints } from "../../configs/APIs";
import Logo from "../../assets/Image/Logo.png";
import LockResetIcon from "@mui/icons-material/LockReset";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import Notification from "./Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const userMenuOpen = Boolean(anchorEl);

  const navigationLinks = [
    { to: "/", label: "Trang chủ", icon: <HomeIcon className="w-5 h-5" /> },
    { to: "/categories", label: "Danh mục", icon: <CategoryIcon className="w-5 h-5" /> },
  ];

  const userMenuItems = [
    { to: "/info", label: "Trang cá nhân", icon: <PersonIcon /> },
    { to: "/mycourse", label: "Khóa học của tôi", icon: <SchoolIcon /> },
    ...(user?.role === 1 ? [{ to: "/manage-course", label: "Quản lý khóa học", icon: <ManageAccountsIcon /> }] : []),
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-blue-400/30 group-hover:ring-blue-400/60 group-hover:scale-110 transition-all duration-300 hidden xs:block"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 group-hover:from-blue-400/30 group-hover:to-purple-400/30 transition-all duration-300 hidden xs:block"></div>
                </div>
                <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                  EduPlatform
                </span>
              </Link>

              <nav className="hidden md:flex space-x-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium text-sm group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <CircularProgress size={20} className="text-blue-400" />
                  <span className="text-gray-300 text-sm">Đang tải...</span>
                </div>
              ) : user ? (
                <>
                  {/* Notifications */}
                  <IconButton
                    onClick={() => setShowDrawer(true)}
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    size="medium"
                  >
                    <Badge color="error" className="animate-pulse">
                      <NotificationsIcon className="bg-white-600" />
                    </Badge>
                  </IconButton>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-medium text-white">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.role === 1 ? 'Giảng viên' : 'Học viên'}
                      </div>
                    </div>

                    <IconButton
                      onClick={handleUserMenuOpen}
                      className="ring-2 ring-blue-400/30 hover:ring-blue-400/60 transition-all duration-300"
                      size="small"
                    >
                      <Avatar
                        alt="User Avatar"
                        src={user.avatar}
                        className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-white/20"
                      >
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </Avatar>
                    </IconButton>
                  </div>

                  {/* Enhanced User Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={userMenuOpen}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                      className: "mt-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-xl min-w-[200px] sm:min-w-[250px]",
                      elevation: 0,
                    }}
                    TransitionComponent={Fade}
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Avatar src={user.avatar} className="w-10 h-10 sm:w-12 sm:h-12">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">
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

                    {/* Menu Items */}
                    {userMenuItems.map((item, index) => (
                      <MenuItem
                        key={index}
                        component={Link}
                        to={item.to}
                        onClick={handleUserMenuClose}
                        className="px-4 py-2 sm:py-3 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-600">{item.icon}</div>
                          <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                      </MenuItem>
                    ))}

                    <Divider className="my-1" />

                    {/* Password Change */}
                    <MenuItem
                      onClick={() => {
                        setShowPasswordModal(true);
                        handleUserMenuClose();
                      }}
                      className="px-4 py-2 sm:py-3 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                    >
                      <div className="flex items-center space-x-3">
                        <LockResetIcon className="text-gray-600" />
                        <span className="font-medium text-gray-700">Đổi mật khẩu</span>
                      </div>
                    </MenuItem>

                    {/* Logout */}
                    <MenuItem
                      onClick={logout}
                      className="px-4 py-2 sm:py-3 hover:bg-red-50 transition-colors duration-200 text-red-600 text-sm sm:text-base"
                    >
                      <div className="flex items-center space-x-3">
                        <ExitToAppIcon />
                        <span className="font-medium">Đăng xuất</span>
                      </div>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link
                    to="/login"
                    className="group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-gray-200 text-sm sm:text-base overflow-hidden"
                  >
                    <span className="relative z-10 group-hover:text-white transition-colors duration-200">
                      Đăng nhập
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-gradient-to-t from-blue-600 to-purple-600 transition-[height] duration-200 ease-out" />
                  </Link>

                  <Link
                    to="/register"
                    className="group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-gray-200 text-sm sm:text-base overflow-hidden"
                  >
                    <span className="relative z-10 group-hover:text-white transition-colors duration-200">
                      Đăng ký
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-gradient-to-t from-blue-600 to-purple-600 transition-[height] duration-200 ease-out" />
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <MenuIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Notification Drawer */}
      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        PaperProps={{
          className: "bg-white/95 backdrop-blur-md",
          sx: { width: { xs: '80%', sm: 360, md: 400 } }
        }}
        SlideProps={{
          direction: "left"
        }}
      >
        <Box className="h-full">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <NotificationsIcon />
                <Typography variant="h6" fontWeight={600}>
                  Thông báo
                </Typography>
              </div>
              <IconButton
                onClick={() => setShowDrawer(false)}
                className="text-white hover:bg-white/20"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <Notification />
          </div>
        </Box>
      </Drawer>

      {/* Enhanced Password Change Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => !updating && setShowPasswordModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          className: "backdrop-blur-sm bg-black/30"
        }}
      >
        <Fade in={showPasswordModal}>
          <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[90%] sm:max-w-md mx-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <LockResetIcon />
                    </div>
                    <div>
                      <Typography variant="h6" fontWeight={600} className="text-base sm:text-lg">
                        Đổi mật khẩu
                      </Typography>
                      <Typography variant="body2" className="opacity-90 text-xs sm:text-sm">
                        Cập nhật mật khẩu bảo mật
                      </Typography>
                    </div>
                  </div>
                  {!updating && (
                    <IconButton
                      onClick={() => setShowPasswordModal(false)}
                      className="text-white hover:bg-white/20"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                {success ? (
                  <div className="text-center py-6 sm:py-8">
                    <CheckCircleIcon className="text-green-500 text-4xl sm:text-6xl mb-4" />
                    <Typography variant="h6" className="text-green-600 mb-2 text-base sm:text-lg">
                      Đổi mật khẩu thành công!
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 text-sm sm:text-base">
                      Mật khẩu của bạn đã được cập nhật.
                    </Typography>
                  </div>
                ) : (
                  <>
                    <Typography variant="body2" className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      Vui lòng nhập mật khẩu hiện tại và mật khẩu mới bạn muốn thay đổi.
                    </Typography>

                    <div className="space-y-4">
                      <TextField
                        fullWidth
                        label="Mật khẩu hiện tại"
                        type="password"
                        name="current_password"
                        value={passwords.current_password}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        className="bg-white"
                        disabled={updating}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        type="password"
                        name="new_password"
                        value={passwords.new_password}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        className="bg-white"
                        disabled={updating}
                        helperText="Tối thiểu 6 ký tự"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        name="confirm_password"
                        value={passwords.confirm_password}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        className="bg-white"
                        disabled={updating}
                        size="small"
                      />

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <Typography variant="body2" className="text-red-600 text-sm">
                            {error}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3 mt-6 sm:mt-8">
                      <Button
                        onClick={() => setShowPasswordModal(false)}
                        disabled={updating}
                        variant="outlined"
                        className="px-3 sm:px-6 text-sm sm:text-base"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={updating || !passwords.current_password || !passwords.new_password || !passwords.confirm_password}
                        variant="contained"
                        className="px-3 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base"
                        startIcon={updating ? <CircularProgress size={18} color="inherit" /> : null}
                      >
                        {updating ? "Đang cập nhật..." : "Cập nhật"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Box>
        </Fade>
      </Modal>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          className: "bg-slate-900 text-white w-72 sm:w-80"
        }}
      >
        <div className="h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white/30 group-hover:ring-white/60 group-hover:scale-110 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 group-hover:from-blue-400/30 group-hover:to-purple-400/30 transition-all duration-300"></div>
                </div>
                <span className="font-bold text-lg sm:text-xl">EduPlatform</span>
              </div>
              <IconButton
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:bg-white/20"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-all duration-200 text-sm sm:text-base"
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Header;