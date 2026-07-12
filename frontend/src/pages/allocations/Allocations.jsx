import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderSync,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { allocationApi } from "../../api/allocationApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

function Allocations() {
  const [activeTab, setActiveTab] = useState("allocations");
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isDeptHeadOrAbove = user && ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(user.role);
  const isManagerOrAdmin = user && ["ADMIN", "ASSET_MANAGER"].includes(user.role);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "allocations") {
        const response = await allocationApi.listAllocations();
        setAllocations(response.data);
      } else if (activeTab === "transfers") {
        const response = await allocationApi.listTransfers();
        setTransfers(response.data);
      }
    } catch (err) {
      toast.error("Failed to load records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApproveTransfer = async (id) => {
    try {
      await allocationApi.approveTransfer(id);
      toast.success("Transfer request approved.");
      fetchData();
    } catch (err) {
      toast.error("Failed to approve transfer.");
    }
  };

  const handleRejectTransfer = async (id) => {
    try {
      await allocationApi.rejectTransfer(id);
      toast.success("Transfer request rejected.");
      fetchData();
    } catch (err) {
      toast.error("Failed to reject transfer.");
    }
  };

  const handleCompleteTransfer = async (id) => {
    try {
      await allocationApi.completeTransfer(id);
      toast.success("Transfer completed and assets re-allocated.");
      fetchData();
    } catch (err) {
      toast.error("Failed to complete transfer.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-slate-100">Asset Allocations & Transfers</h1>
        <p className="text-sm text-slate-400">Track current custody, overdue returns, and process department transfer approvals.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("allocations")}
          className={`py-2 px-6 font-semibold text-xs border-b-2 uppercase tracking-wider transition ${
            activeTab === "allocations" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Active Allocations
        </button>
        <button
          onClick={() => setActiveTab("transfers")}
          className={`py-2 px-6 font-semibold text-xs border-b-2 uppercase tracking-wider transition ${
            activeTab === "transfers" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Transfer Requests
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeTab === "allocations" ? (
        <Card className="p-0 overflow-x-auto">
          {allocations.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Asset Tag</th>
                  <th className="py-4 px-6">Asset Name</th>
                  <th className="py-4 px-6">Assigned To</th>
                  <th className="py-4 px-6">Assigned Date</th>
                  <th className="py-4 px-6">Expected Return</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-200">
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6 font-mono text-indigo-400 font-bold">{alloc.asset.assetTag}</td>
                    <td className="py-4 px-6 font-semibold">{alloc.asset.name}</td>
                    <td className="py-4 px-6">{alloc.employee.firstName} {alloc.employee.lastName}</td>
                    <td className="py-4 px-6">{new Date(alloc.allocatedDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                        alloc.allocationStatus === "OVERDUE"
                          ? "bg-rose-500/10 text-rose-450 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-455 border-emerald-500/20"
                      }`}>
                        {alloc.allocationStatus === "OVERDUE" && <AlertTriangle className="h-3 w-3" />}
                        {alloc.allocationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-center py-20">No active asset allocations found.</p>
          )}
        </Card>
      ) : (
        /* Transfer Requests List Tab */
        <Card className="p-0 overflow-x-auto">
          {transfers.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Asset Tag</th>
                  <th className="py-4 px-6">Asset</th>
                  <th className="py-4 px-6">Requested By</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Status</th>
                  {isDeptHeadOrAbove && <th className="py-4 px-6 text-right">Approvals</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-200">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6 font-mono text-indigo-400 font-bold">{t.asset.assetTag}</td>
                    <td className="py-4 px-6 font-semibold">{t.asset.name}</td>
                    <td className="py-4 px-6">{t.requester.firstName} {t.requester.lastName}</td>
                    <td className="py-4 px-6 max-w-xs truncate">{t.reason}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        t.transferStatus === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : t.transferStatus === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {t.transferStatus.replace("_", " ")}
                      </span>
                    </td>
                    {isDeptHeadOrAbove && (
                      <td className="py-4 px-6 flex justify-end gap-2 text-right">
                        {t.transferStatus === "PENDING" && (
                          <>
                            <Button onClick={() => handleApproveTransfer(t.id)} className="py-1 px-3 w-auto text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button onClick={() => handleRejectTransfer(t.id)} variant="danger" className="py-1 px-3 w-auto text-xs flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {t.transferStatus === "DEPT_HEAD_APPROVED" && isManagerOrAdmin && (
                          <Button onClick={() => handleApproveTransfer(t.id)} className="py-1 px-3 w-auto text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Final Approve
                          </Button>
                        )}
                        {t.transferStatus === "APPROVED" && isManagerOrAdmin && (
                          <Button onClick={() => handleCompleteTransfer(t.id)} className="py-1 px-3 w-auto text-xs flex items-center gap-1">
                            Complete Transfer
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-center py-20">No pending asset transfer requests found.</p>
          )}
        </Card>
      )}
    </div>
  );
}

export default Allocations;
