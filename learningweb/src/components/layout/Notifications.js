import React, { useState, useEffect } from "react";
import { useUser } from "../Context/UserContext";
import { authAPIs, endpoints } from "../../configs/APIs";
import { Badge, Stack, Typography, Box } from "@mui/material";

const Notification = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const api = authAPIs(true);
        const response = await api.get(endpoints["notifications"]);
        setNotifications(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch notifications.");
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const api = authAPIs(true);
      const payload = { is_read: true };
      await api.patch(`${endpoints["notifications"]}${notificationId}/`, payload);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Typography variant="h4" gutterBottom>
        User Notifications
      </Typography>

      <Stack spacing={2}>
        {notifications.map((notification) => (
          <Box
            key={notification.id}
            className={`p-4 rounded-lg shadow-sm cursor-pointer transition-colors duration-200 ${
              notification.is_read ? "bg-gray-100" : "bg-blue-100"
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <Typography variant="body1">
                {notification.message}
              </Typography>
              {!notification.is_read && (
                <Badge
                  badgeContent="New"
                  color="secondary"
                  sx={{ ml: 2 }}
                />
              )}
            </div>
            <Typography variant="caption" color="text.secondary">
              {new Date(notification.created_at).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </div>
  );
};

export default Notification;
