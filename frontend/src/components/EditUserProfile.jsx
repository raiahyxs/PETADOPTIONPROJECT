// EditProfile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Heart, Upload, Tag } from 'lucide-react';

// --- Sub-Component: Tag Card (re-used from UserProfile.jsx for consistency) ---
const TagCard = ({ label, onRemove }) => (
    <span className="inline-flex items-center px-3 py-2 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer group hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
        {label}
        <button
            onClick={onRemove}
            className="ml-2 -mr-1 p-0.5 rounded-full bg-slate-200/50 text-slate-500 group-hover:bg-red-200 group-hover:text-red-600 transition-colors"
        >
            <X size={10} />
        </button>
    </span>
);

const EditProfile = ({
  initialData = {
    userName: '',
    email: '',
    phone: '',
    address: '', 
    household: '',
    profileImage: '', 
    favorites: [],
    preferences: [] 
  },
  onSave
}) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [imagePreview, setImagePreview] = useState(initialData.profileImage || '');
  const [newPreference, setNewPreference] = useState(''); 

  useEffect(() => {
    setFormData(initialData);
    if (initialData.profileImage) {
        setImagePreview(initialData.profileImage);
    }
    setMounted(true);
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

  // --- PREFERENCES LOGIC ---
  const handleAddPreference = () => {
    const trimmed = newPreference.trim();
    if (trimmed && !formData.preferences.includes(trimmed)) {
        setFormData({ ...formData, preferences: [...formData.preferences, trimmed] });
        setNewPreference(''); // Clear input after adding
    }
  };

  const handleRemovePreference = (tagToRemove) => {
    setFormData({ 
        ...formData, 
        preferences: formData.preferences.filter(tag => tag !== tagToRemove) 
    });
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("You are not logged in (No token found).");
        navigate("/login");
        return;
      }

      const payload = {
          userName: formData.userName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          household: formData.household, 
          // UPDATED: Include preferences in payload
          favorites: formData.favorites, 
          preferences: formData.preferences, 
          profileImage: formData.profileImage
      };

      try {
          const response = await fetch("http://127.0.0.1:8000/api/user-profile/", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Token ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text(); 
            console.error("Backend Error:", errorText);
            
            if (response.status === 401) {
                alert("Session expired. Please log in again.");
                navigate("/login");
                return;
            }
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
          }

          const updatedProfile = await response.json();
          onSave(updatedProfile);
          navigate("/profile");

      } catch (networkError) {
          console.error("Network Error:", networkError);
          alert("Could not connect to the server. Is your Django backend running on port 8000?");
      }

    } catch (err) {
      console.error("General Error:", err);
      alert("Something went wrong.");
    }
  };


  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">
      {/* Styles for animation (kept for context) */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
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
              Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Profile</span>
            </h1>
            <p className="text-slate-500 mt-2">Update your details and preferences</p>
          </div>
          
          <div className="space-y-8">
            {/* Profile Image Card */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-slide-up`}>
              <h3 className="text-xl font-black text-slate-900 mb-6">Profile Image</h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-1 shadow-lg">
                   {/* Fallback image logic */}
                  <img 
                    src={imagePreview || 'https://via.placeholder.com/150'} 
                    alt="Profile preview" 
                    className="w-full h-full rounded-full object-cover bg-white" 
                  />
                </div>
                <label className="cursor-pointer bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-2">
                  <Upload size={20} /> Upload New Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-slate-500 text-sm">Supported: JPG, PNG. Max: 5MB.</p>
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
                  <label className="block text-sm font-bold text-slate-600 mb-2">Household Description</label>
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

            {/* NEW: Preferences Card (Styled using slate/orange/red palette) */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in`}>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Tag size={24} className="text-orange-500" /> Adoption Preferences
              </h3>
              <p className="text-slate-500 mb-4">Add tags to describe the type of pet you are looking for (e.g., Cat-friendly, Senior, Quiet).</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.preferences?.map((tag) => (
                    <TagCard 
                        key={tag} 
                        label={tag} 
                        onRemove={() => handleRemovePreference(tag)} 
                    />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                    type="text"
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent form submission
                            handleAddPreference();
                        }
                    }}
                    className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all text-sm"
                    placeholder="e.g., Small dog, Hypoallergenic"
                />
                <button
                    onClick={handleAddPreference}
                    className="bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold text-sm hover:bg-orange-500 transition-all active:scale-95"
                    disabled={!newPreference.trim()}
                >
                    Add
                </button>
              </div>
            </div>
            {/* END NEW: Preferences Card */}

            {/* Favorites Card (with removal logic) */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in`}>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Heart size={24} className="text-red-500" /> Favorite Pets
              </h3>
              <p className="text-slate-500 mb-4">You have **{formData.favorites?.length || 0} favorite pet{formData.favorites?.length === 1 ? '' : 's'}**. Click **X** to remove or visit the Adopt page to add more!</p>
              <div className="flex flex-wrap gap-4">
                {formData.favorites?.map((favorite, index) => (
                    <div key={index} className="relative group/fav">
                        {favorite.pet && favorite.pet.image ? (
                            <img 
                                src={favorite.pet.image.url || favorite.pet.image} 
                                alt={favorite.pet.name || 'Pet'} 
                                className="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-white group-hover/fav:border-red-400 transition-all" 
                            />
                        ) : (
                            // Fallback div if image URL is missing
                            <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                                <Heart size={32} />
                            </div>
                        )}
                        <button
                            onClick={() => setFormData({ ...formData, favorites: formData.favorites.filter((_, i) => i !== index) })}
                            className="absolute -top-3 -right-3 bg-red-500 text-white w-7 h-7 rounded-full p-1 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 active:scale-90"
                            title={`Remove ${favorite.pet?.name || 'favorite'}`}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in`}>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-500 hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Save size={20} /> Save Changes
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold hover:border-orange-400 hover:bg-orange-50 hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
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

export default EditProfile;