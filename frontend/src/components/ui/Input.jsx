import React from "react";

const Input = React.forwardRef(({
  label,
  type = "text",
  placeholder,
  error,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}

      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${
          error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-500 font-medium">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;