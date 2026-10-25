"use client";

export default function ScoreRing({ value, size = 180 }: { value: number; size?: number }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const strokeDashoffset = C * (1 - Math.min(Math.max(value, 0), 100) / 100);

  // Dynamic color depending on ATS score
  const strokeColor = value === 0 ? "#D4CFC2" : value >= 80 ? "#1E6B38" : value >= 60 ? "#D97706" : "#DC2626";

  return (
    <div 
      className="relative flex items-center justify-center shrink-0" 
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg 
        viewBox="0 0 160 160" 
        className="w-full h-full -rotate-90 transform"
      >
        <circle 
          cx="80" 
          cy="80" 
          r={R} 
          fill="none" 
          stroke="#EBE7DD" 
          strokeWidth="12" 
        />
        <circle 
          cx="80" 
          cy="80" 
          r={R} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="12" 
          strokeDasharray={C} 
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-serif font-bold text-[#141A16] tracking-tight">
          {Math.round(value)}
        </span>
        <span className="text-[11px] font-semibold text-[#6B756E] uppercase tracking-wider mt-0.5">
          ATS Score
        </span>
      </div>
    </div>
  );
}
