import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Grid,
  List,
  Tag,
  MapPin,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  SlidersHorizontal
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { assetApi } from "../../api/assetApi";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const LIMIT = 12;

function AssetDirectory() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isManagerOrAdmin = user && ["ADMIN", "ASSET_MANAGER"].includes(user.role);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        search: search || undefined,
        categoryId: category || undefined,
        departmentId: department || undefined,
        lifecycleStatus: status || undefined,
        condition: condition || undefined,
      };

      const data = await assetApi.listAssets(params);
      setAssets(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load assets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, category, department, status, condition]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const cats = await assetApi.getCategories();
        setCategories(cats);
        
        const depts = await orgApi.listDepartments();
        setDepartments(depts.data || depts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAssets();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await assetApi.deleteAsset(id);
      toast.success("Asset deleted successfully.");
      fetchAssets();
    } catch (err) {
      toast.error("Failed to delete asset.");
    }
  };

  const exportCSV = () => {
    if (!assets.length) {
      toast.error("No assets available to export.");
      return;
    }
    const headers = "Asset Tag,Name,Category,Location,Status,Condition,Serial Number\n";
    const rows = assets
      .map(
        (a) =>
          `"${a.assetTag}","${a.name}","${a.category?.name || ""}","${a.location || ""}","${a.lifecycleStatus}","${a.condition}","${a.serialNumber || ""}"`
      )
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const pointer = document.createElement("a");
    pointer.setAttribute("href", url);
    pointer.setAttribute("download", `AssetFlow_Export_${new Date().toISOString().slice(0,10)}.csv`);
    pointer.click();
  };

  const getStatusBadgeColor = (lifecycleStatus) => {
    switch (lifecycleStatus) {
      case "AVAILABLE": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "ALLOCATED": return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "MAINTENANCE": return "bg-amber-50 text-amber-605 border-amber-200";
      case "LOST": return "bg-rose-50 text-rose-600 border-rose-200";
      case "RETIRED": return "bg-slate-50 text-slate-500 border-slate-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header and Add button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-850">Asset Directory</h1>
          <p className="text-sm text-slate-500">Total control of organization assets, tags, warranties, and locations.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2 py-2.5 text-xs font-semibold">
            <FileSpreadsheet className="h-4 w-4" /> Export CSV
          </Button>
          {isManagerOrAdmin && (
            <Link to="/assets/new">
              <Button className="flex items-center gap-2 py-2.5 text-xs font-semibold">
                <Plus className="h-4 w-4" /> Register Asset
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tag, name, serial number..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <Button type="submit" variant="secondary" className="w-auto px-6 py-2.5 text-xs">
            Search
          </Button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Lifecycle Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="LOST">Lost</option>
            <option value="RETIRED">Retired</option>
            <option value="DISPOSED">Disposed</option>
          </select>

          {/* Condition Filter */}
          <select
            value={condition}
            onChange={(e) => { setCondition(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="">All Conditions</option>
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>

          {/* Grid/Table View toggle */}
          <div className="flex gap-2 justify-end items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-slate-200 text-indigo-600" : "text-slate-400"}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-slate-200 text-indigo-600" : "text-slate-400"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Assets Grid/Table Rendering */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : assets.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <Card key={asset.id} className="flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeColor(asset.lifecycleStatus)}`}>
                    {asset.lifecycleStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Photo or Placeholder */}
                  <div className="h-40 w-full rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {asset.photos?.[0] ? (
                      <img src={`http://localhost:3001${asset.photos[0].url}`} alt={asset.name} className="h-full w-full object-cover" />
                    ) : (
                      <Tag className="h-10 w-10 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-650 font-bold uppercase">{asset.assetTag}</span>
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1">{asset.name}</h3>
                    <p className="text-xs text-slate-500">{asset.category?.name}</p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{asset.location || "No Location"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                  <Link to={`/assets/${asset.id}`} className="flex-1">
                    <Button variant="outline" className="py-2 text-xs flex items-center justify-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                  </Link>
                  {isManagerOrAdmin && (
                    <>
                      <Link to={`/assets/edit/${asset.id}`}>
                        <Button variant="secondary" className="px-3.5 py-2">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button onClick={() => handleDelete(asset.id)} variant="danger" className="px-3.5 py-2 w-auto">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Table list view */
          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Asset Tag</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Condition</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-mono text-indigo-650 font-bold">{asset.assetTag}</td>
                    <td className="py-4 px-6 font-bold">{asset.name}</td>
                    <td className="py-4 px-6 text-slate-500">{asset.category?.name}</td>
                    <td className="py-4 px-6 text-slate-500">{asset.location || "N/A"}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeColor(asset.lifecycleStatus)}`}>
                        {asset.lifecycleStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{asset.condition}</td>
                    <td className="py-4 px-6 flex justify-end gap-2 text-right">
                      <Link to={`/assets/${asset.id}`}>
                        <Button variant="outline" className="px-3.5 py-1.5 w-auto">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {isManagerOrAdmin && (
                        <>
                          <Link to={`/assets/edit/${asset.id}`}>
                            <Button variant="secondary" className="px-3.5 py-1.5 w-auto">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button onClick={() => handleDelete(asset.id)} variant="danger" className="px-3.5 py-1.5 w-auto">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      ) : (
        <Card className="text-center py-20">
          <SlidersHorizontal className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Assets Found</h3>
          <p className="text-sm text-slate-500 mt-1">Try modifying your search query or filters.</p>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              variant="outline"
              className="py-1.5 px-4 w-auto text-xs"
            >
              Previous
            </Button>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              variant="outline"
              className="py-1.5 px-4 w-auto text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetDirectory;
