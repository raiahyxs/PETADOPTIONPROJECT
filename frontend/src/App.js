import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// --- AUTH COMPONENTS ---
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

// --- PUBLIC/USER COMPONENTS ---
import LandingPage from './components/LandingPage';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Adopt from './components/AdoptPage';
import UserApplications from './components/user/UserApplications';
import UserProfile from './components/user/UserProfile';
import EditProfile from './components/EditUserProfile';

// --- FOSTER COMPONENTS ---
import FosterProfile from './components/user/FosterProfile';
import EditFosterProfile from './components/EditFosterProfile';
import AddPetPage from './components/FosterAddPetPage';
// ⭐ IMPORT: Add the new MyListedPets component
import MyListedPets from './components/MyListedPets'; 

// --- ADMIN COMPONENTS ---
import AdminInventory from './components/admin/AdminInventory';
import AdminRequests from './components/admin/AdminRequests';
import AdminStats from './components/admin/AdminStats';

// --- LAYOUTS ---
import Layout from './components/Layout';
import FosterLayout from './components/layouts/FosterLayout';

// --- API CONFIGURATION ---
const BASE_URL = 'http://127.0.0.1:8000/api';

// ------------------------------------------------------------------
// Protected Routes
// ------------------------------------------------------------------
const ProtectedRoutes = ({ user, onLogout }) => {
  const currentUser = user || { role: 'user', username: 'Guest', isGuest: true };
  const isAdmin = currentUser.role === 'admin';
  const isFoster = currentUser.role === 'foster';

  // ------------------------------------------------
  // REGULAR USER STATE
  // ------------------------------------------------
  const [userProfileData, setUserProfileData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!isAdmin && !isFoster && !currentUser.isGuest) {
      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setLoadingUser(false);
            return;
          }
          const response = await fetch(`${BASE_URL}/user-profile/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUserProfileData({
              ...data,
              favorites: data.favorites || [],
              preferences: data.preferences || [],
              currentFosters: data.currentFosters || [],
              profileImage: data.profileImage || '',
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUserProfile();
    } else {
      setLoadingUser(false);
    }
  }, [isAdmin, isFoster, currentUser]);

  const handleUserProfileSave = (updatedData) => {
    setUserProfileData(updatedData);
  };

  // ------------------------------------------------
  // FOSTER STATE
  // ------------------------------------------------
  const [fosterProfileData, setFosterProfileData] = useState(null);
  const [loadingFoster, setLoadingFoster] = useState(true);

  useEffect(() => {
    if (isFoster) {
      const fetchFosterProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${BASE_URL}/profile/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setFosterProfileData({
              ...data,
              currentFosters: data.currentFosters || [],
              preferences: data.preferences || [],
              favorites: data.favorites || [],
              profileImage: data.profileImage || '',
            });
          }
        } catch (err) {
          console.error('Error fetching foster profile:', err);
        } finally {
          setLoadingFoster(false);
        }
      };
      fetchFosterProfile();
    }
  }, [isFoster, currentUser]);

  const handleFosterProfileSave = (newFormData) => {
    setFosterProfileData(newFormData);
  };

  // ------------------------------------------------
  // ROUTES
  // ------------------------------------------------
  if (isAdmin) {
    return (
      <Layout user={currentUser} onLogout={onLogout}>
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/inventory" element={<AdminInventory />} />
          <Route path="/requests" element={<AdminRequests />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    );
  }

  if (isFoster) {
    if (loadingFoster) return <div className="p-20 text-center">Loading Foster Profile...</div>;
    const safeFosterData = fosterProfileData || {
      userName: currentUser.username,
      email: '',
      phone: '',
      address: '',
      household: '',
      currentFosters: [],
      profileImage: '',
      preferences: [],
      favorites: [],
    };
    const fosterUserProps = { ...currentUser, avatar: safeFosterData.profileImage };

    return (
      <FosterLayout user={fosterUserProps} onLogout={onLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/foster-dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="/about" element={<About />} />
          
          {/* ⭐ NEW ROUTE ADDED: My Listed Pets */}
          <Route path="/my-pets" element={<MyListedPets />} />
          
          <Route path="/add-pet" element={<AddPetPage user={currentUser} onLogout={onLogout} />} />
          <Route path="/foster-applications" element={<div>Applications Placeholder</div>} />
          <Route path="/profile" element={<FosterProfile user={fosterUserProps} {...safeFosterData} />} />
          <Route path="/edit-profile" element={<EditFosterProfile initialData={safeFosterData} onSave={handleFosterProfileSave} />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FosterLayout>
    );
  }

  if (loadingUser) return <div className="p-20 text-center font-bold text-slate-500">Loading Profile...</div>;
  const safeProfileData = userProfileData || {
    userName: currentUser.username,
    email: currentUser.email,
    phone: '',
    address: '',
    household: '',
    favorites: [],
    preferences: [],
    profileImage: '',
    currentFosters: [],
  };
  const regularUserProps = { ...currentUser, location: safeProfileData.address, avatar: safeProfileData.profileImage, username: safeProfileData.userName };

  return (
    <Layout user={regularUserProps} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/my-applications" element={<UserApplications />} />
        <Route path="/profile" element={<UserProfile user={regularUserProps} {...safeProfileData} />} />
        <Route path="/edit-profile" element={<EditProfile initialData={safeProfileData} onSave={handleUserProfileSave} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// ------------------------------------------------------------------
// Main App
// ------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('petUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      const u = await response.json();
      setUser(u);
      localStorage.setItem('petUser', JSON.stringify(u));
      if (u.token) localStorage.setItem('token', u.token);

      if (u.role === 'foster') navigate('/');
      else if (u.role === 'admin') navigate('/');
      else navigate('/profile');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('petUser');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={<SignIn onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/*" element={<ProtectedRoutes user={user} onLogout={handleLogout} />} />
    </Routes>
  );
}