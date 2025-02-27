import React, { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { 
  useCombinedSpeechRecognition, 
  type RecognitionMethod 
} from '../hooks';
import { ShoppingItem as ShoppingItemComponent } from './ShoppingItem';
import { AudioVisualizer } from './AudioVisualizer';
import { FileUpload } from './FileUpload';
import type { ShoppingItem, VoiceShoppingListProps } from '../types';
import {
  parseTranscriptToItems,
  isClearCommand,
  isDeleteLastCommand,
  isMarkAllCompletedCommand,
  saveItemsToStorage,
  loadItemsFromStorage,
  isStorageAvailable,
  downloadShoppingList
} from '../utils';

// Get environment variables with defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE || 'en-US';
const DEFAULT_TITLE = import.meta.env.VITE_DEFAULT_TITLE || 'Shopping List';
const DEFAULT_MAX_ITEMS = parseInt(import.meta.env.VITE_MAX_ITEMS || '100', 10);
const DEFAULT_STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'voice-shopping-list';
const DEFAULT_ENABLE_STORAGE = import.meta.env.VITE_ENABLE_STORAGE !== 'false';
const USE_OPENAI_API = import.meta.env.VITE_USE_OPENAI_API === 'true';

export const VoiceShoppingList: React.FC<VoiceShoppingListProps> = ({
  title = DEFAULT_TITLE,
  placeholder = 'Add an item...',
  language = DEFAULT_LANGUAGE,
  maxItems = DEFAULT_MAX_ITEMS,
  storageKey = DEFAULT_STORAGE_KEY,
  enableStorage = DEFAULT_ENABLE_STORAGE,
  className = '',
  onListChange,
}) => {
  // State
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [processingFile, setProcessingFile] = useState(false);
  const [recognitionMethod, setRecognitionMethod] = useState<RecognitionMethod>('auto');
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'csv' | 'json' | 'html'>('txt');
  
  // Speech recognition hook
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    supported,
    activeMethod,
    setMethod
  } = useCombinedSpeechRecognition({
    method: recognitionMethod,
    language,
    apiEndpoint: `${API_URL}/api/transcribe`,
  });
  
  // Load items from storage on mount
  useEffect(() => {
    if (enableStorage && isStorageAvailable()) {
      const storedItems = loadItemsFromStorage(storageKey);
      if (storedItems.length > 0) {
        setItems(storedItems);
      }
    }
  }, [enableStorage, storageKey]);
  
  // Save items to storage when they change
  useEffect(() => {
    if (enableStorage && isStorageAvailable() && items.length > 0) {
      saveItemsToStorage(items, storageKey);
    }
    
    // Call onChange callback if provided
    if (onListChange) {
      onListChange(items);
    }
  }, [items, enableStorage, storageKey, onListChange]);
  
  // Process transcript when it changes
  useEffect(() => {
    if (!transcript || transcript.trim() === '' || isListening) return;
    
    // Check for special commands
    if (isClearCommand(transcript)) {
      setItems([]);
      resetTranscript();
      return;
    }
    
    if (isDeleteLastCommand(transcript)) {
      setItems(prev => {
        if (prev.length === 0) return prev;
        return prev.slice(0, -1);
      });
      resetTranscript();
      return;
    }
    
    if (isMarkAllCompletedCommand(transcript)) {
      setItems(prev => prev.map(item => ({ ...item, completed: true })));
      resetTranscript();
      return;
    }
    
    // Process normal items
    const newItems = parseTranscriptToItems(transcript);
    if (newItems.length > 0) {
      setItems(prev => {
        const combined = [...prev, ...newItems];
        // Limit to maxItems
        return combined.slice(-maxItems);
      });
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript, maxItems]);
  
  // Handle input submission
  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const newItem: ShoppingItem = {
      id: nanoid(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    
    setItems(prev => {
      const newItems = [...prev, newItem];
      return newItems.slice(-maxItems);
    });
    
    setInputValue('');
  }, [inputValue, maxItems]);
  
  // Handle toggle item
  const handleToggleItem = useCallback((id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);
  
  // Handle delete item
  const handleDeleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // Handle edit item
  const handleEditItem = useCallback((id: string, newText: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, text: newText } : item
      )
    );
  }, []);
  
  // Handle clear completed
  const handleClearCompleted = useCallback(() => {
    setItems(prev => prev.filter(item => !item.completed));
  }, []);
  
  // Handle clear all
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all items?')) {
      setItems([]);
    }
  }, []);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setProcessingFile(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', language);
      
      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.rawText) {
        const transcription = result.data.rawText.trim();
        const newItems = parseTranscriptToItems(transcription);
        
        if (newItems.length > 0) {
          setItems(prev => {
            const combined = [...prev, ...newItems];
            // Limit to maxItems
            return combined.slice(-maxItems);
          });
        }
      } else if (result.error) {
        throw new Error(result.error.message || 'Unknown API error');
      }
    } catch (err) {
      console.error('Error processing audio file:', err);
      alert('Failed to process audio file. Please try again.');
    } finally {
      setProcessingFile(false);
    }
  }, [language, maxItems]);
  
  // Handle download
  const handleDownload = useCallback(() => {
    downloadShoppingList(items, downloadFormat, title);
  }, [items, downloadFormat, title]);
  
  // Get API method display name
  const getMethodDisplayName = useCallback((method: RecognitionMethod) => {
    switch (method) {
      case 'browser': return 'Browser API';
      case 'api': return 'Vista API';
      case 'openai': return 'OpenAI Whisper';
      default: return 'API';
    }
  }, []);
  
  return (
    <div className={`voice-shopping-list ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex space-x-2">
          {/* Recognition method selector */}
          <select
            value={recognitionMethod}
            onChange={(e) => setRecognitionMethod(e.target.value as RecognitionMethod)}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            disabled={isListening}
          >
            <option value="auto">Auto</option>
            <option value="browser">Browser API</option>
            <option value="api">Vista API</option>
            {USE_OPENAI_API && <option value="openai">OpenAI Whisper</option>}
          </select>
          
          {/* Download format selector */}
          <select
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value as 'txt' | 'csv' | 'json' | 'html')}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md"
          >
            <option value="txt">Text</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
          </select>
          
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={items.length === 0}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            Download
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        {/* Voice input */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!supported}
            className={`px-4 py-2 rounded-full ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isListening ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Stop Recording
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Start Recording
              </>
            )}
          </button>
          
          <div className="ml-3 text-sm text-gray-600">
            Using {getMethodDisplayName(activeMethod)}
          </div>
          
          {/* Alternative text input */}
          <form onSubmit={handleInputSubmit} className="flex-1 ml-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isListening}
            />
          </form>
        </div>
        
        {/* Transcript display */}
        {isListening && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Listening...</div>
            <AudioVisualizer
              isRecording={isListening}
              width={500}
              height={80}
              className="mb-2"
            />
            <div className="bg-gray-100 p-3 rounded-md min-h-12 max-h-32 overflow-y-auto">
              {transcript || 'Say something...'}
            </div>
          </div>
        )}
        
        {/* File upload */}
        <div className="mt-4">
          <FileUpload
            onFileSelected={handleFileUpload}
            isProcessing={processingFile}
          />
          {processingFile && (
            <div className="text-sm text-gray-500 mt-2">Processing audio file...</div>
          )}
        </div>
        
        {/* Error display */}
        {error && (
          <div className="text-red-600 text-sm mt-2">
            Error: {error}
          </div>
        )}
      </div>
      
      {/* Shopping list */}
      <div className="border rounded-md">
        <ul className="divide-y divide-gray-200">
          {items.length > 0 ? (
            items.map(item => (
              <ShoppingItemComponent
                key={item.id}
                item={item}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
                onEdit={handleEditItem}
              />
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">
              No items yet. Add some items by speaking or typing!
            </li>
          )}
        </ul>
      </div>
      
      {/* Controls */}
      {items.length > 0 && (
        <div className="flex justify-between mt-4 text-sm">
          <div>
            {items.filter(item => !item.completed).length} items left
          </div>
          <div className="space-x-4">
            <button
              onClick={handleClearCompleted}
              className="text-gray-600 hover:text-gray-800"
              disabled={!items.some(item => item.completed)}
            >
              Clear completed
            </button>
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};