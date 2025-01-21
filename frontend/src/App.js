import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For the typing loader

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const response = await axios.get("https://chatapp-backend-tbkd.onrender.com/api/messages");
    setMessages(response.data);
  };

  const sendMessage = async () => {
    if (input.trim()) {
      setIsLoading(true); // Show loader
      await axios.post("https://chatapp-backend-tbkd.onrender.com/api/messages", {
        sender: "User",
        message: input,
      });
      setInput("");
      fetchMessages();
      setIsLoading(false); // Hide loader
    }
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Chatbot Icon */}
      <div className="flex justify-center mb-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
          alt="Chatbot Icon"
          className="w-16 h-16"
        />
      </div>

      {/* Chatbox Container */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl p-6">
        {/* Messages Container */}
        <div className="h-96 overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 ${
                msg.sender === "User" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-lg shadow-sm ${
                  msg.sender === "User"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.message}
              </span>
            </div>
          ))}
          {/* Typing Loader */}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input and Buttons */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Send
          </button>
         
        </div>
      </div>
    </div>
  );
};

export default App;
