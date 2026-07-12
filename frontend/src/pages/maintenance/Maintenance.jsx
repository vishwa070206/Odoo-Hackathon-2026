import { useState, useEffect } from "react";
import { Plus, Check, Clock, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { maintenanceApi } from "../../api/maintenanceApi";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PRIORITY_COLORS = {
  LOW: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CRITICAL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const STAGE_LABELS = {
  PENDING: "Pending Approval",
  APPROVED: "Approved / Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved / Closed",
};

function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Workflow Dialog states
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [resolution, setResolution] = useState("");
  const [cost, setCost] = useState(0);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isDeptHeadOrAbove = user && ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(user.role);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await maintenanceApi.listRequests();
      setTickets(response.data || response);
      
      const emps = await orgApi.listUsers();
      setEmployees(emps.data || emps);
    } catch (err) {
      toast.error("Failed to load maintenance tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateWorkflow = async (e) => {
    e.preventDefault();
    if (!workflowStatus) {
      toast.error("Please select a target status.");
      return;
    }

    try {
      await maintenanceApi.updateWorkflow(selectedTicket.id, workflowStatus, {
        assignedTo: assignedTechnician || null,
        resolution: resolution || null,
        cost: Number(cost) || null,
      });
      toast.success("Workflow stage updated successfully.");
      setWorkflowOpen(false);
      
      // Reset form
      setWorkflowStatus("");
      setAssignedTechnician("");
      setResolution("");
      setCost(0);

      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update workflow.");
    }
  };

  const getStageTickets = (stage) => {
    return tickets.filter((t) => {
      if (stage === "APPROVED") {
        return t.workflowStatus === "APPROVED" || t.workflowStatus === "ASSIGNED";
      }
      return t.workflowStatus === stage;
    });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance & Service Tickets</h1>
        <p className="text-sm text-slate-500">Track structural repairs, routine inspections, and monitor maintenance spend across departments.</p>
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        /* Kanban style board list view */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
          
          {["PENDING", "APPROVED", "IN_PROGRESS", "RESOLVED"].map((stage) => (
            <div key={stage} className="flex flex-col bg-white/40 border border-slate-900 rounded-3xl p-4 min-w-[250px] space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">{STAGE_LABELS[stage]}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                  {getStageTickets(stage).length}
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] scrollbar-thin">
                {getStageTickets(stage).length > 0 ? (
                  getStageTickets(stage).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (isDeptHeadOrAbove) {
                          setSelectedTicket(t);
                          setWorkflowStatus(t.workflowStatus);
                          setAssignedTechnician(t.assignedTo || "");
                          setResolution(t.resolution || "");
                          setCost(t.cost || 0);
                          setWorkflowOpen(true);
                        }
                      }}
                      className={`p-4 bg-white border border-slate-200 rounded-2xl space-y-3 cursor-pointer hover:border-slate-200 transition-all ${
                        isDeptHeadOrAbove ? "hover:scale-[1.01]" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${PRIORITY_COLORS[t.priority]}`}>
                          {t.priority}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600">{t.asset.assetTag}</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                        <span>By: {t.requester.firstName} {t.requester.lastName[0]}.</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl">
                    <Check className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500">No tickets in this stage.</p>
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Workflow Transition Dialog */}
      {workflowOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Update Service Ticket Workflow</h3>
            
            <form onSubmit={handleUpdateWorkflow} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Stage</label>
                <select
                  value={workflowStatus}
                  onChange={(e) => setWorkflowStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none"
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved / Assign Technician</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved / Closed</option>
                </select>
              </div>

              {(workflowStatus === "APPROVED" || workflowStatus === "ASSIGNED") && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assign Technician</label>
                  <select
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none"
                  >
                    <option value="">Choose Technician (Employee)</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
              )}

              {workflowStatus === "RESOLVED" && (
                <>
                  <Input
                    label="Service / Repair Cost ($)"
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolution summary</label>
                    <textarea
                      rows={3}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setWorkflowOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Apply changes</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Maintenance;
