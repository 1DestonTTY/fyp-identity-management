import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
    const token = localStorage.getItem("access");

    if(!token){
        return <Navigate to="/" replace />;
    }

    try{
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isAdmin = payload.is_staff || false;

        if(!isAdmin){
            return <Navigate to="/dashboard" replace />;
        }
    }catch(err){
        return <Navigate to="/" replace />;
    }
    
    return children;
}

export default AdminRoute;