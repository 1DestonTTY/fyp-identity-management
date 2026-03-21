import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/navbar";

function ProfilePage(){
    const [profileId, setProfileId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        bio: "",
        pronouns: "",
        gender_identity: "",
    });

    const fetchMyProfile = async () => {
        try{
            const response = await api.get("/my-profile/?context=legal");

            setProfileId(response.data.id);
            setForm({
                bio: response.data.bio || "",
                pronouns: response.data.pronouns || "",
                gender_identity: response.data.gender_identity || "",
            });
        }catch(err){
            setError("Failed to load profile settings.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({...form, [name]: value,});
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
            await api.patch(`/profiles/${profileId}/`, form);
            setSuccess("Profile updated successfully.");
        }catch(err){
            setError("Failed to update profile.");
        }
    };

    const handleExportData = async () => {
        try {
            setSuccess("");
            setError("");
    
            //request the full data bundle from your new endpoint
            const response = await api.get("/export-data/");
            
            //convert the json data into a blob for downloading
            const dataStr = JSON.stringify(response.data, null, 4);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
    
            //create a temporary link and trigger the download
            const link = document.createElement("a");
            link.href = url;
            link.download = `identity_export_${response.data.user_metadata.username}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            setSuccess("Your identity data has been exported successfully!");
        }catch(err){
            setError("Failed to export data. Please try again later.");
        }
    };

    useEffect(() => {
        fetchMyProfile();
    }, []);

    return(
        <>
            <Navbar/>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1">Profile Settings</h2>
                        <p className="text-muted mb-0">Update your core profile information and identity details.</p>
                    </div>

                    <Link to="/dashboard" className="btn btn-outline-secondary">
                        Back to Dashboard
                    </Link>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="card p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Bio</label>
                            <textarea
                            className="form-control"
                            name="bio"
                            rows="4"
                            value={form.bio}
                            onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Pronouns</label>
                            <input
                            type="text"
                            className="form-control"
                            name="pronouns"
                            value={form.pronouns}
                            onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Gender Identity</label>
                            <input
                            type="text"
                            className="form-control"
                            name="gender_identity"
                            value={form.gender_identity}
                            onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>

                        <button 
                            type="button" 
                            className="btn btn-outline-secondary ms-2" 
                            onClick={handleExportData}
                        >
                            Download My Data (JSON)
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;