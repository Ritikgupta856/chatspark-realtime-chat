import React, { useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContext";

import Loader from "../../components/Loader/Loader";
import toast from "react-hot-toast";
import logo from "../../img/logo.png";

const profileColors = [
  "#8C1AAE", // Deep purple
  "#00BFFF", // Bright blue
  "#FF6B6B", // Vibrant red
  "#FFA500", // Orange
  "#00C853", // Bright green
  "#9575CD", // Light purple
  "#FF9100", // Amber
  "#00B8D4", // Teal
  "#F48FB1", // Pink
  "#7CB342", // Light green
  "#E91E63", // Magenta
  "#0D47A1", // Navy blue
  "#FFD600", // Yellow
  "#4CAF50", // Green
  "#673AB7", // Deep purple
];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const { currentUser, isloading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isloading && currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  const colorIndex = Math.floor(Math.random() * profileColors.length);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { displayName, email, password } = formData;

    if (!displayName || !email || !password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName });

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName,
        email,
        color: profileColors[colorIndex],
      });

      await setDoc(doc(db, "userChats", res.user.uid), {});
      toast.success("Account created successfully");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  return isloading || (!isloading && currentUser) ? (
    <Loader />
  ) : (
    <div className="register-page">
      <div className="register-container ">
        <div className="logo">
          <img src={logo} alt="logo" width={100} />
        </div>

        <span className="heading-1">Create Your Account</span>
        <span className="heading-2">Connect and chat with anyone,anywhere</span>

        <form className="form" method="POST" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="displayName"
              className="input-field"
              placeholder="Display Name"
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="Email Id"
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="Enter Password"
              onChange={handleChange}
            />
          </div>

          <button className="register-submit" disabled={loading}>
            Sign up
          </button>
        </form>

        <p className="login-cta">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
