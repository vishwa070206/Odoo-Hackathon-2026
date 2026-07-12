import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Wrench,
  Tag,
  MapPin,
  Clock,
  Printer,
  History,
  FileText,
  User,
  Plus,
  ShieldCheck,
  Building,
  Image as ImageIcon
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { assetApi } from "../../api/assetApi";
import { allocationApi } from "../../api/allocationApi";
import { maintenanceApi } from "../../api/maintenanceApi";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const [isLoading, setIsLoading] = useState(true);

  // Workflow Dialog states
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  // Form states for dialog workflows
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [allocationNotes, setAllocationNotes] = useState("");
  
  // Return workflow state
  const [returnCondition, setReturnCondition] = useState("GOOD");
  const [returnNotes, setReturnNotes] = useState("");

  // Transfer workflow state
  const [transferReason, setTransferReason] = useState("");
  const [transferToDept, setTransferToDept] = useState("");
  const [transferToUser, setTransferToUser] = useState("");

  // Maintenance workflow state
  const [maintTitle, setMaintTitle] = useState("");
  const [maintDesc, setMaintDesc] = useState("");
  const [maintPriority, setMaintPriority] = useState("MEDIUM");

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isManagerOrAdmin = user && ["ADMIN", "ASSET_MANAGER"].includes(user.role);

  const fetchAsset = async () => {
    try {
      const response = await assetApi.getAssetById(id);
      setAsset(response);
    } catch (err) {
      toast.error("Failed to load asset details.");
      navigate("/assets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
    
    // Fetch employee and department dropdown meta
    const fetchMeta = async () => {
      try {
        const users = await orgApi.listUsers();
        setEmployees(users.data || users);
        const depts = await orgApi.listDepartments();
        setDepartments(depts.data || depts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error("Please select an employee.");
      return;
    }
    try {
      await allocationApi.allocateAsset({
        assetId: asset.id,
        employeeId: selectedEmployee,
        departmentId: selectedDepartment || null,
        expectedReturnDate: expectedReturnDate || null,
        notes: allocationNotes,
      });
      toast.success("Asset allocated successfully.");
      setIsAllocationOpen(false);
      fetchAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to allocate asset.");
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    const activeAlloc = asset.allocations.find(a => a.allocationStatus === "ACTIVE" || a.allocationStatus === "OVERDUE");
    if (!activeAlloc) return;

    try {
      await allocationApi.returnAsset({
        allocationId: activeAlloc.id,
        condition: returnCondition,
        notes: returnNotes,
      });
      toast.success("Asset returned successfully.");
      setIsReturnOpen(false);
      fetchAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process asset return.");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const activeAlloc = asset.allocations.find(a => a.allocationStatus === "ACTIVE" || a.allocationStatus === "OVERDUE");
    
    try {
      await allocationApi.createTransfer({
        assetId: asset.id,
        allocationId: activeAlloc?.id || null,
        toDepartmentId: transferToDept || null,
        toUserId: transferToUser || null,
        reason: transferReason,
      });
      toast.success("Transfer request submitted successfully.");
      setIsTransferOpen(false);
      fetchAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create transfer request.");
    }
  };

  const handleMaintenance = async (e) => {
    e.preventDefault();
    if (!maintTitle || !maintDesc) {
      toast.error("Please fill in Title and Issue description.");
      return;
    }
    try {
      await maintenanceApi.createRequest({
        assetId: asset.id,
        title: maintTitle,
        description: maintDesc,
        priority: maintPriority,
      });
      toast.success("Maintenance request raised successfully.");
      setIsMaintenanceOpen(false);
      fetchAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to raise maintenance request.");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Asset Tag Label - ${asset.assetTag}</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 20px; }
            .label { border: 2px solid black; padding: 20px; display: inline-block; border-radius: 10px; }
            img { width: 150px; height: 150px; }
            h2 { margin: 10px 0 0 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label">
            <img src="${asset.qrCode}" />
            <h2>${asset.assetTag}</h2>
            <p>${asset.name}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusColor = (lifecycleStatus) => {
    switch (lifecycleStatus) {
      case "AVAILABLE": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "ALLOCATED": return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      case "MAINTENANCE": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "LOST": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const activeAllocation = asset.allocations.find(a => a.allocationStatus === "ACTIVE" || a.allocationStatus === "OVERDUE");

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/assets" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{asset.name}</h1>
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(asset.lifecycleStatus)}`}>
                {asset.lifecycleStatus.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-slate-400">Tag: <span className="font-mono text-indigo-400 font-bold">{asset.assetTag}</span> | Serial: {asset.serialNumber || "N/A"}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex gap-2 flex-wrap">
          {asset.lifecycleStatus === "AVAILABLE" && isManagerOrAdmin && (
            <Button onClick={() => setIsAllocationOpen(true)} className="flex items-center gap-2 py-2 px-4 text-xs font-semibold">
              Checkout Asset
            </Button>
          )}
          {asset.lifecycleStatus === "ALLOCATED" && (
            <>
              {isManagerOrAdmin && (
                <Button onClick={() => setIsReturnOpen(true)} variant="secondary" className="flex items-center gap-2 py-2 px-4 text-xs font-semibold">
                  Return Asset
                </Button>
              )}
              <Button onClick={() => setIsTransferOpen(true)} variant="outline" className="flex items-center gap-2 py-2 px-4 text-xs font-semibold">
                Request Transfer
              </Button>
            </>
          )}
          <Button onClick={() => setIsMaintenanceOpen(true)} variant="outline" className="flex items-center gap-2 py-2 px-4 text-xs font-semibold">
            Raise Maintenance
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2 py-2 px-4 text-xs font-semibold">
            <Printer className="h-4 w-4" /> Print Label
          </Button>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main card details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gallery or Large Image */}
            <div className="h-60 w-full rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
              {asset.photos?.[0] ? (
                <img src={`http://localhost:3001${asset.photos[0].url}`} alt={asset.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-16 w-16 text-slate-600" />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-2">Technical Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Brand / Model</p>
                  <p className="text-slate-200 mt-1 font-semibold">{asset.brand || "N/A"} {asset.model || ""}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Location</p>
                  <p className="text-slate-200 mt-1 font-semibold">{asset.location || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Category</p>
                  <p className="text-slate-200 mt-1 font-semibold">{asset.category?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Acquisition Cost</p>
                  <p className="text-slate-200 mt-1 font-semibold">{asset.acquisitionCost ? `$${Number(asset.acquisitionCost).toLocaleString()}` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Purchase Date</p>
                  <p className="text-slate-200 mt-1 font-semibold">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Warranty Expiry</p>
                  <p className="text-slate-200 mt-1 font-semibold">{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabbed area */}
          <div className="space-y-4">
            <div className="flex border-b border-slate-800">
              {["timeline", "allocations", "maintenance", "attachments"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-6 font-semibold text-xs border-b-2 transition-all uppercase tracking-wider ${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content rendering */}
            <div>
              {activeTab === "timeline" && (
                <Card className="space-y-6">
                  {asset.history?.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                      {asset.history.map((h) => (
                        <div key={h.id} className="relative">
                          {/* Circle indicator */}
                          <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-indigo-500" />
                          <div className="text-xs">
                            <span className="font-semibold text-slate-200">{h.action.replace("_", " ")}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{new Date(h.createdAt).toLocaleString()}</span>
                            <p className="text-slate-400 mt-1.5 leading-relaxed">{h.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No historical records available.</p>
                  )}
                </Card>
              )}

              {activeTab === "allocations" && (
                <Card className="p-0 overflow-hidden">
                  {asset.allocations?.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Assigned To</th>
                          <th className="p-4">Assigned Date</th>
                          <th className="p-4">Returned Date</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {asset.allocations.map((a) => (
                          <tr key={a.id}>
                            <td className="p-4 font-bold">{a.employee.firstName} {a.employee.lastName}</td>
                            <td className="p-4">{new Date(a.allocatedDate).toLocaleDateString()}</td>
                            <td className="p-4">{a.actualReturnDate ? new Date(a.actualReturnDate).toLocaleDateString() : "Active"}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                a.allocationStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              }`}>
                                {a.allocationStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-10">This asset has never been allocated.</p>
                  )}
                </Card>
              )}

              {activeTab === "maintenance" && (
                <Card className="p-0 overflow-hidden">
                  {asset.maintenanceRequests?.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Issue Title</th>
                          <th className="p-4">Priority</th>
                          <th className="p-4">Workflow Status</th>
                          <th className="p-4">Created Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {asset.maintenanceRequests.map((m) => (
                          <tr key={m.id}>
                            <td className="p-4 font-bold">{m.title}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                m.priority === "CRITICAL" || m.priority === "HIGH" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              }`}>
                                {m.priority}
                              </span>
                            </td>
                            <td className="p-4">{m.workflowStatus}</td>
                            <td className="p-4">{new Date(m.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-10">No maintenance tickets logged for this asset.</p>
                  )}
                </Card>
              )}

              {activeTab === "attachments" && (
                <Card className="space-y-4">
                  {asset.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {asset.documents.map((d) => (
                        <a
                          key={d.id}
                          href={`http://localhost:3001${d.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition"
                        >
                          <FileText className="h-6 w-6 text-amber-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">{d.name}</p>
                            <span className="text-[10px] text-slate-500">{(d.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No attachments uploaded.</p>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Right side barcode & allocation status widgets */}
        <div className="space-y-6">
          {/* QR tag card */}
          <Card className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <h4 className="font-semibold text-slate-200 text-sm">Asset ID Label</h4>
            <div className="p-4 bg-white rounded-2xl flex items-center justify-center">
              {asset.qrCode ? (
                <img src={asset.qrCode} alt="Asset QR Code" className="h-40 w-40" />
              ) : (
                <QrCode className="h-40 w-40 text-slate-400" />
              )}
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">{asset.assetTag}</span>
          </Card>

          {/* Allocation Widget info */}
          <Card className="space-y-4">
            <h4 className="font-semibold text-slate-200 text-sm">Current Allocation</h4>
            {activeAllocation ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-2xl">
                  <div className="h-8 w-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {activeAllocation.employee.firstName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{activeAllocation.employee.firstName} {activeAllocation.employee.lastName}</p>
                    <span className="text-[10px] text-slate-400">{activeAllocation.employee.email}</span>
                  </div>
                </div>
                <div className="space-y-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>Assigned Date</span>
                    <span className="text-slate-200 font-medium">{new Date(activeAllocation.allocatedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Return</span>
                    <span className="text-slate-200 font-medium">{activeAllocation.expectedReturnDate ? new Date(activeAllocation.expectedReturnDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">This asset is not currently allocated to any user.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Allocation Checkout Dialog */}
      {isAllocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Checkout Resource</h3>
            <form onSubmit={handleAllocate} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="">Choose Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Department (Optional)</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="">Choose Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Expected Return Date"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Checkout Notes</label>
                <textarea
                  rows={2}
                  value={allocationNotes}
                  onChange={(e) => setAllocationNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsAllocationOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Allocate</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Return Dialog */}
      {isReturnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Process Asset Return</h3>
            <form onSubmit={handleReturn} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Return Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="DAMAGED">Damaged / Broken</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Return Notes</label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsReturnOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Complete Return</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Transfer Request Dialog */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Request Asset Transfer</h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transfer to Department</label>
                <select
                  value={transferToDept}
                  onChange={(e) => setTransferToDept(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="">Select Target Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transfer to Employee</label>
                <select
                  value={transferToUser}
                  onChange={(e) => setTransferToUser(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="">Select Target Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reason for Transfer</label>
                <textarea
                  rows={2}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsTransferOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Submit Request</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Maintenance Request Dialog */}
      {isMaintenanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Raise Maintenance Ticket</h3>
            <form onSubmit={handleMaintenance} className="space-y-4">
              <Input
                label="Ticket Title / Summary"
                placeholder="e.g. Broken keyboard, OS not booting"
                value={maintTitle}
                onChange={(e) => setMaintTitle(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ticket Priority</label>
                <select
                  value={maintPriority}
                  onChange={(e) => setMaintPriority(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detailed Description</label>
                <textarea
                  rows={3}
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsMaintenanceOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Raise Ticket</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default AssetDetail;
