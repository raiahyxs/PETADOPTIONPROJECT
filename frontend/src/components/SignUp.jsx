import React, { useState } from 'react';
import { PawPrint, ArrowLeft, Heart, Upload, User, Lock, Type, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ------------------------------------------------------------------
// 1. MEMOIZED LAYOUT COMPONENT
// ------------------------------------------------------------------

const SignUpLayout = React.memo(({ children, onBack, gradientClass, bgBlurClass, accentTextClass, isFoster, step }) => {
    const getTitle = () => {
        if (step === 1) return 'Join Us';
        return isFoster ? 'Foster' : 'Adopt';
    };

    const getSubtitle = () => {
        if (step === 1) return 'Begin your journey to making a difference.';
        return isFoster ? 'Help us save lives by providing a temporary home.' : 'Find your new best friend.';
    };
    
    const navigate = useNavigate(); 
    
    return (
        <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className={`absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-multiply transition-colors duration-700 ${bgBlurClass}`}></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[650px] transition-all duration-300 border border-white/50">
                <div className={`relative w-full md:w-5/12 bg-gradient-to-br ${gradientClass} p-6 md:p-12 flex flex-col justify-between overflow-hidden text-white group shrink-0 transition-all duration-700`}>
                    <div className="absolute inset-0 opacity-10 mix-blend-soft-light" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    
                    {/* Back button */}
                    <button onClick={onBack} className="relative z-20 self-start flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm transition-all border border-white/20 text-sm font-medium shadow-sm">
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">{step === 1 ? 'Log In' : 'Back'}</span>
                    </button>

                    <div className="relative z-10 flex flex-col items-center text-center my-4 md:my-auto">
                        <div className="mb-4 md:mb-8 p-5 rounded-[2rem] bg-black/20 backdrop-blur-md shadow-lg ring-1 ring-white/10 transform hover:scale-110 transition-transform duration-500 hover:rotate-6">
                            {isFoster ? <Upload size={56} className="text-white drop-shadow-md" /> : <PawPrint size={56} className="text-white drop-shadow-md" />}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 md:mb-4 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80">
                            {getTitle()}
                        </h1>
                        <p className="text-white/90 text-sm md:text-lg font-medium leading-relaxed max-w-xs drop-shadow-sm hidden sm:block">
                            {getSubtitle()}
                        </p>
                    </div>

                    <div className="relative z-10 text-xs text-white/60 text-center md:text-left font-medium hidden md:block">
                        © 2024 Pawsom Inc.
                    </div>
                </div>

                <div className="w-full md:w-7/12 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-8">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 tracking-tight">
                                {step === 1 ? 'Choose Your Path' : 'Create Account'}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {step === 1 ? 'How do you want to get involved?' : 'Please complete your profile registration.'}
                            </p>
                        </div>

                        {children}

                        <div className="mt-8 text-center pt-6 border-t border-slate-50">
                            <p className="text-slate-500 font-medium text-sm">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className={`${accentTextClass} font-bold hover:underline decoration-2 underline-offset-4 transition-all`}
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// ------------------------------------------------------------------
// 2. MAIN SIGNUP COMPONENT
// ------------------------------------------------------------------

const SignUp = ({ onRegister }) => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({ name: '', username: '', password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
        setError(null);
        setFormData(prev => ({ ...prev, password: '' }));
        setConfirmPassword('');
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!formData.name.trim() || !formData.username.trim() || !formData.password || !confirmPassword) {
            setError('All fields are required.');
            return false;
        }
        if (formData.password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!validate()) return;

        setIsLoading(true);
        const payload = { ...formData, role };

        // Map role consistently
        const mappedRole = role === 'poster' ? 'foster' : 'adopter';

        try {
            // Backend registration
            const res = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.name,
                    username: formData.username,
                    password: formData.password,
                    role: mappedRole
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.username?.[0] || err.password?.[0] || 'Registration failed');
            }

            const data = await res.json();
            setIsLoading(false);
            setSuccessMessage('Account created successfully! Redirecting to login...');
            
            // call parent if needed
            if (onRegister) onRegister({ ...payload, role: mappedRole, id: data.id });

            // redirect after 1.5s
            setTimeout(() => navigate('/login'), 1500);
            return;
        } catch (err) {
            console.log('Backend registration failed, falling back to local demo users', err.message);
        }

        // --- Local Demo Mode Fallback ---
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const exists = users.some(u => u.username.toLowerCase() === payload.username.toLowerCase());
        if (exists) {
            setIsLoading(false);
            return setError('Username already exists.');
        }

        const newUser = { ...payload, role: mappedRole, id: `local-${Date.now()}` };
        users.push(newUser);
        localStorage.setItem('demo_users', JSON.stringify(users));

        setIsLoading(false);
        setSuccessMessage(`Account created (role: ${mappedRole}). Redirecting to login...`);
        if (onRegister) onRegister(newUser);
        else setTimeout(() => navigate('/login'), 1500);
    };

    // Styling logic
    const isFoster = role === 'poster';
    const currentIsFoster = step === 1 ? false : isFoster;

    const gradientClass = currentIsFoster ? 'from-red-400 via-rose-500 to-red-600' : 'from-orange-400 via-orange-500 to-orange-600';
    const accentTextClass = currentIsFoster ? 'text-red-500' : 'text-orange-500';
    const focusRingClass = currentIsFoster ? 'focus:ring-red-100 focus:border-red-400' : 'focus:ring-orange-100 focus:border-orange-400';
    const buttonClass = currentIsFoster ? 'hover:bg-red-500 shadow-red-500/30' : 'hover:bg-orange-500 shadow-orange-500/30';
    const bgBlurClass = currentIsFoster ? 'bg-red-200/30' : 'bg-orange-200/30';

    const handleBack = () => {
        if (step === 1) navigate('/login');
        else setStep(1);
    };

    if (step === 1) {
        return (
            <SignUpLayout
                onBack={handleBack}
                isFoster={false} 
                gradientClass={gradientClass} 
                bgBlurClass={bgBlurClass}
                accentTextClass={accentTextClass}
                step={step}
            >
                <div className="space-y-4">
                    <button onClick={() => handleRoleSelect('adopter')} className="w-full text-left p-5 border border-slate-200 rounded-2xl bg-white hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 flex items-center space-x-5 group">
                        <div className="bg-orange-100 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300"><Heart size={28} className="text-orange-500 fill-orange-500/20" /></div>
                        <div className="flex-1"><h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors">I want to Adopt</h3><p className="text-slate-500 text-sm font-medium mt-0.5">Browse pets and find your match.</p></div>
                        <div className="text-slate-300 group-hover:text-orange-400 transition-colors"><ChevronRight size={20} /></div>
                    </button>
                    <button onClick={() => handleRoleSelect('poster')} className="w-full text-left p-5 border border-slate-200 rounded-2xl bg-white hover:border-red-200 hover:bg-red-50/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-500/10 flex items-center space-x-5 group">
                        <div className="bg-red-100 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300"><Upload size={28} className="text-red-500" /></div>
                        <div className="flex-1"><h3 className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors">I'm a Foster/Rescue</h3><p className="text-slate-500 text-sm font-medium mt-0.5">Post pets and manage applications.</p></div>
                        <div className="text-slate-300 group-hover:text-red-400 transition-colors"><ChevronRight size={20} /></div>
                    </button>
                </div>
            </SignUpLayout>
        );
    }

    return (
        <SignUpLayout
            onBack={handleBack}
            isFoster={isFoster} 
            gradientClass={gradientClass}
            bgBlurClass={bgBlurClass}
            accentTextClass={accentTextClass}
            step={step}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm mb-4 flex items-center gap-3"><ArrowLeft size={16} className="rotate-180" /><p>{error}</p></div>}
                {successMessage && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-xl text-sm mb-4 flex items-center gap-3"><CheckCircle2 size={16} /><p>{successMessage}</p></div>}

                <div className="group space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors`}><Type size={20} /></div>
                        <input type="text" name="name" required placeholder="John Doe" className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white ${focusRingClass} focus:ring-4 outline-none transition-all shadow-sm`} onChange={handleFormChange} value={formData.name} />
                    </div>
                </div>

                <div className="group space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">Username</label>
                    <div className="relative">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors`}><User size={20} /></div>
                        <input type="text" name="username" required placeholder="johndoe_23" className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white ${focusRingClass} focus:ring-4 outline-none transition-all shadow-sm`} onChange={handleFormChange} value={formData.username} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">Password</label>
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors`}><Lock size={20} /></div>
                            <input type="password" name="password" required placeholder="••••••" className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white ${focusRingClass} focus:ring-4 outline-none transition-all shadow-sm`} onChange={handleFormChange} value={formData.password} />
                        </div>
                    </div>
                    <div className="group space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">Confirm</label>
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors`}><CheckCircle2 size={20} /></div>
                            <input type="password" name="confirmPassword" required placeholder="••••••" className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white ${focusRingClass} focus:ring-4 outline-none transition-all shadow-sm`} onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className={`w-full bg-slate-900 text-white font-bold py-4 rounded-2xl ${buttonClass} active:scale-[0.98] transition-all duration-300 shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group mt-6 disabled:opacity-70`}>
                    {isLoading ? <span className="animate-pulse">Creating Account...</span> : <>Create Account <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
            </form>
        </SignUpLayout>
    );
};

export default SignUp;
