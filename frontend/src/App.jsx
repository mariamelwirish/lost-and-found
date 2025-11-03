// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";        
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import Home from "./pages/Home"; // whatever your home component is
import { ACCESS_TOKEN } from "./constants";

function RequireAuth({ children }) {
  const hasToken = !!localStorage.getItem(ACCESS_TOKEN);
  return hasToken ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* your navbar goes here */}
      <Routes>
      <Navbar />   
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

        {/* ✅ protected profile route */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* optional: default redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/__test" element={<div style={{padding:20}}>ROUTER OK</div>} />

      </Routes>
    </BrowserRouter>
  );
}
