import { Plus } from "lucide-react";

function RegisterButton() {
  return (
    <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition">
      <Plus size={18} />
      Register Asset
    </button>
  );
}

export default RegisterButton;