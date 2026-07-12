const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">
        AF
      </div>

      <div>
        <h1 className="text-xl font-bold">
          AssetFlow
        </h1>

        <p className="text-sm text-gray-500">
          Enterprise Asset Management
        </p>
      </div>
    </div>
  );
};

export default Logo;