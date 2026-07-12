const Input = ({
  label,
  error,
  ...props
}) => {

  return (

    <div className="space-y-2">

      <label className="font-medium text-slate-700">
        {label}
      </label>

      <input
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

    </div>

  );

};

export default Input;