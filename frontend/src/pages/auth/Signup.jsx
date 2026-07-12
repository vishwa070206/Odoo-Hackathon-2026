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

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...submitData } = data;
      await authApi.signup(submitData);
      toast.success("Account registered successfully! Please log in.");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Email might already be taken.");
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
        <h2 className="text-2xl font-bold text-slate-900">Create employee account</h2>
        <p className="text-sm text-slate-500">
          Enter your details to register as an organization member.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            error={errors.firstName}
            {...register("firstName")}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName}
            {...register("lastName")}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="john.doe@company.com"
          error={errors.email}
          {...register("email")}
        />

        <Input
          label="Phone Number (Optional)"
          placeholder="+1 (555) 000-0000"
          error={errors.phone}
          {...register("phone")}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword}
          {...register("confirmPassword")}
        />

        <Button type="submit" isLoading={isLoading} className="mt-2">
          Create Account
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-300 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default Signup;