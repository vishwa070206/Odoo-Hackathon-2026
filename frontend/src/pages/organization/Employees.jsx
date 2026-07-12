import { useState, useEffect } from "react";
import { User, Users, ShieldAlert, Award, Ban } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Promotion Dialog
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState("");

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await orgApi.listUsers();
      setEmployees(response.data || response);

      const rolesData = await orgApi.getRoles();
      setRoles(rolesData);
    } catch (err) {
      toast.error("Failed to load employee directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!targetRole) {
      toast.error("Please select a target role.");
      return;
    }
    try {
      await orgApi.promoteUser(selectedUser.id, targetRole);
      toast.success("User role updated successfully.");
      setPromoteOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to promote user.");
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this employee's account?")) return;
    try {
      await orgApi.deactivateUser(id);
      toast.success("Employee account deactivated.");
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to deactivate account.");
    }
  };

  const handleActivate = async (id) => {
    try {
      await orgApi.activateUser(id);
      toast.success("Employee account re-activated.");
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to activate account.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
        <p className="text-sm text-slate-500">Manage employee accounts, assign manager hierarchies, and promote employees to system roles.</p>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <Card className="p-0 overflow-x-auto">
          {employees.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Emp ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/40 transition">
                    <td className="py-4 px-6 font-mono text-indigo-600 font-bold">{emp.employeeId || "N/A"}</td>
                    <td className="py-4 px-6 font-bold">{emp.firstName} {emp.lastName}</td>
                    <td className="py-4 px-6 text-slate-500">{emp.email}</td>
                    <td className="py-4 px-6 text-slate-500">{emp.department?.name || "Unassigned"}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 uppercase tracking-wide text-[10px] font-bold">
                        {emp.role.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                        emp.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex justify-end gap-2 text-right">
                      <Button
                        onClick={() => { setSelectedUser(emp); setTargetRole(emp.roleId); setPromoteOpen(true); }}
                        className="py-1 px-3 w-auto text-xs flex items-center gap-1.5"
                      >
                        <Award className="h-3.5 w-3.5" /> Adjust Role
                      </Button>
                      {emp.status === "ACTIVE" ? (
                        <Button onClick={() => handleDeactivate(emp.id)} variant="danger" className="py-1 px-3 w-auto text-xs flex items-center gap-1.5">
                          <Ban className="h-3.5 w-3.5" /> Deactivate
                        </Button>
                      ) : (
                        <Button onClick={() => handleActivate(emp.id)} className="py-1 px-3 w-auto text-xs">
                          Re-activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-center py-20">No employee directories loaded.</p>
          )}
        </Card>
      )}

      {/* Adjust Role Promotion Dialog */}
      {promoteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Adjust System Role / Promote</h3>
            <p className="text-xs text-slate-500">Update system rights for <span className="font-bold text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</span></p>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.label} ({r.name})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setPromoteOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Apply Changes</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Employees;
