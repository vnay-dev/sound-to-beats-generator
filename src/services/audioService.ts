/**
 * Audio Service
 * Handles Web Audio API operations for capturing and processing microphone input
 */

export interface AudioServiceCallbacks {
  onDataAvailable?: (audioData: Float32Array) => void;
  onError?: (error: Error) => void;
}

export class AudioService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Float32Array | null = null;
  private animationFrameId: number | null = null;
  private callbacks: AudioServiceCallbacks = {};

  /**
   * Initialize audio context and request microphone access
   */
  async startRecording(callbacks: AudioServiceCallbacks = {}): Promise<void> {
    try {
      this.callbacks = callbacks;

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create analyser node for waveform data
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Get buffer length and create data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Float32Array(bufferLength);

      // Connect microphone to analyser
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      // Start continuous data capture
      this.captureAudioData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Failed to start recording');
      this.callbacks.onError?.(errorMessage);
      throw errorMessage;
    }
  }

  /**
   * Continuously capture audio data and notify callbacks
   */
  private captureAudioData(): void {
    if (!this.analyser || !this.dataArray) return;

    const capture = () => {
      if (!this.analyser || !this.dataArray) return;

      // Get time domain data for waveform visualization
      this.analyser.getFloatTimeDomainData(this.dataArray);

      // Notify callback with audio data
      this.callbacks.onDataAvailable?.(this.dataArray.slice());

      // Continue capturing
      this.animationFrameId = requestAnimationFrame(capture);
    };

    capture();
  }

  /**
   * Stop recording and clean up resources
   */
  stopRecording(): void {
    // Stop animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Stop all tracks in media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // Ignore errors during cleanup
      });
      this.audioContext = null;
    }

    // Reset analyser and data array
    this.analyser = null;
    this.dataArray = null;
    this.callbacks = {};
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaStream !== null && this.mediaStream.active;
  }
}
