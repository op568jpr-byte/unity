import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: { 
      box: 'w-10 h-10 border-2', 
      inner: 'inset-[3px]', 
      unity: 'text-[15px] -mt-[2px]', 
      hostel: 'text-[5px] tracking-[1.5px] mt-[1px]' 
    },
    md: { 
      box: 'w-12 h-12 border-2', 
      inner: 'inset-[4px]', 
      unity: 'text-[19px] -mt-[3px]', 
      hostel: 'text-[6px] tracking-[1.8px] mt-[1px]' 
    },
    lg: { 
      box: 'w-16 h-16 border-2', 
      inner: 'inset-[5px]', 
      unity: 'text-[26px] -mt-[4px]', 
      hostel: 'text-[8px] tracking-[2.2px] mt-[2px]' 
    },
    xl: { 
      box: 'w-28 h-28 border-[3px]', 
      inner: 'inset-[8px]', 
      unity: 'text-[46px] -mt-[6px]', 
      hostel: 'text-[14px] tracking-[4px] mt-[4px]' 
    },
  };

  const current = sizes[size];

  return (
    <div className={`relative flex items-center justify-center rounded-full bg-[#1E2022] border-[#D4AF37] shadow-md shadow-black/30 ${current.box} ${className}`}>
      {/* Inner thin gold ring */}
      <div className={`absolute rounded-full border border-[#D4AF37]/50 flex flex-col items-center justify-center ${current.inner}`}>
        {/* "Unity" Cursive Text */}
        <span 
          style={{ fontFamily: "'Great Vibes', cursive" }}
          className={`text-[#D4AF37] font-normal leading-none select-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${current.unity}`}
        >
          Unity
        </span>
        {/* "HOSTEL" Serif Text */}
        <span 
          style={{ fontFamily: "'Cinzel', serif" }}
          className={`text-[#D4AF37] font-semibold uppercase select-none leading-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${current.hostel}`}
        >
          HOSTEL
        </span>
      </div>
    </div>
  );
}
