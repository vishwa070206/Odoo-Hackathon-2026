import { assets } from "../../data/assetData";
import StatusChip from "./StatusChip";
import { Eye, Pencil, Trash2 } from "lucide-react";

function AssetTable() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full">

        <thead className="bg-slate-100">

          <tr className="text-left">

            <th className="p-4">Tag</th>
            <th>Name</th>
            <th>Category</th>
            <th>Department</th>
            <th>Status</th>
            <th>Location</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {assets.map((asset) => (

            <tr
              key={asset.id}
              className="border-t hover:bg-slate-50"
            >

              <td className="p-4 font-medium">
                {asset.tag}
              </td>

              <td>{asset.name}</td>

              <td>{asset.category}</td>

              <td>{asset.department}</td>

              <td>
                <StatusChip status={asset.status} />
              </td>

              <td>{asset.location}</td>

              <td>

                <div className="flex gap-3">

                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye size={18} />
                  </button>

                  <button className="text-green-600 hover:text-green-800">
                    <Pencil size={18} />
                  </button>

                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>
    </div>
  );
}

export default AssetTable;