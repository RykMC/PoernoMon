import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios";

export default function ConsoleChatModal({ onClose }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Verbindungsaufbau...\nVerbindung zu PoernoMon hergestellt." }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

   useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const res = await api.post("/chat", { prompt: input }); // dein AI-Endpoint
      const botReply = res.data.reply || "Keine Antwort erhalten.";
      setMessages(prev => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      console.error("Fehler beim Chat:", err);
      setMessages(prev => [...prev, { from: "bot", text: "❌ Fehler beim Antworten." }]);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-8 text-center">PoernoMonCommunicator</h3>
    <div 
      className="w-full max-w-4xl mx-auto 
                 bg-[#0a0a0a] border-4 border-cyan-500 
                 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.5)] 
                 p-6 font-mono text-green-500 flex flex-col h-[50vh] 
                 relative overflow-hidden mb-8"
      style={{
        backgroundImage: 'url("/images/global/console.png")',
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Overlay for tint */}
      <div className="absolute inset-0 bg-black/60 z-0 rounded-xl"></div>

      {/* Chatlog */}
      <div className="flex-grow overflow-y-auto pr-2 z-10 relative">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.from === "user" ? "text-right text-cyan-300" : "text-green-500"}`}
          >
            <span className="inline-block px-2">
              {msg.text.split("\n").map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}<br />
                </React.Fragment>
              ))}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
    <div className="mt-4  z-10 relative">
     c:\PoernoMonConnector\ <input
        ref={inputRef}
        type="text"
        value={input}
        placeholder=""
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className={`flex-grow  py-2 rounded bg-black text-green-500 
                    outline-none focus ${input === '' ? 'input-with-cursor' : ''}`}
      />
      
    </div>

     
    </div>
     <div className="text-center mt-4 z-10 relative">
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded 
                     shadow hover:shadow-[0_0_10px_rgba(255,0,0,0.6)]"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}
