function StatusChip({ status }) {
  const colors = {
    Available: "bg-green-100 text-green-700",
    Allocated: "bg-blue-100 text-blue-700",
    Maintenance: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default StatusChip;