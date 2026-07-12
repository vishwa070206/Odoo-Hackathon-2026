import { Search } from "lucide-react";

function AssetSearch() {
  return (
    <div className="relative w-full md:w-96">
      <Search
        className="absolute left-3 top-3 text-gray-400"
        size={18}
      />

      <input
        type="text"
        placeholder="Search by tag, serial or QR code..."
        className="w-full rounded-xl border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default AssetSearch;