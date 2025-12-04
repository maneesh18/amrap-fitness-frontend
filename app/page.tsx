export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Welcome to Fitness Platform</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <a
          href="/users"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-2">Users</h2>
          <p className="text-gray-600">Manage users and their fitness goals</p>
        </a>
        <a
          href="/gyms"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-2">Gyms</h2>
          <p className="text-gray-600">Manage gyms and their capacity</p>
        </a>
        <a
          href="/memberships"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-2">Memberships</h2>
          <p className="text-gray-600">Manage user-gym memberships</p>
        </a>
      </div>
    </div>
  );
}
