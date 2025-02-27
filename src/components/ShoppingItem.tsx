import React, { useState } from 'react';
import type { ShoppingItem as ShoppingItemType } from '../types';

interface ShoppingItemProps {
  /**
   * Item data
   */
  item: ShoppingItemType;
  
  /**
   * Callback for when the item is toggled
   */
  onToggle: (id: string) => void;
  
  /**
   * Callback for when the item is deleted
   */
  onDelete: (id: string) => void;
  
  /**
   * Callback for when the item is edited
   */
  onEdit: (id: string, newText: string) => void;
  
  /**
   * Custom CSS class for the item
   */
  className?: string;
}

export const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  onToggle,
  onDelete,
  onEdit,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  
  const handleToggle = () => {
    onToggle(item.id);
  };
  
  const handleDelete = () => {
    onDelete(item.id);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if (editText.trim()) {
      onEdit(item.id, editText);
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setEditText(item.text);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  return (
    <li 
      className={`
        flex items-center justify-between p-3 border-b border-gray-200 group
        ${item.completed ? 'bg-gray-50' : 'bg-white'}
        ${className}
      `}
    >
      {isEditing ? (
        <div className="flex-1 flex items-center">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-1 border border-gray-300 rounded-md"
            autoFocus
          />
          <div className="flex space-x-2 ml-3">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800"
              aria-label="Save"
            >
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
              >
                <path d="M5 12l5 5l10 -10"></path>
              </svg>
            </button>
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-800"
              aria-label="Cancel"
            >
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
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center flex-1">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={handleToggle}
              className="w-4 h-4 mr-3 text-blue-600 rounded focus:ring-blue-500"
            />
            <span 
              className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
            >
              {item.text}
            </span>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Edit"
            >
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
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800"
              aria-label="Delete"
            >
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
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  );
};
