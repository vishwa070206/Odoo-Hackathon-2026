import { useState, useEffect } from "react";
import { ClipboardCheck, CheckCircle2, AlertTriangle, Plus, X, Search, ShieldAlert } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { auditApi } from "../../api/auditApi";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function Audits() {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("cycles");
  const [isLoading, setIsLoading] = useState(true);

  // Form Cycle States
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [cycleDesc, setCycleDesc] = useState("");
  const [startDate, setStartDate] = useState("");

  // Auditor assignment states
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAuditor, setSelectedAuditor] = useState("");
  const [assignScope, setAssignScope] = useState("");

  // Verification Item state
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("VERIFIED");
  const [verifyNotes, setVerifyNotes] = useState("");

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isManagerOrAdmin = user && ["ADMIN", "ASSET_MANAGER"].includes(user.role);

  const fetchCycles = async () => {
    setIsLoading(true);
    try {
      const response = await auditApi.listCycles();
      setCycles(response.data || response);
      
      const emps = await orgApi.listUsers();
      setEmployees(emps.data || emps);
    } catch (err) {
      toast.error("Failed to load audit cycles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    if (!cycleName || !startDate) {
      toast.error("Cycle name and start date are required.");
      return;
    }
    try {
      await auditApi.createCycle({
        name: cycleName,
        description: cycleDesc,
        startDate: new Date(startDate).toISOString(),
      });
      toast.success("Audit cycle campaign initiated.");
      setIsCycleOpen(false);
      
      // Reset form
      setCycleName("");
      setCycleDesc("");
      setStartDate("");

      fetchCycles();
    } catch (err) {
      toast.error("Failed to create audit cycle.");
    }
  };

  const handleAssignAuditor = async (e) => {
    e.preventDefault();
    if (!selectedAuditor) {
      toast.error("Please select an auditor.");
      return;
    }
    try {
      await auditApi.assignAuditor(selectedCycle.id, selectedAuditor, assignScope);
      toast.success("Auditor assigned successfully.");
      setIsAssignOpen(false);
      
      // Reset
      setSelectedAuditor("");
      setAssignScope("");
      
      // Refetch detail
      handleViewCycle(selectedCycle.id);
    } catch (err) {
      toast.error("Failed to assign auditor.");
    }
  };

  const handleVerifyItem = async (e) => {
    e.preventDefault();
    try {
      await auditApi.verifyItem(selectedItem.id, verifyStatus, verifyNotes);
      toast.success("Asset verified successfully.");
      setIsVerifyOpen(false);
      
      // Reset
      setVerifyStatus("VERIFIED");
      setVerifyNotes("");

      handleViewCycle(selectedCycle.id);
    } catch (err) {
      toast.error("Failed to verify item.");
    }
  };

  const handleCloseCycle = async (id) => {
    if (!window.confirm("Are you sure you want to CLOSE this cycle? This will lock all verified records.")) return;
    try {
      await auditApi.closeCycle(id);
      toast.success("Audit cycle closed successfully.");
      setSelectedCycle(null);
      fetchCycles();
    } catch (err) {
      toast.error("Failed to close cycle.");
    }
  };

  const handleViewCycle = async (id) => {
    try {
      const cycleDetail = await auditApi.getCycleById(id);
      setSelectedCycle(cycleDetail);
      setActiveTab("details");
    } catch (err) {
      toast.error("Failed to load cycle details.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance & Audits</h1>
          <p className="text-sm text-slate-500">Perform routine asset checklists, verify physical inventory, and resolve discrepant reports.</p>
        </div>

        {isManagerOrAdmin && activeTab === "cycles" && (
          <Button onClick={() => setIsCycleOpen(true)} className="w-auto py-2.5 px-4 text-xs font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" /> Start Audit Cycle
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab("cycles"); setSelectedCycle(null); }}
          className={`py-2 px-6 font-semibold text-xs border-b-2 uppercase tracking-wider transition ${
            activeTab === "cycles" ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Audit Cycles
        </button>
        {selectedCycle && (
          <button
            className={`py-2 px-6 font-semibold text-xs border-b-2 uppercase tracking-wider transition border-indigo-500 text-indigo-600`}
          >
            Cycle Details Checklist
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeTab === "cycles" ? (
        /* Cycles list */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cycles.length > 0 ? (
            cycles.map((c) => (
              <Card key={c.id} className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      c.cycleStatus === "CLOSED"
                        ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {c.cycleStatus}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(c.startDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description || "No description provided."}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <Button onClick={() => handleViewCycle(c.id)} variant="outline" className="py-2 text-xs">
                    Inspect Checklist
                  </Button>
                  {c.cycleStatus !== "CLOSED" && isManagerOrAdmin && (
                    <Button onClick={() => handleCloseCycle(c.id)} variant="secondary" className="py-2 text-xs">
                      Lock & Close
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-3 text-center py-20">
              <ClipboardCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500">No Audits Campaign Found</h3>
              <p className="text-sm text-slate-500">Initiate a new cycle to assign auditors and start checking assets.</p>
            </Card>
          )}
        </div>
      ) : (
        /* Cycle checklist details render */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Auditor Scope list */}
            <Card className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">Assigned Auditors Checklist</h3>
                {selectedCycle.cycleStatus !== "CLOSED" && isManagerOrAdmin && (
                  <Button onClick={() => setIsAssignOpen(true)} className="w-auto py-1 px-3 text-xs">
                    Assign Auditor
                  </Button>
                )}
              </div>

              {selectedCycle.assignments?.length > 0 ? (
                <div className="space-y-4">
                  {selectedCycle.assignments.map((a) => (
                    <div key={a.id} className="border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-indigo-600">Auditor: {a.auditor.firstName} {a.auditor.lastName}</span>
                        <span className="text-slate-500 font-mono text-[10px]">Scope: {a.scope || "All"}</span>
                      </div>
                      
                      {/* Items table */}
                      <div className="overflow-x-auto pt-2 border-t border-slate-100">
                        <table className="w-full text-left text-[11px] text-slate-700">
                          <thead>
                            <tr className="text-slate-500 font-semibold uppercase">
                              <th className="pb-2">Asset Tag</th>
                              <th className="pb-2">Asset Name</th>
                              <th className="pb-2">Status</th>
                              {selectedCycle.cycleStatus !== "CLOSED" && <th className="pb-2 text-right">Verify</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {a.items?.map((item) => (
                              <tr key={item.id} className="border-t border-slate-100">
                                <td className="py-2.5 font-mono text-slate-500 font-bold">{item.asset.assetTag}</td>
                                <td className="py-2.5 font-semibold text-slate-700">{item.asset.name}</td>
                                <td className="py-2.5">
                                  <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border uppercase ${
                                    item.verificationStatus === "VERIFIED"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : item.verificationStatus === "PENDING"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  }`}>
                                    {item.verificationStatus}
                                  </span>
                                </td>
                                {selectedCycle.cycleStatus !== "CLOSED" && (
                                  <td className="py-2.5 text-right">
                                    <Button onClick={() => { setSelectedItem(item); setIsVerifyOpen(true); }} className="py-0.5 px-2 text-[10px] w-auto">
                                      Verify
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No auditors assigned to this cycle yet.</p>
              )}
            </Card>
          </div>

          {/* Right side Discrepancies report */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">Discrepancy Reports</h3>
              <div className="space-y-4">
                {selectedCycle.discrepancies?.length > 0 ? (
                  selectedCycle.discrepancies.map((d) => (
                    <div key={d.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-rose-600 font-bold">{d.asset.assetTag}</span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 uppercase">{d.type}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">{d.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">No discrepancies flagged during this cycle.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Start Cycle Modal */}
      {isCycleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Start New Audit Cycle</h3>
              <button onClick={() => setIsCycleOpen(false)} className="p-1 rounded bg-slate-100 hover:bg-slate-100 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              <Input
                label="Campaign Name"
                placeholder="e.g. Q3 Floor 2 IT Audit"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Campaign Description</label>
                <textarea
                  rows={2}
                  value={cycleDesc}
                  onChange={(e) => setCycleDesc(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none"
                />
              </div>

              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsCycleOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Initiate Cycle</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Auditor Modal */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Assign Auditor Scope</h3>
              <button onClick={() => setIsAssignOpen(false)} className="p-1 rounded bg-slate-100 hover:bg-slate-100 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignAuditor} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Choose Employee</label>
                <select
                  value={selectedAuditor}
                  onChange={(e) => setSelectedAuditor(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none"
                  required
                >
                  <option value="">Select Auditor</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Auditing Scope Area (Optional)"
                placeholder="e.g. Floor 2 IT devices, Rack B"
                value={assignScope}
                onChange={(e) => setAssignScope(e.target.value)}
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsAssignOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Assign Auditor</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Verify Checklist Item Modal */}
      {isVerifyOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Asset Verification Check</h3>
            <p className="text-xs text-slate-500">Verify status of <span className="font-bold text-slate-800">{selectedItem.asset.name}</span> ({selectedItem.asset.assetTag})</p>

            <form onSubmit={handleVerifyItem} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verification Result</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none"
                >
                  <option value="VERIFIED">Verified / Present</option>
                  <option value="MISSING">Missing / Lost</option>
                  <option value="DAMAGED">Damaged / Broken</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Auditor Notes</label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none"
                  placeholder="Describe location checks, condition details..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsVerifyOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Submit Verification</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default Audits;
