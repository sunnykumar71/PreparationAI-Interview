import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { StartInterview } from "./pages/StartInterview";
import { MockInterview } from "./pages/MockInterview";
import { CodingInterview } from "./pages/CodingInterview";
import { ResumeUpload } from "./pages/ResumeUpload";
import { InterviewReport } from "./pages/InterviewReport";
import { Profile } from "./pages/Profile";

// Auth Route Guard to protect private pages
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useApp();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-white/40 font-mono text-sm">Authenticating candidate session...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Private Routes */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/interview/start"
                element={
                  <RequireAuth>
                    <StartInterview />
                  </RequireAuth>
                }
              />
              <Route
                path="/interview/mock/:sessionId"
                element={
                  <RequireAuth>
                    <MockInterview />
                  </RequireAuth>
                }
              />
              <Route
                path="/interview/coding/:sessionId"
                element={
                  <RequireAuth>
                    <CodingInterview />
                  </RequireAuth>
                }
              />
              <Route
                path="/resume/upload"
                element={
                  <RequireAuth>
                    <ResumeUpload />
                  </RequireAuth>
                }
              />
              <Route
                path="/interview/report/:sessionId"
                element={
                  <RequireAuth>
                    <InterviewReport />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
