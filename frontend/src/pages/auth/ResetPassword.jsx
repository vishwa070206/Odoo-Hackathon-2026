import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { authApi } from "../../api/authApi";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset.");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      toast.success("Password reset successfully! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Token is invalid or expired. Please try again.");
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
        <h2 className="text-2xl font-bold text-slate-900">Set new password</h2>
        <p className="text-sm text-slate-500">
          Enter a secure password containing uppercase, lowercase, and numeric characters.
        </p>
      </div>

      {!token ? (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-6 text-center space-y-4">
          <p className="text-sm text-rose-400 font-medium">
            Reset token is missing from the link. Please request a new link.
          </p>
          <Link to="/forgot-password" className="block">
            <Button variant="outline">Request Reset Link</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordInput
            label="New Password"
            placeholder="••••••••"
            error={errors.password}
            {...register("password")}
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            {...register("confirmPassword")}
          />

          <Button type="submit" isLoading={isLoading} className="mt-2">
            Reset Password
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link
          to="/login"
          className="font-semibold text-sm text-indigo-600 hover:text-indigo-300 transition"
        >
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}

export default ResetPassword;