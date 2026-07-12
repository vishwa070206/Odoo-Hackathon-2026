function AssetFilters() {
  return (
    <div className="flex flex-wrap gap-3">

      <select className="rounded-lg border p-2">
        <option>Category</option>
      </select>

      <select className="rounded-lg border p-2">
        <option>Status</option>
      </select>

      <select className="rounded-lg border p-2">
        <option>Department</option>
      </select>

    </div>
  );
}

export default AssetFilters;