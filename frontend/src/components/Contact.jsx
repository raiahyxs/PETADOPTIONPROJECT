import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Mail, Instagram, Facebook, Twitter, 
  Send, CheckCircle, PawPrint, User, AtSign, MessageSquare, 
  Heart, Sparkles 
} from 'lucide-react';

const Contact = () => {
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success
  const [mounted, setMounted] = useState(false);

  // Trigger entrance animations on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    // Simulate network request
    setTimeout(() => {
      setFormStatus('success');
      // Reset after 3 seconds
      setTimeout(() => setFormStatus('idle'), 4000);
    }, 2000);
  };

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">
      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-blob { animation: blob 10s infinite; }
        .delay-200 { animation-delay: 2s; }
        .delay-400 { animation-delay: 4s; }
      `}</style>

      <section className="min-h-screen bg-[#fffaf5] relative overflow-hidden flex items-center justify-center px-4 md:px-8 py-12 md:py-24">
        
        {/* --- Animated Background Elements --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            {/* Moving Gradient Blobs - Reduced Opacity for Better Visibility */}
            <div className="absolute top-0 -right-4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-200"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-400"></div>
        </div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start z-10 relative">
          
          {/* --- Left Column: Content & Info --- */}
          <div className={`lg:col-span-5 space-y-8 transition-all duration-1000 transform p-6 md:p-8 rounded-[2rem] bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-orange-100 text-orange-600 font-bold text-sm uppercase tracking-wider hover:shadow-md transition-all cursor-default group">
               <span className="bg-orange-100 p-1.5 rounded-full group-hover:rotate-12 transition-transform">
                 <PawPrint size={14} />
               </span>
               <span>Get in Touch</span>
            </div>
            
            {/* Headlines */}
            <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.95] tracking-tight drop-shadow-sm">
                Let's have a <br/>
                <span className="relative inline-block mt-2">
                    {/* Text Highlight */}
                    <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 blur-2xl opacity-20 transform skew-x-12"></span>
                    <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                        furry chat!
                    </span>
                </span>
                </h1>
                <p className="text-slate-700 text-lg md:text-xl leading-relaxed max-w-md font-medium">
                Have questions about adoption? Want to volunteer? Or just want to share cute photos? We're all ears (and tails).
                </p>
            </div>
            
            {/* Contact Cards Grid */}
            <div className="grid gap-5 pt-4">
              <ContactCard 
                icon={<MapPin size={20} />} 
                title="Visit Us" 
                text="123 Pawsome St, Animal City" 
                subText="Open Mon-Sat, 9am - 6pm"
                color="text-blue-600 bg-blue-50"
                delay="100ms"
              />
              <ContactCard 
                icon={<Phone size={20} />} 
                title="Call Us" 
                text="+1 (555) 123-4567" 
                subText="24/7 Emergency Hotline"
                color="text-green-600 bg-green-50"
                delay="200ms"
              />
              <ContactCard 
                icon={<Mail size={20} />} 
                title="Email Us" 
                text="adopt@pawsome.com" 
                subText="We reply within 24 hours"
                color="text-purple-600 bg-purple-50"
                delay="300ms"
              />
            </div>

            {/* Socials */}
            <div className="flex gap-4 pt-2">
               <SocialIcon Icon={Instagram} color="hover:bg-pink-500" />
               <SocialIcon Icon={Facebook} color="hover:bg-blue-600" />
               <SocialIcon Icon={Twitter} color="hover:bg-sky-500" />
            </div>
          </div>

          {/* --- Right Column: Interactive Form --- */}
          <div className={`lg:col-span-7 relative transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              
              {/* Decorative Floating 3D Elements */}
              <div className="absolute -top-12 -right-12 z-0 animate-float-delayed hidden md:block">
                 <div className="text-8xl drop-shadow-2xl filter grayscale-[0.2] hover:grayscale-0 transition-all cursor-pointer">🦴</div>
              </div>
              <div className="absolute -bottom-12 -left-12 z-20 animate-float hidden md:block">
                 <div className="text-7xl drop-shadow-2xl filter grayscale-[0.2] hover:grayscale-0 transition-all cursor-pointer">🎾</div>
              </div>

              {/* Form Container - Increased opacity to 90% (bg-white/90) for readability */}
              <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 relative overflow-hidden z-10 ring-1 ring-white/60">
                
                {/* Success Overlay */}
                {formStatus === 'success' ? (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-50 animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-100 p-6 rounded-full mb-6 text-green-600 animate-[bounce_1s_infinite]">
                        <CheckCircle size={64} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Message Sent!</h3>
                        <p className="text-slate-500 text-lg max-w-xs mx-auto">High five! 🐾 Our team will wag their tails back at you shortly.</p>
                    </div>
                ) : null}

                {/* Form Content */}
                <div className={`space-y-8 transition-all duration-300 ${formStatus === 'submitting' ? 'opacity-50 scale-[0.99] pointer-events-none grayscale' : 'opacity-100'}`}>
                    
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            Send a Message <Sparkles className="text-orange-400" size={20}/>
                        </h2>
                        <div className="h-2 w-12 bg-orange-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 w-1/3 rounded-full"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                           icon={<User size={18}/>} 
                           label="Full Name" 
                           placeholder="Jane Doe" 
                           type="text" 
                        />
                        <InputField 
                           icon={<AtSign size={18}/>} 
                           label="Email Address" 
                           placeholder="jane@example.com" 
                           type="email" 
                        />
                    </div>
                    
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-500 transition-colors">Interest</label>
                        <div className="relative">
                             <Heart className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <select className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-4 pl-12 text-slate-700 font-medium focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-50">
                                <option>I want to adopt a pet</option>
                                <option>I want to volunteer</option>
                                <option>I want to donate</option>
                                <option>Just saying hi!</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-500 transition-colors">Your Message</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <textarea 
                              required 
                              rows="4" 
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 pl-12 text-slate-700 font-medium focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-400 resize-none" 
                              placeholder="Tell us a bit about yourself and what you're looking for..."
                            ></textarea>
                        </div>
                    </div>

                    <button 
                      disabled={formStatus === 'submitting'}
                      className="w-full group relative bg-slate-900 text-white font-bold py-5 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70"
                    >
                        {/* Gradient Overlay for hover */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Shine effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shimmer_1s_infinite]" />

                        <div className="relative flex items-center justify-center gap-3 z-10">
                            {formStatus === 'submitting' ? (
                                <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Sending Love...</span>
                                </>
                            ) : (
                                <>
                                <span>Send Message</span> 
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"/>
                                </>
                            )}
                        </div>
                    </button>
                </div>
              </form>
          </div>

        </div>
      </section>
    </div>
  );
};

// Reusable Interactive Input Field
const InputField = ({ label, icon, type, placeholder }) => (
  <div className="space-y-2 group">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-500 transition-colors duration-300">
        {label}
    </label>
    <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-300">
            {icon}
        </div>
        <input 
            required 
            type={type} 
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-4 pl-12 text-slate-700 font-medium focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all duration-300 placeholder:text-slate-400 hover:bg-slate-50" 
            placeholder={placeholder}
        />
    </div>
  </div>
);

// Enhanced Contact Card
const ContactCard = ({ icon, title, text, subText, color, delay }) => (
  <div 
    className="flex items-start gap-4 p-4 rounded-3xl bg-white/90 backdrop-blur-sm border border-transparent hover:border-orange-200 hover:bg-white hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 group cursor-pointer"
    style={{ animationDelay: delay }}
  >
     <div className={`p-3.5 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
       {icon}
     </div>
     <div>
       <h4 className="font-bold text-slate-900 text-lg leading-tight">{title}</h4>
       <p className="text-slate-600 font-medium mt-1">{text}</p>
       <p className="text-slate-400 text-sm mt-1 group-hover:text-orange-500 transition-colors">{subText}</p>
     </div>
  </div>
);

// Enhanced Social Icon
const SocialIcon = ({ Icon, color }) => (
  <button type="button" className={`p-4 rounded-2xl bg-white text-slate-400 shadow-sm border border-slate-100 hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${color}`}>
    <Icon size={20} strokeWidth={2.5} />
  </button>
);

export default Contact;