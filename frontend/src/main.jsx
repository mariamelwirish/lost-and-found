import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout.jsx";

// PAGES
import Lost from "./pages/Lost.jsx";
import MyLost from "./pages/MyLost.jsx";
import Found from "./pages/Found.jsx";            // ← add
import MyFound from "./pages/MyFound.jsx";
import ViewPost from "./pages/ViewPost.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm.jsx";
import Home from "./pages/Home.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Everything inside AppLayout gets the Navbar & Outlet */}
        <Route element={<AppLayout />}>
          {/* LANDING → /lost (public) */}
          <Route path="/" element={<Navigate to="/lost" replace />} />

          {/* PUBLIC routes you’re building */}
          <Route path="/lost" element={<Lost />} />
          <Route path="/lost/mine" element={<MyLost />} />
          <Route path="/found" element={<Found />} />
          <Route path="/found/mine" element={<MyFound />} />

          {/* View one post (read-only) */}
          <Route path="/posts/:id" element={<ViewPost />} />
          <Route path="/my-posts/create" element={<CreatePost />} />

          {/* Auth pages (still reachable if you need them) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordConfirm />} />
          <Route path="/home" element={<Home />} />

          {/* CATCH-ALL → /lost */}
          <Route path="*" element={<Navigate to="/lost" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
