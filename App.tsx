
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VisualizerMode, AudioData } from './types';
import { VUMeter } from './components/VUMeter';
import { RetroControls } from './components/RetroControls';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>(VisualizerMode.BARS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    
    setAudioData({
      buffer: decodedBuffer,
      name: file.name
    });
    setDuration(decodedBuffer.duration);
    setCurrentTime(0);
    pausedAtRef.current = 0;
    setIsPlaying(false);
  };

  const play = useCallback(() => {
    if (!audioData || !audioContextRef.current || isPlaying) return;
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioData.buffer;

    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    gainNodeRef.current.gain.value = volume;
    source.connect(gainNodeRef.current);

    const offset = pausedAtRef.current;
    source.start(0, offset);
    sourceNodeRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime - offset;
    setIsPlaying(true);

    source.onended = () => {
      const current = audioContextRef.current?.currentTime || 0;
      if (Math.abs(current - startTimeRef.current - audioData.buffer.duration) < 0.1) {
        setIsPlaying(false);
        pausedAtRef.current = 0;
        setCurrentTime(0);
      }
    };
  }, [audioData, isPlaying, volume]);

  const pause = useCallback(() => {
    if (!isPlaying || !sourceNodeRef.current || !audioContextRef.current) return;
    sourceNodeRef.current.stop();
    sourceNodeRef.current = null;
    pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current;
    setIsPlaying(false);
  }, [isPlaying]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    pausedAtRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) gainNodeRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    let animationFrame: number;
    const updateProgress = () => {
      if (isPlaying && audioContextRef.current) {
        const time = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(time, duration));
      }
      animationFrame = requestAnimationFrame(updateProgress);
    };
    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, duration]);

  const changeVisualizerMode = (mode: VisualizerMode) => {
    if (mode === visualizerMode) return;
    setIsTransitioning(true);
    setTimeout(() => setVisualizerMode(mode), 150);
    setTimeout(() => setIsTransitioning(false), 450);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      {/* Nuevo Fondo Synthwave Animado */}
      <div className="synth-world">
        <div className="synth-sun"></div>
        <div className="synth-mountains">
          <div className="mountain"></div>
          <div className="mountain"></div>
          <div className="mountain"></div>
          <div className="mountain"></div>
          <div className="mountain"></div>
        </div>
        <div className="horizon-glow"></div>
        <div className="retro-grid"></div>
      </div>
      
      <Header />

      <main className="w-full max-w-5xl z-10">
        {/* Cassette Deck Body */}
        <div className="brushed-metal rounded-lg p-1 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_0_2px_#333] border-t border-white/10">
          <div className="bg-[#1a1a1c] rounded-md p-6 border border-black flex flex-col gap-6">
            
            {/* Top Info Section */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1">High Fidelity Component</span>
                <span className="text-xl font-bold italic text-[#ddd] tracking-widest">CB-8000 <span className="text-[#ff003c] text-sm">SERIES</span></span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] text-[#555] uppercase">Power</span>
                      <div className={`led ${audioData ? 'active-green' : ''}`}></div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] text-[#555] uppercase">Dolby NR</span>
                      <div className="led active-red"></div>
                   </div>
                </div>
                <div className="bg-black/40 px-3 py-1 rounded border border-white/5 flex flex-col items-center min-w-[80px]">
                  <span className="text-[8px] text-[#555] uppercase font-bold">Counter</span>
                  <span className="font-mono text-[#00ff9f] text-lg tracking-widest">
                    {new Date(currentTime * 1000).toISOString().substr(14, 5).replace(':', '')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Detailed Cassette Tape Visual */}
              <div className="flex-1 lg:max-w-[42%] bg-black/40 rounded-lg border-2 border-[#111] p-6 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,159,0.05)_0,transparent_100%)]"></div>
                 
                 {/* The Cassette Tape */}
                 <div className="cassette-shell w-full h-48 max-w-[340px] flex flex-col p-3 z-10">
                    <div className="cassette-screw top-1 left-1"></div>
                    <div className="cassette-screw top-1 right-1"></div>
                    <div className="cassette-screw bottom-1 left-1"></div>
                    <div className="cassette-screw bottom-1 right-1"></div>
                    
                    {/* Tape Label */}
                    <div className="cassette-label h-28 w-full p-2 flex flex-col items-center justify-start overflow-hidden shadow-inner">
                       <div className="w-full flex justify-between px-1 mb-1">
                          <span className="text-[8px] text-gray-400 font-bold">TYPE II</span>
                          <span className="text-[8px] text-gray-400 font-bold">CHROME</span>
                          <span className="text-[8px] text-gray-400 font-bold">60 min</span>
                       </div>
                       <div className="w-full h-[2px] bg-green-500/20 mb-2"></div>
                       
                       {/* Label Marker Text */}
                       <div className="w-full h-10 flex items-center justify-center px-2">
                          <span className="font-['Permanent_Marker'] text-gray-700 text-sm md:text-base leading-none text-center transform -rotate-1 truncate w-full">
                             {audioData ? audioData.name : "Ready to Mix..."}
                          </span>
                       </div>

                       {/* Tape Window / Reels */}
                       <div className="cassette-window w-40 h-10 mt-2 flex items-center justify-around overflow-hidden">
                          <div className={`tape-reel w-8 h-8 rounded-full cassette-reel-core flex items-center justify-center ${!isPlaying ? 'paused' : ''}`}>
                             <div className="w-0.5 h-6 bg-gray-400 absolute rotate-0"></div>
                             <div className="w-0.5 h-6 bg-gray-400 absolute rotate-60"></div>
                             <div className="w-0.5 h-6 bg-gray-400 absolute rotate-120"></div>
                             <div className="w-3 h-3 bg-gray-300 rounded-full z-10 border border-gray-400"></div>
                          </div>
                          
                          {/* Exposed Tape Visual */}
                          <div className="h-full w-12 flex flex-col items-center justify-center opacity-30">
                            <div className="w-full h-[1px] bg-amber-900 mb-1"></div>
                            <div className="w-full h-[1px] bg-amber-900 mb-1"></div>
                            <div className="w-full h-[1px] bg-amber-900"></div>
                          </div>

                          <div className={`tape-reel w-8 h-8 rounded-full cassette-reel-core flex items-center justify-center ${!isPlaying ? 'paused' : ''}`}>
                             <div className="w-0.5 h-6 bg-gray-400 absolute rotate-0"></div>
                             <div className="w-0.5 h-6 bg-gray-400 absolute rotate-60"></div>
                             <div className="w-0.5 h-6 bg-gray-400 absolute rotate-120"></div>
                             <div className="w-3 h-3 bg-gray-300 rounded-full z-10 border border-gray-400"></div>
                          </div>
                       </div>
                    </div>

                    {/* Bottom part of cassette shell */}
                    <div className="mt-auto w-full flex justify-between items-end px-4 py-1">
                       <div className="w-10 h-6 border-2 border-[#222] rounded-t-sm flex items-center justify-center gap-1">
                          <div className="w-1 h-1 bg-[#333] rounded-full"></div>
                          <div className="w-1 h-1 bg-[#333] rounded-full"></div>
                       </div>
                       <div className="text-[7px] text-gray-500 font-bold italic tracking-wider">CHARLIEBRAVO MUSIC CORP.</div>
                       <div className="w-10 h-6 border-2 border-[#222] rounded-t-sm flex items-center justify-center gap-1">
                          <div className="w-1 h-1 bg-[#333] rounded-full"></div>
                          <div className="w-1 h-1 bg-[#333] rounded-full"></div>
                       </div>
                    </div>
                 </div>

                 <div className="absolute bottom-2 left-2 text-[8px] text-[#444] font-bold uppercase tracking-widest">Cassette Deck 1</div>
              </div>

              {/* Right: VU Display */}
              <div className="flex-[1.5] flex flex-col gap-4">
                <div className="glass-panel rounded-md h-52 flex items-center justify-center">
                  <div className={`w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <VUMeter 
                      audioData={audioData} 
                      isPlaying={isPlaying} 
                      audioContext={audioContextRef.current} 
                      sourceNode={sourceNodeRef.current}
                      mode={visualizerMode}
                    />
                  </div>
                  <div className="absolute inset-0 glitch-overlay pointer-events-none opacity-10"></div>
                  {isTransitioning && <div className="absolute inset-0 bg-black/40 animate-pulse"></div>}
                </div>

                {/* Mode Selectors */}
                <div className="flex gap-2">
                  <button onClick={() => changeVisualizerMode(VisualizerMode.BARS)} className={`flex-1 py-1 border border-white/10 text-[9px] uppercase font-bold tracking-widest rounded ${visualizerMode === VisualizerMode.BARS ? 'bg-[#b026ff] text-white shadow-[0_0_10px_#b026ff]' : 'text-[#666]'}`}>Display Multi</button>
                  <button onClick={() => changeVisualizerMode(VisualizerMode.ANALOG)} className={`flex-1 py-1 border border-white/10 text-[9px] uppercase font-bold tracking-widest rounded ${visualizerMode === VisualizerMode.ANALOG ? 'bg-[#ff003c] text-white shadow-[0_0_10px_#ff003c]' : 'text-[#666]'}`}>Display Analog</button>
                </div>
              </div>
            </div>

            {/* Bottom: Piano Controls and Master Volume */}
            <div className="pt-4 border-t border-white/5">
              <RetroControls 
                isPlaying={isPlaying} 
                onPlay={play} 
                onPause={pause} 
                onStop={stop} 
                onUpload={handleFileUpload} 
                fileName={audioData?.name}
                volume={volume}
                onVolumeChange={setVolume}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center text-[9px] text-[#444] font-bold tracking-[0.2em] uppercase">
          <span>Analog Sound Restoration</span>
          <span>Tokyo • London • New York</span>
          <span>Copyright © 1984 Cyber-Acoustics</span>
        </div>
      </main>
    </div>
  );
};

export default App;
