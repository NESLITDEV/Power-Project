/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useState } from "react";
import * as authHelper from "../_helpers";
import { jwtDecode } from "jwt-decode";

// Default API URL in case environment variable is not set
const DEFAULT_API_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = import.meta.env.VITE_APP_API_URL || DEFAULT_API_URL;

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = false;

export const LOGIN_URL = `/Auth/login`;
export const REGISTER_URL = `/Auth/register`;
export const FORGOT_PASSWORD_URL = `/Auth/forgot-password`;
export const RESET_PASSWORD_URL = `/Auth/reset-password`;

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState();

  const verify = async () => {
    if (!auth) {
      setCurrentUser(undefined);
      return;
    }
    setCurrentUser(auth);
  };

  const saveAuth = (auth) => {
    if (auth?.token) {
      try {
        const decodedToken = jwtDecode(auth.token);
        auth.stripeCustomerId = decodedToken.StripeCustomerId;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(LOGIN_URL, {
        email,
        password,
      });
      if (response.data && response.data.isSuccessfull) {
        const userData = response.data;
        setCurrentUser(userData);
        saveAuth(userData);
        return userData;
      } else {
        throw new Error(response.data.responseMessage || "Login failed");
      }
    } catch (error) {
      setCurrentUser(null);
      setAuth(null);
      console.error(
        "Login Error:",
        error.response?.status,
        error.response?.data || error.message
      );
      if (error.response) {
        throw new Error(error.response.data.message || "Login failed");
      }
      throw error;
    }
  };

  const register = async (email, password, userName) => {
    try {
      const response = await axios.post(REGISTER_URL, {
        email,
        password,
        userName,
      });

      if (response.data) {
        setCurrentUser(response.data);
        setAuth({ token: response.data.token });
        return response.data;
      }
    } catch (error) {
      setCurrentUser(null);
      setAuth(null);
      console.error(
        "Registration Error:",
        error.response?.status,
        error.response?.data || error.message
      );
      if (error.response) {
        throw new Error(error.response.data.message || "Registration failed");
      }
      throw error;
    }
  };

  const requestPasswordResetLink = async (email) => {
    await axios.post(FORGOT_PASSWORD_URL, {
      email,
    });
  };

  const changePassword = async (
    email,
    token,
    password,
    password_confirmation
  ) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation,
    });
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  const confirmEmailWithUrl = async (url) => {
    try {
      // Extract the path after /api from the original URL
      const urlPath = url.split("/api")[1];
      // Construct new URL using the API_URL from environment
      const newUrl = `${API_URL}${urlPath}`;
      const response = await axios.get(newUrl);
      return response.data;
    } catch (error) {
      console.error(
        "Email Confirmation Error:",
        error.response?.status,
        error.response?.data || error.message
      );
      if (error.response) {
        throw new Error(
          error.response.data.message || "Email confirmation failed"
        );
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        requestPasswordResetLink,
        changePassword,
        logout,
        verify,
        confirmEmailWithUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
