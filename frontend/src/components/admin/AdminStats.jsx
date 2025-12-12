import React, { useState, useEffect } from "react";

import {

  Dog,

  Clock,

  CheckCircle,

  Activity,

  TrendingUp,

  Sparkles,

  User,

  PieChart,

  ArrowUpRight,

  Shield,

  LayoutDashboard,

  FileText,

  LogOut,

} from "lucide-react";



// --- Constants ---

const MAX_CAPACITY = 200; // Define max capacity as a constant



// -------------------- API --------------------

// NOTE: This API base is local (http://127.0.0.1:8000/api/) and will likely fail

// in the live environment, triggering the mock data fallback.

const API_BASE = "http://127.0.0.1:8000/api/";



const api = {

  fetchPets: async () => {

    const res = await fetch(`${API_BASE}pets/`);

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    return await res.json();

  },

  fetchRequests: async () => {

    // ⭐ UPDATED: Fetching requests from the new 'applications' endpoint

    const res = await fetch(`${API_BASE}applications/`);

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    return await res.json();

  },

};



// -------------------- MOCK DATA --------------------

const GENERATE_PETS = () => [

  { id: 1, type: "Dog", status: "Available" },

  { id: 2, type: "Cat", status: "Adopted" },

  { id: 3, type: "Dog", status: "Available" },

  { id: 4, type: "Cat", status: "Pending" }, // Pending Pet 1

  { id: 5, type: "Dog", status: "Available" },

  { id: 6, type: "Dog", status: "Available" },

  { id: 7, type: "Cat", status: "Available" },

  { id: 8, type: "Dog", status: "Adopted" },

  { id: 9, type: "Cat", status: "Adopted" },

  { id: 10, type: "Dog", status: "Pending" }, // Pending Pet 2

];



const GENERATE_REQUESTS = () => [

  // ⭐ Modified to include 1 Pending Request for accurate demonstration

  { id: 101, status: "Pending" }, 

  { id: 102, status: "Approved" },

  { id: 103, status: "Rejected" },

  { id: 104, status: "Approved" }, 

  { id: 105, status: "Approved" },

];



// Static chart labels

const CHART_LABELS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



// Helper function to generate a trend array that culminates in the total adopted count.

const createDynamicTrendData = (adoptedTotal) => {

    if (adoptedTotal === 0) return [0, 0, 0, 0, 0, 0, 0];

    

    // Weights define the proportion of the total reached by each month (cumulative progression)

    const weights = [0.1, 0.2, 0.3, 0.5, 0.7, 0.9];

    

    const trends = [];

    

    // Calculate cumulative values based on adoptedTotal

    for (let i = 0; i < weights.length; i++) {

        let value = Math.round(adoptedTotal * weights[i]);

        // Use Math.max(1, ...) to ensure a visible trend if total is small

        trends.push(Math.max(1, value));

    }

    

    // Ensure the last point of the chart matches the current total adoptions

    trends.push(adoptedTotal);

    

    return trends;

};



// -------------------- COMPONENTS --------------------

const StatCard = React.memo(

  ({ title, value, icon, trend, trendUp, color, alert, loading }) => {

    const colors = {

      orange: "bg-orange-100 text-orange-600",

      blue: "bg-blue-100 text-blue-600",

      green: "bg-green-100 text-green-600",

      purple: "bg-purple-100 text-purple-600",

    };



    if (loading) {

      return (

        <div className="bg-white/50 rounded-[2rem] h-40 animate-pulse border border-white/50 p-6 flex flex-col justify-between">

          <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>

          <div>

            <div className="h-2 w-1/2 bg-slate-200 rounded mb-2"></div>

            <div className="h-5 w-3/4 bg-slate-200 rounded"></div>

          </div>

        </div>

      );

    }



    const trendClass = trendUp

      ? "bg-green-200 text-green-800"

      : "bg-slate-200 text-slate-600";

    const trendIcon = trendUp ? (

      <ArrowUpRight size={12} />

    ) : (

      <Activity size={12} />

    );



    return (

      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-[2rem] border border-orange-100/50 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group flex flex-col justify-between">

        {alert && (

          <>

            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white m-4 z-10 animate-ping" />

            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white m-4 z-10" />

          </>

        )}



        <div className="flex justify-between items-start mb-4">

          <div

            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${colors[color]} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md`}

          >

            {icon}

          </div>

          <div

            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${trendClass}`}

          >

            {trendIcon}

            {trend.split(" ")[0]}

          </div>

        </div>



        <div>

          <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">

            {title}

          </h3>

          <div className="flex items-baseline gap-2 mt-1">

            <span className="text-3xl sm:text-4xl font-black text-slate-900">

              {value}

            </span>

          </div>

          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-2 line-clamp-1">

            {trend}

          </p>

        </div>

      </div>

    );

  }

);



const AdoptionTrendChart = React.memo(({ data, labels, loading }) => {

  if (loading)

    return (

      <div className="w-full h-full bg-slate-50 rounded-3xl animate-pulse"></div>

    );



  const height = 100;

  const width = 300;

  // Ensure max is at least 15 for a nice visual scale if data is very low

  const max = Math.max(...data, 15); 



  const points = data.map((val, i) => {

    const x = (i / (data.length - 1)) * width;

    const y = height - (val / max) * height;

    return `${x},${y}`;

  });



  const pathData = `M0,${height} ${points

    .map((p) => `L${p}`)

    .join(" ")} L${width},${height} Z`;



  return (

    <div className="w-full h-full flex flex-col">

      <div className="flex-1 relative min-h-0">

        <svg

          width="100%"

          height="100%"

          viewBox={`0 0 ${width} ${height}`} // Use the calculated 300x100 for correct path drawing

          preserveAspectRatio="none"

          className="overflow-visible"

        >

          <defs>

            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">

              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />

              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />

            </linearGradient>

          </defs>



          {/** Grid - drawing based on 300x100 dimensions */}

          {[0, 0.25, 0.5, 0.75, 1].map((p) => (

            <line

              key={p}

              x1="0"

              y1={height * p}

              x2={width}

              y2={height * p}

              stroke="#f1f5f9"

              strokeWidth="1"

              strokeDasharray="4 4"

            />

          ))}



          {/** Area */}

          <path

             d={pathData}

            fill="url(#trendGradient)"

            className="animate-[fadeInUp_1s_ease-out]"

          />



          {/** Line */}

          <path

            d={`M${points[0]} ${points.map((p) => `L${p}`).join(" ")}`}

            fill="none"

            stroke="#f97316"

            strokeWidth="3"

            strokeLinecap="round"

            strokeLinejoin="round"

            className="animate-[fadeInUp_1s_ease-out]"

          />



          {/** Dots */}

          {points.map((p, i) => {

            const [cx, cy] = p.split(",");

            return (

              <g key={i} className="group cursor-pointer">

                <circle

                  cx={cx}

                  cy={cy}

                  r="4"

                  fill="#fff"

                  stroke="#f97316"

                  strokeWidth="2.5"

                  className="group-hover:r-5 transition-all duration-300 shadow-xl"

                />

                <foreignObject

                  x={parseFloat(cx) - 20}

                  y={parseFloat(cy) - 45}

                  width="40"

                  height="30"

                  className="overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-200"

                >

                  <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg text-center shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform">

                    {data[i]}

                  </div>

                </foreignObject>

              </g>

            );

          })}

        </svg>

      </div>



      {/** Labels */}

      <div className="flex justify-between mt-4 px-1 flex-shrink-0">

        {labels.map((l, i) => (

          <span

            key={i}

            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"

          >

            {l}

          </span>

        ))}

      </div>

    </div>

  );

});



const PetDistributionChart = React.memo(({ dogs, cats }) => {

  const total = dogs + cats;

  const dogPercentage = total > 0 ? (dogs / total) * 100 : 0;



  // Increased dimensions for slightly bigger donut chart

  const radius = 80; // Increased from 70

  const strokeWidth = 25; // Increased from 22

  const circumference = 2 * Math.PI * radius;

  const dogDash = (dogPercentage / 100) * circumference;



  return (

    <div className="relative h-full w-full flex items-center justify-center aspect-square max-h-64">

      <svg

        viewBox="0 0 200 200"

        // Increased max-w/h for a slightly larger overall presence

        className="rotate-[-90deg] transition-all duration-500 drop-shadow-xl w-full h-full max-w-[200px] max-h-[200px] mx-auto" 

      >

        <circle

          cx="100"

          cy="100"

          r={radius}

          fill="none"

          stroke="#60a5fa"

          strokeWidth={strokeWidth}

          className="opacity-30"

        />

        <circle

          cx="100"

          cy="100"

          r={radius}

          fill="none"

          stroke="#3b82f6"

          strokeWidth={strokeWidth}

        />

        <circle

          cx="100"

          cy="100"

          r={radius}

          fill="none"

          stroke="#f97316"

          strokeWidth={strokeWidth}

          strokeDasharray={`${dogDash} ${circumference}`}

          strokeLinecap="round"

          className="transition-all duration-1000 ease-out shadow-lg"

        />

      </svg>

    </div>

  );

});



// -------------------- MAIN DASHBOARD --------------------

const AdminDashboard = () => {

  const [pets, setPets] = useState([]);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);



  useEffect(() => {

    setMounted(true);



    const fetchWithFallback = async (apiFunc, mockFunc, name) => {

      try {

        // Simple exponential backoff for a few retries

        let data = null;

        let success = false;

        for (let i = 0; i < 3; i++) {

          try {

            data = await apiFunc();

            success = true;

            break;

          } catch (e) {

            if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** i)));

          }

        }

        

        if (success) {

            console.log(`Successfully loaded ${name} data from API.`);

            return data;

        } else {

            throw new Error(`Failed to fetch after retries.`);

        }

      } catch (err) {

        console.warn(

          `Failed to fetch ${name} data. Using mock data. Error:`,

          err.message

        );

        return mockFunc();

      }

    };



    const loadAll = async () => {

      setLoading(true);

      const [petsData, reqData] = await Promise.all([

        fetchWithFallback(api.fetchPets, GENERATE_PETS, "pets"),

        fetchWithFallback(api.fetchRequests, GENERATE_REQUESTS, "requests"),

      ]);

      setPets(petsData);

      setRequests(reqData);

      setLoading(false);

    };



    loadAll();

  }, []);



  const stats = {

    totalDogs: pets.filter((p) => p.type === "Dog").length,

    totalCats: pets.filter((p) => p.type === "Cat").length,

    pendingRequests: requests.filter((r) => r.status === "Pending").length,

    adoptedTotal: pets.filter((p) => p.status === "Adopted").length,

    // --- NEW STATS FOR PET STATUS BREAKDOWN ---

    availablePets: pets.filter((p) => p.status === "Available").length,

    pendingPets: pets.filter((p) => p.status === "Pending").length,

    // -----------------------------------------

  };



  // Logic for Pending Requests Card Trend

  // This now shows 1 pending request due to mock data change

  const pendingRequestsTrendText = stats.pendingRequests === 0

    ? "Current: Zero Pending"

    : stats.pendingRequests >= 3

    ? "High Volume: Review Immediately" // Action needed for 3 or more

    : `${stats.pendingRequests} request${stats.pendingRequests !== 1 ? 's' : ''} to review`; // Added pluralization



  const pendingRequestsTrendUp = stats.pendingRequests <= 1; // TrendUp is true (good) if 0 or 1 pending



  // Determine a simple trend message based on the current data

  const adoptionTrendMessage = stats.adoptedTotal > 5 

    ? `Great quarter so far: ${stats.adoptedTotal} total adoptions.`

    : `Focus on outreach, targeting ${10 - stats.adoptedTotal} more for the month goal.`;

    

  const trendIsUp = stats.adoptedTotal > 0;



  // Generate dynamic trend data for the chart

  const adoptionTrends = createDynamicTrendData(stats.adoptedTotal);



  // Capacity calculation and display

  const currentCapacity = pets.length;

  const capacityPercentage = Math.round((currentCapacity / MAX_CAPACITY) * 100);

  const capacityTrendText = `${currentCapacity} / ${MAX_CAPACITY} Capacity Used`;

  const capacityTrendUp = currentCapacity < MAX_CAPACITY * 0.8; // Good if under 80%



  const headerClass = `flex-shrink-0 flex justify-between items-center mb-6 transition-all duration-700 ease-custom ${

    mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"

  }`;



  const gridClass = `flex-shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 transition-all duration-700 delay-100 ease-custom ${

    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"

  }`;



  const analyticsClass = `flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 transition-all duration-700 delay-200 ease-custom ${

    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"

  }`;



  return (

    <div className="font-sans text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900 min-h-screen w-full bg-[#fffaf5] shadow-inner flex justify-center">

      <style>{`

        @keyframes blob {

          0% { transform: translate(0, 0) scale(1); }

          33% { transform: translate(30px, -50px) scale(1.1); }

          66% { transform: translate(-20px, 20px) scale(0.9); }

          100% { transform: translate(0, 0) scale(1); }

        }

        .animate-blob { animation: blob 10s infinite; }

        .ease-custom { transition-timing-function: cubic-bezier(0.23,1,0.32,1); }



        @keyframes fadeInUp {

          from { opacity: 0; transform: translateY(10px); }

          to { opacity: 1; transform: translateY(0); }

        }



        @keyframes zoomIn {

          from { opacity: 0; transform: scale(0.9); }

          to { opacity: 1; transform: scale(1); }

        }



        .mobile-nav-bar {

          height: 60px;

          padding-bottom: env(safe-area-inset-bottom);

        }

      `}</style>



      {/* Background */}

      <div className="absolute inset-0 pointer-events-none z-0 w-full overflow-x-hidden">

        <div

          className="absolute inset-0 opacity-[0.05]"

          style={{

            backgroundImage:

              "radial-gradient(#f97316 1px, transparent 1px)",

            backgroundSize: "32px 32px",

          }}

        ></div>



        <div

          className="absolute top-0 right-0 w-[15rem] h-[15rem] sm:w-[50rem] sm:h-[50rem] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"

        ></div>



        <div

          className="absolute bottom-0 left-0 w-[15rem] h-[15rem] sm:w-[50rem] sm:h-[50rem] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"

          style={{ animationDelay: "2s" }}

        ></div>

      </div>



      {/* MAIN CONTENT */}

      <div className="relative z-10 flex flex-col max-w-[1600px] w-full px-4 sm:px-6 md:px-8 py-6 min-h-screen pb-[60px] md:pb-6">

        {/* Header */}

        <header className={headerClass}>

          <div>

            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-lg px-3 py-1 rounded-full border border-orange-200/50 text-orange-600 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">

              <Sparkles size={12} /> Admin Dashboard

            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">

              Sanctuary{" "}

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">

                Statistics

              </span>

            </h1>

          </div>



          <div className="flex items-center gap-4">

            <div className="hidden sm:flex bg-white/70 backdrop-blur-lg px-4 py-2 rounded-2xl border border-white shadow-md items-center gap-3">

              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>

              <span className="text-sm font-bold text-slate-600">

                Live Data

              </span>

            </div>

            <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white shadow-lg border border-orange-100 flex items-center justify-center text-slate-400 hover:text-orange-500 transition-colors duration-300">

              <User size={20} />

            </button>

          </div>

        </header>



        {/* Stats Grid */}

        <div className={gridClass}>

          <StatCard

            title="Total Animals"

            value={pets.length}

            icon={<Dog size={24} />}

            // ⭐ UPDATED TREND to show AVAILABLE and PENDING counts

            trend={`Available: ${stats.availablePets} / Pending: ${stats.pendingPets}`}

            trendUp={true}

            color="orange"

            loading={loading}

          />



          <StatCard

            title="Pending Requests"

            value={stats.pendingRequests}

            icon={<Clock size={24} />}

            trend={pendingRequestsTrendText} // Updated trend text

            trendUp={pendingRequestsTrendUp} // Updated trend logic

            color="blue"

            alert={stats.pendingRequests > 0}

            loading={loading}

          />



          <StatCard

            title="Successful Adoptions" 

            value={stats.adoptedTotal}

            icon={<CheckCircle size={24} />}

            trend={adoptionTrendMessage.split(":")[0]}

            trendUp={trendIsUp}

            color="green"

            loading={loading}

          />



          <StatCard

            title="Capacity"

            value={`${capacityPercentage}%`} // Using calculated percentage

            icon={<Activity size={24} />}

            trend={capacityTrendText} // Using detailed trend text

            trendUp={capacityTrendUp} // Using calculated trend based on 80% threshold

            color="purple"

            loading={loading}

          />

        </div>



        {/* Analytics Section */}

        <div className={analyticsClass}>

          {/* Trend Chart */}

          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] border border-white shadow-2xl shadow-orange-500/10 p-4 sm:p-8 flex flex-col">

            <div className="flex justify-between items-center mb-6 flex-shrink-0">

              <div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">

                  <TrendingUp size={20} className="text-orange-500" />{" "}

                  Adoption Trends

                </h2 >

                <p className="text-slate-400 text-xs font-bold mt-1">

                  Successful adoptions over time

                </p>

              </div>



              <div className="flex gap-1 sm:gap-2">

                {["Week", "Month", "Year"].map((t) => (

                  <button

                    key={t}

                    className={`px-2 py-1 text-[10px] sm:text-xs font-bold transition-colors duration-300 rounded-lg ${

                      t === "Month"

                        ? "bg-orange-100 text-orange-600"

                        : "text-slate-400 hover:bg-slate-50"

                    }`}

                  >

                    {t}

                  </button>

                ))}

              </div>

            </div>

          



            <div className="flex-1 w-full relative min-h-64 sm:min-h-0">

              <AdoptionTrendChart

                data={adoptionTrends} 

                labels={CHART_LABELS}

                loading={loading}

              />

            </div>

          </div>



          {/* Donut Chart */}

          <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] border border-white shadow-2xl shadow-blue-500/10 p-4 sm:p-8 flex flex-col">

            <div className="mb-6 flex-shrink-0">

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">

                <PieChart size={20} className="text-blue-500" /> Demographics

              </h2>

              <p className="text-slate-400 text-xs font-bold mt-1">

                Current inventory breakdown

              </p>

            </div>

            

            <div className="flex-1 flex flex-col items-center justify-center relative">

              {loading ? (

                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-slate-100 animate-pulse"></div>

              ) : (

                <>

                  <div className="relative w-full max-w-xs mx-auto">

                    <PetDistributionChart

                      dogs={stats.totalDogs}

                      cats={stats.totalCats}

                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

                      <span className="text-2xl sm:text-3xl font-black text-slate-900 animate-[zoomIn_0.5s_ease-out]"> {/* Reduced font size */}

                        {pets.length}

                      </span>

                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">

                        Total

                      </span>

                    </div>

                  </div>



                  <div className="w-full grid grid-cols-2 gap-4 mt-8">

                    <div className="bg-orange-50/70 rounded-2xl p-3 flex flex-col items-center shadow-sm">

                      <span className="text-orange-600 font-black text-lg">

                        {pets.length > 0

                          ? Math.round((stats.totalDogs / pets.length) * 100)

                          : 0}

                        %

                      </span>

                      <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 mt-1">

                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>{" "}

                        Dogs

                      </span>

                    </div>



                    <div className="bg-blue-50/70 rounded-2xl p-3 flex flex-col items-center shadow-sm">

                      <span className="text-blue-600 font-black text-lg">

                        {pets.length > 0

                          ? Math.round((stats.totalCats / pets.length) * 100)

                          : 0}

                        %

                      </span>

                      <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 mt-1">

                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{" "}

                        Cats

                      </span>

                    </div>

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      </div>



      {/* MOBILE NAV */}

      <nav className="fixed bottom-0 left-0 w-full bg-white mobile-nav-bar border-t border-orange-100 shadow-2xl md:hidden">

        <div className="flex justify-around items-center h-full">

          {["Dash", "Pets", "Reqs", "Exit"].map((item) => {

            const isActive = item === "Dash";



            const IconComponent =

              item === "Dash"

                ? LayoutDashboard

                : item === "Pets"

                ? Dog

                : item === "Reqs"

                ? FileText

                : LogOut;



            return (

              <button

                key={item}

                className={`flex flex-col items-center justify-center text-sm font-bold p-1 transition-colors ${

                  isActive

                    ? "text-orange-600"

                    : "text-slate-400 hover:text-orange-500"

                }`}

              >

                {item === "Reqs" ? (

                  <div className="relative h-10 w-10 flex items-center justify-center bg-white rounded-full shadow-2xl border-4 border-white -translate-y-3">

                    <Shield size={28} className="text-orange-500 shadow-md" />

                    <FileText size={14} className="absolute text-white" />

                  </div>

                ) : (

                  <span

                    className={`p-2 rounded-full ${

                      isActive

                        ? "text-orange-600 bg-orange-50"

                        : "text-slate-400"

                    }`}

                  >

                    <IconComponent size={20} />

                  </span>

                )}



                <span className="text-[10px] mt-0.5">{item}</span>

              </button>

            );

          })}

        </div>

      </nav>

    </div>

  );

};



export default AdminDashboard;