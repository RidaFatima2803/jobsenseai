export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h3>{title}</h3>
      <p className="text-2xl">{value}</p>
    </div>
  );
}
