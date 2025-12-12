import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// prettier-ignore
import { Cat, Dog, PlusCircle, Info, FileText, Loader2, AlertCircle, User, Scale, Calendar, PawPrint, Heart, CheckCircle, Clock, ChevronRight } from 'lucide-react'; 
import toast, { Toaster } from 'react-hot-toast'; 

// --- Configuration ---
const API_BASE = 'http://localhost:8000/api/pets/'; 
const DJANGO_BASE_URL = 'http://localhost:8000'; 
const MAX_PETS_TO_DISPLAY = 4; // Increased limit since we have more space now

// --- Simulated User Context ---
const CURRENT_USER_ID = 1; 

// --- Helper Components ---

/**
 * Enhanced PetListItem
 * Adjusts layout based on screen width: Stacked on mobile, Row on Laptop, Grid on Ultra-wide
 */
const PetListItem = ({ pet }) => { 
    let imageUrl = pet.image || pet.photo || "https://placehold.co/400x400/D1D5DB/6B7280?text=Pet+Photo";
    if (!imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
        const pathFragment = imageUrl.substring(1); 
        imageUrl = `${DJANGO_BASE_URL}/${pathFragment}`;
    }

    const SpeciesIcon = pet.type === 'Dog' ? Dog : pet.type === 'Cat' ? Cat : PawPrint;
    const petStatus = (pet.status || "Inactive").toLowerCase().replace(/\s/g, '-'); 

    let statusConfig = {
        label: 'Inactive', 
        class: 'bg-slate-100 text-slate-600',
        icon: Clock,
    };

    if (petStatus === 'active' || petStatus === 'available') {
        statusConfig = { label: 'Available', class: 'bg-green-100 text-green-700 border-green-300', icon: Heart };
    } else if (petStatus === 'pending-review') {
        statusConfig = { label: 'Pending Review', class: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock };
    } else if (petStatus === 'adopted') {
        statusConfig = { label: 'Adopted', class: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle };
    }

    const StatusIcon = statusConfig.icon;

    return (
        <div className="group relative flex flex-col md:flex-row h-full bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100">
            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600 z-10"></div>

            {/* Image Section - Larger on Desktop */}
            <div className="relative w-full h-56 md:w-64 md:h-auto shrink-0 overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={`Photo of ${pet.name}`} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Status Overlay */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 border text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${statusConfig.class} bg-opacity-90`}>
                    <StatusIcon size={14}/>
                    <span>{statusConfig.label}</span>
                </div>

                {/* Species Icon Overlay */}
                <div className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-orange-600 rounded-full shadow-lg border border-orange-100">
                    <SpeciesIcon size={24} />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors truncate">
                        {pet.name || 'Untitled Pet'}
                    </h3>
                </div>

                {/* Grid for details - Responsive spacing */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-y-4 gap-x-8 mt-4 text-slate-600">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg md:bg-transparent md:p-0">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                            <Calendar size={18} /> 
                        </div>
                        <div className="flex flex-col md:block">
                            <span className="text-xs font-bold text-slate-400 uppercase md:hidden">Age</span>
                            <span className="font-semibold text-slate-800">{pet.age ? `${pet.age} yrs` : 'Unknown'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg md:bg-transparent md:p-0">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                            <Scale size={18} /> 
                        </div>
                        <div className="flex flex-col md:block">
                            <span className="text-xs font-bold text-slate-400 uppercase md:hidden">Weight</span>
                            <span className="font-semibold text-slate-800">{pet.weight ? `${pet.weight} kg` : 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-2 bg-slate-50 rounded-lg md:bg-transparent md:p-0">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                            <PawPrint size={18} /> 
                        </div>
                        <div className="flex flex-col md:block">
                            <span className="text-xs font-bold text-slate-400 uppercase md:hidden">Breed</span>
                            <span className="font-semibold text-slate-800">{pet.breed || 'Mixed Breed'}</span>
                        </div>
                    </div>
                </div>

                {/* View Details Call to Action (Visible on Hover/Desktop) */}
                <div className="hidden md:flex items-center gap-2 mt-6 text-orange-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                    <span>Manage Listing</span>
                    <ChevronRight size={16} />
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const FosterPetListPage = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const url = `${API_BASE}?owner=${CURRENT_USER_ID}&limit=${MAX_PETS_TO_DISPLAY}`; 
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to fetch pet list (Status: ${response.status}).`);
            }

            let data = await response.json();
            if (Array.isArray(data)) {
                 data = data.slice(0, MAX_PETS_TO_DISPLAY);
            }
            setPets(data); 
            
        } catch (err) {
            console.error("Fetch Pet Error:", err);
            setError(err.message || 'A network error occurred while loading pets.');
            toast.error('Could not load pets. Check server connection.', { duration: 5000 });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPets();
    }, [fetchPets]);

    const handleAddPetClick = () => navigate('/add-foster-pet'); 

    let content;

    if (isLoading) {
        content = (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-orange-600">
                <Loader2 size={64} className="animate-spin mb-6" />
                <p className="text-2xl font-bold text-slate-700">Loading your pets...</p>
            </div>
        );
    } else if (error) {
        content = (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-12 bg-red-50 text-red-800 rounded-3xl border-2 border-red-200 shadow-xl">
                <AlertCircle size={64} className="mb-4 text-red-500" />
                <p className='text-2xl font-bold mb-2'>Connection Error</p>
                <p className='text-lg text-center opacity-80'>{error}</p>
                <button onClick={fetchPets} className="mt-6 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-full transition">
                    Try Again
                </button>
            </div>
        );
    } else if (pets.length === 0) {
        content = (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl shadow-sm border border-orange-100">
                <div className="bg-orange-50 p-6 rounded-full mb-6">
                    <Cat size={64} className="text-orange-400" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 mb-4">No Listings Yet</h2>
                <p className="text-slate-500 text-lg max-w-md mb-8">
                    You haven't listed any pets for adoption. Start your journey by creating your first listing today.
                </p>
                <button
                    onClick={handleAddPetClick}
                    className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-orange-500/40 hover:-translate-y-1 transition-all font-bold text-lg"
                >
                    <PlusCircle size={24} className="mr-3" />
                    Create First Listing
                </button>
            </div>
        );
    } else {
        content = (
            <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
                <div className="flex flex-col md:flex-row items-end justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                            <span className="bg-orange-100 p-2 rounded-lg text-orange-600"><FileText size={28}/></span>
                            Your Active Listings
                        </h2>
                        <p className="mt-2 text-slate-500 font-medium text-lg">
                            Managing <span className="text-orange-600 font-bold">{pets.length}</span> pets looking for homes.
                        </p>
                    </div>
                </div>
                
                {/* GRID LAYOUT CHANGE: 
                   - Mobile/Tablet: 1 column (grid-cols-1)
                   - 2XL Screens (Wide Desktop): 2 columns (2xl:grid-cols-2) 
                   This uses the wide screen space much better than a single long list.
                */}
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
                    {pets.map(pet => (
                        <PetListItem key={pet.id} pet={pet} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        // Changed max-w to be much wider and added a subtle background pattern
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-200 selection:text-orange-900 pb-20">
            {/* Subtle background pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fb923c 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <Toaster position="top-right" />

            {/* --- Wide Navbar Style Header --- */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/80">
                <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                            <Dog className="text-orange-600" size={32} strokeWidth={2.5} />
                            My<span className="text-orange-600">Foster</span>Pets
                        </h1>

                        <button
                            onClick={handleAddPetClick}
                            className="hidden md:flex items-center bg-orange-600 hover:bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-slate-500/30 transition-all active:scale-95 font-bold"
                        >
                            <PlusCircle size={20} className="mr-2" />
                            List New Pet
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <main className="relative z-10 max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-12">
                {content}

                {/* --- Footer Status Guide --- */}
                {pets.length > 0 && (
                    <div className="mt-16 border-t border-slate-200 pt-10">
                        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <div className="shrink-0 flex items-center gap-3 text-slate-800">
                                    <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                        <Info size={24} />
                                    </div>
                                    <span className="font-bold text-xl">Status Guide</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100">
                                        <Heart size={24} className="text-green-600 shrink-0"/> 
                                        <div>
                                            <p className="font-bold text-slate-800">Available</p>
                                            <p className="text-sm text-slate-500">Publicly visible for adoption.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-50/50 border border-yellow-100">
                                        <Clock size={24} className="text-yellow-600 shrink-0"/> 
                                        <div>
                                            <p className="font-bold text-slate-800">Pending Review</p>
                                            <p className="text-sm text-slate-500">Awaiting admin approval.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                        <CheckCircle size={24} className="text-blue-600 shrink-0"/>
                                        <div>
                                            <p className="font-bold text-slate-800">Adopted</p>
                                            <p className="text-sm text-slate-500">Successfully rehomed!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Mobile Action Button */}
            <button
                onClick={handleAddPetClick}
                className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform"
                title="List a New Pet"
            >
                <PlusCircle size={32} />
            </button>
        </div>
    );
};

export default FosterPetListPage;