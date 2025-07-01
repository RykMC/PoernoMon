import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "./Loader";
import { useGame } from "../context/GameContext";

export default function ShopModal({ onClose, fetchSpieler })  {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedBuyShopId, setSelectedBuyShopId] = useState(null);
  const [filter, setFilter] = useState("Alle");
  const { fetchItems } = useGame();

  useEffect(() => {
    loadData();
    fetchItems();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shop");
      setItems(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Fehler beim Laden des Shops:", err);
    } finally {
      setLoading(false);
    }
  };

    const handleBuy = (shopId) => {
    setSelectedBuyShopId(shopId);
    setShowBuyModal(true);
    };

    const handleBuyConfirm = async () => {
    try {
        await api.post(`/shop/${selectedBuyShopId}/buy`);
        setShowBuyModal(false);
        await loadData();
        await fetchSpieler();
    } catch (err) {
        console.error("Fehler beim Kaufen:", err);
    }
    };


  const rarityStyles = (seltenheit) => {
    switch (seltenheit) {
      case 'legendär':
        return {
          border: "border-yellow-400 border-4",
          bg: "bg-yellow-400/10",
          shadow: "shadow-yellow-500/50"
        };
      case 'selten':
        return {
          border: "border-blue-300 border-2",
          bg: "bg-blue-300/10",
          shadow: "shadow-blue-500/40"
        };
      default:
        return {
          border: "border-gray-600",
          bg: "bg-gray-600/10",
          shadow: "shadow-gray-500/30"
        };
    }
  };
  const filteredItems = filter === "Alle"
    ? items
    : items.filter(item => item.typ === filter);
    return (
    <div className="w-full max-w-5xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">🛒 Shop</h2>

      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {["Alle", "waffe", "kopfschutz", "brustschutz", "beinschutz", "trank"].map(typ => (
              <button
                key={typ}
                onClick={() => setFilter(typ)}
                className={`px-3 py-1 rounded text-xs 
                            ${filter === typ ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                {typ.charAt(0).toUpperCase() + typ.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 h-110 overflow-y-auto">
            {filteredItems.map((item) => {
              const style = rarityStyles(item.seltenheit);
              return (
                <div key={item.shop_id} className="flex flex-col items-center">
                  <div
                    className={`relative w-40 md:w-46 h-52 md:h-56 rounded-2xl p-5 text-center transform transition hover:scale-105
                                flex flex-col items-center justify-between
                                ${style.bg} ${style.border} shadow-xl ${style.shadow}`}
                  >
                    <div className="mb-2 font-semibold text-white">{item.bezeichnung}</div>
                    <img
                      src={`/${item.bild}`}
                      alt={item.typ}
                      className="w-20 h-20 object-contain mx-auto mb-4"
                    />
                    <div className="text-xs space-y-1 mb-2 text-gray-300">
                      {item.bonus1was && <div>+{item.bonus1wert} {item.bonus1was}</div>}
                      {item.bonus2was && <div>+{item.bonus2wert} {item.bonus2was}</div>}
                      {item.bonus3was && <div>+{item.bonus3wert} {item.bonus3was}</div>}
                    </div>
                  </div>
                  <div className="text-sm text-yellow-300 mt-2 mb-2 p-1">💰 {item.preis} Coins</div>
                  <button
                    onClick={() => handleBuy(item.shop_id)}
                    className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                  >
                    Kaufen
                  </button>
                </div>
              );
            })}
          </div>

          <div className="col-span-2 md:col-span-4 text-center mt-6">
            <button
              onClick={() => {
                fetchItems();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Schließen
            </button>
          </div>
        </div>

      )}
      
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4">Kaufen?</h3>
            <div className="flex justify-between mt-6">
                <button 
                onClick={() => setShowBuyModal(false)} 
                className="bg-gray-600 px-4 py-2 rounded"
                >
                Nein, abbrechen
                </button>
                <button 
                onClick={handleBuyConfirm} 
                className="bg-green-600 px-4 py-2 rounded"
                >
                Ja, kaufen
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}
