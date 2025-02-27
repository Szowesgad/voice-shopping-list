import { useState, useEffect, useRef, useCallback } from 'react';
import type { SpeechRecognitionHook } from '../types';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VistaApiSpeechRecognitionOptions {
  /**
   * API endpoint for transcription service
   * @default from VITE_API_URL environment variable or http://localhost:3001/api/transcribe
   */
  apiEndpoint?: string;
  
  /**
   * Language for speech recognition
   * @default 'en-US'
   */
  language?: string;
  
  /**
   * MIME type for audio recording
   * @default 'audio/webm'
   */
  mimeType?: string;
}

/**
 * Hook for speech recognition using the Vista API
 * @param options Configuration options
 * @returns Speech recognition state and control functions
 */
export function useVistaApiSpeechRecognition({
  apiEndpoint = `${API_URL}/api/transcribe`,
  language = 'en-US',
  mimeType = 'audio/webm',
}: VistaApiSpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  
  // Check if the browser supports MediaRecorder
  const supported = typeof window !== 'undefined' && 'MediaRecorder' in window;
  
  // Refs
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, []);
  
  // Start listening function
  const startListening = useCallback(async () => {
    if (!supported) {
      setError('MediaRecorder is not supported in this browser');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      audioChunks.current = [];
      
      mediaRecorder.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      });
      
      mediaRecorder.current.addEventListener('stop', async () => {
        try {
          const audioBlob = new Blob(audioChunks.current, { type: mimeType });
          
          // Create FormData
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('language', language);
          
          // Send to API
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success && result.data && result.data.rawText) {
            setTranscript(prev => prev + ' ' + result.data.rawText.trim());
          } else if (result.error) {
            throw new Error(result.error.message || 'Unknown API error');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          setIsListening(false);
        }
      });
      
      mediaRecorder.current.start();
      setIsListening(true);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsListening(false);
    }
  }, [supported, mimeType, language, apiEndpoint]);
  
  // Stop listening function
  const stopListening = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
  }, []);
  
  // Reset transcript function
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
    supported,
  };
}
