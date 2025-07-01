import React, { createContext, useState, useContext, useEffect } from 'react';
import cookie from 'react-cookies';
import { endpoints, authAPIs } from '../../configs/APIs';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const api = authAPIs();
      const response = await api.get(endpoints["user-info"]);
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user info", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cookie.load('authToken')) {
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
  try {
    const api = authAPIs();
    const formData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('username', email);
    formData.append('password', password);
    formData.append('client_id', process.env.REACT_APP_CLIENT_ID);
    formData.append('client_secret', process.env.REACT_APP_CLIENT_SECRET);

    const response = await api.post(endpoints.login, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const { access_token } = response.data;
    cookie.save('authToken', access_token, { path: '/' });

    await fetchUserInfo();
  } catch (error) {
    let message = 'Đăng nhập thất bại. Vui lòng thử lại.';

    if (error.response?.data) {
      const { error_description } = error.response.data;
      if (error_description) {
        message = `Đăng nhập thất bại: ${error_description}`;
      }
    }

    console.error(message, error);
    throw new Error(message);
  }
};


  const logout = () => {
    cookie.remove('authToken', { path: '/' });
    setUser(null);
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <UserContext.Provider value={{ user, loading, fetchUserInfo, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);