import { useState, useCallback, useEffect, useRef } from 'react';
import { AudioService } from '../services/audioService';
import { WaveformView } from './WaveformView';
import './AudioRecorder.css';

type RecordingStatus = 'idle' | 'recording' | 'error';

/**
 * AudioRecorder Component
 * Main component that handles audio recording and waveform display
 */
export const AudioRecorder: React.FC = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const audioServiceRef = useRef<AudioService | null>(null);

  // Initialize audio service
  useEffect(() => {
    audioServiceRef.current = new AudioService();
    return () => {
      // Cleanup on unmount
      audioServiceRef.current?.stopRecording();
    };
  }, []);

  /**
   * Start recording audio from microphone
   */
  const handleStartRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      setStatus('recording');
      setAudioData(null);

      if (!audioServiceRef.current) {
        throw new Error('Audio service not initialized');
      }

      await audioServiceRef.current.startRecording({
        onDataAvailable: (data) => {
          // Update audio data for waveform visualization
          setAudioData(data);
        },
        onError: (error) => {
          setErrorMessage(error.message);
          setStatus('error');
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start recording';
      
      // Handle specific error cases
      if (message.includes('permission') || message.includes('Permission denied')) {
        setErrorMessage('Microphone permission denied. Please allow microphone access and try again.');
      } else if (message.includes('not found') || message.includes('NotFoundError')) {
        setErrorMessage('No microphone found. Please connect a microphone and try again.');
      } else {
        setErrorMessage(message);
      }
      
      setStatus('error');
    }
  }, []);

  /**
   * Stop recording audio
   */
  const handleStopRecording = useCallback(() => {
    audioServiceRef.current?.stopRecording();
    setStatus('idle');
    setAudioData(null);
  }, []);

  // Get status text for display
  const getStatusText = (): string => {
    switch (status) {
      case 'recording':
        return 'Listening...';
      case 'error':
        return 'Error';
      default:
        return 'Stopped';
    }
  };

  return (
    <div className="audio-recorder">
      <div className="recorder-container">
        <h1 className="app-title">Tadadum</h1>
        <p className="app-subtitle">Rhythm Capture - Phase 1</p>

        <WaveformView audioData={audioData} isRecording={status === 'recording'} />

        <div className="status-section">
          <div className={`status-indicator ${status}`}>
            <span className="status-dot"></span>
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="error-message" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="controls">
          <button
            className="btn btn-start"
            onClick={handleStartRecording}
            disabled={status === 'recording'}
            aria-label="Start recording"
          >
            Start Listening
          </button>
          <button
            className="btn btn-stop"
            onClick={handleStopRecording}
            disabled={status !== 'recording'}
            aria-label="Stop recording"
          >
            Stop Listening
          </button>
        </div>
      </div>
    </div>
  );
};
