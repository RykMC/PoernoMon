import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { useGame } from "../context/GameContext";

export default function ConsoleChatModal({ onClose }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "PoernoMonCommunicator: Verbindungsaufbau...\nPoernoMonCommunicator: Verbindung zu PoernoMon hergestellt." }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { fetchSpieler, spieler } = useGame();


  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
  (async () => {
    try {
      const res = await api.get("/auth/getme");
      setMe(res.data);
    } catch (err) {
      console.error("Fehler beim Laden von getme:", err);
    }
  })();
}, []);

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
      setLoading(true);
      const res = await api.post("/chat", { prompt: input }); // dein AI-Endpoint
      const botReply = res.data.reply || "Keine Antwort erhalten.";
      setMessages(prev => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      console.error("Fehler beim Chat:", err);
      setMessages(prev => [...prev, { from: "bot", text: "❌ Fehler beim Antworten." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold m-2">PoernoMonCommunicator</h2>
    <div 
      className="w-full max-w-4xl mx-auto 
                 bg-[#0a0a0a] 
                 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.5)] 
                 p-6 font-mono text-green-500 flex flex-col h-[50vh] 
                 relative overflow-hidden mb-8"
    
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
      <div className="mt-4 z-10 relative">
        {loading ? (
          <div className="text-green-500 font-mono">
            {spieler.username} tippt...
          </div>
        ) : (
          <>
            c:\PoernoMonConnector\ <input
              ref={inputRef}
              type="text"
              value={input}
              placeholder=""
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className={`flex-grow py-2 rounded bg-black text-green-500 
                          outline-none focus w-150 ${input === '' ? 'input-with-cursor' : ''}`}
            />
          </>
        )}
      </div>

     
    </div>
     <div className="text-center mt-4 z-10 relative">
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded cursor-pointer transform transition hover:scale-90
                     shadow hover:shadow-[0_0_10px_rgba(255,0,0,0.6)]"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}
