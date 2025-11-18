import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import * as Sentry from "@sentry/react";

import AppLayout from "./layouts/AppLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthRedirect from "./components/AuthRedirect.jsx";
import AdminRoute from "./components/admin/AdminRoute.jsx";

// Regular pages
import Lost from "./pages/Lost.jsx";
import MyLost from "./pages/MyLost.jsx";
import Found from "./pages/Found.jsx";
import MyFound from "./pages/MyFound.jsx";
import ViewPost from "./pages/ViewPost.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import EditPost from "./pages/EditPost.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm.jsx";
import Home from "./pages/Home.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import PostManagement from "./pages/admin/PostManagement.jsx";

import "./index.css";
import "./styles/admin.css";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  const tracingIntegration =
    typeof Sentry.browserTracingIntegration === "function"
      ? Sentry.browserTracingIntegration()
      : Sentry.BrowserTracing
      ? new Sentry.BrowserTracing()
      : null;

  const replayIntegration =
    typeof Sentry.replayIntegration === "function"
      ? Sentry.replayIntegration()
      : Sentry.Replay
      ? new Sentry.Replay()
      : null;

  Sentry.init({
    dsn: sentryDsn,
    integrations: [tracingIntegration, replayIntegration].filter(Boolean),
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.2),
    replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAY_SAMPLE_RATE ?? 0.0),
    environment: import.meta.env.VITE_ENVIRONMENT ?? "development",
    release: import.meta.env.VITE_SENTRY_RELEASE,
  });
}

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

        {/* Admin routes */}
        <Route element={<ProtectedRoute><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/posts" element={<PostManagement />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/lost/mine" element={<MyLost />} />
          <Route path="/found" element={<Found />} />
          <Route path="/found/mine" element={<MyFound />} />
          <Route path="/posts/:id" element={<ViewPost />} />
          <Route path="/my-posts/create" element={<CreatePost />} />
          <Route path="/my-posts/edit/:id" element={<EditPost />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Redirect all other routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
