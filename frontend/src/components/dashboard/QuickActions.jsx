import { Plus, Calendar, Wrench } from "lucide-react";

function QuickActions() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border">

      <h2 className="text-xl font-semibold mb-4">
        Quick Actions
      </h2>

      <div className="space-y-3">

        <button className="w-full rounded-xl bg-blue-600 text-white py-3 flex items-center justify-center gap-2 hover:bg-blue-700">
          <Plus size={18} />
          Register Asset
        </button>

        <button className="w-full rounded-xl bg-green-600 text-white py-3 flex items-center justify-center gap-2 hover:bg-green-700">
          <Calendar size={18} />
          Book Resource
        </button>

        <button className="w-full rounded-xl bg-orange-500 text-white py-3 flex items-center justify-center gap-2 hover:bg-orange-600">
          <Wrench size={18} />
          Maintenance Request
        </button>

      </div>

    </div>
  );
}

export default QuickActions;