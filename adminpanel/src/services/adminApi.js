import axios from "axios";

/* 🌐 Create Axios Instance */
const adminApi = axios.create({
  baseURL: "http://localhost:5000/admin",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // useful if you add cookies later
});

/* 🔐 Admin Login */
export const adminLogin = async ({ email, password }) => {
  try {
    const res = await adminApi.post("/login", {
      email,
      password,
    });

    // store token or admin info if backend sends it
    if (res.data?.token) {
      localStorage.setItem("adminToken", res.data.token);
    }

    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

/* 📝 Admin Signup */
export const adminSignup = async ({ email, password }) => {
  try {
    const res = await adminApi.post("/signup", {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Signup failed" };
  }
};

/* 🚪 Admin Logout */
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
};

/* 🔑 Auth Header Helper (for protected APIs later) */
export const getAdminAuthHeader = () => {
  const token = localStorage.getItem("adminToken");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export default adminApi;
