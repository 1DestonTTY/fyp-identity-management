import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const formatErrors = (data) => {
        if(!data){
            return "Login failed.";
        }
      
        if(typeof data === "string"){
            return data;
        }

        const fieldLabels = {
            username: "Username",
            password: "Password",
            detail: "Error",
            non_field_errors: "Error",
        };
      
        if(typeof data === "object"){
            return Object.entries(data)
            .map(([field, messages]) => {
                const label = fieldLabels[field] || field;
                const messageText = Array.isArray(messages) ? messages.join(" ") : messages;
                return `${label}: ${messageText}`;
            })
            .join(" | ");
        }
      
        return "Login failed.";
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try{
            const response = await api.post("/token/", {
                username,
                password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            navigate("/dashboard");
        }catch (err){
            setError(formatErrors(err.response?.data));
        }
    };

    return(
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <div className="card p-4 shadow-sm border-0">
                <h2 className="mb-1">Login</h2>
                <p className="text-muted mb-4">Sign in to access your identity profile management dashboard.</p>
        
                {error && <div className="alert alert-danger">{error}</div>}
        
                <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    />
                </div>
        
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>
        
                <button type="submit" className="btn btn-primary w-100">
                    Login
                </button>
                </form>
        
                <div className="mt-3 text-center">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;