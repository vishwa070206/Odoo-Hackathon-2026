function StatCard({
  title,
  value,
  icon: Icon,
  color = "bg-blue-600",
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div className={`${color} p-3 rounded-xl text-white`}>

          <Icon size={28} />

        </div>

      </div>

    </div>
  );
}

export default StatCard;