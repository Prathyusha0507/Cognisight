import { TERMINAL_COMMANDS, AI_RESPONSES } from '../types/constants';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export { API_BASE };
export const mockAPI = {
  executeCommand: (command) => {
    return TERMINAL_COMMANDS[command] || `Command: ${command} not found`;
  },

  generateAIResponse: (message) => {
    return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
  },
};


// export const chatAPI = {
//   sendMessage: async (message, history) => {
//     try {
//       // Use API_BASE here
//       const response = await fetch(`http://127.0.0.1:8000/api/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: message,
//           // Transform internal store format to backend format
//           history: history.map((msg) => ({
//             role: msg.isUser ? "user" : "assistant",
//             content: msg.text,
//           })),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.statusText}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("API Call Failed:", error);
//       throw error;
//     }
//   },
// };