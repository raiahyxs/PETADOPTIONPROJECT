import React, { useState, useEffect } from 'react';
import { Heart, Award, Clock, Sparkles, Star } from 'lucide-react';

// API Endpoints
const PETS_API = "http://127.0.0.1:8000/api/pets/"; // To count adoptions (assuming 'adopted' status)
const ACCOUNTS_API = "http://127.0.0.1:8000/api/accounts/"; // To count volunteers (assuming a 'is_volunteer' field)

// ... (StatCard and ValueCard components remain the same, defined below)

const About = () => {
  const [mounted, setMounted] = useState(false);
  const [adoptedCount, setAdoptedCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);

  useEffect(() => {
    // 1. Set mounted state for transition
    setMounted(true);

    // 2. Define the asynchronous fetch function
    const fetchStats = async () => {
      try {
        // Use Promise.all to fetch both APIs in parallel
        const [petsResponse, accountsResponse] = await Promise.all([
          fetch(PETS_API),
          fetch(ACCOUNTS_API),
        ]);

        // Check for HTTP errors
        if (!petsResponse.ok || !accountsResponse.ok) {
          throw new Error('Failed to fetch one or more resources');
        }

        const petsData = await petsResponse.json();
        const accountsData = await accountsResponse.json();

        // 3. Process data for Adoptions (FIXED LOGIC)
        // **Updated Assumption:** The pets API returns a list of ALL pets, 
        // and we count how many have an 'adopted: true' status/field.
        const totalAdoptions = petsData.filter(pet => pet.adopted === true).length;
        setAdoptedCount(totalAdoptions);

        // 4. Process data for Volunteers (Original Logic Kept)
        // **Assumption:** The accounts API returns a list of accounts, and we assume
        // the API only returns volunteer accounts, so we use the length.
        const totalVolunteers = accountsData.length;
        setVolunteerCount(totalVolunteers);

      } catch (error) {
        console.error("Error fetching Pawsom statistics:", error);
        // Optionally, set state to a fallback or error message
        setAdoptedCount(0);
        setVolunteerCount(0);
      }
    };

    // 5. Call the fetch function inside useEffect with an empty dependency array
    fetchStats();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900 overflow-hidden">
        <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 10s infinite; }
        .delay-200 { animation-delay: 2s; }
      `}</style>

      <section className="min-h-screen bg-[#fffaf5] relative px-6 md:px-16 py-12 md:py-24">
        
        {/* --- Background Elements --- */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03]" 
                style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-200"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Header Section */}
          <div className={`text-center mb-20 space-y-6 transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider mb-4">
               <Sparkles size={14} /> Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-4">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Pawsom</span>
            </h1>
            <p className="text-slate-600 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
              We are a newly founded sanctuary dedicated to connecting homeless pets with loving families.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            
            {/* Image Area */}
            <div className={`relative transition-all duration-1000 delay-300 transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="absolute inset-0 bg-orange-200 rounded-[2.5rem] transform rotate-3 scale-105 opacity-50 blur-sm"></div>
              <div className="absolute -top-10 -left-10 z-20 animate-float hidden md:block">
                  <div className="text-6xl drop-shadow-lg filter grayscale-[0.2]">🐾</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80&w=800" 
                alt="Team" 
                className="relative rounded-[2.5rem] shadow-2xl border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform duration-700 object-cover h-[500px] w-full" 
              />
            </div>

            {/* Text Content - Wrapped in Glass Container for Readability */}
            <div className={`bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-[2.5rem] border border-white/50 shadow-sm space-y-8 transition-all duration-1000 delay-500 transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-2">
                    Our Mission <Star className="text-yellow-400 fill-yellow-400" size={24} />
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg">
                  Founded in 2024, Pawsom started with a simple belief: every animal deserves a fresh start. We are just beginning our journey, but our hearts are full of hope.
                </p>
                <p className="text-slate-700 leading-relaxed text-lg">
                  We don't just want to find homes; we want to build families. Our strict vetting process ensures long-term happiness for both pet and owner.
                </p>
              </div>

              {/* Animated Stats - Now using the fetched counts */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <StatCard target={adoptedCount} suffix="+" label="Adoptions" delay={0} />
                <StatCard target={volunteerCount} suffix="+" label="Volunteers" delay={100} />
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className={`bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 shadow-xl border border-white/50 relative overflow-hidden transition-all duration-1000 delay-700 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-400"></div>
            
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
                <p className="text-slate-500">We go above and beyond for our furry friends.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueCard 
                icon={<Heart size={32} />} 
                title="Compassion First" 
                desc="We treat every animal with dignity regardless of their background or history." 
                delay="800ms"
              />
              <ValueCard 
                icon={<Award size={32} />} 
                title="Vetted Health" 
                desc="Every pet is vaccinated, spayed/neutered, and thoroughly health-checked." 
                delay="900ms"
              />
              <ValueCard 
                icon={<Clock size={32} />} 
                title="Lifetime Support" 
                desc="Our relationship doesn't end at adoption. We offer training tips forever." 
                delay="1000ms"
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

// Animated Counter Component - REMAINS THE SAME
const StatCard = ({ target, suffix, label, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const intervalTime = duration / steps;
    const increment = target / steps;
    let current = 0;
    let interval;

    // Only animate if target is greater than 0
    if (target > 0) {
        const timer = setTimeout(() => {
            interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(interval);
            } else {
                setCount(Math.floor(current));
            }
            }, intervalTime);
        }, 500 + delay); // Delay start slightly
        return () => clearTimeout(timer);
    } else {
        // If target is 0 (or not yet loaded), display 0
        setCount(0);
    }
    
    return () => clearInterval(interval); // Cleanup interval on unmount or target change
  }, [target, delay]);

  return (
    <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-orange-100 shadow-sm text-center hover:scale-105 transition-transform duration-300 group cursor-default">
      <div className="text-4xl md:text-5xl font-black text-orange-500 mb-1 group-hover:text-orange-600 transition-colors">
        {count}{suffix}
      </div>
      <div className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
};

// ValueCard Component - REMAINS THE SAME
const ValueCard = ({ icon, title, desc, delay }) => (
  <div 
    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm text-center space-y-4 border border-orange-50 hover:border-orange-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
    style={{ animationDelay: delay }}
  >
    <div className="inline-flex p-4 bg-orange-50 text-orange-500 rounded-2xl mb-2 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-orange-200">
        {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default About;