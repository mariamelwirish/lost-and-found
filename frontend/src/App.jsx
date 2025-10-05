import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ItemsPage from "./pages/Items";              // ⬅ add this
import CreatePostPage from "./pages/CreatePost.jsx"; // add this import

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Lost & Found gallery */}
        <Route path="/lost" element={<ItemsPage status="lost" />} />
        <Route path="/found" element={<ItemsPage status="found" />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}



// inside <Routes>...

