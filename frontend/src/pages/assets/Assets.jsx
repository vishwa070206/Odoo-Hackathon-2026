import AssetSearch from "../../components/assets/AssetSearch";
import AssetFilters from "../../components/assets/AssetFilters";
import AssetTable from "../../components/assets/AssetTable";
import RegisterButton from "../../components/assets/RegisterButton";

function Assets() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Asset Directory
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all company assets
          </p>

        </div>

        <RegisterButton />

      </div>

      {/* Search */}

      <AssetSearch />

      {/* Filters */}

      <AssetFilters />

      {/* Table */}

      <AssetTable />

    </div>
  );
}

export default Assets;