import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Heart, PawPrint, Filter, Sparkles, Mars, Venus, Scale, Settings, X, Info, CheckCircle } from 'lucide-react';

// Mock useNavigate
const useNavigate = () => {
    return (path) => console.log(`Navigating to: ${path}`);
};

// --- API (Django Backend Endpoints) ---
const API_BASE = 'http://localhost:8000/api/';

const fetchPets = async () => {
    const maxRetries = 3;
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const res = await fetch(`${API_BASE}pets/`);
            if (!res.ok) throw new Error('Failed to fetch pets');
            return await res.json();
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
};

const updateUserProfile = async (token, favoritesData) => {
    const res = await fetch(`${API_BASE}user-profile/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ favorites: favoritesData })
    });
    if (!res.ok) throw new Error('Failed to update favorites');
    return await res.json();
};

const updateUserPreferences = async (token, preferencesData) => {
    const res = await fetch(`${API_BASE}user-profile/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ preferences: preferencesData }) 
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return await res.json();
};

const fetchUserProfile = async (userId, token) => {
    const res = await fetch(`${API_BASE}user-profiles/?user=${userId}`, {
        headers: {
            'Authorization': `Token ${token}`
        }
    });

    if (!res.ok) throw new Error('Failed to fetch user profile');
    
    const data = await res.json();
    if (data.length > 0) {
        return data[0];
    }
    return null; 
};

const fetchApplications = async () => {
    try {
        const res = await fetch(`${API_BASE}applications/`);
        if (!res.ok) throw new Error('Failed to fetch applications');
        return await res.json();
    } catch (e) {
        return [
            { id: 1, pet_name: 'Max (Dog)', status: 'Pending' },
            { id: 2, pet_name: 'Luna (Cat)', status: 'Approved' },
        ];
    }
};

const createApplication = async ({ petId, requester_name, email }) => {
    const res = await fetch(`${API_BASE}applications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pet: petId,
            requester_name,
            email,
            status: 'Pending'
        }),
    });
    if (!res.ok) throw new Error('Failed to submit application');
    return await res.json();
};

// --- Helper Components ---
const Badge = ({ label, value, icon }) => (
    <div className="bg-slate-50/50 px-2 py-3 rounded-xl flex-1 text-center border border-slate-200/60 group-hover:bg-white group-hover:border-orange-100 transition-colors duration-300">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
            {icon} {label}
        </p>
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
);

// --- Notification Component ---
const Notification = ({ message, type, onClose }) => {
    const isSuccess = type === 'success';
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000); 
        
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    return (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] max-w-[90%] w-full sm:max-w-lg px-4 animate-fadeInDown">
            <style>{`
                @keyframes fadeInDown {
                    0% { opacity: 0; transform: translateY(-50px) translateX(-50%); }
                    100% { opacity: 1; transform: translateY(0) translateX(-50%); }
                }
                .animate-fadeInDown {
                    animation: fadeInDown 0.5s ease-out forwards;
                }
            `}</style>

            <div className={`flex items-center justify-between gap-4 p-4 rounded-xl shadow-xl border-t-4 transition-all duration-300 ${
                isSuccess 
                    ? 'bg-white border-t-emerald-500 text-slate-800 shadow-emerald-200/50' 
                    : 'bg-white border-t-red-500 text-slate-800 shadow-red-200/50'
            }`}>
                <div className="flex items-center gap-3">
                    <CheckCircle size={24} className={isSuccess ? 'text-emerald-500' : 'text-red-500'} />
                    <span className="font-semibold text-sm sm:text-base">{message}</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

// --- Pet Profile View Component (RESPONSIVE & CENTERED) ---
const PetProfileView = ({ pet, onClose, onAdopt, onFavorite, isFavorite, matchesPreference }) => {
    if (!pet) return null;

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return `https://placehold.co/800x600/ffe4c4/e87400?text=${pet.name}`;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:8000${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
    };

    return (
        // Outer Container: Flex Centered
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            {/* Modal Panel: Vertically Constrained + Flex Column */}
            <div className="bg-white/95 rounded-3xl shadow-2xl max-w-4xl w-full border border-orange-100/50 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
                
                {/* Header: Fixed */}
                <div className="flex-shrink-0 flex justify-between items-start p-6 border-b border-orange-100">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Info className="text-orange-500" size={28} /> {pet.name}'s Story
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50">
                        <X size={24} />
                    </button>
                </div>

                {/* Body: Scrollable */}
                <div className="overflow-y-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Column */}
                        <div className="relative">
                            <div className="w-full h-64 sm:h-80 lg:h-[400px] rounded-2xl shadow-xl mb-4 overflow-hidden bg-slate-100">
                                <img
                                    src={getFullImageUrl(pet.image)}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x600/ffe4c4/e87400?text=${pet.name}`; }}
                                />
                            </div>
                            {matchesPreference(pet) && (
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-rose-400 to-orange-400 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-pink-300 z-10 animate-bounce-slow">
                                    <Sparkles size={14} fill="currentColor" /> SOULMATE MATCH
                                </div>
                            )}
                            <p className="text-sm text-slate-500 mt-2 text-center italic">Image: {pet.type} - {pet.breed}</p>
                        </div>

                        {/* Details Column */}
                        <div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{pet.name} - The {pet.type}</h3>
                                <p className="text-slate-600 leading-relaxed bg-orange-50 p-4 rounded-xl border border-orange-100">
                                    {pet.description || "This lovely pet is ready for a new home! They are known for their friendly nature and love of cuddles."}
                                </p>
                            </div>

                            {/* Badges/Attributes - Responsive Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                <Badge label="Age" value={`${pet.age} Years`} />
                                <Badge 
                                    label="Sex" 
                                    value={pet.sex ? pet.sex.toUpperCase() : 'UNKNOWN'} 
                                    icon={pet.sex === 'MALE' ? <Mars size={12} /> : pet.sex === 'FEMALE' ? <Venus size={12} /> : null} 
                                />
                                <Badge label="Breed" value={pet.breed || 'Mixed'} icon={<PawPrint size={12} />} />
                                <Badge label="Weight" value={pet.weight ? `${pet.weight} kg` : '--'} icon={<Scale size={12} />} />
                                <Badge label="Location" value="2 miles" icon={<MapPin size={12} />} />
                                <div className={`px-3 py-1 rounded-xl text-center text-[10px] font-black uppercase tracking-widest border flex items-center justify-center ${
                                    pet.status === 'Available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                    pet.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                    'bg-slate-100 text-slate-400 border-slate-200'
                                }`}>
                                    <span className='text-sm font-bold'>{pet.status}</span>
                                </div>
                            </div>

                            {/* Behavior & Needs Section */}
                            <div className="bg-slate-100 p-5 rounded-xl border border-slate-200 mb-6">
                                <h4 className="font-bold text-xl text-slate-800 mb-3 flex items-center gap-2">
                                    <Info size={18} className="text-orange-500" /> Key Characteristics
                                </h4>
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-700">
                                        <span className="font-semibold text-slate-900">Temperament:</span> {pet.temperament || 'Playful and affectionate'}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                        <span className="font-semibold text-slate-900">Compatibility:</span> Good with {pet.compatibility || 'kids and other pets'}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                        <span className="font-semibold text-slate-900">Special Needs:</span> {pet.special_needs || 'None'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => onFavorite(pet)}
                                    className="p-3.5 bg-white border-2 border-slate-200 rounded-xl text-orange-500 shadow-md hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-all flex justify-center items-center"
                                >
                                    <Heart 
                                        fill={isFavorite(pet.id) ? 'currentColor' : 'none'} 
                                        className={isFavorite(pet.id) ? 'text-red-500' : 'text-orange-500'} 
                                        size={24} 
                                    />
                                    <span className="sm:hidden ml-2 font-bold">Favorite</span>
                                </button>
                                
                                {pet.status === 'Available' ? (
                                    <button
                                        onClick={() => onAdopt(pet)}
                                        className="flex-1 group/btn relative bg-slate-900 text-white font-bold py-4 rounded-xl overflow-hidden transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]"
                                    >
                                        <div className="relative flex items-center justify-center gap-2">
                                            <span>Apply to Adopt {pet.name}</span>
                                            <PawPrint size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                        </div>
                                    </button>
                                ) : (
                                    <button disabled className="flex-1 bg-slate-200 text-slate-500 font-bold py-4 rounded-xl cursor-not-allowed">
                                        {pet.status === 'Pending' ? 'Application Pending' : 'Adopted'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Preferences Data Structure ---
const PreferenceOptions = [
    { category: 'Type', options: ['Dog', 'Cat', 'Bird', 'Rabbit'] },
    { category: 'Gender', options: ['Male', 'Female'] },
    { category: 'Weight (kg)', options: ['Under 5 kg', '5 - 15 kg', '16 - 30 kg', 'Over 30 kg'] }, 
    { category: 'Age', options: ['Young (0-2)', 'Adult (3-8)', 'Senior (9+)'] },
    { category: 'Breed', options: ['Labrador', 'Siamese', 'German Shepherd', 'Poodle', 'Mix/Other'] }, 
];

const PreferencesModal = ({ isOpen, onClose, initialPreferences, onSave, currentUser }) => {
    const [selectedPrefs, setSelectedPrefs] = useState(initialPreferences);

    useEffect(() => {
        if (isOpen) {
             setSelectedPrefs(initialPreferences);
        }
    }, [isOpen, initialPreferences]);


    const handleToggle = (pref) => {
        setSelectedPrefs(prev => {
            if (prev.includes(pref)) {
                return prev.filter(p => p !== pref);
            } else {
                return [...prev, pref];
            }
        });
    };

    const handleSave = () => {
        onSave(selectedPrefs);
        onClose();
    };

    if (!isOpen) return null;

    if (!currentUser.token) {
        return (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Action Required</h2>
                    <p className="text-slate-600 mb-6">You need to be logged in to set your preferences. Please sign in to save your favorite filters.</p>
                    <button
                        onClick={onClose}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 rounded-3xl shadow-2xl max-w-2xl w-full border border-orange-100/50 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
                <div className="flex-shrink-0 flex justify-between items-start p-6 border-b border-orange-100">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Settings className="text-orange-500" size={28} /> Set Preferences
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 md:p-8">
                    <p className="text-slate-600 mb-8">Select the attributes you're looking for in your ideal companion. Pets matching these preferences will be highlighted.</p>

                    <div className="space-y-6">
                        {PreferenceOptions.map(({ category, options }) => (
                            <div key={category} className="border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-xl text-slate-800 mb-3">{category}</h3>
                                <div className="flex flex-wrap gap-3">
                                    {options.map(option => {
                                        const isSelected = selectedPrefs.includes(option);
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => handleToggle(option)}
                                                className={`
                                                    px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm border-2
                                                    ${isSelected
                                                        ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-300 scale-105 transform hover:scale-110'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-300 transform hover:scale-[1.02]'
                                                    }
                                                `}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={selectedPrefs.length === 0}
                            className="w-full group/save relative bg-slate-900 text-white font-bold py-4 rounded-xl transition-all hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/save:animate-[shimmer_1s_infinite]" />
                            <span className="relative z-10">Save {selectedPrefs.length} Preferences</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Adopt = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [mounted, setMounted] = useState(false);
    
    // State for user preferences
    const [userPreferences, setUserPreferences] = useState([]);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

    // State for Pet Profile View
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    // State for Notifications
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const [currentUser, setCurrentUser] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem('petUser') || '{}');
        if (!Array.isArray(storedUser.favorites)) {
            storedUser.favorites = [];
        }
        return storedUser;
    });

    const navigate = useNavigate();

    const loadUserPreferences = useCallback(async (userId, token) => {
        try {
            const profile = await fetchUserProfile(userId, token);
            if (profile && Array.isArray(profile.preferences)) {
                setUserPreferences(profile.preferences);
            }
        } catch (error) {
            console.error("Error fetching user preferences:", error);
        }
    }, []);

    const loadPets = useCallback(async () => {
        setLoading(true);
        try {
            const [petsData, applicationData] = await Promise.all([
                fetchPets(),
                fetchApplications()
            ]);

            const pendingApplications = applicationData.filter(app => app.status === 'Pending');

            const mergedPets = petsData.map(pet => {
                const hasPendingApplication = pendingApplications.some(app =>
                    app.pet_name && app.pet_name.includes(pet.name) && pet.status !== 'Adopted'
                );

                if (pet.status === 'Available' && hasPendingApplication) {
                    return { ...pet, status: 'Pending' };
                }
                return pet;
            });

            setPets(mergedPets);
        } catch (error) {
            console.error("Error fetching and merging data:", error);
            try {
                const petsOnly = await fetchPets();
                setPets(petsOnly);
            } catch (e) {
                setPets([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        loadPets();
        
        if (currentUser.token && currentUser.user) {
            loadUserPreferences(currentUser.user, currentUser.token);
        }
    }, [currentUser.token, currentUser.user, loadPets, loadUserPreferences]);

    // Helper to check if a pet is a favorite
    const isFavorite = (petId) => {
        return currentUser.favorites.some(fav => fav.pet?.id === petId);
    };
    
    const matchesPreference = (pet) => {
        if (userPreferences.length === 0) return false;

        const preferences = userPreferences.map(p => p.toLowerCase()); 
        
        const petType = pet.type?.toLowerCase();
        const petSex = pet.sex?.toLowerCase();
        const petBreed = pet.breed?.toLowerCase(); 

        const directMatch = preferences.some(pref => {
            const prefFirstWord = pref.split(' ')[0].toLowerCase();
            if (petType === prefFirstWord || petSex === prefFirstWord) return true;
            if (petBreed && pref === petBreed) return true;
             if (preferences.includes(petType) || preferences.includes(petSex) || preferences.includes(petBreed)) return true;
            return false;
        });

        if (directMatch) return true;
        
        if (pet.age !== undefined && pet.age !== null) {
            let ageGroup = '';
            if (pet.age <= 2) ageGroup = 'young';
            else if (pet.age >= 9) ageGroup = 'senior';
            else ageGroup = 'adult';
            
            if (preferences.some(pref => pref.includes(ageGroup))) return true;
        }

        if (pet.weight !== undefined && pet.weight !== null) {
            const weight = pet.weight;
            if (preferences.includes('under 5 kg') && weight < 5) return true;
            if (preferences.includes('5 - 15 kg') && weight >= 5 && weight <= 15) return true;
            if (preferences.includes('16 - 30 kg') && weight >= 16 && weight <= 30) return true;
            if (preferences.includes('over 30 kg') && weight > 30) return true;
        }

        return false;
    };


    const handleFavorite = async (pet) => {
        if (!currentUser.token) {
            setNotification({ message: "Please log in to manage your favorites.", type: "error" });
            navigate('/login'); 
            return;
        }

        const currentFavorites = currentUser.favorites;
        const isPetFavorite = isFavorite(pet.id);
        let newFavorites;

        if (isPetFavorite) {
            newFavorites = currentFavorites.filter(fav => fav.pet?.id !== pet.id);
        } else {
            const newFavItem = { 
                pet: { 
                    id: pet.id, 
                    name: pet.name,
                    image: pet.image || null,
                } 
            };
            newFavorites = [...currentFavorites, newFavItem];
        }

        try {
            const updatedProfile = await updateUserProfile(currentUser.token, newFavorites);
            
            const updatedUser = { ...currentUser, favorites: updatedProfile.favorites };
            localStorage.setItem('petUser', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            setNotification({ 
                message: isPetFavorite ? `${pet.name} removed from favorites.` : `${pet.name} added to favorites!`, 
                type: "success" 
            });

        } catch (error) {
            console.error("Failed to update favorites:", error);
            setNotification({ message: `Failed to update favorites. Please try again.`, type: "error" });
        }
    };

    const handleAdopt = async (pet) => {
        if (!currentUser.username) {
            setNotification({ message: "You need to sign in to adopt.", type: "error" });
            navigate('/login');
            return;
        }

        if (pet.status !== 'Available') {
            setNotification({ message: `Application for ${pet.name} cannot be submitted. Status: ${pet.status}`, type: "error" });
            return;
        }

        try {
            await createApplication({
                petId: pet.id,
                requester_name: currentUser.first_name || currentUser.username,
                email: currentUser.email || ''
            });
            
            setNotification({ 
                message: `Success! Application for ${pet.name} sent. Check 'My Applications' for updates.`, 
                type: "success" 
            });
            
            loadPets();
            navigate('/my-applications');
        } catch (error) {
            console.error('Failed to submit application.', error);
            setNotification({ message: 'Failed to submit application. Please try again.', type: "error" });
        }
        
        setIsProfileModalOpen(false);
        setSelectedPet(null);
    };

    const handleSavePreferences = async (prefs) => {
        if (!currentUser.token) return;

        try {
            const updatedProfile = await updateUserPreferences(currentUser.token, prefs);
            
            setUserPreferences(updatedProfile.preferences || prefs);
            setNotification({ message: "Preferences saved successfully.", type: "success" });
        } catch (error) {
            console.error("Error saving preferences:", error);
            setNotification({ message: "Error saving preferences.", type: "error" });
        }
    };

    const handleViewProfile = (pet) => {
        setSelectedPet(pet);
        setIsProfileModalOpen(true);
    }
    
    const dismissNotification = () => {
        setNotification({ message: '', type: '' });
    };

    const filteredPets = (() => {
        if (filter === 'Soulmates') {
            if (currentUser.token && userPreferences.length > 0) {
                return pets.filter(matchesPreference);
            }
            return [];
        }

        if (filter === 'All') {
            return pets;
        }

        return pets.filter(p => p.type === filter);
    })();

    return (
        <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">

            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                @keyframes bounce { 0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-blob { animation: blob 10s infinite; }
                .animate-bounce-slow { animation: bounce 3s infinite; }
                .delay-200 { animation-delay: 2s; }
                .delay-400 { animation-delay: 4s; }
                .ease-custom { transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }

                .gradient-border-highlight {
                    border: 3px solid transparent;
                    border-radius: 2.5rem; 
                    background-origin: padding-box, border-box;
                    background-image: linear-gradient(to right, #fdfcfb, #fdfcfb), linear-gradient(135deg, #fb923c, #fcd34d, #fda4af); 
                    box-shadow: 0 12px 24px -6px rgba(251, 146, 60, 0.4), 0 4px 6px -2px rgba(251, 146, 60, 0.2); 
                    transition: all 0.5s ease;
                }

                .gradient-border-highlight:hover {
                    box-shadow: 0 20px 30px -8px rgba(251, 146, 60, 0.6), 0 10px 10px -5px rgba(251, 146, 60, 0.3);
                }
            `}</style>

            <section className="min-h-screen bg-[#fdfcfb] relative px-4 md:px-8 py-12 md:py-24 overflow-hidden">

                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-200"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">

                    <div className={`flex flex-col md:flex-row justify-between items-end mb-12 gap-8 transition-all duration-[1000ms] ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>

                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider mb-6">
                                <Sparkles size={14} /> Find your best friend
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4 leading-[0.95]">
                                Adopt a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Soulmate</span>
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg font-medium max-w-lg">
                                Browse our furry friends waiting for a forever home. Swipe right on happiness today.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {currentUser.token && (
                                <button
                                    onClick={() => setIsPreferencesModalOpen(true)}
                                    className="w-full sm:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 transition-all hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:ring-2 ring-orange-300"
                                >
                                    <Settings size={18} /> Edit Preferences
                                </button>
                            )}
                            
                            <div className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/60 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/50 overflow-x-auto">
                                {['All', 'Dog', 'Cat', 'Soulmates'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`px-4 md:px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden whitespace-nowrap ${filter === type ? 'text-white shadow-lg shadow-orange-200 scale-105' : 'text-slate-500 hover:bg-white hover:text-orange-500'}`}
                                    >
                                        {filter === type && <div className={`absolute inset-0 ${type === 'Soulmates' ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-gradient-to-r from-slate-900 to-slate-800'} z-0`}></div>}
                                        <span className="relative z-10 flex items-center gap-2">
                                            {filter === type && (type === 'Soulmates' ? <Heart size={14} className="text-white" fill="currentColor" /> : <Filter size={14} />)} 
                                            {type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {userPreferences.length > 0 && currentUser.token && (
                        <div className="mb-12 bg-orange-100/50 p-4 rounded-xl border border-orange-200 shadow-inner transition-opacity duration-500 ease-custom hover:shadow-lg hover:shadow-orange-100">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-2">
                                <Heart size={20} className="text-red-500" fill="currentColor" /> Your Current Pet Preferences:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {userPreferences.map(pref => (
                                    <span 
                                        key={pref} 
                                        className="bg-white px-3 py-1 text-sm font-medium text-orange-700 rounded-full border border-orange-300 shadow-sm animate-bounce-slow"
                                    >
                                        {pref}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="bg-white/80 rounded-[2.5rem] p-4 h-[500px] animate-pulse shadow-sm border border-white/60">
                                    <div className="h-80 rounded-[2rem] bg-slate-200 mb-6"></div>
                                    <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
                                    <div className="flex gap-3">
                                        <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                                        <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                                        <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPets.length === 0 && (filter === 'Soulmates' && userPreferences.length > 0) ? (
                                <div className="lg:col-span-3 text-center bg-white/70 p-12 rounded-2xl border border-slate-100 shadow-md">
                                    <Heart size={48} className="text-red-400 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No Soulmates Found</h2>
                                    <p className="text-slate-500">None of the current pets match your selected preferences. Try adjusting your filter settings!</p>
                                </div>
                            ) : filteredPets.length === 0 && filter !== 'All' ? (
                                <div className="lg:col-span-3 text-center bg-white/70 p-12 rounded-2xl border border-slate-100 shadow-md">
                                    <PawPrint size={48} className="text-orange-400 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No {filter}s Available</h2>
                                    <p className="text-slate-500">Check back soon! We're always updating our list of available pets.</p>
                                </div>
                            ) : (
                                filteredPets.map((pet, index) => (
                                    <div
                                        key={pet.id}
                                        className={`transform transition-all duration-[800ms] ease-custom ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                                        style={{ transitionDelay: `${index * 120}ms` }}
                                    >
                                        <div
                                            className={`group bg-white/80 backdrop-blur-md rounded-[2.5rem] p-4 border shadow-sm transition-all duration-500 hover:-translate-y-2 h-full flex flex-col relative
                                                ${matchesPreference(pet) 
                                                    ? 'gradient-border-highlight' 
                                                    : 'border-white/60 hover:shadow-xl hover:shadow-orange-100/50'
                                                }
                                            `}
                                            style={{ animation: `float 6s ease-in-out infinite`, animationDelay: `${index * 0.2}s` }}
                                        >
                                            
                                            {matchesPreference(pet) && (
                                                <div className="absolute top-8 right-8 bg-gradient-to-r from-rose-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-pink-300 z-10 animate-bounce-slow">
                                                    <Sparkles size={12} fill="currentColor" /> BEST MATCH
                                                </div>
                                            )}

                                            <div 
                                                className="h-64 sm:h-80 rounded-[2rem] overflow-hidden relative bg-slate-50 shadow-inner shrink-0 cursor-pointer"
                                                onClick={() => handleViewProfile(pet)} 
                                            >
                                                <img
                                                    src={
                                                        pet.image
                                                            ? (pet.image.startsWith('http') ? pet.image : `http://localhost:8000${pet.image.startsWith('/') ? pet.image : '/' + pet.image}`)
                                                            : `https://placehold.co/400x400/ffe4c4/e87400?text=${pet.name}`
                                                    }
                                                    alt={pet.name}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://placehold.co/400x400/ffe4c4/e87400?text=${pet.name}`;
                                                    }}
                                                />

                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm border border-white/50">
                                                    <MapPin size={12} className="text-orange-500" /> 2 miles away
                                                </div>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleFavorite(pet); }} 
                                                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full text-orange-500 shadow-lg group-hover:scale-110 transition-transform cursor-pointer hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Heart 
                                                        fill={isFavorite(pet.id) ? 'currentColor' : 'none'} 
                                                        className={isFavorite(pet.id) ? 'text-red-500' : 'text-orange-500'} 
                                                        size={20} 
                                                    />
                                                </button>
                                                
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewProfile(pet); }} 
                                                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full text-slate-600 shadow-lg group-hover:scale-110 transition-transform cursor-pointer hover:bg-slate-100"
                                                >
                                                    <Info size={20} />
                                                </button>

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                            </div>

                                            <div className="pt-6 px-2 pb-2 space-y-6 flex-1 flex flex-col">

                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-3xl font-black text-slate-900 leading-tight">{pet.name}</h3>
                                                        <p className="text-slate-500 font-bold text-sm mt-1 flex items-center gap-1">
                                                            <PawPrint size={12} className="text-orange-300" /> {pet.breed}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                            pet.status === 'Available'
                                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                                : pet.status === 'Pending'
                                                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                                        }`}
                                                    >
                                                        {pet.status}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Badge label="Age" value={`${pet.age} Years`} />
                                                    <Badge
                                                        label="Sex"
                                                        value={pet.sex ? pet.sex.toUpperCase() : 'UNKNOWN'}
                                                        icon={pet.sex === 'MALE' ? <Mars size={12} /> : pet.sex === 'FEMALE' ? <Venus size={12} /> : null}
                                                    />
                                                    <Badge 
                                                        label="Weight" 
                                                        value={pet.weight ? `${pet.weight} kg` : '--'} 
                                                        icon={<Scale size={12} />} 
                                                    />
                                                </div>

                                                <div className="mt-auto">
                                                    {pet.status === 'Available' ? (
                                                        <button
                                                            onClick={() => handleAdopt(pet)}
                                                            className="w-full group/btn relative bg-slate-900 text-white font-bold py-4 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/btn:animate-[shimmer_1s_infinite]" />
                                                            <div className="relative flex items-center justify-center gap-2">
                                                                <span>Adopt {pet.name}</span>
                                                                <PawPrint size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <button disabled className="w-full bg-slate-50 text-slate-300 font-bold py-4 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-100">
                                                            <span>{pet.status === 'Pending' ? 'Application Pending' : 'Already Found Home'}</span>
                                                            <Heart size={18} className="text-slate-200" fill="currentColor" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </section>

            <Notification
                message={notification.message}
                type={notification.type}
                onClose={dismissNotification}
            />

            <PreferencesModal
                isOpen={isPreferencesModalOpen}
                onClose={() => setIsPreferencesModalOpen(false)}
                initialPreferences={userPreferences}
                onSave={handleSavePreferences}
                currentUser={currentUser}
            />

            <PetProfileView
                pet={selectedPet}
                isOpen={isProfileModalOpen}
                onClose={() => { setIsProfileModalOpen(false); setSelectedPet(null); }}
                onAdopt={handleAdopt}
                onFavorite={handleFavorite}
                isFavorite={isFavorite}
                matchesPreference={matchesPreference}
            />
        </div>
    );
};

export default Adopt;