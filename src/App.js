import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Home from "./pages//Home/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) =>
    currentUser ? children : <Navigate to="/login" />;

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/">
        <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          ></Route>
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
