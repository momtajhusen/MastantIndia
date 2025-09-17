import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiClient = axios.create({
  baseURL: "http://192.168.1.68:8080/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Request interceptor → token attach with AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log("Token fetch error:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
