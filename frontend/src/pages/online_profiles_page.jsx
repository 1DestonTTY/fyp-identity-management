import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/navbar";

function OnlineProfilesPage() {
    const [profiles, setProfiles] = useState([]);
    const [error, setError] = useState("");
    const [profileId, setProfileId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        platform: "github",
        handle: "",
        url: "",
        visibility: "public",
    });

    const fetchMyProfile = async () => {
        try{
            const response = await api.get("/my-profile/?context=professional");
            setProfileId(response.data.id);
        }catch(err){
            setError("Failed to load current profile.");
        }
    };

    const fetchOnlineProfiles = async () => {
        try{
            const response = await api.get("/online-profiles/");
            setProfiles(response.data);
        }catch(err){
            setError("Failed to load online profiles.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({...form, [name]: value,});
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            platform: item.platform || "github",
            handle: item.handle || "",
            url: item.url || "",
            visibility: item.visibility || "public",
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            platform: "github",
            handle: "",
            url: "",
            visibility: "public",
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
                await api.put(
                    `/online-profiles/${editingId}/`,
                    { ...form, profile: profileId },
                );
                setSuccess("Online profile updated successfully.");
            }else{
                await api.post(
                    "/online-profiles/",
                    { ...form, profile: profileId },
                );
                setSuccess("Online profile added successfully.");
            }

            resetForm();
            fetchOnlineProfiles();
        }catch(err){
            setError(editingId ? "Failed to update online profile." : "Failed to create online profile.");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this online profile?");
        if(!confirmed) return;

        setError("");
        setSuccess("");
      
        try{
            await api.delete(`/online-profiles/${id}/`);
            setSuccess("Online profile deleted successfully.");
            fetchOnlineProfiles();
        }catch(err){
            setError("Failed to delete online profile.");
        }
    };

    useEffect(() => {
        fetchMyProfile();
        fetchOnlineProfiles();
    }, []);

    return(
        <>
            <Navbar/>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1">Manage Online Profiles</h2>
                        <p className="text-muted mb-0">
                            Manage platform links, handles, and visibility settings.
                        </p>
                    </div>

                    <Link to="/dashboard" className="btn btn-outline-secondary">
                        Back to Dashboard
                    </Link>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="card p-4 mb-4">
                    <h4 className="mb-3">{editingId ? "Edit Online Profile" : "Add Online Profile"}</h4>

                    <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Platform</label>
                        <select
                        className="form-select"
                        name="platform"
                        value={form.platform}
                        onChange={handleChange}
                        >
                        <option value="github">GitHub</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter/X</option>
                        <option value="instagram">Instagram</option>
                        <option value="website">Website</option>
                        <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Handle</label>
                        <input
                        type="text"
                        className="form-control"
                        name="handle"
                        value={form.handle}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">URL</label>
                        <input
                        type="url"
                        className="form-control"
                        name="url"
                        value={form.url}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Visibility</label>
                        <select
                        className="form-select"
                        name="visibility"
                        value={form.visibility}
                        onChange={handleChange}
                        >
                        <option value="public">Public</option>
                        <option value="restricted">Restricted</option>
                        <option value="private">Private</option>
                        </select>
                    </div>

                    <div className="mt-3">
                        <button type="submit" className="btn btn-primary">
                        {editingId ? "Update Online Profile" : "Add Online Profile"}
                        </button>

                        {editingId && (
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={resetForm}
                        >
                            Cancel Edit
                        </button>
                        )}
                    </div>
                    </form>
                </div>

                <div className="card p-4">
                    <h4 className="mb-3">Existing Online Profiles</h4>
                    <ul className="list-group">
                    {profiles.map((item) => (
                        <li
                        key={item.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        >
                        <div>
                            <strong>{item.platform}</strong> — {item.url}
                            {item.handle && <span> ({item.handle})</span>}
                        </div>

                        <div>
                            <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(item)}
                            >
                            Edit
                            </button>
                            <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item.id)}
                            >
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

export default OnlineProfilesPage;