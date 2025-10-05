import React, { useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Mail, Lock, AlertCircle, User } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

const profileColors = [
  "#FF3366", // Vibrant Pink
  "#4A90E2", // Ocean Blue
  "#50E3C2", // Mint Green
  "#F39C12", // Golden Orange
  "#9B59B6", // Royal Purple
  "#2ECC71", // Emerald Green
  "#E74C3C", // Crimson Red
  "#1ABC9C", // Turquoise
  "#5856D6", // Indigo
  "#FF9500", // Warm Orange
  "#34495E", // Deep Navy
  "#7F8C8D", // Cool Gray
  "#16A085", // Dark Teal
  "#8E44AD", // Deep Purple
  "#3498DB"  // Sky Blue
];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const { currentUser, isloading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isloading && currentUser) {
      navigate("/");
    }
  }, [currentUser, isloading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    } else if (formData.displayName.trim().length > 50) {
      newErrors.displayName = "Display name must be less than 50 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const { displayName, email, password } = formData;
    const colorIndex = Math.floor(Math.random() * profileColors.length);

    try {
     
      const res = await createUserWithEmailAndPassword(
        auth, 
        email.trim(), 
        password
      );

      await updateProfile(res.user, { 
        displayName: displayName.trim() 
      });

 
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName: displayName.trim(),
        email: email.trim(),
        color: profileColors[colorIndex],
        isOnline: false,
        createdAt: new Date().toISOString(),
      });

      
      await setDoc(doc(db, "userChats", res.user.uid), {});

      toast.success("Success!");
   
      await auth.signOut();
      
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Failed to create account. Please try again.";
      
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered. Please login instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        default:
          if (err.message) {
            errorMessage = err.message;
          }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isloading) {
    return <Loader />;
  }

  if (!isloading && currentUser) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl lg:text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="lg:text-base">
              Connect and chat with anyone, anywhere
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="displayName" className="lg:text-sm font-medium">
                Display Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`pl-10 placeholder:text-sm ${errors.displayName ? 'border-destructive' : ''}`}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              {errors.displayName && (
                <div className="flex items-center gap-2 lg:text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.displayName}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="lg:text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 placeholder:text-sm ${errors.email ? 'border-destructive' : ''}`}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 lg:text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="lg:text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 placeholder:text-sm ${errors.password ? 'border-destructive' : ''}`}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 lg:text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary hover:underline transition-colors"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;