// src/pages/DashboardPage.jsx
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  const { user, logout } = useAuth();
  
  return (
    <div className="dashboard-page">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-bold mb-4">Welcome, {user?.name || 'User'}!</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Information</h3>
          <p><strong>Email:</strong> {user?.email || 'No email provided'}</p>
          <p><strong>ID:</strong> {user?.id || 'Unknown'}</p>
        </div>
        
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
