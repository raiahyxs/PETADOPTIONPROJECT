import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PawPrint, Home, Info, FileText, LogIn, LogOut, User, UserCircle
} from 'lucide-react';

const UserLayout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* --- USER SIDEBAR --- */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full bg-white shadow-xl z-50 w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden group flex-col justify-between border-r border-orange-100">
        <div className="h-24 flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-orange-500 p-2 rounded-xl text-white shrink-0 shadow-lg">
             <PawPrint size={28} fill="currentColor" />
          </div>
          <span className="ml-3 text-xl font-extrabold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">
            Pawsom
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Home size={24}/>} label="Home" active={isActive('/')} onClick={() => navigate('/')} />
          <NavItem icon={<Info size={24}/>} label="About" active={isActive('/about')} onClick={() => navigate('/about')} />
          
          {/* Only show User links if logged in */}
          {!user?.isGuest && (
            <>
              <NavItem icon={<FileText size={24}/>} label="My Applications" active={isActive('/my-applications')} onClick={() => navigate('/my-applications')} />
            </>
          )}
        </nav>

        <div className="p-4 mb-4">
           {user?.isGuest ? (
             <button onClick={() => navigate('/login')} className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center group-hover:justify-start hover:bg-orange-500 transition-all">
                <LogIn size={20} />
                <span className="ml-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">Sign In</span>
             </button>
           ) : (
             <div className="space-y-2">
                <div className="flex items-center p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-100 cursor-pointer" onClick={() => navigate('/profile')}>
                   <User size={20} />
                   <span className="ml-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">{user.username || user.name}</span>
                </div>
                <button onClick={onLogout} className="w-full bg-red-50 text-red-500 p-3 rounded-xl flex items-center justify-center group-hover:justify-start hover:bg-red-100 transition-all">
                  <LogOut size={20} />
                  <span className="ml-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">Log Out</span>
                </button>
             </div>
           )}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-white z-50 shadow-2xl flex justify-around items-center px-2 pb-2 rounded-t-3xl border-t border-orange-100">
          <MobileNavItem icon={<Home size={24}/>} label="Home" active={isActive('/')} onClick={() => navigate('/')} />
          
          {!user?.isGuest && (
             <MobileNavItem icon={<FileText size={24}/>} label="Status" active={isActive('/my-applications')} onClick={() => navigate('/my-applications')} />
          )}
          
          <div className="-mt-8 bg-orange-500 p-4 rounded-full text-white shadow-lg border-4 border-white transform active:scale-95 transition-transform" onClick={() => navigate('/')}>
            <PawPrint size={28} />
          </div>

          {/* --- NEW PROFILE LINK (MOBILE) --- */}
          {!user?.isGuest && (
            <MobileNavItem icon={<UserCircle size={24}/>} label="Profile" active={isActive('/profile')} onClick={() => navigate('/profile')} />
          )}

          {user?.isGuest ? (
            <MobileNavItem icon={<LogIn size={24}/>} label="Sign In" onClick={() => navigate('/login')} />
          ) : (
            <MobileNavItem icon={<LogOut size={24}/>} label="Exit" onClick={onLogout} />
          )}
      </nav>

      <main className="flex-1 md:ml-20 transition-all pb-24 md:pb-0">{children}</main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all group/item ${active ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}>
    <div className="shrink-0">{icon}</div>
    <span className="ml-3 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-xl active:bg-orange-50 ${active ? 'text-orange-600' : 'text-slate-400'}`}>
    {icon} <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);

export default UserLayout;