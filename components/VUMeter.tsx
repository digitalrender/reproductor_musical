
import React, { useEffect, useRef } from 'react';
import { VisualizerMode, AudioData } from '../../types';
import { COLORS, FFT_SIZE } from '../../constants';

interface VUMeterProps {
  audioData: AudioData | null;
  isPlaying: boolean;
  audioContext: AudioContext | null;
  sourceNode: AudioBufferSourceNode | null;
  mode: VisualizerMode;
}

export const VUMeter: React.FC<VUMeterProps> = ({ isPlaying, audioContext, sourceNode, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (isPlaying && audioContext && sourceNode) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      sourceNode.connect(analyser);
      analyserRef.current = analyser;
    } else {
      analyserRef.current = null;
    }
  }, [isPlaying, audioContext, sourceNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const dataArray = new Uint8Array(FFT_SIZE / 2);

    const render = (time: number) => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      // Deep VFD Background
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, width, height);

      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(0);
      }

      if (mode === VisualizerMode.BARS) {
        drawBars(ctx, width, height, dataArray, time);
      } else {
        drawAnalog(ctx, width, height, dataArray);
      }

      animationFrame = requestAnimationFrame(render);
    };

    const drawBars = (ctx: CanvasRenderingContext2D, width: number, height: number, data: Uint8Array, time: number) => {
      // Reduce the number of visible columns for a "chunkier" retro look
      const step = 2; 
      const barCount = data.length / step;
      const barWidth = (width / barCount) * 0.8; 
      const gap = (width / barCount) * 0.2;
      
      const pulse = Math.sin(time / 150) * 0.2 + 0.8;
      const flicker = Math.random() > 0.98 ? 0.7 : 1.0;
      const intensity = pulse * flicker;

      for (let i = 0; i < data.length; i += step) {
        const barHeight = (data[i] / 255) * height * 0.9;
        const x = (i / step) * (barWidth + gap) + gap / 2;
        
        // Define color based on frequency
        let activeColor = (COLORS as any).green;
        if (i > data.length * 0.8) activeColor = (COLORS as any).red;
        else if (i > data.length * 0.6) activeColor = (COLORS as any).violet;
        else if (i > data.length * 0.3) activeColor = (COLORS as any).blue;

        const segments = 12; // Fewer, larger segments
        const segmentGap = 6; // Larger gap between vertical blocks
        const segmentHeight = (height - (segments * segmentGap)) / segments;
        const activeSegments = Math.ceil((barHeight / height) * segments);

        // 1. Draw Background Segments (The unlit VFD mesh)
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        for (let k = 0; k < segments; k++) {
          const y = height - (k + 1) * (segmentHeight + segmentGap) + segmentGap;
          ctx.fillRect(x, y, barWidth, segmentHeight);
        }

        // 2. Draw Active Segments with Glow
        for (let j = 0; j < activeSegments; j++) {
          let segmentColor = (COLORS as any).green;
          if (j > segments * 0.8) segmentColor = (COLORS as any).red;
          else if (j > segments * 0.6) segmentColor = (COLORS as any).violet;
          else if (j > segments * 0.3) segmentColor = (COLORS as any).blue;

          const y = height - (j + 1) * (segmentHeight + segmentGap) + segmentGap;

          // Strong Glow Effect
          ctx.shadowBlur = 25 * intensity;
          ctx.shadowColor = segmentColor;
          ctx.globalAlpha = intensity;
          ctx.fillStyle = segmentColor;
          
          // Main Block
          ctx.fillRect(x, y, barWidth, segmentHeight);
          
          // Center "Gas Discharge" Brightness
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(x + barWidth * 0.1, y + segmentHeight * 0.3, barWidth * 0.8, segmentHeight * 0.4);

          // Subtle Bloom stroke
          ctx.strokeStyle = segmentColor;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3 * intensity;
          ctx.strokeRect(x - 1, y - 1, barWidth + 2, segmentHeight + 2);
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    };

    const drawAnalog = (ctx: CanvasRenderingContext2D, width: number, height: number, data: Uint8Array) => {
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      const normalizedAvg = avg / 255;

      const drawSingleMeter = (centerX: number, centerY: number, radius: number, isLeft: boolean) => {
        // Outer Rim
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0);
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 18;
        ctx.stroke();

        // Title
        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = '#555';
        ctx.textAlign = 'center';
        ctx.fillText(isLeft ? 'CHANNEL L' : 'CHANNEL R', centerX, centerY - radius * 0.4);

        const angle = Math.PI + (normalizedAvg * Math.PI);
        const needleLen = radius - 10;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        let needleColor = (COLORS as any).green;
        if (normalizedAvg > 0.85) needleColor = (COLORS as any).red;
        else if (normalizedAvg > 0.6) needleColor = (COLORS as any).violet;
        else if (normalizedAvg > 0.35) needleColor = (COLORS as any).blue;

        // Enhanced Glow for Needle
        ctx.shadowBlur = 30;
        ctx.shadowColor = needleColor;
        ctx.strokeStyle = needleColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(needleLen, 0);
        ctx.stroke();

        // Tip Highlight
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(needleLen * 0.8, 0);
        ctx.lineTo(needleLen, 0);
        ctx.stroke();

        ctx.restore();

        // Pivot Point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0a';
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Reflection on pivot
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();
      };

      const meterRadius = Math.min(width / 4, height * 0.75);
      drawSingleMeter(width * 0.25, height * 0.85, meterRadius, true);
      drawSingleMeter(width * 0.75, height * 0.85, meterRadius, false);
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [mode]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1000} 
      height={350} 
      className="w-full h-full object-contain p-4"
    />
  );
};
