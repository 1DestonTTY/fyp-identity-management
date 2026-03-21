import { useState } from "react";
import Navbar from "../components/navbar";
import api from "../api/axios";

function ContextPreviewPage() {
    const [profileId, setProfileId] = useState("");
    const [context, setContext] = useState("professional");
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchPreview = async () => {
        if(!profileId){
            setError("Please enter a profile ID.");
            return;
        }

        setError("");
        setLoading(true);
        setProfile(null);

        try{
            const response = await api.get(`/profiles/${profileId}/context-preview/?context=${context}`);
            setProfile(response.data);
        }catch(err){
            setError(
                err.response?.data?.detail || "Failed to load context preview."
            );
        }finally{
            setLoading(false);
        }
    };

    return(
        <>
            <Navbar/>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1">Context Preview</h2>
                        <p className="text-muted mb-0">
                            Admin-only preview of how a profile appears in a selected context.
                        </p>
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {loading && <div className="alert alert-info">Loading context preview...</div>}

                <div className="card p-4 shadow-sm border-0 mb-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Profile ID</label>
                            <input
                                type="number"
                                className="form-control"
                                value={profileId}
                                onChange={(e) => setProfileId(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Context</label>
                            <select
                                className="form-select"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                            >
                                <option value="legal">Legal</option>
                                <option value="professional">Professional</option>
                                <option value="social">Social</option>
                                <option value="gaming">Gaming</option>
                            </select>
                        </div>

                        <div className="col-md-4 d-flex align-items-end">
                            <button className="btn btn-primary w-100" onClick={fetchPreview}>Load Preview</button>
                        </div>
                    </div>
                </div>

                {!loading && profile && (
                    <div className="card p-4 shadow-sm border-0">
                        <h4 className="mb-3 text-capitalize">Preview Context: {context}</h4>

                        <div className="p-3 bg-light rounded mb-4">
                            <p className="mb-2">
                                <strong>Bio:</strong> {profile.bio || "N/A"}
                            </p>
                            <p className="mb-2">
                                <strong>Pronouns:</strong> {profile.pronouns || "N/A"}
                            </p>
                            {"gender_identity" in profile && (
                                <p className="mb-0">
                                <strong>Gender Identity:</strong> {profile.gender_identity || "N/A"}
                                </p>
                            )}
                        </div>

                        <h5 className="mb-3">Names</h5>
                        {profile.names && profile.names.length > 0 ? (
                            <ul className="list-group mb-4">
                                {profile.names.map((name) => (
                                <li key={name.id} className="list-group-item">
                                    <strong>{name.full_name}</strong> — {name.context} ({name.name_type})
                                </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">No names available for this context.</p>
                        )}

                        <h5 className="mb-3">Online Profiles</h5>
                        {profile.online_profiles && profile.online_profiles.length > 0 ? (
                            <ul className="list-group">
                                {profile.online_profiles.map((item) => (
                                <li key={item.id} className="list-group-item">
                                    <strong>{item.platform}</strong>
                                    {item.handle && <span> ({item.handle})</span>} —{" "}
                                    <a href={item.url} target="_blank" rel="noreferrer">
                                    {item.url}
                                    </a>
                                    <span className="ms-2 text-muted">[{item.visibility}]</span>
                                </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">No online profiles available for this context.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default ContextPreviewPage;