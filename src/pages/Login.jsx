import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import Loader from "@/components/Loader";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { currentUser, isloading } = useContext(AuthContext);

  useEffect(() => {
    if (!isloading && currentUser) {
      navigate("/");
    }
  }, [currentUser, isloading, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
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

    setIsSubmitting(true);
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success("Welcome back!");
      // Navigation will be handled by useEffect when currentUser updates
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Invalid credentials. Please try again.";
      
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection";
          break;
        default:
          errorMessage = "Failed to sign in. Please try again";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address first");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send reset email";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later";
          break;
        default:
          errorMessage = "Something went wrong. Please try again";
      }
      
      toast.error(errorMessage);
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
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-xl lg:text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="lg:text-base">
              Sign in to your account to continue chatting
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="email" className="lg:text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  className={`pl-10 placeholder:text-sm ${errors.email ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  className={`pl-10 pr-10 placeholder:text-sm ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetPassword}
                disabled={isSubmitting}
                className="lg:text-sm hover:underline cursor-pointer p-0 h-auto"
              >
                Forgot password?
              </Button>
            </div>

            <Button 
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="font-medium text-primary hover:underline transition-colors"
            >
              Create one now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;