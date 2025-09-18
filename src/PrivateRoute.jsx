import { Navigate, Outlet } from "react-router-dom";
import axios from "./Axiosinstance";
import { useState, useEffect } from "react";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // To track if the user is authenticated

  useEffect(() => {
    // Call the backend to check if the user is authenticated
    axios
      .get("/auth/check", { withCredentials: true }) // Ensure credentials (cookies) are sent with the request
      .then((response) => {
        // If the response is successful, user is authenticated
        setIsAuthenticated(true);
      })
      .catch((error) => {
        // If the user is not authenticated, error will occur
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    // You can show a loading spinner while checking authentication status
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;