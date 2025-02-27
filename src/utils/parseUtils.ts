import { nanoid } from 'nanoid';
import type { ShoppingItem } from '../types';

/**
 * Extract items from a transcript text
 * @param text Transcript text to parse
 * @returns Array of extracted item texts
 */
export const extractItemsFromText = (text: string): string[] => {
  if (!text || typeof text !== 'string') return [];
  
  // Remove common filler phrases
  const cleanedText = text
    .replace(/\b(add|put|include|get|buy|need|i need|we need|i want|we want|let's add|grab|pick up|please add|maybe|probably|actually|um|uh|like|you know)\b/gi, '')
    .replace(/\b(to (the|my|our) (list|shopping list))\b/gi, '')
    .replace(/\b(on (the|my|our) (list|shopping list))\b/gi, '')
    .replace(/\b(to shopping list)\b/gi, '')
    .trim();
  
  // Split by common delimiters
  let items: string[] = [];
  
  // Check if the text has bullet points, commas, periods, or other markers
  if (cleanedText.includes('•') || cleanedText.includes('*') || cleanedText.includes('-')) {
    // Split by bullet points, asterisks, or dashes
    items = cleanedText
      .split(/[•*\-]\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  } else if (cleanedText.includes(',') || cleanedText.includes('and')) {
    // Split by commas and 'and'
    items = cleanedText
      .replace(/ and /gi, ',')
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  } else if (cleanedText.includes('.')) {
    // Split by periods
    items = cleanedText
      .split('.')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  } else if (cleanedText.includes('\n')) {
    // Split by newlines
    items = cleanedText
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  } else {
    // Just use the entire text as one item
    if (cleanedText.length > 0) {
      items = [cleanedText];
    }
  }
  
  // Clean up items
  return items
    .map(item => {
      // Capitalize first letter
      return item.charAt(0).toUpperCase() + item.slice(1);
    })
    .filter(item => item.length >= 2); // Filter out very short items
};

/**
 * Create ShoppingItem objects from text items
 * @param textItems Array of text items
 * @returns Array of ShoppingItem objects
 */
export const createShoppingItems = (textItems: string[]): ShoppingItem[] => {
  const now = Date.now();
  
  return textItems.map(text => ({
    id: nanoid(),
    text,
    completed: false,
    createdAt: now
  }));
};

/**
 * Parse transcript to shopping items
 * @param transcript Transcript text
 * @returns Array of ShoppingItem objects
 */
export const parseTranscriptToItems = (transcript: string): ShoppingItem[] => {
  const textItems = extractItemsFromText(transcript);
  return createShoppingItems(textItems);
};

/**
 * Check if text contains any of the keywords
 * @param text Text to check
 * @param keywords Keywords to look for
 * @returns True if any keyword is found
 */
export const containsKeywords = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

/**
 * Check if the text is a command to clear the list
 * @param text Text to check
 * @returns True if it's a clear command
 */
export const isClearCommand = (text: string): boolean => {
  const clearKeywords = [
    'clear list',
    'clear the list',
    'empty list',
    'empty the list',
    'delete all',
    'delete everything',
    'remove all',
    'remove everything',
    'start over',
    'start a new list',
    'reset list',
    'reset the list'
  ];
  
  return containsKeywords(text, clearKeywords);
};

/**
 * Check if the text is a command to delete the last item
 * @param text Text to check
 * @returns True if it's a delete last command
 */
export const isDeleteLastCommand = (text: string): boolean => {
  const deleteLastKeywords = [
    'delete last',
    'delete the last',
    'remove last',
    'remove the last',
    'undo last',
    'undo the last',
    'forget last',
    'forget the last'
  ];
  
  return containsKeywords(text, deleteLastKeywords);
};

/**
 * Check if the text is a command to mark all as completed
 * @param text Text to check
 * @returns True if it's a mark all command
 */
export const isMarkAllCompletedCommand = (text: string): boolean => {
  const markAllKeywords = [
    'mark all',
    'mark all as done',
    'mark all as completed',
    'complete all',
    'complete everything',
    'finish all',
    'finish everything',
    'all done',
    'everything done',
    'check all',
    'check everything'
  ];
  
  return containsKeywords(text, markAllKeywords);
};
