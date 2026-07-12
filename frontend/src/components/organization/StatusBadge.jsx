function StatusBadge({ status }) {
  const colors =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${colors}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;