import React, { useState, useEffect } from "react";
import { useUser } from "../Context/UserContext";
import { authAPIs, endpoints } from "../../configs/APIs";
import Badge from "react-bootstrap/Badge"; // Import Badge component
import Stack from "react-bootstrap/Stack"; // Import Stack for layout

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

      // Update the state to mark the notification as read
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
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>User Notifications</h1>
      <Stack gap={2}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-3 border rounded"
            style={{
              backgroundColor: notification.is_read ? "#f8f9fa" : "#d1ecf1",
              cursor: "pointer",
            }}
            onClick={() => markAsRead(notification.id)}
          >
            <div>
              {notification.message}
              {!notification.is_read && (
                <>
                  <Badge bg="secondary" className="ml-2">New</Badge>
                  <span className="visually-hidden">unread notification</span>
                </>
              )}
            </div>
            <small className="text-muted">{new Date(notification.created_at).toLocaleString()}</small>
          </div>
        ))}
      </Stack>
    </div>
  );
};

export default Notification;
