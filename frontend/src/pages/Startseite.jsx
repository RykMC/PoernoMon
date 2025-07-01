import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";


export default function Startseite() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      await new Promise(resolve => setTimeout(resolve, 50));
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login fehlgeschlagen");
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();

    try {
        const res = await api.post("/auth/register", {
        email,
        password,
        });

        localStorage.setItem("token", res.data.token);
        alert("Registrierung erfolgreich!");
    } catch (err) {
        alert(err.response?.data?.error || "Registrierung fehlgeschlagen");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-between"
      style={{ backgroundImage: "url('/images/global/bg.png')" }}
    >
      {/* Header mit Login */}
      <header className="p-6 flex justify-end gap-4 bg-black/60">
        <form onSubmit={handleLogin} className="flex gap-2 items-center">
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
            className="px-4 py-1 bg-yellow-400 rounded hover:bg-yellow-300"
          >
            Login
          </button>
        </form>
      </header>

      {/* Mitte: Registrierung */}
      <main className="flex justify-center items-center flex-grow">
        
        <form
          onSubmit={handleRegister}
          className="bg-black/70 text-white p-6 rounded-lg backdrop-blur-md"
        >
          <h2 className="text-2xl mb-4 font-bold text-center">Registrieren</h2>
 
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full mb-2 px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full mb-4 px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-white py-2 rounded"
          >
            Registrieren
          </button>
        </form>
      </main>

      <footer className="text-white text-center p-4 bg-black/60 text-sm">
        © 2025 PoernoMons
      </footer>
    </div>
  );
}
