import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { authApi } from "../../api/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSent(true);
      toast.success("Reset link sent if account exists!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate reset request.");
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
        <h2 className="text-2xl font-bold text-slate-100">Reset your password</h2>
        <p className="text-sm text-slate-400">
          We will send a password reset link to your registered email address.
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            error={errors.email}
            {...register("email")}
          />

          <Button type="submit" isLoading={isLoading} className="mt-2">
            Send Reset Link
          </Button>
        </form>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <p className="text-sm text-slate-300">
            If an account is associated with that email address, you will receive a link to reset your password shortly.
          </p>
          <Button onClick={() => setIsSent(false)} variant="secondary">
            Send again
          </Button>
        </div>
      )}

      <div className="text-center">
        <Link
          to="/login"
          className="font-semibold text-sm text-indigo-400 hover:text-indigo-300 transition"
        >
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}

export default ForgotPassword;