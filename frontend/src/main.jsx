import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout.jsx";

// PAGES
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Everything inside AppLayout gets the Navbar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordConfirm />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
