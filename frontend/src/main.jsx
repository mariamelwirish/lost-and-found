import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthRedirect from "./components/AuthRedirect.jsx";

// PAGES
import Lost from "./pages/Lost.jsx";
import MyLost from "./pages/MyLost.jsx";
import Found from "./pages/Found.jsx";
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
        {/* Landing page - redirects based on auth status */}
        <Route path="/" element={<AuthRedirect><Navigate to="/login" replace /></AuthRedirect>} />
        
        {/* Auth routes (public) */}
        <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
        <Route path="/forgot" element={<AuthRedirect><ForgotPassword /></AuthRedirect>} />
        <Route path="/reset-password" element={<AuthRedirect><ResetPasswordConfirm /></AuthRedirect>} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/lost/mine" element={<MyLost />} />
          <Route path="/found" element={<Found />} />
          <Route path="/found/mine" element={<MyFound />} />
          <Route path="/posts/:id" element={<ViewPost />} />
          <Route path="/my-posts/create" element={<CreatePost />} />
        </Route>

        {/* Redirect all other routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
