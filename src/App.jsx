import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

import { AuthContext, AuthContextProvider } from "./context/AuthContext";
import { ChatContextProvider } from "./context/ChatContext";
import Loader from "./components/Loader";

function ProtectedRoute({ children }) {
  const { currentUser, isloading } = useContext(AuthContext);

  if (isloading) {
    return <Loader />;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { currentUser, isloading } = useContext(AuthContext);

  if (isloading) {
    return <Loader />;
  }

  return !currentUser ? children : <Navigate to="/" replace />;
}

function AppContent() {
  return (
    <>
    <Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  toastOptions={{
    duration: 4000,
    style: {
      background: '#f9fafb', // light gray background
      color: '#111827',      // dark text
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#10b981', // green
        secondary: '#f9fafb', // light background
      },
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: '#ef4444', // red
        secondary: '#f9fafb', // light background
      },
    },
   
  }}
/>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthContextProvider>
      <ChatContextProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ChatContextProvider>
    </AuthContextProvider>
  );
}

export default App;