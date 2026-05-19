export default function UserTable({ users }) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Email</th>
          <th>Created</th>
          <th>Last Active</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.email}</td>
            <td>{new Date(u.createdAt).toLocaleString()}</td>
            <td>
              {u.activities?.length
                ? new Date(
                    u.activities[u.activities.length - 1].timestamp
                  ).toLocaleString()
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
