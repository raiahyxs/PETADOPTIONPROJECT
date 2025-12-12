import React, { useState } from 'react';

import { PawPrint, ArrowLeft, User, Lock, ChevronRight, Eye, EyeOff } from 'lucide-react'; // Added Eye and EyeOff

import { useNavigate } from 'react-router-dom';



// --- Real API (Django Backend Endpoints) ---

const API_BASE = 'http://localhost:8000/api/';



// Validate login against accounts API before calling login endpoint

const validateAccount = async (username) => {

  const res = await fetch(`${API_BASE}accounts/?username=${encodeURIComponent(username)}`);

  if (!res.ok) throw new Error('Failed to fetch accounts');

  const accounts = await res.json();

  return accounts.length > 0 ? accounts[0] : null;

};



const loginWithApi = async (username, password) => {

  // First, check if account exists

  const account = await validateAccount(username);

  if (!account) throw new Error('Account does not exist');



  // Then, try login

  const res = await fetch(`${API_BASE}login/`, {

    method: 'POST',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({ username, password }),

  });

  if (!res.ok) {

    const err = await res.json().catch(() => ({}));

    throw new Error(err.detail || 'Invalid credentials');

  }

  return await res.json();

};



const SignIn = ({ onLogin }) => {

  const [formData, setFormData] = useState({ username: '', password: '' });

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const [showPassword, setShowPassword] = useState(false); // ⭐ New State for show/hide

  const navigate = useNavigate();



  const handleUsernameChange = (e) => {

    setFormData({ ...formData, username: e.target.value });

  };



  const handlePasswordChange = (e) => {

    setFormData({ ...formData, password: e.target.value });

  };



  // ⭐ New Handler to toggle password visibility

  const togglePasswordVisibility = () => {

    setShowPassword(prev => !prev);

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setIsLoading(true);

    setError(null);



    try {

      const user = await loginWithApi(formData.username, formData.password);

      setIsLoading(false);



      // Save user info in localStorage

      localStorage.setItem('petUser', JSON.stringify(user));



      // ⭐ ROLE-BASED REDIRECT ⭐

      if (user.role === 'poster' || user.role === 'foster') {

        navigate('/foster-dashboard');

      } else {

        navigate('/user-profile');

      }



      if (onLogin) onLogin(formData.username, formData.password, user);



    } catch (err) {

      setIsLoading(false);

      setError(err.message);

    }

  };



  return (

    <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden">

      

      {/* Decorative Background Elements */}

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">

        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>

        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px] mix-blend-multiply"></div>

      </div>



      {/* MAIN CARD CONTAINER */}

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(234,88,12,0.1)] w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[650px] transition-all duration-300 border border-white/50">

        

        {/* LEFT SIDE */}

        <div className="relative w-full md:w-5/12 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-6 md:p-12 flex flex-col justify-between overflow-hidden text-white group shrink-0">

          <div className="absolute inset-0 opacity-10 mix-blend-soft-light" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

          <div className="absolute top-[-20%] right-[-30%] w-80 h-80 bg-white/20 rounded-full blur-3xl transition-transform duration-1000 group-hover:translate-y-4"></div>

          <div className="absolute bottom-[-10%] left-[-20%] w-96 h-96 bg-orange-700/30 rounded-full blur-3xl mix-blend-overlay transition-transform duration-1000 group-hover:-translate-y-4"></div>



          <button 

            onClick={() => navigate('/')}

            className="relative z-20 self-start flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm transition-all border border-white/20 text-sm font-medium shadow-sm"

          >

            <ArrowLeft size={16} />

            <span className="hidden sm:inline">Back</span>

          </button>



          <div className="relative z-10 flex flex-col items-center text-center my-4 md:my-auto">

            <div className="mb-4 md:mb-8 p-5 rounded-[2rem] bg-black/20 backdrop-blur-md shadow-lg ring-1 ring-white/10 transform hover:scale-110 transition-transform duration-500 hover:rotate-6">

              <PawPrint size={56} className="text-white drop-shadow-md" />

            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 md:mb-4 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-b from-white to-orange-100">

              Pawsom

            </h1>

            <p className="text-orange-50 text-sm md:text-lg font-medium leading-relaxed max-w-xs drop-shadow-sm opacity-90 hidden sm:block">

              Every pet deserves a loving home. Start your journey today.

            </p>

          </div>



          <div className="relative z-10 text-xs text-orange-100/70 text-center md:text-left font-medium hidden md:block">

            © 2024 Pawsom Inc.

          </div>

        </div>



        {/* RIGHT SIDE FORM */}

        <div className="w-full md:w-7/12 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">

          <div className="max-w-md mx-auto w-full">

            <div className="mb-10">

              <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Welcome Back</h2>

              <p className="text-slate-500 font-medium">We missed you! Please enter your details.</p>

            </div>



            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="group space-y-2">

                <label htmlFor="username" className="text-sm font-bold text-slate-700 ml-1">Username</label>

                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">

                    <User size={20} />

                  </div>

                  <input 

                    id="username"

                    type="text" 

                    name="username"

                    value={formData.username}

                    required

                    placeholder="Enter your username"

                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all shadow-sm hover:border-slate-300"

                    onChange={handleUsernameChange}

                  />

                </div>

              </div>



              <div className="group space-y-2">

                <div className="flex justify-between items-center ml-1">

                  <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>

                  <button type="button" className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">

                    Forgot Password?

                  </button>

                </div>

                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">

                    <Lock size={20} />

                  </div>

                  <input 

                    id="password"

                    // ⭐ Dynamic type based on showPassword state

                    type={showPassword ? 'text' : 'password'} 

                    name="password"

                    value={formData.password}

                    required

                    placeholder="••••••••"

                    // ⭐ Added pr-12 for icon space

                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all shadow-sm hover:border-slate-300"

                    onChange={handlePasswordChange}

                  />

                  {/* ⭐ Show/Hide Toggle Button */}

                  <button 

                    type="button" 

                    onClick={togglePasswordVisibility}

                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"

                    aria-label={showPassword ? 'Hide password' : 'Show password'}

                  >

                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}

                  </button>

                </div>

              </div>



              {error && (

                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm mb-4">

                  {error}

                </div>

              )}



              <button 

                type="submit" 

                disabled={isLoading}

                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-orange-500 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-orange-500/30 flex items-center justify-center gap-2 group mt-8 disabled:opacity-70"

              >

                {isLoading ? (

                  <span className="animate-pulse">Signing in...</span>

                ) : (

                  <>

                    Sign In <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />

                  </>

                )}

              </button>

            </form>



            <div className="mt-8 text-center space-y-6">

              <p className="text-slate-500 font-medium text-sm">

                New to Pawsom?{' '}

                <button 

                  onClick={() => navigate('/signup')} 

                  className="text-orange-500 font-bold hover:text-orange-600 hover:underline decoration-2 underline-offset-4 transition-all"

                >

                  Create Account

                </button>

              </p>

            </div>

          </div>

        </div>



      </div>

    </div>

  );

};



export default SignIn;