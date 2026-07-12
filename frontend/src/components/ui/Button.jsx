import React from "react";
import { Loader2 } from "lucide-react";

const Button = React.forwardRef(({
  children,
  type = "button",
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none w-full py-3 px-4";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 shadow-lg shadow-indigo-600/25",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-700",
    outline: "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-850 hover:text-white focus:ring-slate-700",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 shadow-lg shadow-rose-600/25",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;