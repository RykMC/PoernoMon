import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "./Loader";
import { useGame } from "../context/GameContext";

export default function ShopModal({ onClose, fetchSpieler })  {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedBuyShopId, setSelectedBuyShopId] = useState(null);
  const { fetchItems } = useGame();

  useEffect(() => {
    loadData();
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

  const rarityClass = (seltenheit) => {
      switch (seltenheit) {
        case 'legendär':
          return "border-yellow-400 border-double border-7 shadow-yellow-500/50";
        case 'selten':
          return "border-blue-300 border-double border-4 shadow-blue-500/50";
        default:
          return "border-gray-600 border-2";
      }
    };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">🛒 Shop</h2>

      {loading ? (
        <Loader />
      ) : (
        <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4  h-120 overflow-y-auto">
          {items.map((item) => (
            <div className="text-center">
            <div 
              key={item.shop_id}
              className={`relative bg-gray-700 p-4 rounded-lg shadow flex flex-col items-center text-center border-2 ${rarityClass(item.seltenheit)}`}
            >
              <div className="mb-2 font-bold">{item.bezeichnung}</div>
              <img src={`/${item.bild}`} alt={item.typ} className="w-20 h-20 object-contain mb-2" />

              <div className="text-sm space-y-1 mb-2">
                {item.bonus1was && <div>+{item.bonus1wert} {item.bonus1was}</div>}
                {item.bonus2was && <div>+{item.bonus2wert} {item.bonus2was}</div>}
                {item.bonus3was && <div>+{item.bonus3wert} {item.bonus3was}</div>}
              </div>

              
              
              
            </div>
            <div className="text-sm mb-2 p-1">💰 {item.preis} Coins</div>
            <button 
                onClick={() => handleBuy(item.shop_id)}
                className="px-3 py-1 bg-green-600 rounded text-xs"
                >
                Kaufen
                </button>
                
          </div>
          
          ))}
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
