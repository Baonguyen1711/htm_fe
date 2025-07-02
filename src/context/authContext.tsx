import axios from "axios";
import { useEffect, useState, createContext, useContext } from "react";
import useAuth from "../hooks/useAuth"; // Assuming this is your custom hook file
import {
  getAuth,
  signInWithEmailAndPassword,
  User,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

let axiosAuthContextValue: any = null;
// Create a context for Axios with Authentication
const AxiosAuthContext = createContext<any>(null);

export const AxiosAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [axiosInstance, setAxiosInstance] = useState(() => axios.create());
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);

  const saveToken = (token: string | undefined) => {
    setAuthToken(token);
  };

  const clearToken = () => {
    setAuthToken(undefined);
  };

  const getAxiosInstance = () => {
    const axiosInstance = axios.create({
      baseURL: "https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app", // Replace with your API endpoint
    });

    // Add an interceptor to attach the token
    axiosInstance.interceptors.request.use(
      (config) => {
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
      }
    );

    return axiosInstance;
  };

  axiosAuthContextValue = { getAxiosInstance, setAuthToken, clearToken, authToken };
  return (
    <AxiosAuthContext.Provider value={{getAxiosInstance, setAuthToken, clearToken, authToken}}>
      {children}
    </AxiosAuthContext.Provider>
  );
};

export const getAxiosAuthContext = () => axiosAuthContextValue;

// Custom hook to use Axios with Bearer authentication
export const useAxiosAuth = () => {
  return useContext(AxiosAuthContext);
};
