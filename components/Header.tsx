
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center z-10">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#eee] mb-1 font-[Michroma]">
        CHARLIEBRAVO <span className="text-[#ff003c]">MUSIC</span>
      </h1>
      <div className="flex items-center justify-center gap-4">
        <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-[#eee]"></div>
        <p className="text-[#555] tracking-[0.5em] font-bold text-[9px] uppercase">
          Precision Audio Component
        </p>
        <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-[#eee]"></div>
      </div>
    </header>
  );
};
