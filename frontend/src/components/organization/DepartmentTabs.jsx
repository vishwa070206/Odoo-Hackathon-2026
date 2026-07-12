function DepartmentTabs() {
  return (
    <div className="flex gap-3">

      <button className="rounded-lg bg-blue-600 px-5 py-2 text-white">
        Departments
      </button>

      <button className="rounded-lg border px-5 py-2">
        Categories
      </button>

      <button className="rounded-lg border px-5 py-2">
        Employees
      </button>

    </div>
  );
}

export default DepartmentTabs;