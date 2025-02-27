import { useState, useEffect, useRef, useCallback } from 'react';
import type { SpeechRecognitionHook } from '../types';

// Get API settings from environment variables
const USE_OPENAI_API = import.meta.env.VITE_USE_OPENAI_API === 'true';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_API_MODEL = import.meta.env.VITE_OPENAI_API_MODEL || 'whisper-1';

interface OpenAiWhisperRecognitionOptions {
  /**
   * API URL for OpenAI Whisper API
   * @default from VITE_OPENAI_API_URL or https://api.openai.com/v1/audio/transcriptions
   */
  apiUrl?: string;
  
  /**
   * OpenAI API key
   * @default from VITE_OPENAI_API_KEY
   */
  apiKey?: string;
  
  /**
   * Model to use for transcription
   * @default from VITE_OPENAI_API_MODEL or whisper-1
   */
  model?: string;
  
  /**
   * Language for speech recognition
   * @default 'en'
   */
  language?: string;
  
  /**
   * MIME type for audio recording
   * @default 'audio/webm'
   */
  mimeType?: string;
}

/**
 * Hook for speech recognition using OpenAI Whisper API
 * @param options Configuration options
 * @returns Speech recognition state and control functions
 */
export function useOpenAiWhisperRecognition({
  apiUrl = OPENAI_API_URL,
  apiKey = OPENAI_API_KEY,
  model = OPENAI_API_MODEL,
  language = 'en',
  mimeType = 'audio/webm',
}: OpenAiWhisperRecognitionOptions = {}): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  
  // Check if the browser supports MediaRecorder and API is configured
  const supported = typeof window !== 'undefined' && 
    'MediaRecorder' in window && 
    USE_OPENAI_API && 
    apiKey.length > 0;
  
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
      setError('OpenAI Whisper API is not configured or MediaRecorder is not supported');
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
          
          // Create FormData for OpenAI API
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          formData.append('model', model);
          formData.append('language', language);
          
          // Send to OpenAI API
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`
            },
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown API error' } }));
            throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.text) {
            setTranscript(prev => prev + ' ' + result.text.trim());
          } else {
            throw new Error('No transcription returned from API');
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
  }, [supported, mimeType, language, apiUrl, apiKey, model]);
  
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
