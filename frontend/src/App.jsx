import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";   // NEW
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function Home() {
  return (
    <main className="container">
      <h1>Lost & Found</h1>
      <p>Landing page placeholder.</p>
      <nav style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign up</Link>
      </nav>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />                                  {/* NEW */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}
