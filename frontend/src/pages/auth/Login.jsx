import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Logo from "../../components/ui/Logo";

import { loginSchema } from "../../utils/validation";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Simulate backend delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock logged-in user
      const mockUser = {
        id: 1,
        name: "Demo User",
        email: data.email,
        role: "Employee",
        token: "demo-token",
      };

      login(mockUser);

      toast.success("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card>

        <Logo />

        <div className="mt-8 mb-8">
          <h2 className="text-3xl font-bold">
            Welcome Back
          </h2>

          <p className="mt-2 text-slate-500">
            Sign in to continue to AssetFlow ERP
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

          <Input
            label="Email Address"
            placeholder="Enter your email"
            {...register("email")}
            error={errors.email?.message}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            {...register("password")}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2">

              <input type="checkbox" />

              Remember Me

            </label>

            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          <Button type="submit">

            {loading ? "Signing In..." : "Login"}

          </Button>

        </form>

        <div className="my-6 flex items-center">

          <div className="h-px flex-1 bg-gray-300"></div>

          <span className="mx-3 text-gray-500">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-300"></div>

        </div>

        <Link to="/signup">

          <button
            className="w-full rounded-xl border border-blue-600 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Create Employee Account
          </button>

        </Link>

        <p className="mt-6 text-center text-sm text-slate-500">
          Only Employee accounts can be created.
          <br />
          Administrative roles are assigned later by an Admin.
        </p>

      </Card>
    </motion.div>
  );
}

export default Login;