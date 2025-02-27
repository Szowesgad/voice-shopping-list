import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpeechRecognitionHook } from '../types';

interface VistaApiOptions {
  /**
   * API endpoint for speech recognition service
   * @default 'http://178.183.101.202:3001/api/transcribe'
   */
  apiEndpoint?: string;
  
  /**
   * Language for transcription
   * @default 'en-US'
   */
  language?: string;
  
  /**
   * Time slice for sending audio data (in milliseconds)
   * @default 1000
   */
  timeSlice?: number;
  
  /**
   * MIME type for audio recording
   * @default 'audio/webm'
   */
  mimeType?: string;
}

/**
 * Hook for speech recognition using Vista API
 * @param options Configuration options
 * @returns Speech recognition state and control functions
 */
export function useVistaApiSpeechRecognition({
  apiEndpoint = 'http://178.183.101.202:3001/api/transcribe',
  language = 'en-US',
  timeSlice = 1000,
  mimeType = 'audio/webm',
}: VistaApiOptions = {}): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Check if the browser supports necessary APIs
  const supported = useCallback(() => {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }, []);

  // Clean up function to stop recording and release resources
  const cleanupRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Reset when component unmounts
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  // Send audio data to API and get transcription
  const sendAudioToApi = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.rawText) {
        setTranscript(prev => {
          const newText = result.data.rawText.trim();
          if (prev && !prev.includes(newText)) {
            return `${prev} ${newText}`.trim();
          }
          return prev || newText;
        });
      } else if (result.error) {
        throw new Error(result.error.message || 'Unknown API error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      setError(errorMessage);
      console.error('Transcription error:', err);
    }
  }, [apiEndpoint, language]);

  // Start recording and listening
  const startListening = useCallback(async () => {
    if (!supported()) {
      setError('Media recording is not supported in this browser');
      return;
    }
    
    if (isListening) return;
    
    try {
      // Reset state
      setError(undefined);
      chunksRef.current = [];
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'audio/webm',
      });
      
      mediaRecorderRef.current = recorder;
      
      // Handle data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      recorder.onstop = async () => {
        setIsListening(false);
        
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          await sendAudioToApi(audioBlob);
          chunksRef.current = [];
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      // Handle errors
      recorder.onerror = (event) => {
        setError('Recording error occurred');
        setIsListening(false);
        cleanupRecording();
      };
      
      // Start recording
      recorder.start(timeSlice);
      setIsListening(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
      cleanupRecording();
    }
  }, [supported, isListening, sendAudioToApi, mimeType, timeSlice, cleanupRecording]);

  // Stop recording and listening
  const stopListening = useCallback(() => {
    if (!isListening || !mediaRecorderRef.current) return;
    
    try {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      cleanupRecording();
    }
  }, [isListening, cleanupRecording]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    supported: supported(),
  };
}
