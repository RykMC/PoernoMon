import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Startseite from "./pages/Startseite";
import Kampfseite from "./components/Kampfseite";
import ProtectedRoute from "./components/ProtectedRoute";
import { GameProvider } from "./context/GameContext";

export default function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Startseite />} />
          
          <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <GameProvider> 
                    <Dashboard />
                  </GameProvider>
                </ProtectedRoute>
              }
            />

            <Route
              path="/fight/:kampfId"
              element={
                <ProtectedRoute>
                  <GameProvider> 
                    <Kampfseite />
                  </GameProvider>
                </ProtectedRoute>
              }
            />
          {/* Weitere Seiten hier */}
        </Routes>
       
    </Router>
  );
}
