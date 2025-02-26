export interface ShoppingItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface VoiceShoppingListProps {
  /**
   * Title for the shopping list
   * @default "Shopping List"
   */
  title?: string;
  
  /**
   * Placeholder text for the input field
   * @default "Add an item..."
   */
  placeholder?: string;
  
  /**
   * Language for speech recognition
   * @default "en-US"
   */
  language?: string;
  
  /**
   * Maximum number of items to keep in history
   * @default 100
   */
  maxItems?: number;
  
  /**
   * Local storage key for persisting the list
   * @default "voice-shopping-list"
   */
  storageKey?: string;
  
  /**
   * Enable or disable local storage persistence
   * @default true
   */
  enableStorage?: boolean;
  
  /**
   * Custom CSS class for the component
   */
  className?: string;
  
  /**
   * Event handler for when the list changes
   */
  onListChange?: (items: ShoppingItem[]) => void;
}

export interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error?: string;
  supported: boolean;
}
