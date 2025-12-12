// EditFosterProfile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, CheckCircle, Plus, Trash2, Upload, Loader2 } from 'lucide-react';

const EditFosterProfile = ({
  initialData, 
  onSave // This will now just update the parent state locally
}) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  // Initialize Form Data
  const [formData, setFormData] = useState({
      userName: '',
      email: '',
      phone: '',
      address: '',
      household: '',
      currentFosters: [],
      profileImage: '',
      ...initialData // Overwrite defaults with props if they exist
  });

  // Local state for adding a new pet
  const [newFoster, setNewFoster] = useState({ name: '', type: '', breed: '', age: '' });
  
  // Image Preview Logic
  const [imagePreview, setImagePreview] = useState('/static/images/profile.jpeg');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (initialData) {
        setFormData(prev => ({...prev, ...initialData}));
        
        // Handle Image Preview
        if (initialData.profileImage) {
            // Check if it's already a full URL or base64, otherwise append localhost
            const img = initialData.profileImage.startsWith('http') || initialData.profileImage.startsWith('data')
                ? initialData.profileImage 
                : `http://127.0.0.1:8000${initialData.profileImage}`;
            setImagePreview(img);
        }
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { 
        alert('Image size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setImagePreview(base64);
        setFormData({ ...formData, profileImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewFosterChange = (field, value) => {
    setNewFoster({ ...newFoster, [field]: value });
  };

  const handleAddFoster = () => {
    if (newFoster.name.trim() && newFoster.type && newFoster.breed.trim() && newFoster.age.trim()) {
      setFormData({ ...formData, currentFosters: [...formData.currentFosters, { ...newFoster }] });
      setNewFoster({ name: '', type: '', breed: '', age: '' });
    } else {
      alert('Please fill in all fields for the new foster.');
    }
  };

  const handleRemoveFoster = (index) => {
    setFormData({ ...formData, currentFosters: formData.currentFosters.filter((_, i) => i !== index) });
  };

  // --- FIXED SAVE HANDLER ---
  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');

    if (!token) {
        alert("You are not logged in.");
        navigate('/login');
        return;
    }

    try {
        // Construct Payload exactly as Serializer expects
        const payload = {
            userName: formData.userName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            household: formData.household,
            profileImage: formData.profileImage,
            currentFosters: formData.currentFosters // Serializer expects a list of objects
        };

        // Perform the API Request here
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend Error:", errorText);
            throw new Error(`Save failed: ${response.statusText}`);
        }

        const updatedData = await response.json();
        
        // Update App.js state locally so we don't need to refetch immediately
        if (onSave) {
            onSave(updatedData);
        }

        // Success!
        navigate('/profile');

    } catch (error) {
        console.error("Save Error:", error);
        alert("Failed to save profile. Is the backend server running?");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">
      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 10s infinite; } 
        .ease-custom { transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1); } 
        .animate-fade-in { animation: fadeIn 0.8s ease-custom forwards; } 
        .animate-slide-up { animation: slideUp 0.8s ease-custom forwards; } 
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } 
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="min-h-screen bg-[#fffaf5] relative overflow-hidden p-8 md:p-12 flex justify-center">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" 
              style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
          </div>
          <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-[50rem] h-[50rem] bg-orange-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-4xl w-full relative z-10 space-y-8">
          {/* Header */}
          <div className={`text-center transition-all duration-1000 ease-custom transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
              Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Foster Profile</span>
            </h1>
            <p className="text-slate-500 mt-2">Update your foster details and manage your pets</p>
          </div>

          <div className="space-y-8">
            {/* Profile Image Card */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-slide-up`}>
              <h3 className="text-xl font-black text-slate-900 mb-6">Profile Image</h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-1 shadow-lg">
                  <img src={imagePreview} alt="Profile preview" className="w-full h-full rounded-full object-cover bg-white" />
                </div>
                <label className="cursor-pointer bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-2">
                  <Upload size={20} /> Upload New Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-slate-500 text-sm">Supported formats: JPG, PNG. Max size: 5MB.</p>
              </div>
            </div>

            {/* Basic Info Card */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in`}>
              <h3 className="text-xl font-black text-slate-900 mb-6">Basic Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.userName || ''}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="Your username"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in`}>
              <h3 className="text-xl font-black text-slate-900 mb-6">Contact Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="Your full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Household</label>
                  <input
                    type="text"
                    value={formData.household || ''}
                    onChange={(e) => handleInputChange('household', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="Describe your household (e.g., family with kids)"
                  />
                </div>
              </div>
            </div>

            {/* Current Fosters Card */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in`}>
              <h3 className="text-xl font-black text-slate-900 mb-6">Current Fosters</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={newFoster.name}
                    onChange={(e) => handleNewFosterChange('name', e.target.value)}
                    className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="Pet Name"
                  />
                  <select
                    value={newFoster.type}
                    onChange={(e) => handleNewFosterChange('type', e.target.value)}
                    className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                  >
                    <option value="">Select Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={newFoster.breed}
                    onChange={(e) => handleNewFosterChange('breed', e.target.value)}
                    className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="Breed"
                  />
                  <input
                    type="text"
                    value={newFoster.age}
                    onChange={(e) => handleNewFosterChange('age', e.target.value)}
                    className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all"
                    placeholder="Age (e.g., 2 Years)"
                  />
                </div>
                <button
                  onClick={handleAddFoster}
                  className="w-full bg-orange-500 text-white px-6 py-4 rounded-2xl font-bold hover:bg-orange-600 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Foster
                </button>
                <ul className="space-y-2">
                  {formData.currentFosters?.map((foster, index) => (
                    <li key={index} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                      <span className="flex items-center gap-2 font-bold text-slate-700">
                        <CheckCircle size={16} className="text-green-500" /> {foster.name} - {foster.type} • {foster.breed} • {foster.age}
                      </span>
                      <button
                        onClick={() => handleRemoveFoster(index)}
                        className="text-red-500 hover:text-red-600 hover:scale-110 transition-transform"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in`}>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-500 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold hover:border-orange-400 hover:bg-orange-50 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <X size={20} /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFosterProfile;