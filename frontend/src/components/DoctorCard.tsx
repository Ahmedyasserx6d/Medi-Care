import React from 'react';

interface DoctorCardProps {
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  imageUrl?: string;
  degree?: string;
  experience?: string;
  isAvailable?: boolean;
  onBookNow: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ 
  name, 
  specialty, 
  rating, 
  reviewsCount, 
  imageUrl = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300", 
  degree = "Specialist Physician",
  experience = "10+ Years",
  isAvailable = true,
  onBookNow 
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-slate-200/40 border border-slate-100/50 p-6 flex flex-col justify-between h-full hover:-translate-y-1 transition-all duration-300 group">
      
      {/* Top Section: Photo & Availability */}
      <div className="relative w-fit mx-auto pt-2">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all duration-300">
          <img 
            src={imageUrl} 
            alt={`Dr. ${name}`} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        {/* Emerald Green Rule: Only for Available Badge */}
        {isAvailable && (
          <div className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-white shadow-md uppercase tracking-wider animate-pulse">
            Available
          </div>
        )}
      </div>
      
      {/* Middle Section: Name, Specialty, Details */}
      <div className="text-center space-y-2.5 mt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Bolder Doctor Name */}
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
            Dr. {name}
          </h3>
          
          {/* Clearly Legible Specialty */}
          <div className="mt-1.5">
            <span className="inline-block px-3.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
              {specialty}
            </span>
          </div>
        </div>
        
        <p className="text-slate-500 font-bold text-xs">
          {degree}
        </p>
        
        {/* Rating & Experience Summary Badges */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-slate-700">{rating} ({reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-bold text-slate-700">{experience}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Primary Medical Blue Button */}
      <div className="mt-5">
        <button 
          onClick={onBookNow}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-300 uppercase tracking-wider text-xs active:scale-[0.98]"
        >
          View Full Schedule
        </button>
      </div>

    </div>
  );
};

export default DoctorCard;


