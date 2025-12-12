import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">
       {/* Custom Styles for Animations (Matched to Contact Page) */}
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

      <section className="min-h-screen bg-[#fffaf5] relative overflow-hidden py-20 px-6 md:px-8">
        
        {/* --- Background Decorations --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-200"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-400"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* --- Header --- */}
          <div className={`text-center mb-16 space-y-6 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider">
               <HelpCircle size={14} /> Help Center
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
              We've got <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Answers</span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Everything you need to know about the adoption process, fees, and bringing your new best friend home.
            </p>
          </div>

          {/* --- FAQ Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: Slides in from LEFT (Matches Contact Page Left Col) */}
            <div className={`space-y-6 transition-all duration-1000 transform ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <FaqItem 
                question="What is the adoption fee?" 
                answer="The adoption fee varies by pet but generally covers spaying/neutering, vaccinations, and microchipping. It typically ranges from $50 to $200 to help us care for more animals." 
                delay="0ms"
              />
              <FaqItem 
                question="Do you check my home?" 
                answer="We care deeply about our pets' safety. We usually require a brief conversation, photos of your living space, or a virtual home check to ensure it's a safe environment." 
                delay="100ms"
              />
              <FaqItem 
                question="Can I volunteer?" 
                answer="Absolutely! We are always looking for dog walkers, cat cuddlers, and event helpers. It's a great way to help if you can't adopt right now." 
                delay="200ms"
              />
            </div>

            {/* Right Column: Slides UP (Matches Contact Page Right Col) */}
            <div className={`space-y-6 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <FaqItem 
                question="Can I return a pet?" 
                answer="Yes, we understand that sometimes it's not the right fit. We have a 2-week trial period. If it doesn't work out, we welcome the pet back and will work with you to find a better match." 
                delay="300ms"
              />
              <FaqItem 
                question="Do you have puppies/kittens?" 
                answer="Yes! We often have litters available, especially during spring. Check our 'Adopt' page frequently as our available pets change daily." 
                delay="400ms"
              />
               <FaqItem 
                question="Is there a waiting list?" 
                answer="We do not have a general waiting list, but if you are looking for a specific breed, you can sign up for email alerts when new pets arrive." 
                delay="500ms"
              />
            </div>
          </div>

          {/* --- Bottom CTA --- */}
          <div className={`mt-16 bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-left transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
             {/* Decor */}
             <div className="absolute top-0 right-0 text-slate-800 opacity-20 transform translate-x-1/3 -translate-y-1/3 pointer-events-none">
                <MessageCircle size={300} />
             </div>

             <div className="relative z-10 max-w-2xl">
               <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Still have questions?</h3>
               <p className="text-slate-400 text-lg">
                 Can't find the answer you're looking for? Our friendly team is here to help you with anything you need.
               </p>
             </div>
             
             <div className="relative z-10 shrink-0">
               <button 
                 onClick={() => navigate('/contact')}
                 className="group relative bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-400 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-2 overflow-hidden"
               >
                 {/* Shine effect on hover (Same as Contact Button) */}
                 <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shimmer_1s_infinite]" />
                 
                 <Sparkles size={20} className="group-hover:rotate-12 transition-transform"/> Contact Support
               </button>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};

const FaqItem = ({ question, answer, delay }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className={`group bg-white/80 backdrop-blur-sm rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${
        isOpen 
          ? 'border-orange-400 shadow-xl shadow-orange-100/50 ring-4 ring-orange-50 bg-white' 
          : 'border-white/50 shadow-sm hover:border-orange-200 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <div className="p-6 md:p-8 flex justify-between items-start gap-4">
        <div className="flex-1">
            <h3 className={`font-bold text-lg md:text-xl transition-colors leading-snug ${isOpen ? 'text-orange-600' : 'text-slate-900 group-hover:text-orange-600'}`}>
            {question}
            </h3>
            <div 
            className={`grid transition-all duration-500 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
            >
            <div className="overflow-hidden">
                <p className="text-slate-500 leading-relaxed text-base md:text-lg">
                {answer}
                </p>
            </div>
            </div>
        </div>
        
        <div className={`p-3 rounded-full shrink-0 transition-all duration-500 ${
          isOpen ? 'bg-orange-500 text-white rotate-180' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
        }`}>
          <ChevronDown size={20} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default FAQ;