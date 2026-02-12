import Message from "../models/Message.js";
import axios from "axios";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Empty message" });
    }

    // 1. Save user message
    const userMsg = new Message({
      userId: req.userId,
      role: "user",
      content: message,
    });
    await userMsg.save();

    // 2. Fetch history
    const historyDocs = await Message.find({ userId: req.userId })
      .sort({ createdAt: 1 })
      .limit(10);

    // Format for Python (Array of objects)
    const history = historyDocs.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // 3. Call Your Python Server (Port 8000)
    // ❌ OLD: http://localhost:11434/api/generate (Ollama)
    // ✅ NEW: http://127.0.0.1:8000/api/chat (Your Python Script)
    const PYTHON_URL = "http://127.0.0.1:8000/api/chat";

    console.log(`[AI] Sending to Python Engine: ${message.substring(0, 30)}...`);

    const response = await axios.post(PYTHON_URL, {
      message: message,
      history: history
    });

    const reply = response.data.reply || "No response from AI engine.";

    // 4. Save response
    const assistantMsg = new Message({
      userId: req.userId,
      role: "assistant",
      content: reply,
    });
    await assistantMsg.save();

    res.json({ success: true, reply });

  } catch (error) {
    console.error("AI Bridge Error:", error.message);
    if (error.code === "ECONNREFUSED") {
        return res.status(503).json({ error: "AI Engine (Python) is loading or offline. Please wait." });
    }
    res.status(500).json({ error: "AI processing failed." });
  }
};

// ... (Keep getHistory and clearHistory as they were) ...
export const getHistory = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json({ success: true, history: messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await Message.deleteMany({ userId: req.userId });
    res.json({ success: true, message: "History cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};