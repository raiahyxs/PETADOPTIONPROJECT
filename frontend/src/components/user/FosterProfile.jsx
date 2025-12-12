// FosterProfile.jsx

import React from 'react';

import {
  User, Mail, Phone, MapPin, Settings, ShieldCheck,
  Home, Edit3, Calendar, Award, BarChart3, PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Sub-Components ---

const InfoCard = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-100 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                {React.cloneElement(icon, { size: 20 })}
            </div>
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-slate-700 font-bold text-sm truncate">{value}</p>
        </div>
    </div>
);

const CertificationTag = ({ label }) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-xs font-bold">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        {label}
    </div>
);

// ------------------------------------------
const FosterProfile = ({
  user,
  userName,
  email,
  phone,
  address,
  household,
  currentFosters,
  profileImage
}) => {
  const navigate = useNavigate();
  if (!user) return null;

  const displayUsername = userName || user.username;
  const displayAddress = address || user.location;
  const displayFosters = currentFosters || [];

  // Helper to handle Django relative Image URLs vs Base64 vs External URLs
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `http://127.0.0.1:8000${img}`; // Prepend backend URL for relative paths
  };

  const displayAvatar = getImageUrl(profileImage) || user.avatar;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-500 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-orange-500/5 border border-orange-100/50 overflow-hidden mb-6 group relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 bottom-0 w-72 h-72 bg-amber-400 rounded-full blur-3xl"></div>
        </div>

        <div className="h-40 md:h-56 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 relative">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>
        
        <div className="px-6 md:px-10 pb-8">
          <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
                <div className="relative group/avatar">
                    <div className="w-36 h-36 md:w-48 md:h-48 bg-white rounded-[2rem] p-2 shadow-2xl shadow-black/10 ring-4 ring-white/50 rotate-3 group-hover/avatar:rotate-0 transition-all duration-300">
                        <div className="w-full h-full bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 overflow-hidden relative">
                            {displayAvatar ? (
                                <img src={displayAvatar} alt={displayUsername} className="w-full h-full object-cover" />
                            ) : (
                                <User size={80} strokeWidth={1.5} />
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <Edit3 className="text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Online"></div>
                </div>
                
                <div className="text-center md:text-left pb-2">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">{displayUsername}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                            <ShieldCheck size={12} fill="currentColor" /> Foster Parent
                        </div>
                        <span className="flex items-center gap-1.5 text-sm"><MapPin size={14}/> {displayAddress || 'N/A'}</span>
                        <span className="flex items-center gap-1.5 text-sm"><Calendar size={14}/> Fostering since 2023</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
                <Settings size={18} />
                <span>Account</span>
              </button>
              {/* Navigation to the edit page (FIXED PATH) */}
              <button 
                onClick={() => navigate('/edit-profile')} 
                className="flex items-center justify-center p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Edit3 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Info & Capacity) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard icon={<Mail className="text-blue-500" />} label="Email" value={email || 'N/A'} />
                <InfoCard icon={<Phone className="text-green-500" />} label="Phone" value={phone || 'N/A'} />
                <InfoCard icon={<Home className="text-orange-500" />} label="Household" value={household || 'N/A'} />
            </div>

            {/* Capacity / Current Fosters */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Home className="text-orange-500" />
                        Current Fosters
                    </h3>
                    {/* Edit Pets button (FIXED PATH) */}
                    <button 
                        onClick={() => navigate('/edit-profile')}
                        className="text-sm font-bold text-orange-500 hover:text-orange-600"
                    >
                        Edit Pets
                    </button>
                </div>
                
                {/* Active Foster List */}
                <div className="space-y-4">
                    {displayFosters.length > 0 ? (
                        displayFosters.map((foster, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                    {foster.type === 'Dog' ? '🐕' : foster.type === 'Cat' ? '🐱' : '🐾'}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">{foster.name}</h4>
                                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{foster.breed} • {foster.age}</p>
                                  </div>
                              </div>
                              <span className="px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded-lg shadow-sm">Looking for Home</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">No current fosters listed.</p>
                    )}
                    
                    {/* Add New Slot button (FIXED PATH) */}
                    <button 
                        onClick={() => navigate('/edit-profile')}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <PlusCircle size={20} />
                        List Another Pet
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN (Stats) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Impact Stats */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-800/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-500/30 transition-all duration-500"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-orange-400">
                        <BarChart3 size={24} />
                        <h3 className="font-bold text-lg text-white">Impact Report</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Pets Currently Fostered */}
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <div className="text-3xl font-black text-white">{displayFosters.length}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase mt-1">Current Fosters</div>
                        </div>
                        
                        {/* Total Pets Helped (NOW using current fosters count for alignment) */}
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            {/* FIX APPLIED HERE: Replaced hardcoded '12' with the length of currentFosters */}
                            <div className="text-3xl font-black text-white">{displayFosters.length}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase mt-1">Total Pets Helped</div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-slate-400 text-sm">Next Availability: <span className="text-green-400 font-bold">Immediately</span></p>
                    </div>
                </div>
            </div>
            {/* --- END IMPACT STATS --- */}

            {/* Achievements / Certifications - MODIFIED SECTION */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-full">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Award size={20} className="text-slate-400"/>
                        <h3 className="text-lg font-bold text-slate-800">Certifications</h3>
                    </div>
                    {/* Edit Certifications button (FIXED PATH) */}
                    <button 
                        onClick={() => navigate('/edit-profile')}
                        className="text-sm font-bold text-orange-500 hover:text-orange-600"
                    >
                        Edit Certs
                    </button>
                </div>
                <div className="space-y-3">
                    <CertificationTag label="Verified Home Check" />
                    <CertificationTag label="Special Needs Care" />
                    <CertificationTag label="Puppy Training 101" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FosterProfile;