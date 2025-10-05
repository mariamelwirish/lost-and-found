// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout.jsx";

// PAGES (adjust names/paths if your files differ)
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm.jsx";
import ItemsPage from "./pages/Items.jsx";
import CreatePostPage from "./pages/CreatePost.jsx";


import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* public/auth */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordConfirm />} />
          {/* items */}
          <Route path="/lost" element={<ItemsPage status="lost" />} />
          <Route path="/found" element={<ItemsPage status="found" />} />
          <Route path="/create" element={<CreatePostPage />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
