import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpeechRecognitionHook } from '../types';

// Define the SpeechRecognition type globally
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Get the browser's SpeechRecognition implementation
const SpeechRecognitionAPI =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition ||
  (window as any).mozSpeechRecognition ||
  (window as any).msSpeechRecognition ||
  null;

/**
 * React hook for using the browser's speech recognition API
 * @param options Configuration options for speech recognition
 * @returns Speech recognition state and control functions
 */
export function useSpeechRecognition({
  language = 'en-US',
  continuous = true,
  interimResults = true,
  maxAlternatives = 1,
}: {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
} = {}): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const supported = !!SpeechRecognitionAPI;

  // Initialize the recognition object
  useEffect(() => {
    if (!supported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = maxAlternatives;

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      recognitionRef.current = null;
    };
  }, [supported, continuous, interimResults, language, maxAlternatives]);

  // Configure the event handlers
  useEffect(() => {
    if (!supported || !recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.resultIndex];
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript.trim();
        setTranscript((prev) => {
          // Only add text if it's not already in the transcript (can happen with continuous mode)
          if (prev && !prev.endsWith(text)) {
            return `${prev} ${text}`.trim();
          }
          return prev || text;
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        // This is a common non-critical error, don't set it
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(undefined);
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Restart if we're still supposed to be listening
      // This handles cases where the recognition stops due to silence
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore, as this could be due to recognition already running
        }
      }
    };
  }, [supported, isListening]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!supported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setError('Failed to start speech recognition');
    }
  }, [supported, isListening]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (!supported || !recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error('Failed to stop speech recognition:', e);
    }
  }, [supported]);

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
