
import React from 'react';
import { COLORS } from '../constants';

interface RetroControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
  volume: number;
  onVolumeChange: (val: number) => void;
}

export const RetroControls: React.FC<RetroControlsProps> = ({ 
  isPlaying, 
  onPlay, 
  onPause, 
  onStop, 
  onUpload,
  fileName,
  volume,
  onVolumeChange
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-stretch justify-between gap-8">
      
      {/* Tape Deck Buttons Group */}
      <div className="flex gap-1">
        <button 
          onClick={onPlay}
          className={`piano-button play-btn w-16 h-20 rounded-sm ${isPlaying ? 'active' : ''}`}
        >
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent"></div>
          <span>Play</span>
        </button>
        
        <button 
          onClick={onPause}
          className={`piano-button w-16 h-20 rounded-sm ${!isPlaying && fileName ? 'active' : ''}`}
        >
          <div className="flex gap-1">
            <div className="w-1.5 h-3 bg-current"></div>
            <div className="w-1.5 h-3 bg-current"></div>
          </div>
          <span>Pause</span>
        </button>

        <button 
          onClick={onStop}
          className="piano-button stop-btn w-16 h-20 rounded-sm"
        >
          <div className="w-3 h-3 bg-current"></div>
          <span>Stop</span>
        </button>

        <div className="relative group w-16 h-20">
          <input 
            type="file" 
            accept="audio/*" 
            onChange={onUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <button className="piano-button w-full h-full rounded-sm">
            <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
            </div>
            <span>Eject</span>
          </button>
        </div>
      </div>

      {/* Center Info Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 bg-black/20 rounded border border-white/5">
        <div className="text-[10px] text-[#444] font-bold uppercase mb-1 flex justify-between">
          <span>Source Input</span>
          {fileName && <span className="text-[#00ff9f]">Signal Lock</span>}
        </div>
        <div className="text-[11px] font-mono text-[#888] truncate max-w-[250px]">
          {fileName ? fileName.toUpperCase() : "NO TAPE INSERTED..."}
        </div>
      </div>

      {/* Master Recording Level (Volume) */}
      <div className="flex flex-col items-center md:items-end min-w-[200px]">
        <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3">Output Level</span>
        <div className="flex items-center gap-4 w-full">
           <div className="flex-1 flex flex-col gap-1">
              <div className="flex gap-0.5 h-6">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => {
                  const isActive = (i / 12) <= volume;
                  let color = (COLORS as any).green;
                  if (i > 10) color = (COLORS as any).red;
                  else if (i > 7) color = (COLORS as any).violet;
                  else if (i > 4) color = (COLORS as any).blue;

                  return (
                    <div 
                      key={i} 
                      className="flex-1 rounded-sm transition-all duration-300"
                      style={{ 
                        backgroundColor: isActive ? color : '#111',
                        boxShadow: isActive ? `0 0 10px ${color}` : 'none'
                      }}
                    ></div>
                  );
                })}
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-[#ddd]"
                style={{ WebkitAppearance: 'none', border: '1px solid #333' }}
              />
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold font-mono text-[#00ff9f]">{Math.round(volume * 100)}</span>
              <span className="text-[8px] text-[#444] font-bold uppercase">DB</span>
           </div>
        </div>
      </div>
    </div>
  );
};
