import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Feed from "./pages/Feed";
import CreatorUpload from "./pages/CreatorUpload";
import Detail from "./pages/Detail";
import Login from "./pages/Login";
import { useAuth } from "./state/AuthProvider";

function TopBar() {
  const { me, isCreator, logout, loading } = useAuth();
  const navigate = useNavigate();

  const roleLabel = me.isAuthenticated ? (isCreator ? "Creator" : "Consumer") : "Guest";

  return (
    <div className="topbar">
      <div className="container">
        <div className="topbar-inner">
          <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <span className="brand-dot" />
            MediaMini
          </div>

          <div className="nav">
            <NavLink to="/" end>
              Feed
            </NavLink>
            {isCreator && (
              <NavLink to="/upload">
                Upload
              </NavLink>
            )}
            <NavLink to="/login">
              Login
            </NavLink>
          </div>

          <div className="spacer" />

          <span className="badge">
            <span className={`dot ${me.isAuthenticated ? "ok" : ""}`} />
            {roleLabel}
            {me.userDetails ? <span style={{ opacity: 0.8 }}>• {me.userDetails}</span> : null}
          </span>

          {me.isAuthenticated && (
            <button
              className="btn btnGhost"
              onClick={() => {
                logout();
                navigate("/");
              }}
              disabled={loading}
              title="Logout"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <TopBar />

        <div className="container">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/upload" element={<CreatorUpload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/media/:id" element={<Detail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
