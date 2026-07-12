import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({
  label,
  error,
  ...props
}) => {

  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">

      <label className="font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">

        <input
          type={show ? "text" : "password"}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-blue-600"
          {...props}
        />

        <button
          type="button"
          className="absolute right-4 top-3"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={18}/> : <Eye size={18}/>}
        </button>

      </div>

      {error && (
        <p className="text-red-500 text-sm">
          {error}
        </p>
      )}

    </div>
  );
};

export default PasswordInput;