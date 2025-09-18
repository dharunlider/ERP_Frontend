import axios from "axios";
import CryptoJS from "crypto-js";

const SECRET_KEY = "qwertyuiop";

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    // Check if the decrypted data is valid JSON
    if (!decryptedData) {
      throw new Error(
        "Decryption failed. Data may be corrupted or tampered with."
      );
    }

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Error during decryption:", error.message);
    return null;
  }
};

const instance = axios.create({
  // baseURL: "https://w0vhrv2j-8080.inc1.devtunnels.ms/",
  baseURL: "https://1vkmpxlh-8093.inc1.devtunnels.ms/",
  // baseURL: "https://smffhsfh-8080.inc1.devtunnels.ms/",
  // baseURL: "https://1vkmpxlh-8093.inc1.devtunnels.ms/",

  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-type": "application/json",
  },

});

instance.interceptors.request.use(config => {
  console.log(`➡️ Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url.includes("/auth/refresh") ||
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/public-holidays") ||
        originalRequest.url.includes("/user/me")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => instance(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Refreshing token...");
        await instance.post("/auth/refresh");
        console.log("✅ Token refreshed");
        processQueue(null);
        return instance(originalRequest);
      } catch (err) {
        console.error("❌ Refresh token failed", err);
        processQueue(err, null);
        window.location.href = "/login?session_expired=1";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);



export default instance;



export const logout = async () => {
  try {
    await instance.post("/auth/logout");
    sessionStorage.clear();
    console.log("Logged out successfully");
    document.title = "LIDER-ERP";
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
};

export function removeBracketedText(input) {
  if (!input) {
    return input;
  }
  return input.replace(/\s*\(.*?\)\s*/g, "");
}

export const formatType = (type) => {
  return type
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const renderDoc = (url) => {
  if (url.endsWith(".doc") || url.endsWith(".docx")) {
    window.open(
      `https://docs.google.com/viewer?url=${url}&embedded=true`,
      "_blank"
    );
  } else {
    window.open(url, "_blank");
  }
};
