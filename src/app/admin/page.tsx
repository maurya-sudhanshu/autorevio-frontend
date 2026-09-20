import { cookies } from "next/headers";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const cookieStr = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  let totalUsers = 0;
  let totalBusinesses = 0;
  let userDetails: any = null;

  try {
    const apiUrl = process.env.API_URL || "https://ai.storybeans.in";
    const resAuth = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { cookie: cookieStr },
      cache: "no-store"
    });
    if (resAuth.ok) {
      const authData = await resAuth.json();
      userDetails = authData.user;
    }

    const res = await fetch(`${apiUrl}/api/admin/overview`, {
      headers: { cookie: cookieStr },
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      totalUsers = data.totalUsers;
      totalBusinesses = data.totalBusinesses;
    }
  } catch (e) {
    console.error("Failed to fetch admin overview", e);
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      {userDetails && (
        <p className="text-gray-600 mb-8">
          Welcome back, <span className="font-semibold text-blue-600">{userDetails.fullName || "Admin"}</span>! 
          You are logged in as a <span className="font-semibold">admin</span>. 
          <span className="ml-2 block sm:inline text-sm">({userDetails.email})</span>
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Businesses</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalBusinesses}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">System Status</h3>
          <p className="mt-2 text-xl font-semibold text-green-600 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Operational
          </p>
        </div>
      </div>
    </div>
  );
}
