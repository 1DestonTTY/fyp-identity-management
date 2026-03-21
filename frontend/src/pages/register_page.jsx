import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
        ...form,
        [name]: value,
        });
    };

    const formatErrors = (data) => {
        if(!data){
            return "Registration failed.";
        } 
    
        if(typeof data === "string"){
            return data;
        } 
    
        const fieldLabels = {
            username: "Username",
            email: "Email",
            password: "Password",
            confirm_password: "Confirm Password",
            non_field_errors: "Error",
        };
    
        if (typeof data === "object"){
            return Object.entries(data)
                .map(([field, messages]) => {
                    const label = fieldLabels[field] || field;
                    const messageText = Array.isArray(messages) ? messages.join(" ") : messages;
                    return `${label}: ${messageText}`;
                })
                .join(" | ");
        }
    
        return "Registration failed.";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try{
            await api.post("/register/", form);
            setSuccess("Registration successful. You can now log in.");
            setForm({
                username: "",
                email: "",
                password: "",
                confirm_password: "",
            });

            setTimeout(() => {
                navigate("/");
            }, 1200);
        }catch(err){
            setError(formatErrors(err.response?.data));
        }
    };

    return(
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <div className="card p-4 shadow-sm border-0">
                <h2 className="mb-1">Register</h2>
                <p className="text-muted mb-4">
                Create a new account to access the identity profile management system.
                </p>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                    type="password"
                    className="form-control"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Register
                </button>
                </form>

                <div className="mt-3 text-center">
                <span className="text-muted">Already have an account? </span>
                <Link to="/">Login here</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;