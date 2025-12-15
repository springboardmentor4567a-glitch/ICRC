import axios from "axios";

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await axios.post("http://localhost:5000/refresh", {
      refreshToken,
    });

    localStorage.setItem("accessToken", res.data.accessToken);
    return res.data.accessToken;

  } catch (err) {
    return null;
  }
}
