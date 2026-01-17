import React, { useEffect, useRef } from 'react';
import './WaveformView.css';

interface WaveformViewProps {
  audioData: Float32Array | null;
  isRecording: boolean;
}

/**
 * WaveformView Component
 * Displays real-time waveform visualization using canvas
 * Inspired by Wavesurfer.js styling for consistent visual appearance
 */
export const WaveformView: React.FC<WaveformViewProps> = ({ audioData, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const containerWidth = container.clientWidth - 48; // Account for padding
        canvas.width = containerWidth;
        canvas.height = 200;
        // Set display size (CSS pixels)
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = '200px';
      }
    };

    // Initial size update with a small delay to ensure container is rendered
    setTimeout(updateCanvasSize, 0);
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const drawWaveform = () => {
      if (!canvas || !ctx) {
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear previous frame
      ctx.clearRect(0, 0, width, height);

      if (!audioData || !isRecording || width === 0 || height === 0) {
        // Draw baseline when not recording
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        animationFrameRef.current = requestAnimationFrame(drawWaveform);
        return;
      }

      // Set drawing style (Wavesurfer-like appearance)
      ctx.fillStyle = '#667eea';
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 2;

      // Calculate bar width and spacing
      const barCount = Math.min(300, Math.floor(width / 3)); // More bars for smoother visualization
      const barWidth = width / barCount;
      const spacing = Math.max(1, barWidth * 0.2);

      // Draw waveform bars
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * audioData.length);
        if (dataIndex >= audioData.length) continue;
        
        const amplitude = Math.abs(audioData[dataIndex]);
        
        // Normalize and amplify amplitude to make it more visible
        // Audio data is typically in range -1 to 1, so we amplify it
        const normalizedAmplitude = Math.min(1, amplitude * 3); // Amplify by 3x for visibility
        const barHeight = Math.max(3, normalizedAmplitude * centerY * 1.8);

        const x = (i / barCount) * width;
        const actualBarWidth = Math.max(2, barWidth - spacing);

        // Draw bar with rounded corners (Wavesurfer style)
        ctx.beginPath();
        // Use roundRect if available, otherwise fall back to regular rect
        if (ctx.roundRect) {
          ctx.roundRect(x, centerY - barHeight / 2, actualBarWidth, barHeight, 3);
        } else {
          // Fallback for browsers without roundRect
          ctx.rect(x, centerY - barHeight / 2, actualBarWidth, barHeight);
        }
        ctx.fill();
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    };

    // Start drawing
    drawWaveform();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isRecording]);

  return (
    <div className="waveform-container">
      <canvas ref={canvasRef} className="waveform-view" />
      {!isRecording && (
        <div className="waveform-placeholder">
          <p>Waveform will appear here when recording starts</p>
        </div>
      )}
    </div>
  );
};
