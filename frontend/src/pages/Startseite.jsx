import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Startseite() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [currentMon, setCurrentMon] = useState({ name: "", bild: "" });
  const [fade, setFade] = useState(true);
  const [message, setMessage] = useState("");


  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(async () => {
        try {
          const res = await api.get("/auth/random");
          setCurrentMon({ 
            name: res.data.username, 
            bild: "/" + res.data.kreatur_bild 
          });
          setFade(true);
        } catch (err) {
          console.error("Fehler beim Laden des PoernoMons:", err);
        }
      }, 2000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (mode === "login") {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
      } else {
        const res = await api.post("/auth/register", { email, password });
        localStorage.setItem("token", res.data.token);
        setMessage("✅ Registrierung erfolgreich! Du kannst dich jetzt einloggen.");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Fehler beim Auth");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-between"
      style={{ backgroundImage: "url('/images/global/bg.png')" }}
    >
      {/* Header mit Umschalter */}
      <header className="p-6 flex justify-between bg-black/60 items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setMode("login")}
            className={`${mode === "login" ? "bg-[#39B9FD]" : "bg-gray-400/40"} px-4 py-1 rounded`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`${mode === "register" ? "bg-[#39B9FD]" : "bg-gray-400/40"} px-4 py-1 rounded`}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="flex gap-2 items-center">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-2 py-1 rounded bg-white text-black"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-2 py-1 rounded bg-white text-black"
          />
          <button
            type="submit"
            className="px-4 py-1 bg-[#39B9FD] rounded "
          >
            {mode === "login" ? "Login" : "Registrieren"}
          </button>
        </form>
      </header>
      {message && (
        <div className="mt-2 px-4 py-2 bg-black/60 text-white rounded text-center">
          {message}
        </div>
      )}

      {/* Mitte mit PoernoMon */}
      <main className="flex justify-center items-center flex-grow relative mt-60 mr-20">
        <div className={`relative transition-opacity duration-1000 ${fade ? "opacity-100" : "opacity-0"}`}>
          <img
            src={currentMon.bild}
            alt={currentMon.name}
            className="w-[500px] mx-auto"
          />
          <div className="absolute bottom-48 left-38 w-50 bg-black/60 py-2 text-center">
            <h2 className="text-2xl text-white font-bold">{currentMon.name}</h2>
          </div>
        </div>
      </main>


      <footer className="text-white text-center p-4 bg-black/60 text-sm">
        © 2025 PoernoMons
      </footer>
      
    </div>
  );
}
