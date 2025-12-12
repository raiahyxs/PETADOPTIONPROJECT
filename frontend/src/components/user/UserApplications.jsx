import React, { useState, useEffect } from 'react';
import { Clock, XCircle, FileText, Sparkles, Check, Trash2, LayoutDashboard } from 'lucide-react';

// --- Configuration ---
const API_BASE = 'http://127.0.0.1:8000/api/';

// --- Mock Data Generator ---
// Note: Added applicant_id field for client-side mock filtering
const GENERATE_MOCK_REQUESTS = (username) => {
    const allMocks = [
        // This is Alice's pending application
        { id: 1, applicant_id: 'user-alice-123', requester_name: 'Alice Johnson', email: 'alice@example.com', pet_name: 'Max (Dog)', created_at: '2025-11-20T10:00:00Z', status: 'Pending' },
        // This is Bob's approved application (should be hidden from Alice)
        { id: 2, applicant_id: 'user-bob-456', requester_name: 'Bob Smith', email: 'bob@example.com', pet_name: 'Luna (Cat)', created_at: '2025-11-19T14:30:00Z', status: 'Approved' },
        // This is Alice's rejected application
        { id: 3, applicant_id: 'user-alice-123', requester_name: 'Alice Johnson', email: 'charlie@example.com', pet_name: 'Mittens (Cat)', created_at: '2025-11-18T08:15:00Z', status: 'Rejected' },
    ];
    
    // ⭐ Filter mock data to only show applications matching the current user's name
    return allMocks.filter(app => app.requester_name === username);
};


// ⭐ API FUNCTION 1: Fetch User Applications ⭐
const fetchUserApplications = async (username) => { // ⭐ PARAMETER CHANGED to username
    // Construct URL with requester_name query parameter
    let url = `${API_BASE}applications/`;
    const params = [];
    
    // CRITICAL: Filter by requester_name for the backend
    if (username) params.push(`requester_name=${encodeURIComponent(username)}`); 
    
    if (params.length) url += '?' + params.join('&');
    
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        let data = await res.json();
        
        // ⭐ CRITICAL FIX: Implement client-side filtering (Defense in Depth)
        // This ensures that even if the backend fails to filter by requester_name, 
        // the client does not display other users' private data.
        return data.filter(app => app.requester_name === username);
        
    } catch (error) {
        // Fallback to mock data if API fails, performing client-side filtering by name
        console.warn("[MOCK MODE] Backend unreachable, using filtered mock data.");
        return GENERATE_MOCK_REQUESTS(username);
    }
};

// ⭐ API FUNCTION 2: Delete Application by ID ⭐
const deleteApplication = async (id) => {
    const res = await fetch(`${API_BASE}applications/${id}/`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete application');
    return { success: true };
};


// ---------------------------------------------------------------------
// --- Timeline Component (Responsive: Vertical Mobile / Horizontal Desktop) ---
// ---------------------------------------------------------------------

const Timeline = ({ status, currentStep }) => {
    // Define steps for the adoption process
    const steps = [
        { id: 1, label: "App Received", sub: "1-2 days" },
        { id: 2, label: "Initial Review", sub: "3-5 days" },
        { id: 3, label: "Verification", sub: "Virtual Call" },
        { id: 4, label: "Final Decision", sub: "Outcome" }
    ];

    return (
        <div className="relative px-2 md:px-4 mt-8 md:mt-0">
            {/* Progress Bar Background Line (Desktop - Horizontal) */}
            <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 rounded-full -z-10 hidden md:block"></div>
            
            {/* Mobile Line (Vertical) */}
            <div className="absolute left-[1.35rem] top-4 h-[calc(100%-2rem)] w-1 bg-slate-100 rounded-full -z-10 md:hidden"></div>

            <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                {steps.map((step, idx) => {
                    // Logic to determine the state of the current step (completed, current, error, upcoming)
                    let stepState = 'upcoming'; 
                    
                    if (status === 'Approved') {
                        // If Approved, all steps are completed
                        stepState = 'completed';
                    } else if (status === 'Rejected') {
                        // If Rejected, steps up to the final decision point are marked, and the decision is marked as error
                        if (step.id < currentStep) stepState = 'completed';
                        else if (step.id === currentStep) stepState = 'error'; 
                        else stepState = 'upcoming';
                    } else { // status === 'Pending'
                        // If Pending, steps before are done, current is active, steps after are upcoming
                        if (step.id < currentStep) stepState = 'completed';
                        else if (step.id === currentStep) stepState = 'current';
                        else stepState = 'upcoming';
                    }
                    
                    // Dynamic Styling
                    const circleBase = "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-lg font-bold border-4 transition-all duration-500 z-10 shrink-0";
                    const textBase = "mt-0 md:mt-4 text-left md:text-center ml-4 md:ml-0 flex-1 md:flex-none";
                    
                    let circleColor = "bg-white border-slate-100 text-slate-300"; // Default Upcoming
                    let textColor = "text-slate-400";

                    if (stepState === 'completed') {
                        circleColor = "bg-orange-500 border-orange-100 text-white shadow-lg shadow-orange-200";
                        textColor = "text-orange-600";
                    } else if (stepState === 'current') {
                        circleColor = "bg-white border-orange-500 text-orange-500 shadow-xl ring-4 ring-orange-50";
                        textColor = "text-slate-900";
                    } else if (stepState === 'error') {
                        circleColor = "bg-red-500 border-red-100 text-white shadow-lg shadow-red-200";
                        textColor = "text-red-600";
                    }

                    return (
                        <div key={step.id} className="flex md:flex-col items-center group relative">
                            {/* Connecting Line Progress (Desktop) */}
                            {idx !== 0 && (
                                <div className={`hidden md:block absolute top-6 -left-[50%] w-full h-1 transition-all duration-1000 delay-300 -z-10 ${
                                    // Line is colored if the previous step is completed
                                    // eslint-disable-next-line no-mixed-operators
                                    step.id <= currentStep && status !== 'Rejected' || status === 'Approved' ? 'bg-orange-500' : 'bg-slate-100'
                                }`}></div>
                                
                            )}
                            {/* Mobile Line Progress (Vertical) */}
                            {idx !== 0 && (
                                <div className={`md:hidden absolute left-[1.35rem] -top-10 w-1 h-12 transition-all duration-1000 delay-300 -z-10 ${
                                    // eslint-disable-next-line no-mixed-operators
                                    step.id <= currentStep && status !== 'Rejected' || status === 'Approved' ? 'bg-orange-500' : 'bg-slate-100'
                                }`}></div>
                            )}
                                
                            {/* Step Circle */}
                            <div className={`${circleBase} ${circleColor}`}>
                                {stepState === 'completed' ? <Check size={18} strokeWidth={4} /> : 
                                 stepState === 'error' ? <XCircle size={22} /> :
                                 step.id}
                            </div>

                            {/* Text Info */}
                            <div className={textBase}>
                                <p className={`font-bold text-sm md:text-base ${textColor}`}>
                                    {step.label}
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {step.sub}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// ---------------------------------------------------------------------
// --- Main UserApplications Component (Wider Content & Responsive) ---
// ---------------------------------------------------------------------

const UserApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // ⭐ Store current user details

    // Initialize mock user if none exists (for demo purposes)
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('petUser') || '{}');
        if (!user.id) {
            // Set a default demo user if not logged in
            user = { id: 'user-alice-123', username: 'Alice Johnson' }; 
            localStorage.setItem('petUser', JSON.stringify(user));
        }
        setCurrentUser(user);
        setMounted(true);
        // Load applications after user state is set
        if (user.id) {
            // ⭐ Pass username for fetching
            loadApplications(user.id, user.username);
        } else {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ⭐ Centralized function to fetch and set applications
    const loadApplications = (userId, username) => {
        setLoading(true);
        setApplications([]); 

        // CRITICAL: Check for user ID before fetching
        if (!userId) {
            console.error("User ID not available. Cannot load applications.");
            setLoading(false);
            return;
        }

        // ⭐ Pass username instead of userId to the fetch function
        fetchUserApplications(username) 
            .then(data => {
                setApplications(
                    data.map(app => {
                        // Logic for determining current active step based on status
                        let currentStep = 1;
                        if (app.status === 'Pending') {
                            currentStep = 2; 
                        } else if (app.status === 'Approved') {
                            currentStep = 4; // Completed journey
                        } else if (app.status === 'Rejected') {
                            currentStep = 4; // Decision reached, marked as error at final step
                        }
                        
                        return {
                            id: app.id,
                            petName: app.pet_name,
                            date: app.created_at ? app.created_at.slice(0, 10) : '',
                            status: app.status,
                            currentStep: currentStep,
                            // Replace applicant name with 'You' if it matches the current user
                            displayApplicant: app.requester_name === username ? 'You' : app.requester_name 
                        };
                    })
                );
            })
            .catch(() => setApplications([]))
            .finally(() => setLoading(false));
    };

    // ⭐ HANDLER: Delete application (Withdraw) - CRITICAL FIX APPLIED ⭐
    const handleDeleteApplication = async (id, petName) => {
        // Corrected: Use window.confirm for a proper user confirmation dialog
        if (window.confirm(`Are you sure you want to withdraw your application for ${petName}? This action cannot be undone.`)) {
            setLoading(true); // Set loading state while processing

            try {
                // Check if we are currently in a mock data scenario (e.g., if application ID 1 is present)
                // This is a simple, robust check for mock mode when using predefined IDs.
                const isMockMode = applications.some(app => app.id === 1 && app.petName === 'Max (Dog)');

                if (isMockMode) {
                    // Simulate fast mock deletion: We only delete if it exists in the current list
                    setApplications(apps => apps.filter(app => app.id !== id));
                    console.log(`Application for ${petName} (ID: ${id}) successfully withdrawn (Mock).`);
                    
                    // Since this is mock data, we skip the real API call
                    setLoading(false);
                    return;
                }
                
                // --- Real API Call ---
                await deleteApplication(id);
                
                // Update local state by filtering out the deleted application
                setApplications(apps => apps.filter(app => app.id !== id));
                console.log(`Application for ${petName} (ID: ${id}) successfully withdrawn.`);

            } catch (error) {
                console.error(`Error withdrawing application (ID: ${id}): ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">
            {/* Custom Styles for Animations */}
            <style>{`
                /* Custom Cubic Bezier for ultra-smooth entry */
                .ease-custom { transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            `}</style>

            {/* Main Background: Warm Cream */}
            <section className="min-h-screen bg-[#fffaf5] relative px-4 md:px-8 py-8 md:py-24 flex justify-center">
                
                {/* --- Background Elements --- */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]" 
                        style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                    </div>
                    <div className="absolute top-0 right-0 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                </div>

                {/* ⭐ MAIN CENTERED CONTAINER: max-w-7xl ensures wider content on desktops */}
                <div className="max-w-7xl w-full relative z-10">
                
                    {/* --- Header Section --- */}
                    <div className={`mb-12 text-center transition-all duration-[1000ms] ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider mb-4">
                            <Sparkles size={14} /> {currentUser ? `${currentUser.username}'s Portal` : 'Track Progress'}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
                            <span>My Adoption</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Journey</span>
                        </h1>
                        <p className="text-slate-500 mt-4 max-w-lg mx-auto text-base md:text-lg">Track the status of your furry friend applications in real-time.</p>
                    </div>

                    {/* --- Applications List --- */}
                    <div className="space-y-8">
                        {loading ? ( // ⭐ Show loading state
                            <div className={`bg-white/80 backdrop-blur-md rounded-[2rem] p-12 text-center border border-white/60 shadow-sm transition-all duration-1000 ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                                <Clock size={30} className="mx-auto mb-4 text-slate-400 animate-spin" />
                                <h3 className="text-2xl font-bold text-slate-900">Loading Applications...</h3>
                            </div>
                        ) : applications.length === 0 ? ( // Show empty state
                            <div className={`bg-white/80 backdrop-blur-md rounded-[2rem] p-12 text-center border border-white/60 shadow-sm transition-all duration-1000 ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                                <div className="bg-orange-100 text-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <FileText size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No applications yet</h3>
                                <p className="text-slate-500 text-lg">You haven't applied for any pets. <br/>Time to find your new best friend!</p>
                            </div>
                        ) : ( // Render application cards
                            applications.map((app, index) => (
                                // Application Card Container
                                <div 
                                    key={app.id} 
                                    className={`bg-white/90 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white shadow-lg shadow-orange-100/50 transition-all duration-700 ease-custom transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                    style={{ transitionDelay: `${index * 150}ms` }}
                                >
                                    {/* Card Header (Responsive Layout) */}
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 md:mb-10 border-b border-slate-100 pb-6 md:pb-8">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 md:p-4 rounded-2xl text-orange-600 shadow-inner shrink-0">
                                                <FileText size={24} className="md:w-7 md:h-7" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl md:text-2xl text-slate-900 leading-tight">Application for {app.petName}</h3>
                                                <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">ID: #{app.id.toString().padStart(4, '0')} • Submitted on {app.date}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Status Pill & Action (Responsive Layout) */}
                                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 w-full lg:w-auto">
                                            <div className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold border ${
                                                app.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {app.status === 'Approved' && '🎉 Ready to Adopt'}
                                                {app.status === 'Rejected' && '❌ Application Closed'}
                                                {app.status === 'Pending' && '⏳ Admin Reviewing'}
                                            </div>
                                            
                                            {/* ⭐ Delete Button (Visible only if Pending) ⭐ */}
                                            {app.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleDeleteApplication(app.id, app.petName)}
                                                    className="flex items-center gap-2 text-red-500 font-medium text-xs uppercase hover:text-red-700 transition-colors py-2 px-3 rounded-xl bg-white border border-red-100 hover:bg-red-50 ml-auto lg:ml-0"
                                                    disabled={loading} // Disable if an operation is in progress
                                                >
                                                    <Trash2 size={16} /> Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline Stepper */}
                                    <Timeline status={app.status} currentStep={app.currentStep} />
                                    
                                </div>
                            ))
                        )}
                    </div>
                
                </div>
            </section>
        </div>
    );
};

export default UserApplications;