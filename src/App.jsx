import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Register from "./pages/Register";
import Login from "./pages/Login";

import Home from "./pages/Home";

import { AuthContext, AuthContextProvider } from "./context/AuthContext";
import { ChatContextProvider } from "./context/ChatContext";

function AppContent() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) =>
    currentUser ? children : <Navigate to="/login" />;

  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
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
