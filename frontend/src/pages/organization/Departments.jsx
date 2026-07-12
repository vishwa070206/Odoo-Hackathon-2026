import { useState, useEffect } from "react";
import { Plus, X, Building, ChevronRight, User, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modals
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [headId, setHeadId] = useState("");

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await orgApi.listDepartments();
      setDepartments(response.data || response);

      const emps = await orgApi.listUsers();
      setEmployees(emps.data || emps);
    } catch (err) {
      toast.error("Failed to load departments data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Department name and code are required.");
      return;
    }
    try {
      await orgApi.createDepartment({
        name,
        code,
        description,
        parentId: parentId || null,
        headId: headId || null,
      });
      toast.success("Department created successfully.");
      setIsOpen(false);
      
      // Reset
      setName("");
      setCode("");
      setDescription("");
      setParentId("");
      setHeadId("");

      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create department.");
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this department?")) return;
    try {
      await orgApi.deactivateDepartment(id);
      toast.success("Department deactivated.");
      fetchDepartments();
    } catch (err) {
      toast.error("Failed to deactivate department.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments Setup</h1>
          <p className="text-sm text-slate-500">Configure your organization chart, assign department managers, and view structural units.</p>
        </div>

        <Button onClick={() => setIsOpen(true)} className="w-auto py-2.5 px-4 text-xs font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.length > 0 ? (
            departments.map((dept) => (
              <Card key={dept.id} className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold font-mono">
                      {dept.code}
                    </span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                      dept.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    }`}>
                      {dept.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">{dept.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{dept.description || "No description provided."}</p>

                  <div className="flex flex-col gap-1.5 pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>Manager: {dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : "Unassigned"}</span>
                    </div>
                    {dept.parent && (
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-500" />
                        <span>Parent: {dept.parent.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  {dept.status === "ACTIVE" && (
                    <Button onClick={() => handleDeactivate(dept.id)} variant="danger" className="py-2 text-xs">
                      Deactivate
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-3 text-center py-20">
              <Building className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500">No Departments Found</h3>
              <p className="text-sm text-slate-500">Configure your business units to map assets and employees custody.</p>
            </Card>
          )}
        </div>
      )}

      {/* Add Department Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add Department Unit</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded bg-slate-100 hover:bg-slate-100 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <Input
                label="Department Name"
                placeholder="e.g. Marketing, Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Department Code"
                placeholder="e.g. MKT, ENG"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Parent Department (Optional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none"
                >
                  <option value="">Select Parent Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Department Head / Manager</label>
                <select
                  value={headId}
                  onChange={(e) => setHeadId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none"
                >
                  <option value="">Select Manager</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Create Unit</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Departments;
