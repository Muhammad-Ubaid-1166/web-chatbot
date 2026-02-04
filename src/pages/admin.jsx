import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = "https://programmer00732f-chatbot.hf.space";



const AdminPanel = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  
  // UI State
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // 1. Function to Toggle Admin Mode
  const toggleAdminMode = async () => {
    try {
      // Calls the NEW endpoint added in main.py
      const response = await axios.patch(`${BASE_URL}/admin_toggle`);
      setIsAdminMode(response.data.admin_bool);
      
      if (!response.data.admin_bool) {
        setPendingMessage(null);
        setIsDetailsExpanded(false);
        setReplyInput('');
      }
    } catch (error) {
      console.error('Error toggling admin:', error);
    }
  };

  // 2. Polling Logic
  useEffect(() => {
    let intervalId;

    if (isAdminMode) {
      checkPendingMessage(); // Fetch immediately
      intervalId = setInterval(checkPendingMessage, 2000); // Poll every 2s
    }

    return () => clearInterval(intervalId);
  }, [isAdminMode]);

  const checkPendingMessage = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user_data`);
      const msg = response.data.pending_message;
      
      // IMPROVED LOGIC:
      // If the backend message is different from what we are currently showing, update it.
      // This handles new messages coming in even if the panel is open.
      if (msg !== pendingMessage) {
        setPendingMessage(msg);
        // If a new message arrives, reset the expansion state so the admin sees the "New" button
        setIsDetailsExpanded(false);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleShowDetails = () => {
    setIsDetailsExpanded(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    try {
      await axios.post(`${BASE_URL}/admin_message`, {
        message: replyInput,
      });

      // Clear UI
      setPendingMessage(null);
      setIsDetailsExpanded(false);
      setReplyInput('');
      setStatusMessage('Reply sent successfully!');
      setTimeout(() => setStatusMessage(''), 3000);

    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-5 font-sans border-2 border-gray-800 rounded-lg bg-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Admin Panel</h2>

      {/* --- Toggle Section --- */}
      <div className="mb-5 border-b border-gray-300 pb-2.5">
        <p className="text-sm text-gray-600 mb-2">
          Status: <strong className={isAdminMode ? "text-red-600" : "text-green-600"}>
            {isAdminMode ? 'Active' : 'Inactive'}
          </strong>
        </p>
        <button 
          onClick={toggleAdminMode} 
          className={`px-5 py-2.5 text-white rounded font-medium transition-colors duration-200 shadow-sm
            ${isAdminMode 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isAdminMode ? 'Disable Admin Mode' : 'Enable Admin Mode'}
        </button>
      </div>

      {/* --- Pending Message Workflow --- */}
      {isAdminMode && (
        <div className="min-h-[100px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Incoming Messages</h3>

          {statusMessage && <p className="text-green-600 font-medium mb-2">{statusMessage}</p>}

          {/* SCENARIO A: No messages waiting */}
          {!pendingMessage && (
            <p className="text-gray-500 italic">No pending messages...</p>
          )}

          {/* SCENARIO B: Message is waiting (Show Button) */}
          {pendingMessage && !isDetailsExpanded && (
            <button 
              onClick={handleShowDetails}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded shadow-md transition-transform active:scale-95"
            >
              New Pending Message
            </button>
          )}

          {/* SCENARIO C: Button clicked (Show Details) */}
          {isDetailsExpanded && pendingMessage && (
            <div className="border border-blue-500 p-4 rounded-lg bg-blue-50">
              <p className="mb-2 font-bold text-gray-700">User Query:</p>
              <p className="mb-4 bg-white p-2 rounded shadow-sm text-gray-800">"{pendingMessage}"</p>
              
              <form onSubmit={handleSendReply} className="flex gap-2.5">
                <input 
                  type="text" 
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type agent reply here..." 
                  className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors cursor-pointer">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;