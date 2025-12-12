import React, { useState, useEffect, useCallback } from 'react';

import { 
  CheckCircle, XCircle, Clock, Search, Sparkles, Mail, 
  AlertTriangle, Check, X, Eye, User, 
  Calendar, PawPrint, Phone, MapPin, ChevronRight, Home, HeartHandshake,
  PhoneCall, FileText, 
} from 'lucide-react';

// --- Configuration ---
const API_BASE = 'http://127.0.0.1:8000/api/';
const USER_PROFILE_API = `${API_BASE}user-profile/`;

// --- Mock Data Generator: Requests ---
const GENERATE_MOCK_REQUESTS = () => [
  { 
    id: 101, 
    requester_name: 'Alice Johnson', 
    email: 'alice@example.com', 
    pet_name: 'Max (Dog)', 
    created_at: '2025-11-20T10:00:00Z', 
    status: 'Pending',
    requester_phone: '+63 987 654 3212', 
    address: 'Cebu City, Philippines', 
    reason: 'I have a large yard and experience with large breeds. Max would be a great companion for my morning runs.', 
    household: 'Family with kids (Ages 8 and 10). Two adults working from home.', 
    verification_notes: '', 
  },
  { 
    id: 104, 
    requester_name: 'David Lee', 
    email: 'david.lee@web.com', 
    pet_name: 'Coco (Parrot)', 
    created_at: '2025-11-21T11:00:00Z', 
    status: 'Verification', 
    requester_phone: '212-555-0101', 
    address: '10 Park Ave, New York, USA', 
    reason: 'I live in an apartment and am looking for a companion that doesn\'t require large amounts of outdoor space. I have experience with exotic birds.', 
    household: 'Single adult, works full-time in finance (9-5).', 
    verification_notes: 'Spoke to David. Sounds knowledgeable about birds and prepared for apartment living. He plans to purchase a large cage immediately. Tentative approval.', 
  },
  { 
    id: 102, 
    requester_name: 'Bob Smith', 
    email: 'bob@example.com', 
    pet_name: 'Luna (Cat)', 
    created_at: '2025-11-19T14:30:00Z', 
    status: 'Approved',
    requester_phone: '555-5678',
    address: '45 Oak Ave, Sometown, USA',
    reason: 'Luna seems like a quiet, indoor cat, which fits perfectly with my apartment lifestyle. I work from home.',
    household: 'One adult, lives in a quiet third-floor apartment.',
    verification_notes: 'Successful call. Confirmed WFH status and landlord permission. Approved.', 
  },
  { 
    id: 103, 
    requester_name: 'Charlie Brown', 
    email: 'charlie@example.com', 
    pet_name: 'Mittens (Cat)', 
    created_at: '2025-11-18T08:15:00Z', 
    status: 'Rejected',
    requester_phone: '555-9012',
    address: '78 Pine Ln, Villagetown, USA',
    reason: 'I want a cat to keep my current cat company, but I work 12-hour shifts. (Rejected for long hours/current pet compatibility)',
    household: 'One adult, one existing senior cat. Works long hours.',
    verification_notes: 'Initial rejection based on 12-hour shifts and potential stress on current pet.', 
  },
];

// --- Mock Data Generator: Profile ---
const GENERATE_MOCK_PROFILE = () => ({
    username: 'AdminUser',
    first_name: 'Shelter',
    last_name: 'Manager',
    email: 'manager@shelter.org',
});

// --- API Functions ---
const api = {
  fetchRequests: async () => {
    try {
      const res = await fetch(`${API_BASE}applications/`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.warn("Requests Backend unreachable, using mock data:", error.message);
      return GENERATE_MOCK_REQUESTS();
    }
  },
  updateStatus: async (id, newStatus, notes) => {
    const body = { status: newStatus };
    if (notes !== undefined) {
        body.verification_notes = notes; 
    }
    
    try {
      const res = await fetch(`${API_BASE}applications/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return await res.json();
    } catch (error) {
      console.warn(`[MOCK] Status update failed for ${id} (Status: ${newStatus}, Notes: ${notes}). Using mock update logic.`, error.message);
      return { id, status: newStatus, verification_notes: notes }; 
    }
  },
  fetchProfile: async () => {
    try {
        const res = await fetch(USER_PROFILE_API);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
      console.warn("User Profile API unreachable, using mock data:", error.message);
      return GENERATE_MOCK_PROFILE();
    }
  },
};

// --- Helper Functions & Components ---

const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200/60 ring-yellow-500/10',
    Verification: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10',
    Approved: 'bg-green-50 text-green-700 border-green-200/60 ring-green-500/10',
    Rejected: 'bg-red-50 text-red-700 border-red-200/60 ring-red-500/10'
  };
  const icons = {
    Pending: <Clock size={12} strokeWidth={2.5} />,
    Verification: <PhoneCall size={12} strokeWidth={2.5} />,
    Approved: <CheckCircle size={12} strokeWidth={2.5} />,
    Rejected: <XCircle size={12} strokeWidth={2.5} />
  };
  const statusKey = status in styles ? status : 'Pending';
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ring-1 ${styles[statusKey]}`}>
      {icons[statusKey]}
      {statusKey}
    </span>
  );
};

const DetailCard = ({ icon: Icon, title, children, className = '' }) => (
    <div className={`bg-white p-4 md:p-5 rounded-3xl shadow-lg border border-slate-100 ${className}`}>
      <h3 className="text-base font-extrabold text-orange-700 mb-4 flex items-center gap-2 border-b border-orange-50/70 pb-2">
        <Icon size={18} className="text-orange-500" />
        {title}
      </h3>
      <div className="space-y-4 text-sm">
        {children}
      </div>
    </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start">
      <Icon size={14} className="text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
      <p className="flex flex-col">
        <span className="font-medium text-slate-500 text-[11px] uppercase tracking-wider">{label}</span>
        <span className="font-bold text-slate-800 break-words text-sm mt-0.5">{value}</span>
      </p>
    </div>
);

const ActionButton = ({ label, onClick, icon: Icon, className = '', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      // w-full on mobile, auto on larger screens
      className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center py-3 px-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all duration-150 shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${className} ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
      title={`${label} Request`}
    >
      <Icon size={16} className="mr-2" />
      {label}
    </button>
);


// ----------------------------------------------------------------------
// --- RequestDetailDrawer Component (CENTERED, SCROLLABLE, RESPONSIVE) ---
// ----------------------------------------------------------------------

const RequestDetailDrawer = ({ request, onClose, onUpdateStatus }) => {
  if (!request) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [callNotes, setCallNotes] = useState(request.verification_notes || ''); 
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setCallNotes(request.verification_notes || '');
  }, [request.verification_notes]);

  const {
    id, applicant, email, pet, date, status, phone, address, reason, household,
  } = request;

  const isPending = status === 'Pending';
  const isVerification = status === 'Verification';
  const isFinalized = status === 'Approved' || status === 'Rejected';
  
  const handleSaveNotes = () => {
      console.log(`[SIMULATED SAVE] Saving notes for Request ${id}: ${callNotes}`);
      onUpdateStatus(id, status, false, callNotes); 
      setIsNoteSaved(true);
      setTimeout(() => setIsNoteSaved(false), 2000); 
  };

  return (
    // Outer Container: Fixed, full screen, Flex centered for "Center Most" alignment
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"> 
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Panel: Flex col for sticky header/footer, Max-Height constrained */}
      <div 
        className="
          relative w-full max-w-4xl 
          bg-[#fffaf5] rounded-[2rem] md:rounded-[2.5rem] 
          shadow-2xl border border-orange-200/50 
          flex flex-col 
          max-h-[90vh] /* Ensures modal fits within screen vertically */
          transition-all duration-300 transform
        "
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
          
          {/* --- Header (Fixed at Top) --- */}
          <div className="flex-shrink-0 p-4 md:p-6 bg-white/95 backdrop-blur-md border-b border-orange-100/50 rounded-t-[2rem] md:rounded-t-[2.5rem]">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5 md:p-6 rounded-3xl shadow-xl shadow-orange-500/40">
              <div className='flex justify-between items-start'>
                <h2 id="modal-title" className="text-2xl md:text-3xl font-black text-white">Adoption Request</h2>
                <button type="button" className="h-9 w-9 flex items-center justify-center rounded-full text-white bg-white/30 hover:bg-white/40 transition shadow-inner" onClick={onClose} title="Close">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
              <p className="text-white/90 font-bold text-base md:text-lg mt-2 flex items-center gap-2">
                <PawPrint size={18} className="text-white/80" /> {pet}
              </p>
              <div className="mt-3">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>


          {/* --- Content Body (Scrollable Middle Section) --- */}
          <div className="p-4 md:p-6 space-y-5 overflow-y-auto"> 
            
            {/* Applicant & Contact Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"> 
                <DetailCard icon={User} title="Applicant Contact" className="lg:col-span-2"> 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailItem icon={User} label="Name" value={applicant} />
                        <DetailItem icon={Phone} label="Phone" value={phone || 'N/A'} />
                        <DetailItem icon={Mail} label="Email" value={email} />
                        <DetailItem icon={Calendar} label="Date Submitted" value={formatDate(date)} />
                    </div>
                </DetailCard>
                <DetailCard icon={MapPin} title="Location" className="lg:col-span-1">
                    <DetailItem icon={MapPin} label="Address" value={address || 'N/A'} />
                </DetailCard>
            </div>

            {/* Household and Reason */}
            <DetailCard icon={HeartHandshake} title="Adoption Rationale">
                <div className="pb-3 border-b border-slate-100">
                    <p className="text-sm font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                        <PawPrint size={16} className='text-orange-500' /> Applicant's Motivation
                    </p>
                    <p className="text-slate-700 leading-relaxed italic text-sm p-4 bg-orange-50/70 border-l-4 border-orange-400 rounded-xl shadow-inner shadow-orange-100/50">
                        {reason || 'No detailed reason provided.'}
                    </p>
                </div>
                <div>
                    <p className="text-sm font-extrabold text-slate-800 mb-2 pt-3 flex items-center gap-2">
                        <Home size={16} className='text-blue-500' /> Home Environment
                    </p>
                    <p className="text-slate-700 leading-relaxed text-sm p-4 bg-blue-50/70 border-l-4 border-blue-400 rounded-xl shadow-inner shadow-blue-100/50">
                        {household || 'No household details provided.'}
                    </p>
                </div>
            </DetailCard>

            {/* --- Verification Call Section --- */}
            {(isVerification || isFinalized) && (
                <DetailCard icon={PhoneCall} title="Verification Call & Notes" className="mt-5 border-indigo-200">
                    
                    {isVerification && (
                        <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-indigo-800 font-bold text-sm mb-4">
                            <PhoneCall size={18} />
                            <p>Use the contact details above to conduct the screening interview.</p>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <label htmlFor="call-notes" className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <FileText size={14} /> Interview Summary & Assessment
                        </label>
                        <textarea
                            id="call-notes"
                            value={callNotes}
                            onChange={(e) => {
                                setCallNotes(e.target.value);
                                setIsNoteSaved(false);
                            }}
                            disabled={isFinalized}
                            rows={4}
                            placeholder={isFinalized ? "Notes from the final verification call." : "Record key talking points, concerns, and final recommendation here..."}
                            className={`w-full p-4 border rounded-xl shadow-inner text-sm transition ${isFinalized ? 'bg-slate-50 text-slate-500' : 'bg-white border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`}
                        />
                        
                        {!isFinalized && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={!callNotes}
                                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:bg-indigo-300"
                                >
                                    {isNoteSaved ? <><Check size={14} className='inline mr-1' /> Notes Saved!</> : 'Save Notes'}
                                </button>
                            </div>
                        )}
                        {isFinalized && !callNotes && (
                            <p className='text-sm text-red-500'>No verification notes were recorded for this application.</p>
                        )}
                    </div>
                </DetailCard>
            )}
            
            {/* Finalized Status Message */}
            {status === 'Approved' && (
                <div className="flex items-center gap-2 bg-green-100 p-4 rounded-2xl border border-green-300 text-green-800 font-bold text-sm">
                    <CheckCircle size={18} />
                    <p>Status is **APPROVED**. Coordinate final transfer of the pet.</p>
                </div>
            )}
            {status === 'Rejected' && (
                <div className="flex items-center gap-2 bg-red-100 p-4 rounded-2xl border border-red-300 text-red-800 font-bold text-sm">
                    <XCircle size={18} />
                    <p>Status is **REJECTED**. The applicant has been notified.</p>
                </div>
            )}
          </div>

          {/* --- Action Bar Footer (Fixed at Bottom) --- */}
          <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-[2rem] md:rounded-b-[2.5rem]">
            
            {/* Actions for Pending Stage */}
            {isPending && (
              <>
                <ActionButton 
                  label="Reject" 
                  icon={X}
                  onClick={() => onUpdateStatus(id, 'Rejected', true, callNotes)} 
                  className="bg-red-500 text-white hover:bg-red-600 shadow-red-500/50"
                />
                <ActionButton 
                  label="Verify" 
                  icon={PhoneCall}
                  onClick={() => onUpdateStatus(id, 'Verification', false, callNotes)} 
                  className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/50"
                />
              </>
            )}

            {/* Actions for Verification Stage */}
            {isVerification && (
                <>
                    <ActionButton 
                        label="Reject" 
                        icon={X}
                        onClick={() => onUpdateStatus(id, 'Rejected', true, callNotes)} 
                        className="bg-red-500 text-white hover:bg-red-600 shadow-red-500/50"
                        disabled={!callNotes.trim()} 
                    />
                    <ActionButton 
                        label="Approve" 
                        icon={Check}
                        onClick={() => onUpdateStatus(id, 'Approved', true, callNotes)} 
                        className="bg-green-500 text-white hover:bg-green-600 shadow-green-500/50"
                        disabled={!callNotes.trim()} 
                    />
                </>
            )}

            {/* Default/Finalized Action and Close Button */}
            {(isFinalized || isPending || isVerification) && (
                <button 
                  onClick={onClose} 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-200 transition active:scale-[0.98]"
              >
                <ChevronRight size={16} className="mr-2 rotate-180" /> Back
              </button>
            )}
          </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// --- Main AdminRequests Component (UNCHANGED) ---
// ----------------------------------------------------------------------

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const [userProfile, setUserProfile] = useState(null);

  const loadProfile = useCallback(async () => {
    const data = await api.fetchProfile();
    setUserProfile({
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
      email: data.email || 'N/A',
    });
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const data = await api.fetchRequests();
    
    const mappedRequests = data.map(req => ({
      id: req.id,
      applicant: req.requester_name || 'N/A', 
      email: req.email || 'name@gmail.com',
      pet: req.pet_name || req.pet?.name || 'N/A', 
      date: req.created_at ? formatDate(req.created_at) : 'N/A',
      status: req.status || 'Pending',
      phone: req.requester_phone || null, 
      address: req.address || null,       
      reason: req.reason || null,
      household: req.household || null,
      verification_notes: req.verification_notes || '',
    }));
    
    setRequests(mappedRequests);
    
    const isUsingMock = data.length > 0 && data.some(req => req.requester_name === 'Alice Johnson');
    setIsMock(isUsingMock);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
    loadProfile(); 
  }, [loadRequests, loadProfile]);

  const handleStatusUpdate = async (id, newStatus, shouldCloseDrawer, notes = '') => {
    // Optimistic UI update
    setRequests(prev => prev.map(req => req.id === id ? { 
        ...req, 
        status: newStatus,
        verification_notes: notes 
    } : req));

    if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => ({ 
            ...prev, 
            status: newStatus,
            verification_notes: notes
        }));
    }

    if (shouldCloseDrawer) {
        setSelectedRequest(null);
    }
    
    try {
      await api.updateStatus(id, newStatus, notes); 
    } catch (error) {
      console.error("Update failed, reloading:", error);
      loadRequests();
    }
  };

  const filteredRequests = requests
    .slice() 
    .sort((a, b) => {
        const statusOrder = { 'Pending': 1, 'Verification': 2, 'Approved': 3, 'Rejected': 4 };
        return statusOrder[a.status] - statusOrder[b.status];
    })
    .filter(req =>
      (req.applicant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.pet || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openDetailDrawer = (request) => {
    setSelectedRequest(request);
  };
  
  const closeDetailDrawer = () => {
    setSelectedRequest(null);
  };

  return (
    // Main container uses max-w-screen-xl (1280px)
    <div className="min-h-screen bg-[#fffaf5] p-4 md:p-10 font-sans text-slate-900"> 
      <div className="max-w-screen-xl mx-auto"> 
        
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-100 text-orange-600 text-[11px] font-bold uppercase tracking-wider mb-3 shadow-sm">
              <Sparkles size={12} /> Admin Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Adoption <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Requests</span>
            </h1>
            {/* Display Admin User Info */}
            {userProfile && (
                <div className="mt-2 text-sm text-slate-600 flex items-center gap-4">
                    <p className="flex items-center gap-1 font-semibold">
                        <User size={14} className="text-orange-500" /> {userProfile.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs">
                        <Mail size={12} className="text-slate-400" /> {userProfile.email}
                    </p>
                </div>
            )}
          </div>
          <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg shadow-orange-500/5 border flex items-center w-full md:w-80">
            <Search size={18} className="text-slate-400 ml-1" />
            <input
              type="text"
              placeholder="Search applicant, pet..."
              className="w-full bg-transparent border-none outline-none px-3 py-1 text-sm text-slate-700 font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Mock Data Alert */}
        {isMock && (
          <div className="flex items-center gap-2 bg-yellow-100/80 p-3 rounded-xl border border-yellow-300 mb-6 text-yellow-800 text-sm font-medium">
            <AlertTriangle size={18} />
            <p>**Backend unreachable** — using mock data. Ensure Django is running at http://127.0.0.1:8000</p>
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-orange-50/50">
                  <th className="px-6 py-5 text-left text-[11px] font-black text-orange-900/40 uppercase tracking-widest">Applicant</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black text-orange-900/40 uppercase tracking-widest">Pet Details</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black text-orange-900/40 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black text-orange-900/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-right text-[11px] font-black text-orange-900/40 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  // Loading Skeleton
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredRequests.length === 0 ? (
                  // No Results
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
                      No requests found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  // Request Rows
                  filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-orange-50/40 transition-colors duration-300">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{req.applicant}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail size={10} /> {req.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-base">{req.pet}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{req.date}</td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Details Button */}
                          <button 
                            onClick={() => openDetailDrawer(req)} 
                            className="p-2 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100/80 hover:ring-2 ring-orange-500/50 transition-all duration-150 shadow-sm"
                            title="View Full Details"
                          >
                            <Eye size={16} strokeWidth={2.5} />
                          </button>
                          
                          {/* Inline Action Buttons (only show for Pending and Verification) */}
                          {req.status === 'Pending' && (
                            <button 
                                onClick={() => handleStatusUpdate(req.id, 'Verification', false)} 
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100/80 hover:ring-2 ring-indigo-500/50 transition-all duration-150 shadow-sm"
                                title="Move to Verification"
                              >
                                <PhoneCall size={16} strokeWidth={3} />
                              </button>
                            )}
                            {req.status === 'Verification' && (
                              <>
                                <button 
                                  onClick={() => handleStatusUpdate(req.id, 'Approved', true, req.verification_notes)} 
                                  className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100/80 hover:ring-2 ring-green-500/50 transition-all duration-150 shadow-sm disabled:opacity-50"
                                  title="Approve Request"
                                  disabled={!req.verification_notes}
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(req.id, 'Rejected', true, req.verification_notes)} 
                                  className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100/80 hover:ring-2 ring-red-500/50 transition-all duration-150 shadow-sm disabled:opacity-50"
                                  title="Reject Request"
                                  disabled={!req.verification_notes}
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Detail Modal */}
        <RequestDetailDrawer 
          request={selectedRequest} 
          onClose={closeDetailDrawer} 
          onUpdateStatus={handleStatusUpdate}
        />
        
      </div>
    </div>
  );
};

export default AdminRequests;