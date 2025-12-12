import React, { useState, useEffect } from 'react';
import { 
  Phone, MapPin, Heart, Star, ArrowRight, 
  Facebook, Instagram, Mail, 
  Github
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Real API (Django Backend Endpoint) ---
// This single endpoint will now be used for all pets.
const API_BASE = 'http://localhost:8000/api/pets/'; 

// 🌟 MODIFIED: Function to fetch ALL pets from the single endpoint.
const fetchAllPets = async () => {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch all pets');
    return await res.json();
  } catch (error) {
    console.error("Error fetching all pets:", error);
    // Return an array of mock data if the API is down for testing purposes.
    // NOTE: Replace this with `return [];` in a production environment.
    return [
      { id: 10, name: 'Buster', breed: 'Beagle', status: 'Available', image: 'https://images.unsplash.com/photo-1596701140594-555e525a74e3?auto=format&fit=crop&w=300' },
      { id: 11, name: 'Cleo', breed: 'Siamese', status: 'Adopted', image: 'https://images.unsplash.com/photo-1620327318357-d20ef22e84c9?auto=format&fit=crop&w=300' },
      { id: 12, name: 'Rex', breed: 'German Shepherd', status: 'Available', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300' },
      { id: 13, name: 'Whiskers', breed: 'Tabby', status: 'Adopted', image: 'https://images.unsplash.com/photo-1577023300587-f138883e4a92?auto=format&fit=crop&w=300' },
      { id: 14, name: 'Lucy', breed: 'Labrador', status: 'Available', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300' },
    ];
  }
};

// ❌ REMOVED: fetchAdoptedPets and the PET_ADOPTION_OFFSET constant are removed.


// --- HERO SLIDESHOW DATA (Unchanged) ---
const HERO_SLIDES = [
  { id: 1, image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800', alt: 'Happy Golden Retriever', badge: '🦴' },
  { id: 2, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800', alt: 'Curious Cat', badge: '🐟' },
  { id: 3, image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800', alt: 'Playful Puppy', badge: '🎾' },
  { id: 4, image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800', alt: 'Sweet Kitten', badge: '🧶' }
];

const LandingPage = () => {
  // Available pets only (for display in featured section)
  const [availablePets, setAvailablePets] = useState([]);
  // 🌟 NEW STATE: Pets that have been adopted (for the statistic)
  const [adoptedPets, setAdoptedPets] = useState([]); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Slideshow Timer (Unchanged)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  // 🌟 MODIFIED EFFECT: Fetch ALL pets and filter them into two states.
  useEffect(() => {
    const loadAllPets = async () => {
      const data = await fetchAllPets();
      
      // Filter the data based on status
      const available = data.filter(pet => pet.status === 'Available');
      const adopted = data.filter(pet => pet.status === 'Adopted');
      
      setAvailablePets(available);
      setAdoptedPets(adopted);
    };
    loadAllPets();
  }, []);


  return (
    <>
        {/* Custom Styles for Animations (Unchanged) */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float-slow {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-fast {
            animation: float 4s ease-in-out infinite;
          }
        `}</style>

        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center px-6 md:px-16 py-12 bg-orange-50">
          
          {/* Animated Background Elements (Unchanged) */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-[30rem] h-[30rem] bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float-slow">🐾</div>
          <div className="absolute top-40 right-20 text-5xl opacity-20 animate-float-fast text-red-400">♥</div>
          <div className="absolute bottom-40 left-1/3 text-3xl opacity-10 animate-bounce">🦴</div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left Text (Unchanged) */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-block bg-white px-6 py-2 rounded-full shadow-md border border-orange-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="text-orange-600 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Star size={16} fill="currentColor" /> Find your soulmate
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter drop-shadow-sm">
                ADOPT <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
                  PURE
                </span> LOVE
              </h1>
              
              <p className="text-slate-600 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Don't buy, adopt! Thousands of homeless pets are waiting for a loving family. Your new best friend is just a click away.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/adopt')}
                  className="group relative bg-slate-900 text-white px-10 py-4 rounded-full font-bold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.6)] flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Heart size={20} fill="currentColor" className="text-red-500 relative z-10 group-hover:scale-110 transition-transform duration-300" /> 
                  <span className="relative z-10">Find a Pet</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full blur-xl"></div>
                </button>
                
                <button 
                  onClick={() => navigate('/contact')}
                  className="bg-white text-slate-700 px-10 py-4 rounded-full font-bold border-2 border-slate-100 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1"
                >
                  <Phone size={18} /> Contact Us
                </button>
              </div>

              {/* Stats 🌟 UPDATED: Uses adoptedPets.length and availablePets.length */}
              <div className="pt-8 flex justify-center lg:justify-start gap-8 text-center">
                <div className="transform hover:scale-110 transition-transform duration-300">
                   <p className="text-3xl font-black text-orange-500">{adoptedPets.length}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Adoptions</p>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="transform hover:scale-110 transition-transform duration-300">
                   <p className="text-3xl font-black text-orange-500">{availablePets.length}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Waiting</p>
                </div>
              </div>
            </div>

            {/* Right Slideshow (Unchanged) */}
            <div className="relative h-[500px] flex items-center justify-center perspective-1000">
                <div className="relative w-[350px] h-[450px] md:w-[450px] md:h-[550px] group">
                   <div className="absolute inset-0 bg-orange-400 rounded-[3rem] rotate-6 opacity-20 blur-lg group-hover:rotate-12 transition-transform duration-700"></div>
                   
                   {/* Slideshow Container */}
                   <div className="w-full h-full relative z-10 rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500 bg-slate-100">
                     {HERO_SLIDES.map((slide, index) => (
                       <img 
                         key={slide.id}
                         src={slide.image} 
                         alt={slide.alt}
                         className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                       />
                     ))}
                   </div>

                   {/* Floating Badges (Unchanged) */}
                   <div className="absolute -left-8 top-20 z-20 bg-white p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '4s' }}>
                     <span className="text-4xl">{HERO_SLIDES[currentSlide].badge}</span>
                   </div>
                   <div className="absolute -right-8 bottom-32 z-20 bg-white p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '5s' }}>
                     <span className="text-4xl">🐾</span>
                   </div>

                   {/* Slide Indicators (Unchanged) */}
                   <div className="absolute -bottom-12 left-0 w-full flex justify-center gap-3 z-20">
                     {HERO_SLIDES.map((_, index) => (
                       <button 
                         key={index}
                         onClick={() => setCurrentSlide(index)}
                         className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-orange-500 w-8' : 'bg-orange-200 w-3 hover:bg-orange-300'}`}
                       />
                     ))}
                   </div>
                </div>
            </div>
          </div>
        </section>

        {/* --- FEATURED PETS (Now uses 'availablePets' state) --- */}
        <section className="px-6 md:px-16 py-24 bg-white rounded-t-[4rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)] relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                Pets Available for <span className="text-orange-500">Adoption</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Meet the brave hearts waiting for a second chance. Click to see their full story.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 🌟 MODIFIED: Iterates over availablePets */}
              {availablePets.slice(0, 3).map((pet) => (
                <div 
                  key={pet.id} 
                  onClick={() => navigate('/adopt')}
                  className="group bg-white rounded-[2rem] p-4 border border-slate-100 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                >
                  {/* Pet Image Card */}
                  <div className="h-72 rounded-[1.5rem] overflow-hidden relative bg-slate-100">
                    <img 
                      src={
                        pet.image
                          ? (pet.image.startsWith('http')
                              ? pet.image
                              : `http://localhost:8000${pet.image.startsWith('/') ? pet.image : '/' + pet.image}`)
                          : 'https://via.placeholder.com/400'
                      }
                      alt={pet.name}
                      onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'}}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1">
                       <MapPin size={12} className="text-orange-500"/> 2km away
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full text-orange-500 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                       <Heart fill="currentColor" size={20} />
                    </div>
                  </div>

                  {/* Pet Details */}
                  <div className="pt-6 px-2 pb-2">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                           <h3 className="text-2xl font-black text-slate-900">{pet.name}</h3>
                           <p className="text-slate-500 font-medium text-sm">{pet.breed}</p>
                        </div>
                        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                           {/* Status should always be Available here, but using pet.status for robustness */}
                           {pet.status} 
                        </span>
                    </div>
                    
                    <button className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl overflow-hidden relative group/btn">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-amber-500 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
                      <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:scale-105 transition-transform">
                        Meet {pet.name} <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
               <button 
                  onClick={() => navigate('/adopt')}
                  className="bg-white border-2 border-slate-200 text-slate-800 px-10 py-4 rounded-full font-bold hover:border-orange-500 hover:text-white hover:bg-orange-500 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-orange-200"
               >
                 View All Pets
               </button>
            </div>
          </div>
        </section>

        {/* --- FOOTER (Unchanged) --- */}
        <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 relative z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              
              {/* Brand Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-2xl font-black text-white">
                   <span className="text-3xl">🐾</span> 
                   <span>Paw<span className="text-orange-500">som</span></span>
                </div>
                <p className="leading-relaxed">
                  Connecting loving families with loyal companions. Every pet deserves a warm home and a happy ending.
                </p>
                <div className="flex gap-4">
                  <a href="#facebook.com" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                    <Facebook size={18} />
                  </a>
                  <a href="#github.com" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                    <Github size={18} />
                  </a>
                  <a href="#instagram.com" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                    <Instagram size={18} />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-bold text-lg mb-6">Explore</h4>
                <ul className="space-y-4 font-medium">
                  <li><a href="#about" className="hover:text-orange-500 transition-colors">About Us</a></li>
                  <li><a href="#faq" className="hover:text-orange-500 transition-colors">Adoption FAQs</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-bold text-lg mb-6">Contact</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin size={20} className="text-orange-500 shrink-0 mt-1" />
                    <span>123 Puppy Lane,<br/>Happy Tails City, HT 90210</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={20} className="text-orange-500 shrink-0" />
                    <span>(555) 123-4567</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={20} className="text-orange-500 shrink-0" />
                    <span>hello@pawsom.com</span>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-white font-bold text-lg mb-6">Newsletter</h4>
                <p className="mb-4 text-sm">Subscribe for updates on new pets and adoption events.</p>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button className="absolute right-1 top-1 bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
              <p>© 2025 Pawsom Pet Adoption. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
                <a href="#terms" className="hover:text-orange-500 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
    </>
  );
};


export default LandingPage;