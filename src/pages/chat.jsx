import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = "https://programmer00732f-chatbot.hf.space";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  
  // We store the last message sent so we can re-send it during polling.
  const [lastUserMessage, setLastUserMessage] = useState('');

  // Function to handle user submitting a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');

    // 1. Add user message to UI immediately
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    // 2. Store the actual message text for polling purposes
    setLastUserMessage(userText);

    try {
      // 3. Send the ACTUAL message to backend
     const response = await axios.post(`${BASE_URL}/chat`, { message: userText });

      // 4. Check if backend returned an answer (agent_response key exists)
      if (response.data.agent_response) {
        setMessages((prev) => [
          ...prev,
          { sender: 'agent', text: response.data.agent_response },
        ]);
        setIsWaiting(false); // Agent answered immediately
      } else {
        // 5. If agent couldn't answer, enter Waiting state (start polling)
        setIsWaiting(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // AUTOMATIC POLLING logic using useEffect
  useEffect(() => {
    let intervalId;

    // Only poll if we are waiting AND we have a message to check
    if (isWaiting && lastUserMessage) {
      intervalId = setInterval(async () => {
        try {
          // Send the ORIGINAL message again to check if Admin replied
          const response = await axios.post(`${BASE_URL}/chat`, {
            message: lastUserMessage, 
          });

          // If backend returns agent_response, Admin has replied!
          if (response.data.agent_response) {
            setMessages((prev) => [
              ...prev,
              { sender: 'agent', text: response.data.agent_response },
            ]);
            
            // Stop polling and reset input
            setIsWaiting(false);
            setLastUserMessage('');
          }
          
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000); // Check every 3 seconds
    }

    // Cleanup interval when component unmounts or status changes
    return () => clearInterval(intervalId);
  }, [isWaiting, lastUserMessage]);

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto h-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-blue-600 p-4 shadow-md z-10">
        <h2 className="text-white font-bold text-xl">User Chat</h2>
        <p className="text-blue-100 text-xs mt-1">Ask anything, and an Agent will assist you.</p>
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words
              ${msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'}`}>
              
              <span className="block text-[10px] uppercase font-bold opacity-70 mb-1 tracking-wider">
                {msg.sender}
              </span>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Status Indicator */}
        {isWaiting && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm text-sm max-w-[85%] flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Agent couldn't answer. Waiting for admin...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
          className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm
            ${isWaiting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
          disabled={isWaiting} 
        />
        <button 
          type="submit" 
          disabled={isWaiting} 
          className={`px-6 py-3 rounded-xl text-white font-medium shadow-md transition-all text-sm
            ${isWaiting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg'}`}
        >
          {isWaiting ? 'Waiting...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;