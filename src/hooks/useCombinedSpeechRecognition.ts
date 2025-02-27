import { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useVistaApiSpeechRecognition } from './useVistaApiSpeechRecognition';
import { useOpenAiWhisperRecognition } from './useOpenAiWhisperRecognition';
import type { SpeechRecognitionHook } from '../types';

// Get API settings from environment variables
const USE_OPENAI_API = import.meta.env.VITE_USE_OPENAI_API === 'true';

export type RecognitionMethod = 'browser' | 'api' | 'openai' | 'auto';

interface CombinedSpeechRecognitionOptions {
  /**
   * Preferred method for speech recognition
   * @default 'auto'
   */
  method?: RecognitionMethod;
  
  /**
   * Language for speech recognition
   * @default 'en-US'
   */
  language?: string;
  
  /**
   * API endpoint for Vista speech recognition service
   * @default from environment variables or 'http://localhost:3001/api/transcribe'
   */
  apiEndpoint?: string;
  
  /**
   * MIME type for audio recording with API method
   * @default 'audio/webm'
   */
  mimeType?: string;
}

/**
 * Hook that combines browser speech recognition with API-based recognition
 * @param options Configuration options
 * @returns Speech recognition state and control functions
 */
export function useCombinedSpeechRecognition({
  method = 'auto',
  language = 'en-US',
  apiEndpoint,
  mimeType = 'audio/webm',
}: CombinedSpeechRecognitionOptions = {}): SpeechRecognitionHook & {
  activeMethod: RecognitionMethod;
  setMethod: (method: RecognitionMethod) => void;
} {
  // Initialize all recognition hooks
  const browserRecognition = useSpeechRecognition({ language });
  const apiRecognition = useVistaApiSpeechRecognition({
    apiEndpoint,
    language,
    mimeType,
  });
  const openaiRecognition = useOpenAiWhisperRecognition({
    language: language.split('-')[0], // OpenAI uses 'en' not 'en-US'
    mimeType,
  });
  
  // State for tracking the active method
  const [activeMethod, setActiveMethod] = useState<RecognitionMethod>(method);
  
  // Determine which method to use based on preference and support
  useEffect(() => {
    if (method === 'auto') {
      if (browserRecognition.supported) {
        setActiveMethod('browser');
      } else if (USE_OPENAI_API && openaiRecognition.supported) {
        setActiveMethod('openai');
      } else if (apiRecognition.supported) {
        setActiveMethod('api');
      }
    } else {
      setActiveMethod(method);
    }
  }, [method, browserRecognition.supported, apiRecognition.supported, openaiRecognition.supported]);
  
  // Get the currently active recognition instance
  const recognition = 
    activeMethod === 'browser' ? browserRecognition : 
    activeMethod === 'openai' ? openaiRecognition : 
    apiRecognition;
  
  // Combined state
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  
  // Update state when recognition state changes
  useEffect(() => {
    setTranscript(recognition.transcript);
  }, [recognition.transcript]);
  
  useEffect(() => {
    setError(recognition.error);
  }, [recognition.error]);
  
  // Start listening function
  const startListening = useCallback(() => {
    // Check if the current method is supported
    if (
      (activeMethod === 'browser' && !browserRecognition.supported) ||
      (activeMethod === 'api' && !apiRecognition.supported) ||
      (activeMethod === 'openai' && !openaiRecognition.supported)
    ) {
      // Try to find a supported method
      const availableMethods: RecognitionMethod[] = [];
      if (browserRecognition.supported) availableMethods.push('browser');
      if (openaiRecognition.supported) availableMethods.push('openai');
      if (apiRecognition.supported) availableMethods.push('api');
      
      if (availableMethods.length > 0) {
        // Use the first available method
        const fallbackMethod = availableMethods[0];
        setActiveMethod(fallbackMethod);
        
        // Start listening with the fallback method
        if (fallbackMethod === 'browser') {
          browserRecognition.startListening();
        } else if (fallbackMethod === 'openai') {
          openaiRecognition.startListening();
        } else {
          apiRecognition.startListening();
        }
      } else {
        // No method is supported
        setError('Speech recognition is not supported in this browser or API configuration');
      }
    } else {
      // Use the current method
      recognition.startListening();
    }
  }, [
    activeMethod, 
    recognition, 
    browserRecognition, 
    apiRecognition,
    openaiRecognition
  ]);
  
  // Stop listening function
  const stopListening = useCallback(() => {
    recognition.stopListening();
  }, [recognition]);
  
  // Reset transcript function
  const resetTranscript = useCallback(() => {
    setTranscript('');
    recognition.resetTranscript();
  }, [recognition]);
  
  // Set method explicitly
  const setMethod = useCallback((newMethod: RecognitionMethod) => {
    // If currently listening, stop before changing method
    if (recognition.isListening) {
      recognition.stopListening();
    }
    
    if (newMethod === 'auto') {
      // Auto-select the best available method
      if (browserRecognition.supported) {
        setActiveMethod('browser');
      } else if (USE_OPENAI_API && openaiRecognition.supported) {
        setActiveMethod('openai');
      } else if (apiRecognition.supported) {
        setActiveMethod('api');
      }
    } else {
      setActiveMethod(newMethod);
    }
  }, [
    recognition, 
    browserRecognition.supported, 
    apiRecognition.supported,
    openaiRecognition.supported
  ]);
  
  // Combined support status
  const supported = 
    browserRecognition.supported || 
    apiRecognition.supported || 
    openaiRecognition.supported;
  
  return {
    transcript,
    isListening: recognition.isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    supported,
    activeMethod,
    setMethod,
  };
}