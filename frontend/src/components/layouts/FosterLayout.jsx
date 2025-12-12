import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, User, HelpCircle, Mail,
  PlusCircle, Heart, HeartHandshake, ChevronRight, ShieldCheck
} from 'lucide-react';

const FosterLayout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const username = user?.username || user?.name || 'Foster Parent';

  return (
    <div className="min-h-screen bg-orange-50/60 font-sans text-slate-800 flex flex-col md:flex-row selection:bg-orange-200">

      {/* --- MOBILE TOP BAR --- */}
      <header className="md:hidden fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-4 border-b border-orange-100 transition-all">
        <div className="flex items-center gap-2" onClick={() => navigate('/')}>
          <div className="p-1.5 rounded-xl text-white shadow-md bg-gradient-to-tr from-orange-500 to-amber-500">
              <ShieldCheck size={20} />
          </div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">Foster<span className="text-orange-600">Panel</span></span>
        </div>

        <div className="flex items-center gap-3">
            {/* Clickable Profile Pill */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center bg-orange-50 border border-orange-100 px-2 py-1 rounded-full max-w-[120px] active:scale-95 transition-transform cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full mr-1.5 animate-pulse shrink-0 bg-green-500"></div>
              <span className="text-xs font-bold text-slate-600 truncate">{username}</span>
            </div>

            <button onClick={onLogout} className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 text-slate-500 hover:text-red-500 transition-colors bg-white border border-slate-100 rounded-full active:bg-red-50 shadow-sm">
              <LogOut size={16} />
            </button>
        </div>
      </header>

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full shadow-2xl shadow-orange-500/5 z-50 w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden group flex-col justify-between border-r border-orange-100 bg-white/90 backdrop-blur-xl">

        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 rounded-xl text-white shrink-0 shadow-lg relative z-10 group-hover:scale-105 transition-transform bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/30">
              <ShieldCheck size={28} />
          </div>
          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">
            <span className="block text-xl font-black text-slate-800 tracking-tight">Pawsom</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
              Foster Dashboard
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-2 mt-6 relative z-10">

          {/* List New Pet (First) */}
          <NavItem icon={<PlusCircle size={22}/>} label="List New Pet" active={isActive('/add-pet')} onClick={() => navigate('/add-pet')} />
          
          {/* ⭐ ADJUSTED: My Listed Pets (Second, below List New Pet) */}
          <NavItem icon={<Heart size={22}/>} label="My Listed Pets" active={isActive('/my-pets')} onClick={() => navigate('/my-pets')} />
          

          <div className="h-px bg-slate-100 my-2 mx-2" />

          <NavItem icon={<HeartHandshake size={22}/>} label="About Us" active={isActive('/about')} onClick={() => navigate('/about')} />
          <NavItem icon={<HelpCircle size={22}/>} label="FAQ" active={isActive('/faq')} onClick={() => navigate('/faq')} />
          <NavItem icon={<Mail size={22}/>} label="Contact" active={isActive('/contact')} onClick={() => navigate('/contact')} />
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 mb-2 relative z-10">
            <div className="bg-slate-50/80 rounded-2xl p-2 border border-slate-100/50">
                <div
                  onClick={() => navigate('/profile')}
                  className="flex items-center p-2 rounded-xl overflow-hidden cursor-pointer hover:bg-white transition-colors text-orange-600"
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <User size={16} className="text-orange-500" />
                  </div>
                  <span className="ml-3 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75 truncate text-slate-700">
                    {username}
                  </span>
                </div>
                <button onClick={onLogout} className="w-full mt-1 bg-white text-slate-400 p-2 rounded-xl flex items-center justify-center group-hover:justify-start hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-slate-100">
                  <LogOut size={18} />
                  <span className="ml-3 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">Log Out</span>
                </button>
            </div>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 z-50 bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-orange-50 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-2 max-w-lg mx-auto w-full relative">

            <div className="flex flex-1 justify-evenly">
               <MobileNavItem icon={<Heart size={22}/>} label="My Pets" active={isActive('/my-pets')} onClick={() => navigate('/my-pets')} />
               <MobileNavItem icon={<HeartHandshake size={22}/>} label="About" active={isActive('/about')} onClick={() => navigate('/about')} />
            </div>

            {/* Center Add Button */}
            <div className="relative -top-6 mx-1 shrink-0 z-10">
              <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-3.5 rounded-full text-white shadow-xl shadow-orange-500/30 border-[4px] border-white active:scale-95 transition-transform cursor-pointer hover:scale-105"
                  onClick={() => navigate('/add-pet')}>
                <PlusCircle size={26} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex flex-1 justify-evenly">
               <MobileNavItem icon={<User size={22}/>} label="Profile" active={isActive('/profile')} onClick={() => navigate('/profile')} />
               <MobileNavItem icon={<HelpCircle size={22}/>} label="Help" active={isActive('/guidelines')} onClick={() => navigate('/guidelines')} />
            </div>

        </div>
      </nav>

      {/* --- MAIN CONTENT (FIXED) --- */}
      <main className="flex-1 md:pl-20 transition-all pt-20 pb-28 md:py-0 w-full">
        <div className="w-full">
            {children}
        </div>
      </main>

    </div>
  );
};

// --- Helper Components ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`relative w-full flex items-center p-3 rounded-xl transition-all duration-300 group/item overflow-hidden mb-1
    ${active ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>

    {active && <div className="absolute left-0 h-6 w-1 bg-orange-500 rounded-r-full" />}

    <div className={`shrink-0 z-10 transition-transform duration-300 group-hover/item:scale-110 ${active ? 'text-orange-600' : 'text-slate-400 group-hover/item:text-slate-700'}`}>
      {icon}
    </div>

    <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
      <span className={`font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0
        ${active ? 'text-slate-900' : 'text-slate-600'}`}>
        {label}
      </span>
      {active && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-orange-400 mr-2" />}
    </div>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-1 flex-col items-center justify-center min-w-0 py-2 rounded-2xl transition-all duration-300
    ${active ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600 active:scale-95'}`}>
    {icon}
    <span className={`text-[9px] font-bold mt-0.5 truncate w-full text-center transition-all ${active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 hidden'}`}>
      {label}
    </span>
  </button>
);

export default FosterLayout;