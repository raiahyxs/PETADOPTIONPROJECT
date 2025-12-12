import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Dog, FileText, LogOut, Shield
} from 'lucide-react';

const AdminLayout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white h-screen fixed left-0 top-0 shadow-2xl border-r border-orange-100 z-50 flex flex-col justify-between">
        
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-orange-50">
          <div className="bg-orange-500 p-2 rounded-xl text-white shrink-0 shadow-lg shadow-orange-200">
             <Shield size={24} fill="currentColor" />
          </div>
          <div className="ml-3">
            <span className="block text-xl font-extrabold text-slate-900 leading-none tracking-tight">Pawsom</span>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <AdminNavItem 
            icon={<LayoutDashboard size={22}/>} 
            label="Dashboard" 
            active={isActive('/')} 
            onClick={() => navigate('/')} 
          />
          <AdminNavItem 
            icon={<Dog size={22}/>} 
            label="List of Pets" 
            active={isActive('/inventory')} 
            onClick={() => navigate('/inventory')} 
          />
          <AdminNavItem 
            icon={<FileText size={22}/>} 
            label="Adoption Requests" 
            active={isActive('/requests')} 
            onClick={() => navigate('/requests')} 
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-orange-50">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center space-x-3 px-4 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 md:p-12 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
};

const AdminNavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-200 group ${
      active 
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
        : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
    }`}
  >
    <div className={`transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-current'}`}>
      {icon}
    </div>
    <span className="font-bold">{label}</span>
  </button>
);

export default AdminLayout;