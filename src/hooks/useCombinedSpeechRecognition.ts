import { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useVistaApiSpeechRecognition } from './useVistaApiSpeechRecognition';
import type { SpeechRecognitionHook } from '../types';

export type RecognitionMethod = 'browser' | 'api' | 'auto';

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
   * @default 'http://178.183.101.202:3001/api/transcribe'
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
  apiEndpoint = 'http://178.183.101.202:3001/api/transcribe',
  mimeType = 'audio/webm',
}: CombinedSpeechRecognitionOptions = {}): SpeechRecognitionHook & {
  activeMethod: RecognitionMethod;
  setMethod: (method: RecognitionMethod) => void;
} {
  // Initialize both recognition hooks
  const browserRecognition = useSpeechRecognition({ language });
  const apiRecognition = useVistaApiSpeechRecognition({
    apiEndpoint,
    language,
    mimeType,
  });
  
  // State for tracking the active method
  const [activeMethod, setActiveMethod] = useState<RecognitionMethod>(method);
  
  // Determine which method to use based on preference and support
  useEffect(() => {
    if (method === 'auto') {
      setActiveMethod(browserRecognition.supported ? 'browser' : 'api');
    } else {
      setActiveMethod(method);
    }
  }, [method, browserRecognition.supported]);
  
  // Get the currently active recognition instance
  const recognition = activeMethod === 'browser' ? browserRecognition : apiRecognition;
  
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
      (activeMethod === 'api' && !apiRecognition.supported)
    ) {
      const fallbackMethod = activeMethod === 'browser' ? 'api' : 'browser';
      const fallbackSupported = 
        fallbackMethod === 'browser' 
          ? browserRecognition.supported 
          : apiRecognition.supported;
      
      if (fallbackSupported) {
        // Switch to fallback and use it
        setActiveMethod(fallbackMethod);
        if (fallbackMethod === 'browser') {
          browserRecognition.startListening();
        } else {
          apiRecognition.startListening();
        }
      } else {
        // No method is supported
        setError('Speech recognition is not supported in this browser');
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
    
    setActiveMethod(newMethod === 'auto' 
      ? (browserRecognition.supported ? 'browser' : 'api')
      : newMethod
    );
  }, [recognition, browserRecognition.supported]);
  
  // Combined support status
  const supported = browserRecognition.supported || apiRecognition.supported;
  
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
