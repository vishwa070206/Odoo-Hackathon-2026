import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { authApi } from "../../api/authApi";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      toast.success("Welcome back, login successful!");
      
      // Store token and user details
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Toaster position="top-right" />
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="text-sm text-slate-500">
          Enter your credentials to access the ERP system.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          error={errors.email}
          {...register("email")}
        />

        <div className="space-y-1">
          <PasswordInput
            label="Password"
            error={errors.password}
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-300 transition"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-200 bg-white text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 accent-indigo-600"
            {...register("rememberMe")}
          />
          <label htmlFor="rememberMe" className="text-sm text-slate-500 select-none cursor-pointer">
            Remember my session
          </label>
        </div>

        <Button type="submit" isLoading={isLoading} className="mt-2">
          Sign In
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Don't have an employee account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-300 transition"
          >
            Create account
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default Login;