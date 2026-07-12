import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Building, Tag, Users, ChevronRight, User, Pencil, AlertCircle, ShieldAlert, Award, Ban, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const TABS = [
  { id: "departments", label: "Department Management", icon: Building },
  { id: "categories", label: "Asset Categories", icon: Tag },
  { id: "employees", label: "Employee Directory", icon: Users },
];

// ────────────────────────────────────────────────────────────
// TAB A — DEPARTMENTS
// ────────────────────────────────────────────────────────────
function DepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [headId, setHeadId] = useState("");

  const fetch = async () => {
    setIsLoading(true);
    try {
      const [depts, emps] = await Promise.all([orgApi.listDepartments(), orgApi.listUsers()]);
      setDepartments(depts.data || depts);
      setEmployees(emps.data || emps);
    } catch { toast.error("Failed to load departments."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openEdit = (dept) => {
    setEditTarget(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || "");
    setParentId(dept.parentId || "");
    setHeadId(dept.headId || "");
    setIsOpen(true);
  };

  const openCreate = () => {
    setEditTarget(null);
    setName(""); setCode(""); setDescription(""); setParentId(""); setHeadId("");
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) { toast.error("Name and code are required."); return; }
    try {
      const payload = { name, code, description, parentId: parentId || null, headId: headId || null };
      if (editTarget) {
        await orgApi.updateDepartment(editTarget.id, payload);
        toast.success("Department updated.");
      } else {
        await orgApi.createDepartment(payload);
        toast.success("Department created.");
      }
      setIsOpen(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save department."); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this department?")) return;
    try { await orgApi.deactivateDepartment(id); toast.success("Department deactivated."); fetch(); }
    catch { toast.error("Failed to deactivate."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Create, edit, or deactivate organizational units. Assign department heads and define reporting hierarchy.</p>
        <Button onClick={openCreate} className="w-auto py-2.5 px-4 text-xs font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.length > 0 ? departments.map((dept) => (
            <Card key={dept.id} className="flex flex-col justify-between space-y-3 hover:border-indigo-200 transition">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-[10px] font-bold font-mono">{dept.code}</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${dept.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>{dept.status}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{dept.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{dept.description || "No description provided."}</p>
                <div className="flex flex-col gap-1.5 pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Head: {dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : <em className="text-slate-400">Unassigned</em>}</span>
                  </div>
                  {dept.parent && (
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      <span>Parent: {dept.parent.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dept._count?.members ?? 0} members · {dept._count?.assets ?? 0} assets</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button onClick={() => openEdit(dept)} variant="secondary" className="flex-1 py-1.5 text-xs flex items-center justify-center gap-1"><Pencil className="h-3 w-3" /> Edit</Button>
                {dept.status === "ACTIVE" && (
                  <Button onClick={() => handleDeactivate(dept.id)} variant="danger" className="flex-1 py-1.5 text-xs">Deactivate</Button>
                )}
              </div>
            </Card>
          )) : (
            <Card className="col-span-3 text-center py-20">
              <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No Departments</h3>
              <p className="text-sm text-slate-400 mt-1">Create your first organizational unit.</p>
            </Card>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editTarget ? "Edit Department" : "Add Department"}</h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Department Name" placeholder="e.g. Engineering" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Code" placeholder="e.g. ENG" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Parent Department (Optional)</label>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">— None —</option>
                  {departments.filter(d => d.id !== editTarget?.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Department Head</label>
                <select value={headId} onChange={(e) => setHeadId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">— Unassigned —</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} · {e.role?.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button onClick={() => setIsOpen(false)} variant="secondary" className="w-auto px-4 py-2 text-xs">Cancel</Button>
                <Button type="submit" className="w-auto px-6 py-2 text-xs">{editTarget ? "Save Changes" : "Create Unit"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TAB B — ASSET CATEGORIES
// ────────────────────────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");

  const CATEGORY_ICONS = ["Tag","Laptop","Monitor","Car","Wrench","Cpu","Server","DoorOpen","FlaskConical","Printer","Tablet","BookOpen","Box"];

  const fetch = async () => {
    setIsLoading(true);
    try {
      const res = await orgApi.listCategories();
      setCategories(res.data || res);
    } catch { toast.error("Failed to load categories."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openEdit = (cat) => {
    setEditTarget(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIcon(cat.icon || "Tag");
    setWarrantyPeriod(cat.warrantyPeriodMonths?.toString() || "");
    setIsOpen(true);
  };

  const openCreate = () => {
    setEditTarget(null);
    setName(""); setDescription(""); setIcon("Tag"); setWarrantyPeriod("");
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) { toast.error("Category name is required."); return; }
    try {
      const payload = { name, description, icon, warrantyPeriodMonths: warrantyPeriod ? parseInt(warrantyPeriod) : null };
      if (editTarget) {
        await orgApi.updateCategory(editTarget.id, payload);
        toast.success("Category updated.");
      } else {
        await orgApi.createCategory(payload);
        toast.success("Category created.");
      }
      setIsOpen(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save category."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? Assets in this category will be unlinked.")) return;
    try { await orgApi.deleteCategory(id); toast.success("Category deleted."); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || "Cannot delete category."); }
  };

  const COLOR_MAP = {
    Electronics: "indigo", Furniture: "amber", Vehicles: "emerald",
    "IT Equipment": "violet", "Lab Equipment": "rose", "Meeting Rooms": "blue",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Manage asset categories. Define optional category-specific fields like warranty periods for Electronics.</p>
        <Button onClick={openCreate} className="w-auto py-2.5 px-4 text-xs font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.length > 0 ? categories.map((cat) => (
            <Card key={cat.id} className="flex flex-col justify-between space-y-3 hover:border-indigo-200 transition">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{cat._count?.assets ?? 0} assets</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{cat.description || "No description."}</p>
                {cat.warrantyPeriodMonths && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                    <AlertCircle className="h-3 w-3" /> Warranty: {cat.warrantyPeriodMonths} months
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button onClick={() => openEdit(cat)} variant="secondary" className="flex-1 py-1.5 text-xs flex items-center justify-center gap-1"><Pencil className="h-3 w-3" /> Edit</Button>
                <Button onClick={() => handleDelete(cat.id)} variant="danger" className="flex-1 py-1.5 text-xs">Delete</Button>
              </div>
            </Card>
          )) : (
            <Card className="col-span-3 text-center py-20">
              <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No Categories</h3>
            </Card>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editTarget ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Category Name" placeholder="e.g. Electronics, Vehicles" value={name} onChange={(e) => setName(e.target.value)} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Icon Name (Lucide)</label>
                <select value={icon} onChange={(e) => setIcon(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {CATEGORY_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Warranty Period (months, optional)</label>
                <Input type="number" placeholder="e.g. 24" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button onClick={() => setIsOpen(false)} variant="secondary" className="w-auto px-4 py-2 text-xs">Cancel</Button>
                <Button type="submit" className="w-auto px-6 py-2 text-xs">{editTarget ? "Save Changes" : "Create Category"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TAB C — EMPLOYEE DIRECTORY
// ────────────────────────────────────────────────────────────
function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState("");

  const fetch = async () => {
    setIsLoading(true);
    try {
      const [emps, rolesData] = await Promise.all([orgApi.listUsers(), orgApi.getRoles()]);
      setEmployees(emps.data || emps);
      setRoles(rolesData);
    } catch { toast.error("Failed to load employee directory."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!targetRole) { toast.error("Select a role."); return; }
    try {
      await orgApi.promoteUser(selectedUser.id, targetRole);
      toast.success("Role updated successfully.");
      setPromoteOpen(false);
      fetch();
    } catch { toast.error("Failed to update role."); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this account?")) return;
    try { await orgApi.deactivateUser(id); toast.success("Account deactivated."); fetch(); }
    catch { toast.error("Failed to deactivate."); }
  };

  const handleActivate = async (id) => {
    try { await orgApi.activateUser(id); toast.success("Account activated."); fetch(); }
    catch { toast.error("Failed to activate."); }
  };

  const ROLE_BADGE = {
    ADMIN: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    ASSET_MANAGER: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    DEPARTMENT_HEAD: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    EMPLOYEE: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.department?.name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <p className="text-sm text-slate-500">Manage employee accounts. Promote employees to Department Head or Asset Manager. This is the only place role assignments happen.</p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees…"
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-64"
        />
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" /></div>
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Employee ID</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition text-slate-800">
                  <td className="py-4 px-6 font-semibold">{emp.firstName} {emp.lastName}</td>
                  <td className="py-4 px-6 text-slate-500">{emp.email}</td>
                  <td className="py-4 px-6 font-mono text-indigo-600 font-bold">{emp.employeeId}</td>
                  <td className="py-4 px-6">{emp.department?.name || <em className="text-slate-400">None</em>}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${ROLE_BADGE[emp.role?.name] || ROLE_BADGE.EMPLOYEE}`}>
                      {emp.role?.label || emp.role?.name}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${emp.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {emp.role?.name !== "ADMIN" && (
                        <button
                          onClick={() => { setSelectedUser(emp); setTargetRole(emp.role?.name || ""); setPromoteOpen(true); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition"
                        >
                          <Award className="h-3 w-3" /> Promote
                        </button>
                      )}
                      {emp.status === "ACTIVE" ? (
                        <button
                          onClick={() => handleDeactivate(emp.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                        >
                          <Ban className="h-3 w-3" /> Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(emp.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          <CheckCircle className="h-3 w-3" /> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* Role Promotion Modal */}
      {promoteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Change Role</h3>
              <button onClick={() => setPromoteOpen(false)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            <form onSubmit={handlePromote} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assign Role</label>
                <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">— Select Role —</option>
                  {roles.filter(r => r.name !== "ADMIN").map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <ShieldAlert className="h-4 w-4 inline mr-1" />
                This is the <strong>only place</strong> roles are assigned. Choose carefully.
              </div>
              <div className="flex gap-3 justify-end">
                <Button onClick={() => setPromoteOpen(false)} variant="secondary" className="w-auto px-4 py-2 text-xs">Cancel</Button>
                <Button type="submit" className="w-auto px-6 py-2 text-xs">Apply Role</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN ORGANIZATION PAGE
// ────────────────────────────────────────────────────────────
function Organization() {
  const [activeTab, setActiveTab] = useState("departments");

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Setup</h1>
        <p className="text-sm text-slate-500 mt-1">Manage the master data that all other modules depend on — departments, asset categories, and employee roles.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-6 font-semibold text-xs border-b-2 uppercase tracking-wider whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === "departments" && <DepartmentsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "employees" && <EmployeesTab />}
      </motion.div>
    </div>
  );
}

export default Organization;