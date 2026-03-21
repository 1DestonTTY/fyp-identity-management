import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access");
    let isAdmin = false;

    if(token){
        try{
            const payload = JSON.parse(atob(token.split(".")[1]));
            isAdmin = payload.is_staff || false;
        }catch(err){
            isAdmin = false;
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
            <Link className="navbar-brand fw-bold" to="/dashboard">Identity Profile Manager</Link>
            
            <div className="navbar-nav me-auto">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
                <Link className="nav-link" to="/profile-settings">Profile Settings</Link>
                <Link className="nav-link" to="/names">Manage Names</Link>
                <Link className="nav-link" to="/online-profiles">Online Profiles</Link>

                {isAdmin && (
                    <Link className="nav-link" to="/context-preview">Context Preview</Link>
                )}
            </div>

            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
            </button>
        </nav>
    );
}

export default Navbar;