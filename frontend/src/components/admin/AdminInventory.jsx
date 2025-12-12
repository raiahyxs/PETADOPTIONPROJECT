import React, { useState, useEffect, useMemo } from 'react';

import {
  Plus, Edit2, Trash2, Dog, Cat, Search, Sparkles, X, CheckCircle, AlertCircle, Venus, Mars,
  LayoutDashboard, PawPrint, Eye, Heart, Bone, Fish, User, Home, Shield,
} from 'lucide-react';

// --- Real API (Django Backend Endpoints) ---
const API_BASE = 'http://localhost:8000/api/pets/';
const API_APPLICATIONS = 'http://localhost:8000/api/applications/';

// --- Constants ---
const MAX_CAPACITY = 200; // Assuming a maximum capacity of 200 animals for calculation

const api = {
  fetchPets: async () => {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch pets');
    
    const pets = await res.json();
    
    // ⭐ MODIFIED MOCKING: Distinguish between Admin and Foster for demonstration
    return pets.map(p => ({
      ...p,
      // Assume this field is returned by the API or a default is set
      created_by_user_name: p.created_by_user_name || (Math.random() > 0.6 ? 'Admin User' : (Math.random() > 0.5 ? 'Foster Care A' : 'Foster Volunteer B')),
    }));
  },
  fetchApplications: async () => {
    try {
      const res = await fetch(API_APPLICATIONS);
      if (!res.ok) throw new Error('Failed to fetch applications');
      return await res.json();
    } catch (e) {
      return [
        { id: 1, pet: 101, pet_name: 'Max', requester_name: 'John Doe', status: 'Pending', created_at: '2025-12-01T...' },
        { id: 41, pet: 41, pet_name: 'Hershey', requester_name: 'Maloi', status: 'Approved', created_at: '2025-12-08T...' }, 
        { id: 3, pet: 102, pet_name: 'Luna', requester_name: 'Jane Smith', status: 'Approved', created_at: '2025-12-05T...' },
      ];
    }
  },
  createPet: async (petData) => {
    const formData = new FormData();
    formData.append('name', petData.name);
    formData.append('breed', petData.breed);
    formData.append('age', petData.age);
    formData.append('type', petData.type);
    formData.append('status', petData.status);
    formData.append('sex', petData.sex);
    formData.append('weight', petData.weight);
    if (petData.image && petData.image instanceof File) {
      formData.append('image', petData.image);
    }
    const res = await fetch(API_BASE, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create pet');
    return await res.json();
  },
  updatePet: async (id, petData) => {
    const formData = new FormData();
    formData.append('name', petData.name);
    formData.append('breed', petData.breed);
    formData.append('age', petData.age);
    formData.append('type', petData.type);
    formData.append('status', petData.status);
    formData.append('sex', petData.sex);
    formData.append('weight', petData.weight);

    if (petData.image && petData.image instanceof File) {
      formData.append('image', petData.image);
    }

    const res = await fetch(`${API_BASE}${id}/`, {
      method: 'PUT',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update pet');
    return await res.json();
  },
  deletePet: async (id) => {
    const res = await fetch(`${API_BASE}${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete pet');
    return { success: true };
  }
};

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Available');
  const [viewMode, setViewMode] = useState('All');

  const [viewingPet, setViewingPet] = useState(null); 

  const [newPet, setNewPet] = useState({ name: '', breed: '', age: '', weight: '', type: 'Dog', status: 'Available', sex: 'UNKNOWN', image: null });
  const [imagePreview, setImagePreview,] = useState(null);
  const [editPetId, setEditPetId] = useState(null);

  useEffect(() => {
    setMounted(true);
    loadPets();
  }, []);

  const loadPets = async () => {
    setLoading(true);

    try {
      const [petsData, applicationData] = await Promise.all([
        api.fetchPets(),
        api.fetchApplications() 
      ]);

      const pendingApplications = applicationData.filter(app => app.status === 'Pending');
      const approvedApplications = applicationData.filter(app => app.status === 'Approved');

      const mergedPets = petsData.map(pet => {
        const approvedApplication = approvedApplications.find(app =>
          app.pet_name && (app.pet_name.toLowerCase() === pet.name.toLowerCase() || (pet.id && app.pet === pet.id))
        );

        if (approvedApplication) {
          return {
            ...pet,
            status: 'Adopted',
            adopted_by_user_name: approvedApplication.requester_name
          };
        }

        const hasPendingApplication = pendingApplications.some(app =>
          app.pet_name && (app.pet_name.toLowerCase() === pet.name.toLowerCase() || (pet.id && app.pet === pet.id)) && pet.status !== 'Adopted'
        );

        if ((pet.status === 'Available' || pet.status === 'Pending') && hasPendingApplication) {
          return { ...pet, status: 'Pending' };
        }

        return pet;
      });

      setPets(mergedPets);
      setLoading(false);

    } catch (error) {
      console.error("Failed to load or merge pet/application data:", error);
      try {
        const defaultPets = await api.fetchPets();
        setPets(defaultPets);
      } catch { }
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this pet from the list?')) {
      setPets(pets.filter(p => p.id !== id));
      try {
        await api.deletePet(id);
      } catch { }
    }
  };

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    if (editPetId) {
      try {
        const updatedPet = await api.updatePet(editPetId, newPet);
        setPets(pets.map(p => (p.id === editPetId ? updatedPet : p)));
      } catch { }
    } else {
      try {
        const createdPet = await api.createPet(newPet);
        setPets([createdPet, ...pets]);
      } catch { }
    }
    handleModalClose();
    loadPets();
  };

  const openEditModal = (pet) => {
    setEditPetId(pet.id);
    setNewPet({
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight || '',
      type: pet.type,
      status: pet.status,
      sex: pet.sex,
      image: null, 
    });
    setImagePreview(
      pet.image
        ? (pet.image.startsWith('http')
          ? pet.image
          : `http://localhost:8000${pet.image.startsWith('/') ? pet.image : '/' + pet.image}`)
        : null
    );
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditPetId(null);
    setNewPet({ name: '', breed: '', age: '', weight: '', type: 'Dog', status: 'Available', sex: 'UNKNOWN', image: null });
    setImagePreview(null);
  };

  const filteredPets = useMemo(() => {
    return pets.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.breed.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = p.status === filterStatus;

      const matchesViewMode = viewMode === 'All' || (viewMode === 'Dogs' && p.type === 'Dog') || (viewMode === 'Cats' && p.type === 'Cat');

      return matchesSearch && matchesStatus && matchesViewMode;
    });
  }, [pets, searchTerm, filterStatus, viewMode]);

  const totalDogs = pets.filter(p => p.type === 'Dog').length;
  const totalCats = pets.filter(p => p.type === 'Cat').length;
  const capacityPercentage = Math.round((pets.length / MAX_CAPACITY) * 100);

  const getPetImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http')
      ? imagePath
      : `http://localhost:8000${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  }


  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">
      <style>{`
          @keyframes shimmer {
              0% { transform: skewX(-12deg) translateX(-100%); }
              100% { transform: skewX(-12deg) translateX(200%); }
          }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 10s infinite; }
          .ease-custom { transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
        `}</style>

      <div className="min-h-screen bg-[#fffaf5] relative overflow-hidden p-4 md:p-8 flex justify-center">

        {/* --- Background Elements --- */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
          </div>
          <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-[50rem] h-[50rem] bg-orange-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* ⭐ Main Content Container: max-w-screen-2xl for wide layout */}
        <div className="max-w-screen-2xl w-full relative z-10"> 

          {/* Header & Actions */}
          <div className={`flex flex-col md:flex-row justify-between items-end gap-8 mb-10 transition-all duration-1000 ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <LayoutDashboard size={14} /> Pet Management
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Pet <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">List</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mt-2 font-medium">Manage and track all adoptable pets.</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto group relative bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 hover:scale-105 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-500/20 flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shimmer_1s_infinite]" />
              <Plus size={24} /> Add New Pet
            </button>
          </div>

          {/* Stats Grid - Responsive Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 transition-all duration-1000 delay-100 ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <StatCard icon={<Dog size={28} />} label="Total Dogs" value={totalDogs} color="bg-orange-50 text-orange-600 border-orange-100" />
            <StatCard icon={<Cat size={28} />} label="Total Cats" value={totalCats} color="bg-blue-50 text-blue-600 border-blue-100" />
            <StatCard icon={<Sparkles size={28} />} label="Total Pets" value={pets.length} color="bg-purple-50 text-purple-600 border-purple-100" />
            <StatCard
              icon={<LayoutDashboard size={28} />}
              label="Capacity Used"
              value={`${capacityPercentage}%`}
              color="bg-green-50 text-green-600 border-green-100"
            />
          </div>

          {/* Search & Filter Toolbar */}
          <div className={`bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-sm border border-white/60 mb-8 flex flex-col xl:flex-row items-center gap-4 transition-all duration-1000 delay-200 ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="flex items-center w-full xl:w-auto flex-1 px-2">
              <Search size={20} className="text-slate-400 mr-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name or breed..."
                className="w-full bg-transparent border-none outline-none py-2 text-lg font-medium text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* View Mode Filter Buttons */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 p-2 xl:p-0 flex-shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-4 w-full xl:w-auto">
              <button
                onClick={() => setViewMode('All')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                  viewMode === 'All'
                    ? 'bg-slate-900 text-white shadow-lg border-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <PawPrint size={16} className="inline mr-1" /> All
              </button>
              <button
                onClick={() => setViewMode('Dogs')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                  viewMode === 'Dogs'
                    ? 'bg-orange-600 text-white shadow-lg border-orange-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
              >
                <Dog size={16} className="inline mr-1" /> Dogs
              </button>
              <button
                onClick={() => setViewMode('Cats')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                  viewMode === 'Cats'
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <Cat size={16} className="inline mr-1" /> Cats
              </button>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 p-2 xl:p-0 flex-shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-4 w-full xl:w-auto">
              {['Available', 'Pending', 'Adopted'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    filterStatus === status
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Cards Grid */}
          <PetCardsGrid
            filteredPets={filteredPets}
            loading={loading}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            handleDelete={handleDelete}
            openEditModal={openEditModal}
            setViewingPet={setViewingPet}
            getPetImageUrl={getPetImageUrl}
          />

        </div>

        {/* --- Add/Edit Pet Modal (UNCHANGED logic, responsive sizing) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={handleModalClose}
            ></div>

            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <button
                onClick={handleModalClose}
                className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {editPetId ? "Edit Pet Profile" : "Add New Pet"}
              </h2>
              <p className="text-slate-500 mb-8">
                {editPetId ? "Update the details for this pet." : "Enter the details for the new furry friend."}
              </p>

              <form onSubmit={handleAddOrEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Name</label>
                      <input
                        required
                        placeholder="Pet Name"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                        value={newPet.name}
                        onChange={e => setNewPet({ ...newPet, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Breed</label>
                      <input
                        required
                        placeholder="e.g. Golden Retriever"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                        value={newPet.breed}
                        onChange={e => setNewPet({ ...newPet, breed: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Age (Yrs)</label>
                        <input
                          required
                          type="number"
                          placeholder="e.g. 2"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                          value={newPet.age}
                          onChange={e => setNewPet({ ...newPet, age: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 5.5"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                          value={newPet.weight}
                          onChange={e => setNewPet({ ...newPet, weight: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Dog', 'Cat'].map(type => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => !editPetId && setNewPet({ ...newPet, type })}
                            className={`p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                              newPet.type === type
                                ? 'bg-orange-50 border-orange-400 text-orange-600'
                                : (editPetId
                                  ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
                                )
                              }`}
                            disabled={!!editPetId}
                          >
                            {type === 'Dog' ? <Dog size={20} /> : <Cat size={20} />} {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
                      <select
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all appearance-none"
                        value={newPet.status}
                        onChange={e => setNewPet({ ...newPet, status: e.target.value })}
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Adopted">Adopted</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Gender</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[['MALE', 'Male', Mars, 'text-blue-600'], ['FEMALE', 'Female', Venus, 'text-pink-600'], ['UNKNOWN', 'Unknown', AlertCircle, 'text-slate-400']].map(([value, label, Icon, iconColor]) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setNewPet({ ...newPet, sex: value })}
                          className={`p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 text-sm transition-all border-2 ${
                            newPet.sex === value
                              ? 'bg-orange-50 border-orange-400 text-slate-800'
                              : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
                            }`}
                        >
                          <Icon size={20} className={newPet.sex === value ? 'text-orange-600' : iconColor} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      onChange={e => {
                        const file = e.target.files[0];
                        setNewPet({ ...newPet, image: file });
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          setImagePreview(null);
                        }
                      }}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-2xl border border-slate-200 shadow"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-200 transition-all active:scale-[0.98]"
                  >
                    {editPetId ? "Save Changes" : "Add to Pet List"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Pet Profile Modal --- */}
        {viewingPet && (
          <PetProfileModal
            pet={viewingPet}
            onClose={() => setViewingPet(null)}
            getPetImageUrl={getPetImageUrl}
            openEditModal={openEditModal}
          />
        )}

      </div>
    </div>
  );
};


// --- NEW COMPONENT: Pet Cards Grid (Responsive Grid Logic) ---
const PetCardsGrid = ({ filteredPets, loading, searchTerm, filterStatus, handleDelete, openEditModal, setViewingPet, getPetImageUrl }) => {
  return (
    <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white overflow-hidden p-8 transition-all duration-1000 ease-custom`}>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-50 p-6 rounded-3xl h-64">
              <div className="h-40 bg-slate-100 rounded-xl mb-4"></div>
              <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-medium text-lg">
          <div className="flex flex-col items-center gap-3">
            <Dog size={48} className="text-slate-200 mb-2" />
            No pets found matching "{searchTerm}" {filterStatus !== 'All' ? ` with status "${filterStatus}"` : ''}.
          </div>
        </div>
      ) : (
        // ⭐ RESPONSIVE GRID: 1 col mobile, 2 col md, 3 col lg, 4 col xl
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map((pet, index) => (
            <PetCard
              key={pet.id}
              pet={pet}
              index={index}
              handleDelete={handleDelete}
              openEditModal={openEditModal}
              onViewProfile={setViewingPet}
              getPetImageUrl={getPetImageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};


// --- MODIFIED COMPONENT: Pet Card (For the Grid View) ---
const PetCard = ({ pet, handleDelete, openEditModal, onViewProfile, getPetImageUrl }) => {
  return (
    <div
      className="group relative bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 overflow-hidden hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewProfile(pet)} // Open profile on card click
    >
      {/* Image container height */}
      <div className="h-64 rounded-2xl mb-4 overflow-hidden bg-slate-50 border border-slate-100">
        {pet.image ? (
          <img
            src={getPetImageUrl(pet.image)}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            style={{ background: "#f3f4f6" }}
            onError={e => { e.target.style.display = 'none'; }}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xl">
            <PawPrint size={40} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-1">
        <div className="flex items-center justify-between mb-2">
          <p className="font-black text-slate-900 text-2xl leading-snug">{pet.name}</p>
          <StatusBadge status={pet.status} />
        </div>
        <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
          {pet.type} &middot; {pet.breed}
          {pet.sex === 'MALE' && <Mars size={14} className="text-blue-500" title="Male" />}
          {pet.sex === 'FEMALE' && <Venus size={14} className="text-pink-500" title="Female" />}
        </p>
        <p className="text-slate-400 text-xs mt-1">
          {pet.age} Yrs / {pet.weight || '--'} kg
        </p>
      </div>

      {/* Hover Actions (Absolute position, hidden by default) */}
      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl">
        <button
          className="p-3 bg-white text-orange-500 rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); openEditModal(pet); }}
          type="button"
          title="Edit Pet"
        >
          <Edit2 size={20} />
        </button>
        <button
          className="p-3 bg-white text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); handleDelete(pet.id); }}
          title="Delete Pet"
        >
          <Trash2 size={20} />
        </button>
        <button
          className="p-3 bg-orange-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); onViewProfile(pet); }}
          title="View Profile"
        >
          <Eye size={20} />
        </button>
      </div>
    </div>
  );
};


// --- MODIFIED COMPONENT: Pet Profile Modal (CENTERED & SCROLLABLE) ---
const PetProfileModal = ({ pet, onClose, getPetImageUrl, openEditModal }) => {

  const petIcon = pet.type === 'Dog' ? <Dog size={48} className="text-orange-500" /> : <Cat size={48} className="text-blue-500" />;
  const genderIcon = pet.sex === 'MALE' ? <Mars size={24} className="text-blue-500" /> : pet.sex === 'FEMALE' ? <Venus size={24} className="text-pink-500" /> : <AlertCircle size={24} className="text-slate-400" />;

  // Adoption Summary Text
  const adoptionSummary = `Our sweet ${pet.name} is a **${pet.age || 'young'}**-year-old, **${pet.sex.toLowerCase()} ${pet.breed}**. They are ${
    pet.status === 'Available' ? '**currently ready to meet their new family!** We are actively seeking a loving, forever home for this wonderful companion.' :
      pet.status === 'Pending' ? '**under review for adoption by a potential family.** Keep checking back!' :
        `**happily adopted by ${pet.adopted_by_user_name || ' a loving family'}!** This success story is why we do what we do!`
    } ${pet.type === 'Dog' ? 'A cozy couch and' : 'A window perch and'} lots of ear scratches are mandatory!`;

  // Logic to determine user role for the "Registered By" field
  const creatorName = pet.created_by_user_name || 'Shelter Admin';
  const isFoster = creatorName.toLowerCase().includes('foster');
  
  const creatorDetails = {
    icon: isFoster ? <User size={20} className="text-purple-500" /> : <Shield size={20} className="text-indigo-500" />,
    label: isFoster ? 'Registered By (Foster)' : 'Registered By (Admin)',
    value: creatorName,
    color: isFoster ? 'bg-purple-50' : 'bg-indigo-50',
    iconColor: isFoster ? 'text-purple-500' : 'text-indigo-500',
  };


  return (
    // ⭐ OUTER CONTAINER: Flexbox for perfect centering
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"> 
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Panel: Vertically constrained and scrollable */}
      <div className="
          relative w-full max-w-3xl 
          bg-white rounded-[2rem] shadow-2xl 
          border border-slate-100
          flex flex-col 
          max-h-[90vh] /* ⭐ KEY: Ensures modal fits vertically */
          animate-in fade-in zoom-in duration-300
      ">

        {/* --- Header (Fixed) --- */}
        <div className="flex-shrink-0 p-6 border-b border-slate-100 flex justify-between items-start bg-white/80 backdrop-blur-sm rounded-t-[2rem] z-10">
             <div className="flex-1 pr-8">
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{pet.name}</h2>
                    <StatusBadge status={pet.status} />
                </div>
                <p className="text-xl font-medium text-slate-500">{pet.breed}</p>
             </div>
             <button
                onClick={onClose}
                className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
             >
                <X size={20} />
             </button>
        </div>

        {/* --- Scrollable Body --- */}
        <div className="p-6 md:p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Image Column */}
            <div className="md:col-span-1">
                <div className="w-full h-auto aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-lg">
                {pet.image ? (
                    <img
                    src={getPetImageUrl(pet.image)}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 font-bold text-xl">
                    <PawPrint size={60} />
                    No Image
                    </div>
                )}
                </div>
                <button
                onClick={() => { onClose(); openEditModal(pet); }}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors"
                >
                <Edit2 size={18} /> Edit Profile
                </button>
            </div>

            {/* Details Column */}
            <div className="md:col-span-2">
                
                {/* NEW SECTION: PET VITALS */}
                <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 pb-2 flex items-center gap-2 mb-4 border-b border-slate-100">
                    🐾 Pet Vitals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailItem
                    icon={pet.type === 'Dog' ? <Bone size={20} className="text-orange-500" /> : <Fish size={20} className="text-blue-500" />}
                    label="Furry Family Type"
                    value={pet.type}
                    color={pet.type === 'Dog' ? 'bg-orange-50' : 'bg-blue-50'}
                    iconColor={pet.type === 'Dog' ? 'text-orange-500' : 'text-blue-500'}
                    />
                    <DetailItem icon={genderIcon} label="Gender" value={pet.sex === 'UNKNOWN' ? 'N/A' : pet.sex} color={pet.sex === 'MALE' ? 'bg-blue-50' : pet.sex === 'FEMALE' ? 'bg-pink-50' : 'bg-slate-50'} iconColor={pet.sex === 'MALE' ? 'text-blue-500' : pet.sex === 'FEMALE' ? 'text-pink-500' : 'text-slate-400'} />
                    <DetailItem
                    icon={<Sparkles size={20} className="text-orange-500" />}
                    label="Estimated Age"
                    value={`${pet.age || 'N/A'} Years`}
                    color="bg-orange-50"
                    iconColor="text-orange-500"
                    />
                    <DetailItem
                    icon={<PawPrint size={20} className="text-green-500" />}
                    label="Current Weight"
                    value={`${pet.weight || 'Unknown'} kg`}
                    color="bg-green-50"
                    iconColor="text-green-500"
                    />
                </div>
                </div>
                
                {/* NEW SECTION: STATUS AND HISTORY */}
                <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 pb-2 flex items-center gap-2 mb-4 border-b border-slate-100">
                    🏡 Status & History
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <DetailItem
                    icon={creatorDetails.icon}
                    label={creatorDetails.label}
                    value={creatorDetails.value}
                    color={creatorDetails.color}
                    iconColor={creatorDetails.iconColor}
                    />
                    <DetailItem
                    icon={<Home size={20} className={pet.status === 'Adopted' ? 'text-green-500' : 'text-red-500'} />}
                    label="Adopted By"
                    value={
                        pet.status === 'Adopted' && pet.adopted_by_user_name 
                        ? `${pet.adopted_by_user_name} ✨`
                        : 'Awaiting Forever Home'
                    }
                    color={pet.status === 'Adopted' ? 'bg-green-50' : 'bg-red-50'}
                    iconColor={pet.status === 'Adopted' ? 'text-green-500' : 'text-red-500'}
                    />
                </div>
                </div>


                {/* Adoption Summary content */}
                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Heart size={20} className="text-red-500" /> Adoption Story
                </h3>
                <p className="text-slate-600">
                    <span dangerouslySetInnerHTML={{ __html: adoptionSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </p>
                </div>
            </div>
            </div>
        </div>

      </div>
    </div>
  );
};


// --- Helper for Profile Modal (UNCHANGED) ---
const DetailItem = ({ icon, label, value, color, iconColor }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
    <div className={`p-3 rounded-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-black text-slate-800 leading-snug">{value}</p>
    </div>
  </div>
);


const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white p-6 rounded-[2.5rem] border shadow-sm flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 ${color.replace('bg-', 'border-').replace('text-', 'border-opacity-20 ')}`}>
    <div className={`p-4 rounded-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);


const StatusBadge = ({ status }) => {
  const styles = {
    Available: 'bg-green-100 text-green-700 border-green-200',
    Adopted: 'bg-slate-100 text-slate-500 border-slate-200',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${styles[status] || styles.Available}`}>
      {status === 'Available' && <CheckCircle size={14} strokeWidth={3} />}
      {status === 'Adopted' && <CheckCircle size={14} strokeWidth={3} />}
      {status === 'Pending' && <AlertCircle size={14} strokeWidth={3} />}
      {status}
    </span>
  );
};


export default PetList;