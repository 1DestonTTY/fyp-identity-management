import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/navbar";

function DashboardPage() {
    const [profile, setProfile] = useState(null);
    const [context, setContext] = useState("professional");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");

    const getUsernameFromToken = () => {
        const token = localStorage.getItem("access");
        if(!token) return "";
      
        try{
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.username || "";
        }catch(err){
            return "";
        }
    };

    const fetchProfile = async (selectedContext) => {
        try{
            setLoading(true);        
            const response = await api.get(`/my-profile/?context=${selectedContext}`);
        
            setProfile(response.data);
            setError("");
        }catch(err){
            setError("Failed to load profile.");
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        setUsername(getUsernameFromToken());
        fetchProfile(context);
    }, [context]);

    return(
        <>
            <Navbar/>
            <div className="container mt-5">
                <h2 className="mb-1">Dashboard</h2>
                <p className="text-muted mb-4">Preview how your profile appears in different contexts.</p>
                
                <div className="card p-3 mb-4 shadow-sm border-0 bg-light">
                    <h5 className="mb-1">Welcome{username ? `, ${username}` : ""}</h5>
                    <p className="text-muted mb-0">
                        Use the context selector below to preview how your identity profile appears in different contexts.
                    </p>
                </div>
                
                <div className="card p-3 mb-4 shadow-sm border-0" style={{ maxWidth: "360px" }}>
                    <label className="form-label mb-2">
                        <strong>Select Context</strong>
                    </label>
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
            
                {error && <div className="alert alert-danger">{error}</div>}
                {loading && <div className="alert alert-info">Loading profile preview...</div>}

                {!loading && profile && (
                    <div className="card p-4 shadow-sm border-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="mb-0 text-capitalize">Current Context: {context}</h4>
                        </div>

                        <div className="row g-3 mb-2">
                            <div className="col-md-12">
                                <div className="p-3 bg-light rounded">
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
                            </div>
                        </div>

                        <h5 className="mt-4 mb-3">Names</h5>
                        {profile.names && profile.names.length > 0 ? (
                            <div className="row g-3 mb-4">
                                {profile.names.map((name) => (
                                    <div key={name.id} className="col-md-6">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body">
                                                <h6 className="card-title mb-2">{name.full_name || "N/A"}</h6>
                                                <p className="mb-1">
                                                <strong>Type:</strong> {name.name_type}
                                                </p>
                                                <p className="mb-1">
                                                <strong>Context:</strong> {name.context}
                                                </p>
                                                <p className="mb-1">
                                                <strong>Display Name:</strong> {name.display_name || "N/A"}
                                                </p>
                                                <p className="mb-0">
                                                <strong>Structured Name:</strong>{" "}
                                                {[name.given_name, name.middle_name, name.family_name]
                                                    .filter(Boolean)
                                                    .join(" ") || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                        <p className="text-muted">No names available for this context.</p>
                        )}

                        <h5 className="mt-4 mb-3">Online Profiles</h5>
                        {profile.online_profiles && profile.online_profiles.length > 0 ? (
                            <div className="row g-3">
                                {profile.online_profiles.map((item) => (
                                <div key={item.id} className="col-md-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body">
                                            <h6 className="card-title mb-2 text-capitalize">{item.platform}</h6>
                                            <p className="mb-1">
                                            <strong>Handle:</strong> {item.handle || "N/A"}
                                            </p>
                                            <p className="mb-1">
                                            <strong>Visibility:</strong> {item.visibility}
                                            </p>
                                            <p className="mb-0">
                                            <strong>Link:</strong>{" "}
                                            <a href={item.url} target="_blank" rel="noreferrer">
                                                {item.url}
                                            </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            ) : (
                            <p className="text-muted">No online profiles available for this context.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default DashboardPage;