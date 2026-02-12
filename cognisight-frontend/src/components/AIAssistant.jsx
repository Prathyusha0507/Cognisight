import React, { useRef, useEffect, useState } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { useIDEStore } from '../stores/ideStore';
//import { chatAPI } from '../utils/api'; // Import the new API utility
import './AIAssistant.css';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { aiMessages, addAIMessage } = useIDEStore();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue(''); // Clear input

    // 1. Add User Message immediately
    addAIMessage({
      id: `msg-${Date.now()}`,
      text: userText,
      isUser: true,
      timestamp: new Date(),
    });

    setIsTyping(true);

    try {
      // 2. Call Real Backend
      // Passing 'aiMessages' allows the backend to know context
      const data = await chatAPI.sendMessage(userText, aiMessages);

      // 3. Add AI Response
      addAIMessage({
        id: `msg-${Date.now()}-ai`,
        text: data.reply,
        isUser: false,
        timestamp: new Date(),
      });
    } catch (error) {
      // Handle Error nicely in UI
      addAIMessage({
        id: `msg-${Date.now()}-err`,
        text: "Error: Could not connect to AI server. Please check if the Python backend is running.",
        isUser: false,
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="ai-assistant__fab"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="ai-assistant">
      <div className="ai-assistant__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>AI Assistant</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="ai-assistant__close">
          <X size={18} />
        </button>
      </div>

      <div className="ai-assistant__messages">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-assistant__message ${msg.isUser ? 'ai-assistant__message--user' : 'ai-assistant__message--ai'}`}
          >
            <div className={`ai-assistant__bubble ${!msg.isUser && msg.text.startsWith('Error') ? 'error-bubble' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="ai-assistant__message ai-assistant__message--ai">
            <div className="ai-assistant__bubble typing-indicator">
              <Loader2 size={16} className="spin-animation" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="ai-assistant__input">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          placeholder="Ask anything..."
          className="ai-assistant__input-field"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="ai-assistant__send"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};