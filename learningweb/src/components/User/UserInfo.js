import React, { useEffect, useState } from "react";
import { useUser } from "../Context/UserContext"; // giữ nguyên path nếu đúng
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { format } from "date-fns"; // convenient date formatting
import { endpoints, authAPIs } from "../../configs/APIs";

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy");
  } catch {
    return "";
  }
};

const UserInfo = () => {
  const { user, loading, fetchUserInfo } = useUser();
  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        date_of_birth: user.date_of_birth?.slice(0,10) || "",
      });
    } else {
      fetchUserInfo();
    }
  }, [user, fetchUserInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (type) => {
    setUpdating(true);
    setError("");
    try {
      const api = authAPIs(true);
      if (type === "avatar" && avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await api.patch(endpoints["update-info"], fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setAvatarOpen(false);
      } else {
        await api.patch(endpoints["update-info"], formData);
        setEditOpen(false);
      }
      await fetchUserInfo();
    } catch (err) {
      console.error(err);
      setError("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="flex justify-center items-center h-64">
        <span>Không có thông tin người dùng.</span>
      </Box>
    );
  }

  return (
    <Box className="max-w-md mx-auto mt-10 p-4">
      <Card elevation={4} className="p-6">
        <CardContent className="text-center">
          <Box className="relative inline-block mb-4">
            <Avatar
              src={user.avatar}
              alt="avatar"
              sx={{ width:120, height:120 }}
            />
            <IconButton
              className="absolute bottom-0 right-0 bg-white shadow"
              onClick={() => setAvatarOpen(true)}
            >
              <PhotoCameraIcon />
            </IconButton>
          </Box>
          <Box className="space-y-2">
            <Box className="flex justify-between">
              <b>Họ và tên:</b> <span>{user.first_name} {user.last_name}</span>
            </Box>
            <Box className="flex justify-between">
              <b>Email:</b> <span>{user.email}</span>
            </Box>
            <Box className="flex justify-between">
              <b>Ngày sinh:</b> <span>{formatDate(user.date_of_birth)}</span>
            </Box>
            <Box className="flex justify-between">
              <b>Giới tính:</b> <span>{user.gender === 1 ? 'Nam' : 'Nữ'}</span>
            </Box>
            <Box className="flex justify-between">
              <b>Vai trò:</b> <span>{user.role === 1 ? 'Giáo viên' : 'Học viên'}</span>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            className="mt-6"
            onClick={() => setEditOpen(true)}
          >
            Cập nhật thông tin
          </Button>
        </CardContent>
      </Card>

      {/* Modal sửa thông tin */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Thay đổi thông tin cá nhân</DialogTitle>
        <DialogContent className="space-y-4 my-4">
          <TextField
            fullWidth
            label="Họ"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="mt-2"
          />
          <TextField
            fullWidth
            label="Tên"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngày sinh"
            name="date_of_birth"
            InputLabelProps={{ shrink: true }}
            value={formData.date_of_birth}
            onChange={handleChange}
          />
          {error && (
            <Box className="text-red-500 text-sm">{error}</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit()}
            disabled={updating}
          >
            {updating ? <CircularProgress size={20}/> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal cập nhật avatar */}
      <Dialog open={avatarOpen} onClose={() => setAvatarOpen(false)} fullWidth>
        <DialogTitle>Thay đổi avatar</DialogTitle>
        <DialogContent className="space-y-4 text-center">
          {avatarPreview ? (
            <Avatar src={avatarPreview} sx={{ width:120, height:120, mx:"auto" }} />
          ) : (
            <Avatar sx={{ width:120, height:120, bgcolor:"grey.200", mx:"auto" }} />
          )}
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCameraIcon />}
          >
            Chọn ảnh
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarSelect}
            />
          </Button>
          {error && (
            <Box className="text-red-500 text-sm">{error}</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit("avatar")}
            disabled={updating}
          >
            {updating ? <CircularProgress size={20}/> : "Lưu avatar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserInfo;
