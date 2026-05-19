// /components/Sidebar.js
export default function Sidebar() {
  return (
    <div className="w-60 bg-black text-white p-4">
      <h2 className="text-xl mb-4">Admin</h2>
      <ul className="space-y-2">
        <li>Dashboard</li>
        <li>Users</li>
        <li>Analytics</li>
      </ul>
    </div>
  );
}
