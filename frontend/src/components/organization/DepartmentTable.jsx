import { departments } from "../../data/organizationData";
import StatusBadge from "./StatusBadge";

function DepartmentTable() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 text-left">
              Department
            </th>

            <th className="text-left">
              Head
            </th>

            <th className="text-left">
              Parent
            </th>

            <th className="text-left">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {departments.map((dept) => (

            <tr
              key={dept.id}
              className="border-t"
            >

              <td className="p-4">
                {dept.department}
              </td>

              <td>
                {dept.head}
              </td>

              <td>
                {dept.parent}
              </td>

              <td>

                <StatusBadge
                  status={dept.status}
                />

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DepartmentTable;