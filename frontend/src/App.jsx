import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login_page";
import DashboardPage from "./pages/dashboard_page";
import ProtectedRoute from "./components/protectedRoute";
import NamesPage from "./pages/name_page";
import OnlineProfilesPage from "./pages/online_profiles_page";
import ProfilePage from "./pages/profile_page";
import RegisterPage from "./pages/register_page";
import ContextPreviewPage from "./pages/context_preview_page";
import AdminRoute from "./components/adminRoute";

function App(){
    return(
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
            <Route path="/names" element={<ProtectedRoute><NamesPage/></ProtectedRoute>}/>
            <Route path="/online-profiles" element={<ProtectedRoute><OnlineProfilesPage/></ProtectedRoute>}/>
            <Route path="/profile-settings" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
            <Route path="/context-preview" element={<AdminRoute><ContextPreviewPage/></AdminRoute>}/>
        </Routes>
        </BrowserRouter>
    );
}

export default App;