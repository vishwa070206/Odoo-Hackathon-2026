import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "./Input";

const PasswordInput = React.forwardRef(({ label = "Password", placeholder = "••••••••", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        label={label}
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-200 transition"
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;