const activities = [
  "Laptop assigned to John",
  "Conference Room booked",
  "Projector under maintenance",
  "Audit completed",
];

function RecentActivities() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border">

      <h2 className="text-xl font-semibold mb-4">
        Recent Activities
      </h2>

      <ul className="space-y-3">

        {activities.map((item, index) => (

          <li
            key={index}
            className="border-b pb-2 text-gray-600"
          >
            • {item}
          </li>

        ))}

      </ul>

    </div>
  );
}

export default RecentActivities;