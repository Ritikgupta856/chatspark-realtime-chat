import "./Login.css";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../firebase";
import "react-toastify/dist/ReactToastify.css";

import { AuthContext } from "../../context/AuthContext";

import Loader from "../../components/Loader/Loader";
import toast from "react-hot-toast";
import logo from "../../img/logo.png";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(false);
  const { currentUser, isloading } = useContext(AuthContext);

  useEffect(() => {
    if (!isloading && currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    if (!email || !password) {
      toast.error("Please fill out all fields");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Logged In`);
    } catch (err) {
      toast.error("Invalid Credentials");
    }
  };

  const resetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Link is sent to your email");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return isloading || (!isloading && currentUser) ? (
    <Loader />
  ) : (
    <div className="login-page">
      <div className="login-container">
        <div className="logo">
          <img src={logo} alt="logo" width={100} />
        </div>

        <span className="heading-1">Login to Your Account</span>
        <span className="heading-2">Connect and chat with anyone,anywhere</span>

        <form className="form" method="POST" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              className="input-field"
              placeholder="Email Id"
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <input
              type="password"
              className="input-field"
              placeholder="Enter Password"
            ></input>
          </div>

          <div className="forgot-password">
            <span onClick={resetPassword}>Forgot password?</span>
          </div>

          <button type="submit" className="login-submit">
            Login
          </button>
        </form>

        <p className="register-cta">
          Don't have an account yet? <Link to="/register">Register Now</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
