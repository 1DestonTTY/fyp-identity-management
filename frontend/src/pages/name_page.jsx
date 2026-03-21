import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/navbar";

function NamesPage(){
    const [names, setNames] = useState([]);
    const [error, setError] = useState("");
    const [profileId, setProfileId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        name_type: "professional",
        context: "professional",
        full_name: "",
        given_name: "",
        middle_name: "",
        family_name: "",
        display_name: "",
        is_primary: false,
        is_active: true,
    });

    const fetchMyProfile = async () => {
        try{
            const response = await api.get("/my-profile/?context=professional");
            setProfileId(response.data.id);
        }catch(err){
            setError("Failed to load current profile.");
        }
    };

    const fetchNames = async () => {
        try{
            const response = await api.get("/names/");
            setNames(response.data);
        }catch(err){
            setError("Failed to load names.");
        }
    };

    useEffect(() => {
        fetchMyProfile();
        fetchNames();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleEdit = (name) => {
        setEditingId(name.id);
        setForm({
            name_type: name.name_type || "professional",
            context: name.context || "professional",
            full_name: name.full_name || "",
            given_name: name.given_name || "",
            middle_name: name.middle_name || "",
            family_name: name.family_name || "",
            display_name: name.display_name || "",
            is_primary: name.is_primary || false,
            is_active: name.is_active ?? true,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
      
        if(!profileId){
            setError("Profile ID not loaded yet.");
            return;
        }
      
        try{
            if(editingId){
                await api.put(`/names/${editingId}/`,{ ...form, profile: profileId });
                setSuccess("Name updated successfully.");
            }else{
                await api.post("/names/",{ ...form, profile: profileId });
                setSuccess("Name added successfully.");
            }
        
            setForm({
                name_type: "professional",
                context: "professional",
                full_name: "",
                given_name: "",
                middle_name: "",
                family_name: "",
                display_name: "",
                is_primary: false,
                is_active: true,
            });
        
            setEditingId(null);
            fetchNames();
        }catch(err){
            setError(editingId ? "Failed to update name." : "Failed to create name.");
            
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this name?");
        if(!confirmed) return;

        setError("");
        setSuccess("");

        try{
            await api.delete(`/names/${id}/`);
            setSuccess("Name deleted successfully.");
            fetchNames();
        }catch(err){
            setError("Failed to delete name.");
        }
    };

    return(
        <>
            <Navbar/>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1">Manage Identity Names</h2>
                        <p className="text-muted mb-0">
                        Add, edit, and remove context-specific names.
                        </p>
                    </div>

                    <Link to="/dashboard" className="btn btn-outline-secondary">
                        Back to Dashboard
                    </Link>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="card p-4 mb-4">
                    <h4 className="mb-3">Add New Name</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name Type</label>
                            <select
                                className="form-select"
                                name="name_type"
                                value={form.name_type}
                                onChange={handleChange}
                            >
                                <option value="legal">Legal</option>
                                <option value="preferred">Preferred</option>
                                <option value="professional">Professional</option>
                                <option value="social">Social</option>
                                <option value="alias">Alias</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Context</label>
                            <select
                                className="form-select"
                                name="context"
                                value={form.context}
                                onChange={handleChange}
                            >
                                <option value="legal">Legal</option>
                                <option value="professional">Professional</option>
                                <option value="social">Social</option>
                                <option value="gaming">Gaming</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Given Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="given_name"
                                value={form.given_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Middle Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="middle_name"
                                value={form.middle_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Family Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="family_name"
                                value={form.family_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Display Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="display_name"
                                value={form.display_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mt-3">
                            <button type="submit" className="btn btn-primary">
                                {editingId ? "Update Name" : "Add Name"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary ms-2"
                                    onClick={() => {
                                    setEditingId(null);
                                    setForm({
                                        name_type: "professional",
                                        context: "professional",
                                        full_name: "",
                                        given_name: "",
                                        middle_name: "",
                                        family_name: "",
                                        display_name: "",
                                        is_primary: false,
                                        is_active: true,
                                    });
                                    }}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                        
                    </form>
                </div>

                <div className="card p-4">
                    <h4 className="mb-3">Existing Names</h4>
                    <ul className="list-group">
                        {names.map((name) => (
                            <li key={name.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{name.full_name}</strong> — {name.context} ({name.name_type})
                                </div>
                                <div>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(name)}>
                                        Edit
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(name.id)}>
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default NamesPage;