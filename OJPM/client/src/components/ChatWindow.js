import React, { useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import "./ChatWindow.css";

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (input.trim() === "") return;
    
    const newMessages = [...messages, { text: input, user: true }];
    setMessages(newMessages);
    setInput("");
    
    setTimeout(() => {
      setMessages([...newMessages, { text: "Hello! How can I help?", user: false }]);
    }, 1000);
  };

  return (
    <div className={`chat-container ${isOpen ? "open" : ""}`}>
      <div className="chat-icon" onClick={toggleChat}>
        <IoChatbubbleEllipsesOutline size={30} />
      </div>
      {isOpen && (
        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.user ? "user" : "bot"}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
