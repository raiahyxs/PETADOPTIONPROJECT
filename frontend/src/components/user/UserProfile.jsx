import React, { useState, useEffect } from 'react';
import { 
    User, Mail, Phone, MapPin, Settings, Shield, Heart, Tag, 
    Edit3, Calendar, Award, Home, PawPrint, CheckCircle, Clock, XCircle, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- API Endpoints ---
const API_URL = 'http://127.0.0.1:8000/api/applications/';
const USER_PROFILE_API_URL = 'http://127.0.0.1:8000/api/user-profile/'; 
const API_BASE_URL = 'http://127.0.0.1:8000'; // Base URL for constructing image paths

/**
 * Helper function to determine the visual properties based on the user's application status.
 * This is now case-insensitive and handles common status variations.
 * @param {Array} applications - The user's application list.
 * @returns {Object} - Status props (icon, color, text, etc.)
 */
const getStatusProps = (applications) => {
    // Standardize status names and filter out DRAFTs
    const activeApps = applications.filter(app => app.status && app.status.toUpperCase() !== 'DRAFT');
    const count = activeApps.length;

    if (count === 0) {
        return {
            status: 'NONE',
            icon: <Shield className="text-slate-400" size={24} />,
            color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
            text: 'No Active App',
            statusText: 'yet. Start adopting today!',
            showDetails: false
        };
    }

    // Determine the most critical status (prioritizing rejection/action > review > approval)
    let criticalStatus = 'IN_PROGRESS';

    // 1. Check for immediate action required (Rejected or Pending Action)
    const actionNeeded = activeApps.find(app => 
        app.status?.toUpperCase() === 'REJECTED' || app.status?.toUpperCase() === 'PENDING_ACTION'
    );
    if (actionNeeded) {
        criticalStatus = actionNeeded.status.toUpperCase() === 'REJECTED' ? 'REJECTED' : 'PENDING_ACTION';
    } 
    // 2. Check for items pending review
    else if (activeApps.some(app => 
        app.status?.toUpperCase().includes('PENDING') || app.status?.toUpperCase() === 'SUBMITTED'
    )) {
        criticalStatus = 'PENDING_REVIEW';
    } 
    // 3. Check for approved applications
    else if (activeApps.some(app => app.status?.toUpperCase() === 'APPROVED')) {
        criticalStatus = 'APPROVED';
    }
    // 4. Fallback or In Progress
    else {
        criticalStatus = 'IN_PROGRESS';
    }

    switch (criticalStatus) {
        case 'APPROVED':
            return {
                status: 'APPROVED',
                icon: <CheckCircle className="text-green-400" size={24} />,
                color: 'bg-green-500/20 text-green-300 border-green-500/30',
                text: 'Approved',
                statusText: `ready for final steps.`,
                showDetails: true
            };
        case 'PENDING_REVIEW':
            return {
                status: 'PENDING_REVIEW',
                icon: <Clock className="text-yellow-400" size={24} />,
                color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                text: 'Pending',
                statusText: `waiting for shelter review.`,
                showDetails: true
            };
        case 'REJECTED':
        case 'PENDING_ACTION': // Handle Rejected and PENDING_ACTION with the same urgent look
            return {
                status: criticalStatus,
                icon: <AlertTriangle className="text-red-400" size={24} />,
                color: 'bg-red-500/20 text-red-300 border-red-500/30',
                text: 'Action Required',
                statusText: `require immediate attention.`,
                showDetails: true
            };
        case 'IN_PROGRESS':
        default:
            return {
                status: 'IN_PROGRESS',
                icon: <Shield className="text-orange-400" size={24} />,
                color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                text: 'In Progress',
                statusText: `currently being processed.`,
                showDetails: true
            };
    }
};


// --- Sub-Component: Info Card ---
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

// --- Sub-Component: Certification / Preference Tag ---
const TagCard = ({ label }) => (
    <span className="px-3 py-2 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors cursor-default">
        {label}
    </span>
);

// --- Sub-Component: Favorite Pet Card ---
const FavoritePetCard = ({ pet, onClick }) => {
    
    // Determine the raw path/URL.
    const rawPath = pet.image?.url || pet.image;

    // Construct the final URL
    let imageUrl;

    if (rawPath) {
        if (rawPath.startsWith('http')) {
            // Already an absolute URL
            imageUrl = rawPath;
        } else {
            // Construct full URL for relative paths
            imageUrl = `${API_BASE_URL}${rawPath.startsWith('/') ? rawPath : '/' + rawPath}`;
        }
    } else {
        // Fallback placeholder
        imageUrl = 'https://placehold.co/150x150/ff9500/ffffff?text=Pet';
    }

    return (
        <div 
            className="bg-slate-50 rounded-2xl p-3 shadow-sm border border-slate-100 cursor-pointer hover:bg-white hover:border-orange-200 hover:shadow-lg transition-all"
            onClick={onClick}
        >
            <div className="w-full h-32 rounded-xl overflow-hidden mb-3">
                <img 
                    src={imageUrl} 
                    alt={pet.name || 'Favorite Pet'} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = 'https://placehold.co/150x150/aaaaaa/ffffff?text=Image+Error';
                    }}
                />
            </div>
            <p className="text-sm font-bold text-slate-800 text-center truncate">{pet.name || 'Unknown'}</p>
            <p className="text-[10px] text-slate-400 font-medium text-center uppercase">Favorite</p>
        </div>
    );
};


// --- Main Component ---
const UserProfile = ({ user: initialUser, ...initialProfileData }) => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Store the dynamic user/profile data here
    const [user, setUser] = useState(initialUser);
    const [profileData, setProfileData] = useState(initialProfileData);

    // --- Fetch User Profile Data (including Favorites and Preferences) ---
    const fetchUserProfile = async (token) => {
        try {
            const res = await fetch(USER_PROFILE_API_URL, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error('Failed to fetch user profile data');

            const data = await res.json();
            
            // This profile data contains the latest favorites and preferences
            setProfileData(prevData => ({
                ...prevData,
                favorites: data.favorites || [],
                preferences: data.preferences || [],
                // Also update other profile fields if they might change outside of EditProfile
                email: data.email || initialProfileData.email,
                phone: data.phone || initialProfileData.phone,
                address: data.address || initialProfileData.address,
                household: data.household || initialProfileData.household,
                profileImage: data.profileImage || initialProfileData.profileImage,
            }));
            
            // Optionally update the root user object if needed
            setUser(prevUser => ({
                ...prevUser,
                username: data.username || prevUser.username,
                avatar: data.profileImage || prevUser.avatar,
            }));

            // Crucial: Update local storage so EditProfile gets fresh data too
            const storedUser = JSON.parse(localStorage.getItem('petUser') || '{}');
            localStorage.setItem('petUser', JSON.stringify({
                ...storedUser,
                ...data, // Merge API data back into local storage
            }));


        } catch (err) {
            console.error("Error fetching profile:", err);
            // Optionally set error state here if critical
        }
    };

    // --- Fetch Applications ---
    // Now takes the expected username to filter by.
    const fetchApplications = async (token, username) => {
        try {
            const res = await fetch(API_URL, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error('Failed to fetch applications');

            const data = await res.json();
            
            // --- CLIENT-SIDE FILTERING by requester_name (to address user request) ---
            // NOTE: This assumes the backend returns applications for multiple users. 
            // We filter the array to only include applications where requester_name matches the current user's username.
            const filteredData = Array.isArray(data) ? data.filter(app => 
                app.requester_name?.toUpperCase() === username?.toUpperCase()
            ) : [];

            setApplications(filteredData);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };
    
    // --- Combined Data Fetch Effect ---
    useEffect(() => {
        const token = user?.token;
        const username = user?.username; // Get username for filtering
        if (!token) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            // Wait for both fetches to complete
            await Promise.all([
                fetchUserProfile(token),
                fetchApplications(token, username) // Pass username to fetchApplications
            ]);
            setLoading(false);
        };
        
        loadData();
        
        // Polling for application status (e.g., every 60 seconds) could be added here
        const intervalId = setInterval(loadData, 60000); 

        // Add username to dependencies to re-run if the username is loaded/updated
        return () => clearInterval(intervalId); // Cleanup interval on unmount or dependency change
    }, [user.token, user.username]);


    if (!user) return null;

    // The logic to calculate adoptedCount and statusProps relies on applications state
    const statusProps = getStatusProps(applications);
    const activeCount = applications.filter(app => app.status?.toUpperCase() !== 'DRAFT').length;
    const adoptedCount = applications.filter(app => app.status?.toUpperCase() === 'ADOPTED').length;

    // Use state data for rendering
    const displayAvatar = profileData.profileImage || user.avatar;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-500 font-sans">
            <style jsx global>{`
                /* Font import for a better look */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f8fafc;
                }
            `}</style>

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
                        
                        {/* Avatar */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
                            <div className="relative group/avatar">
                                <div className="w-36 h-36 md:w-48 md:h-48 bg-white rounded-[2rem] p-2 shadow-2xl shadow-black/10 ring-4 ring-white/50 rotate-3 group-hover/avatar:rotate-0 transition-all duration-300">
                                    <div className="w-full h-full bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 overflow-hidden relative">
                                        {displayAvatar ? (
                                            <img src={displayAvatar} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={80} strokeWidth={1.5} />
                                        )}
                                        <div 
                                            className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                            onClick={() => navigate('/edit-profile')} // Make avatar clickable to edit
                                        >
                                            <Edit3 className="text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Online"></div>
                            </div>

                            <div className="text-center md:text-left pb-2">
                                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">{user.username || user.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-slate-500 font-medium">
                                    <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <Shield size={12} fill="currentColor" /> Adopter
                                    </div>
                                    <span className="flex items-center gap-1.5 text-sm"><MapPin size={14}/> {profileData.address || 'No address set'}</span>
                                    <span className="flex items-center gap-1.5 text-sm"><Calendar size={14}/> Joined 2024</span>
                                </div>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0">
                            {/* NOTE: Settings button is currently a placeholder */}
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>
                            <button 
                                onClick={() => navigate('/edit-profile')} 
                                className="flex items-center justify-center p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                                title="Edit Profile"
                            >
                                <Edit3 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DASHBOARD GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN (8/12) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Info Cards */}
                    {/* The InfoCard for 'Successful Adoptions' has been removed */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoCard icon={<Mail className="text-blue-500" />} label="Email" value={profileData.email || 'N/A'} />
                        <InfoCard icon={<Phone className="text-green-500" />} label="Phone" value={profileData.phone || 'N/A'} />
                        <InfoCard icon={<MapPin className="text-orange-500" />} label="Address" value={profileData.address || 'N/A'} />
                        <InfoCard icon={<Home className="text-purple-500" />} label="Household Size" value={profileData.household || 'Not specified'} />
                        
                        {/* <InfoCard 
                            icon={<PawPrint className="text-pink-500" />} 
                            label="Successful Adoptions" 
                            value={adoptedCount} 
                        /> **REMOVED AS REQUESTED** */}
                         <InfoCard 
                            icon={<Heart className="text-red-500" />} 
                            label="Favorites Count" 
                            value={profileData.favorites?.length || 0} 
                        />
                    </div>

                    {/* Favorites - ENHANCED LAYOUT */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Award className="text-amber-500" />
                                Favorite Pets
                            </h3>
                            <button 
                                className="text-sm font-bold text-orange-500 hover:text-orange-600" 
                                onClick={() => navigate('/favorites')}
                                title="View all favorited pets"
                            >
                                View All ({profileData.favorites?.length || 0})
                            </button>
                        </div>
                        {profileData.favorites?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {profileData.favorites.slice(0, 4).map((fav, index) => ( // Show max 4 for dashboard appeal
                                    <FavoritePetCard 
                                        key={fav.pet?.id || index} 
                                        pet={fav.pet}
                                        onClick={() => navigate(`/pet/${fav.pet?.id}`)} // Link to pet detail page
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center h-48">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                                    <Heart className="text-slate-300" size={32} />
                                </div>
                                <p className="text-slate-500 font-medium">No favorite pets yet.</p>
                                <p className="text-slate-400 text-sm">Click the heart on pets to add them!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN (4/12) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Application Status Card */}
                    {/* NOTE: This status reflects the current user's applications, which is the correct behavior for a user profile dashboard. */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-800/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-500/30 transition-all duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg">
                                    {loading ? <Clock className="text-slate-400" size={24} /> : statusProps.icon}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusProps.color}`}>
                                    {loading ? 'Loading...' : statusProps.text}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Application Status</h3>
                            {loading ? (
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">Checking backend for your application status...</p>
                            ) : error ? (
                                <div className="bg-red-900/50 p-3 rounded-lg border border-red-700/50 flex items-center gap-2 text-sm mb-6">
                                    <AlertTriangle className="text-red-400" size={16} />
                                    <p className="text-red-300 font-medium">Connection Error: Could not load applications.</p>
                                </div>
                            ) : (
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                    {activeCount > 0 ? (
                                        <>You have <span className="text-white font-bold">{activeCount} active application{activeCount > 1 ? 's' : ''}</span> {statusProps.statusText}</>
                                    ) : (
                                        <>You don't have any <span className="text-white font-bold">active applications</span> yet. Start adopting today!</>
                                    )}
                                </p>
                            )}
                            {statusProps.showDetails && (
                                <button className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                    onClick={() => navigate('/applications')} // Assuming a dedicated applications page
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-full">
                        <div className="flex items-center gap-2 mb-5">
                            <Tag size={20} className="text-slate-400"/>
                            <h3 className="text-lg font-bold text-slate-800">My Preferences</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profileData.preferences?.length > 0 ? (
                                profileData.preferences.map((tag, index) => (
                                    <TagCard key={index} label={tag} />
                                ))
                            ) : (
                                <span className="text-sm text-slate-500 italic">No preferences set.</span>
                            )}
                            <button className="px-3 py-2 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-xs font-bold hover:border-orange-300 hover:text-orange-500 transition-all"
                                onClick={() => navigate('/edit-profile')} // Link to edit profile
                            >
                                + Add / Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;