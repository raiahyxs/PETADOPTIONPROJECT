import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PawPrint, Home, Info, FileText, LogIn, LogOut, User, HelpCircle, Mail,
  LayoutDashboard, Dog, Shield, Heart, UserCircle
} from 'lucide-react';

// --- Main Layout Component ---
const Layout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full bg-white shadow-xl z-50 w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden group flex-col justify-between border-r border-orange-100">
        
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-orange-500 p-2 rounded-xl text-white shrink-0 shadow-lg">
            {isAdmin ? <Shield size={28} fill="currentColor" /> : <PawPrint size={28} fill="currentColor" />}
          </div>
          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">
            <span className="block text-xl font-extrabold text-slate-900">Pawsom</span>
            {isAdmin && <span className="text-xs font-bold text-orange-500 uppercase">Admin Panel</span>}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {isAdmin ? (
            // --- ADMIN LINKS ---
            <>
              <NavItem icon={<LayoutDashboard size={24}/>} label="Dashboard" active={isActive('/')} onClick={() => navigate('/')} />
              <NavItem icon={<Dog size={24}/>} label="Pet List" active={isActive('/inventory')} onClick={() => navigate('/inventory')} />
              <NavItem icon={<FileText size={24}/>} label="Requests" active={isActive('/requests')} onClick={() => navigate('/requests')} />
            </>
          ) : (
            // --- USER / GUEST LINKS ---
            <>
              {/* REPOSITIONED: Profile Link is now above Home */}
              {user && !user.isGuest && (
                <> </>
              )}
            
              <NavItem icon={<Home size={24}/>} label="Home" active={isActive('/')} onClick={() => navigate('/')} />
              <NavItem icon={<Heart size={24}/>} label="Adopt" active={isActive('/adopt')} onClick={() => navigate('/adopt')} />
              
              {/* My Applications (Moved down below Adopt for logical flow) */}
              {user && !user.isGuest && (
                <NavItem icon={<FileText size={24}/>} label="My Applications" active={isActive('/my-applications')} onClick={() => navigate('/my-applications')} />
              )}

              <NavItem icon={<Info size={24}/>} label="About" active={isActive('/about')} onClick={() => navigate('/about')} />
              <NavItem icon={<HelpCircle size={24}/>} label="FAQ" active={isActive('/faq')} onClick={() => navigate('/faq')} />
              <NavItem icon={<Mail size={24}/>} label="Contact" active={isActive('/contact')} onClick={() => navigate('/contact')} />
            </>
          )}
        </nav>

        {/* Bottom Actions (Sign In / Log Out) */}
        <div className="p-4 mb-4">
          {user?.isGuest ? (
            <button onClick={() => navigate('/login')} className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center group-hover:justify-start hover:bg-orange-500 transition-all">
              <LogIn size={20} />
              <span className="ml-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">Sign In</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div 
                className="flex items-center p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-100 overflow-hidden cursor-pointer"
                onClick={() => navigate('/profile')} // User info still links to profile
              >
                <User size={20} className="shrink-0" />
                <span className="ml-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75 truncate">
                  {user.username}
                </span>
              </div>
              <button onClick={onLogout} className="w-full bg-red-50 text-red-500 p-3 rounded-xl flex items-center justify-center group-hover:justify-start hover:bg-red-100 transition-all">
                <LogOut size={20} />
                <span className="ml-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR (Mobile - No change needed here) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-white z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center px-2 pb-2 rounded-t-3xl border-t border-orange-100">
        {isAdmin ? (
          <>
            <MobileNavItem icon={<LayoutDashboard size={24}/>} label="Dash" active={isActive('/')} onClick={() => navigate('/')} />
            <MobileNavItem icon={<Dog size={24}/>} label="Pets" active={isActive('/inventory')} onClick={() => navigate('/inventory')} />
            <div className="-mt-8 bg-slate-900 p-4 rounded-full text-white shadow-lg border-4 border-white" onClick={() => navigate('/')}><Shield size={28} /></div>
            <MobileNavItem icon={<FileText size={24}/>} label="Reqs" active={isActive('/requests')} onClick={() => navigate('/requests')} />
            <MobileNavItem icon={<LogOut size={24}/>} label="Exit" onClick={onLogout} />
          </>
        ) : (
          <>
            <MobileNavItem icon={<Home size={24}/>} label="Home" active={isActive('/')} onClick={() => navigate('/')} />
            <MobileNavItem icon={<Heart size={24}/>} label="Adopt" active={isActive('/adopt')} onClick={() => navigate('/adopt')} />
            
            {/* Center Button - If Guest: Sign In, If User: Profile */}
            {user?.isGuest ? (
                <div className="-mt-8 bg-slate-900 p-4 rounded-full text-white shadow-lg border-4 border-white" onClick={() => navigate('/login')}><LogIn size={28} /></div>
              ) : (
                <div className="-mt-8 bg-orange-500 p-4 rounded-full text-white shadow-lg border-4 border-white" onClick={() => navigate('/profile')}><UserCircle size={28} /></div>
              )}

            <MobileNavItem icon={<HelpCircle size={24}/>} label="FAQ" active={isActive('/faq')} onClick={() => navigate('/faq')} />
            
            {user?.isGuest ? (
              <MobileNavItem icon={<Mail size={24}/>} label="Contact" active={isActive('/contact')} onClick={() => navigate('/contact')} />
            ) : (
              // If User is logged in, show My Apps
              <MobileNavItem icon={<FileText size={24}/>} label="My Apps" active={isActive('/my-applications')} onClick={() => navigate('/my-applications')} />
            )}
          </>
        )}
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-20 transition-all pb-24 md:pb-0">
        {children}
      </main>

    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all group/item ${active ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}>
    <div className={`shrink-0 ${active ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</div>
    <span className={`ml-3 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 ${active ? 'text-orange-600' : 'text-slate-600'}`}>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-xl ${active ? 'text-orange-600' : 'text-slate-400'}`}>
    {icon} <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);

export default Layout;