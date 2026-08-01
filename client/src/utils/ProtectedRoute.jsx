import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if(loading)  return <Spinner />;

    if(!isAuthenticated) return <Navigate to="/" replace />;

    return children;
};