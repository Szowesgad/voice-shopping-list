import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  /**
   * Whether the audio is currently being recorded
   */
  isRecording: boolean;
  
  /**
   * Width of the visualizer canvas
   * @default 300
   */
  width?: number;
  
  /**
   * Height of the visualizer canvas
   * @default 100
   */
  height?: number;
  
  /**
   * Color of the visualization bars
   * @default '#3b82f6' (blue-500)
   */
  barColor?: string;
  
  /**
   * Number of bars to display
   * @default 50
   */
  barCount?: number;
  
  /**
   * Custom CSS class for the canvas
   */
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  width = 300,
  height = 100,
  barColor = '#3b82f6',
  barCount = 50,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Initialize audio context and analyzer when recording starts
  useEffect(() => {
    let source: MediaStreamAudioSourceNode | null = null;
    
    const setupAudio = async () => {
      try {
        if (isRecording) {
          // Create audio context if not already created
          if (!audioContext) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(context);
            
            // Create analyzer node
            const newAnalyser = context.createAnalyser();
            newAnalyser.fftSize = 256;
            const bufferLength = newAnalyser.frequencyBinCount;
            const newDataArray = new Uint8Array(bufferLength);
            
            setAnalyser(newAnalyser);
            setDataArray(newDataArray);
            
            // Get audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            // Connect stream to analyzer
            source = context.createMediaStreamSource(stream);
            source.connect(newAnalyser);
          }
        }
      } catch (error) {
        console.error('Error setting up audio visualizer:', error);
      }
    };
    
    setupAudio();
    
    return () => {
      // Clean up
      if (source) {
        source.disconnect();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isRecording, audioContext]);
  
  // Animation loop for the visualizer
  useEffect(() => {
    if (!isRecording || !analyser || !dataArray || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear canvas if not recording
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    const draw = () => {
      if (!analyser || !dataArray) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / barCount) * 0.8;
      const barSpacing = (canvas.width / barCount) * 0.2;
      let x = 0;
      
      for (let i = 0; i < barCount; i++) {
        // Use a subset of the data array, mapping the bar index to the data array
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const barHeight = (dataArray[dataIndex] / 255) * canvas.height;
        
        // Create gradient for the bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, barColor + '80'); // Add transparency to the top
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + barSpacing;
      }
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isRecording, analyser, dataArray, barColor, barCount]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`audio-visualizer ${className}`}
    />
  );
};
