import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Save, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { assetApi } from "../../api/assetApi";
import { orgApi } from "../../api/orgApi";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const assetFormSchema = z.object({
  name: z.string().min(2, "Asset name is required"),
  categoryId: z.string().uuid("Invalid category"),
  departmentId: z.string().uuid().optional().nullable().or(z.literal("")),
  serialNumber: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable().or(z.literal("")),
  acquisitionCost: z.coerce.number().min(0).optional().nullable(),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR"]).default("NEW"),
  location: z.string().optional().nullable(),
  warrantyExpiry: z.string().optional().nullable().or(z.literal("")),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  isBookable: z.boolean().default(false),
  isShared: z.boolean().default(false),
  expectedLife: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

function AssetForm() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // File uploads state
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      departmentId: "",
      serialNumber: "",
      purchaseDate: "",
      acquisitionCost: 0,
      condition: "NEW",
      location: "",
      warrantyExpiry: "",
      brand: "",
      model: "",
      vendor: "",
      isBookable: false,
      isShared: false,
      expectedLife: 0,
      notes: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const cats = await orgApi.listCategories();
        setCategories(cats.data || cats);
        const depts = await orgApi.listDepartments();
        setDepartments(depts.data || depts);
      } catch (err) {
        toast.error("Failed to load categories/departments.");
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    const fetchAssetData = async () => {
      setIsFetching(true);
      try {
        const asset = await assetApi.getAssetById(id);
        
        // Populate form fields
        Object.keys(assetFormSchema.shape).forEach((key) => {
          let val = asset[key];
          if (key === "purchaseDate" || key === "warrantyExpiry") {
            val = val ? new Date(val).toISOString().split('T')[0] : "";
          }
          if (key === "departmentId" || key === "categoryId") {
            val = val || "";
          }
          setValue(key, val);
        });
      } catch (err) {
        toast.error("Failed to fetch asset details.");
        navigate("/assets");
      } finally {
        setIsFetching(false);
      }
    };
    fetchAssetData();
  }, [id, isEditMode, setValue, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Format empty strings to null for relations
      const submitData = {
        ...data,
        departmentId: data.departmentId || null,
        purchaseDate: data.purchaseDate || null,
        warrantyExpiry: data.warrantyExpiry || null,
      };

      let assetId = id;
      if (isEditMode) {
        await assetApi.updateAsset(id, submitData);
        toast.success("Asset updated successfully.");
      } else {
        const response = await assetApi.createAsset(submitData);
        assetId = response.id;
        toast.success("Asset registered successfully.");
      }

      // Handle photos uploads if any
      if (photos.length > 0) {
        await assetApi.uploadPhotos(assetId, photos);
      }

      // Handle documents uploads if any
      if (documents.length > 0) {
        await assetApi.uploadDocuments(assetId, documents);
      }

      setTimeout(() => {
        navigate(`/assets/${assetId}`);
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save asset. Check unique serial number.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />

      {/* Breadcrumb Header */}
      <div className="flex items-center gap-4">
        <Link to="/assets" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? "Modify Asset Info" : "Register Asset"}</h1>
          <p className="text-sm text-slate-500">Fill in the technical and purchase specifications of the resource.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="space-y-6">
          <h3 className="text-base font-bold text-indigo-600 border-b border-slate-100 pb-2">Core Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Asset Name"
              placeholder="e.g. Dell Latitude 5440"
              error={errors.name}
              {...register("name")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 outline-none focus:border-indigo-500"
                {...register("categoryId")}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <span className="text-xs text-rose-500">{errors.categoryId.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assign Department (Optional)</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 outline-none focus:border-indigo-500"
                {...register("departmentId")}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Serial Number (Unique)"
              placeholder="e.g. SN-98231-G"
              error={errors.serialNumber}
              {...register("serialNumber")}
            />
          </div>
        </Card>

        {/* Purchase & Financial Card */}
        <Card className="space-y-6">
          <h3 className="text-base font-bold text-indigo-600 border-b border-slate-100 pb-2">Financial & Warranty Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Acquisition Cost ($)"
              type="number"
              step="0.01"
              error={errors.acquisitionCost}
              {...register("acquisitionCost")}
            />

            <Input
              label="Purchase Date"
              type="date"
              error={errors.purchaseDate}
              {...register("purchaseDate")}
            />

            <Input
              label="Warranty Expiry Date"
              type="date"
              error={errors.warrantyExpiry}
              {...register("warrantyExpiry")}
            />

            <Input
              label="Expected Lifetime (Months)"
              type="number"
              error={errors.expectedLife}
              {...register("expectedLife")}
            />

            <Input
              label="Vendor / Supplier"
              placeholder="e.g. CDW Electronics"
              error={errors.vendor}
              {...register("vendor")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Condition</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                {...register("condition")}
              >
                <option value="NEW">New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Technical Specs & Location */}
        <Card className="space-y-6">
          <h3 className="text-base font-bold text-indigo-600 border-b border-slate-100 pb-2">Location & Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Location"
              placeholder="e.g. Floor 2 Server Rack C"
              error={errors.location}
              {...register("location")}
            />
            <Input
              label="Brand"
              placeholder="e.g. Lenovo, Apple"
              error={errors.brand}
              {...register("brand")}
            />
            <Input
              label="Model"
              placeholder="e.g. ThinkPad T14"
              error={errors.model}
              {...register("model")}
            />
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                id="isBookable"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-200 bg-white text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 accent-indigo-600"
                {...register("isBookable")}
              />
              <label htmlFor="isBookable" className="text-sm text-slate-500 cursor-pointer select-none">
                Make Bookable (Shared Resource)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isShared"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-200 bg-white text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 accent-indigo-600"
                {...register("isShared")}
              />
              <label htmlFor="isShared" className="text-sm text-slate-500 cursor-pointer select-none">
                Mark as Shared Resource
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                rows={3}
                placeholder="Enter technical details, spec information..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none text-sm"
                {...register("description")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Internal notes</label>
              <textarea
                rows={2}
                placeholder="Internal registry notes..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none text-sm"
                {...register("notes")}
              />
            </div>
          </div>
        </Card>

        {/* Files Upload Card */}
        <Card className="space-y-6">
          <h3 className="text-base font-bold text-indigo-600 border-b border-slate-100 pb-2">Media & Attachments</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Photos upload */}
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Asset Images</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-indigo-500/50 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setPhotos([...e.target.files])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center space-y-2">
                  <Upload className="h-8 w-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">Upload Asset Photos</p>
                  <p className="text-[10px] text-slate-500">Drag & drop or click to choose JPG, PNG, WEBP files</p>
                </div>
              </div>

              {/* Photos List Preview */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                      <ImageIcon className="h-4 w-4 text-indigo-600" />
                      <span className="truncate max-w-[120px]">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents upload */}
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Supporting Documents</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-indigo-500/50 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setDocuments([...e.target.files])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center space-y-2">
                  <Upload className="h-8 w-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">Upload Invoices, Manuals, Warranty PDF</p>
                  <p className="text-[10px] text-slate-500">Drag & drop or click to choose files</p>
                </div>
              </div>

              {/* Documents List Preview */}
              {documents.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                      <FileText className="h-4 w-4 text-amber-400" />
                      <span className="truncate max-w-[120px]">{d.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4">
          <Link to="/assets" className="w-auto">
            <Button variant="secondary" className="px-6">Cancel</Button>
          </Link>
          <Button type="submit" isLoading={isLoading} className="w-auto px-8 flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Resource
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AssetForm;
