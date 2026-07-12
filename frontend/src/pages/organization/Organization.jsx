import DepartmentTabs from "../../components/organization/DepartmentTabs";
import DepartmentTable from "../../components/organization/DepartmentTable";

function Organization() {
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Organization Setup
        </h1>

        <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
          + Add Department
        </button>

      </div>

      <DepartmentTabs />

      <DepartmentTable />

    </div>
  );
}

export default Organization;