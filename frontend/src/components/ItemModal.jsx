import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import api from "../api/axios";
import Loader from "./Loader";
import { useGame } from "../context/GameContext";


export default function AusrüstungsModal({ onClose, addConsoleMessage  }) {
  const [loading, setLoading] = useState(true);
  const [crafting, setCrafting] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellPrice, setSellPrice] = useState(100);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showDestroyModal, setShowDestroyModal] = useState(false);
  const [selectedDestroyItemId, setSelectedDestroyItemId] = useState(null);
  const [showUnsellModal, setShowUnsellModal] = useState(false);
  const [selectedUnsellItemId, setSelectedUnsellItemId] = useState(null);
  const [showUsePotionModal, setShowUsePotionModal] = useState(false);
  const [selectedPotionId, setSelectedPotionId] = useState(null);
  const [showCraftAnimation, setShowCraftAnimation] = useState(false);
  const [craftAnimationData, setCraftAnimationData] = useState(null);

  const { fetchSpieler, fetchPoernomon, fetchItems, fetchNachrichten, spieler, items } = useGame();



  useEffect(() => {
    loadData();
    fetchSpieler();
    fetchItems();
  }, []);

  useEffect(() => {
  fetch("/images/global/craft.json")
    .then((res) => res.json())
    .then((data) => setCraftAnimationData(data));
}, []);


  const loadData = async () => {
    try {
      setLoading(true);
      fetchItems
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePotion = (id) => {
  setSelectedPotionId(id);
  setShowUsePotionModal(true);
};

const handleUsePotionConfirm = async () => {
  try {
    const res = await api.post(`/items/${selectedPotionId}/use`);
    setShowUsePotionModal(false);
    await fetchSpieler();
    await fetchPoernomon();
    await fetchItems();
    addConsoleMessage(res.data.message);
  } catch (err) {
    addConsoleMessage(err);
    console.error("Fehler beim Benutzen des Tranks:", err);
  }
};

const startCraftingWithAnimation = () => {
  setShowCraftAnimation(true);
  setTimeout(async () => {
    await handleCraft();
    setShowCraftAnimation(false);
  }, 6000); 
};

  const handleCraft = async () => {
    try {
      setCrafting(true);
     const res = await api.post("/items/craft");
      await loadData();
      await fetchPoernomon();
      await fetchItems();
      await fetchSpieler();
      addConsoleMessage(res.data.message);
    } catch (err) {
      addConsoleMessage("❌ Fehler beim Craften.");
    } finally {
      setCrafting(false);
    }
  };

  const handleDestroy = (id) => {
    setSelectedDestroyItemId(id);
    setShowDestroyModal(true);
  };

  const handleDestroyConfirm = async () => {
    try {
     const res = await api.post(`/items/${selectedDestroyItemId}/destroy`);
      setShowDestroyModal(false);
      await loadData();
      await fetchSpieler();
      await fetchItems();
      addConsoleMessage(res.data.message);
    } catch (err) {
      addConsoleMessage(err.response?.data?.error || err.message || "Unbekannter Fehler beim Verkaufen");
      console.error("Fehler beim Vernichten:", err);
    }
  };

  const handleSell = (id) => {
    setSelectedItemId(id);
    setShowSellModal(true);
  };

  const handleSellConfirm = async () => {
    try {
     const res =await api.post(`/items/${selectedItemId}/sell`, { preis: sellPrice });
      setShowSellModal(false);
      await loadData();
      await fetchSpieler();
      await fetchItems();
      addConsoleMessage(res.data.message);
    } catch (err) {
      addConsoleMessage(err.response?.data?.error || err.message || "Unbekannter Fehler beim Verkaufen");
      console.error("Fehler beim Verkaufen:", err);
    }
  };

    const handleUnsell = (id) => {
    setSelectedUnsellItemId(id);
    setShowUnsellModal(true);
  };

  const handleUnsellConfirm = async () => {
    try {
      console.log("id: ", selectedUnsellItemId);
      const res = await api.post(`/items/${selectedUnsellItemId}/unsell`);
      setShowUnsellModal(false);
      await loadData();
      await fetchSpieler();
      await fetchItems();
      addConsoleMessage(res.data.message);
    } catch (err) {
      addConsoleMessage(err);
      console.error("Fehler beim aus Shop nehmen:", err);
    }
  };

 const rarityStyles = (seltenheit) => {
    switch (seltenheit) {
      case 'legendär':
        return {
          border: "border-yellow-400 border-4",
          bg: "bg-yellow-400/50",
          shadow: "shadow-yellow-500/50"
        };
      case 'selten':
        return {
          border: "border-blue-300 border-2",
          bg: "bg-blue-300/50",
          shadow: "shadow-blue-500/40"
        };
        
      default:
        return {
          border: "border-gray-600",
          bg: "bg-gray-600/50",
          shadow: "shadow-gray-500/30"
        };
    }
  };

    const itemEigenschaftLabels = {
      angriff: "Angriff",
      doppelschlag: "Doppelschlag",
      krit_chance: "krit. Chance",
      krit_schaden: "krit. Schaden",
      verteidigen: "Verteidigung",
      ausweichen: "Ausweichen",
      leben_pro_treffer: "Leben / Treffer",
      max_leben: "max. Gesundheit",
      gluck: "Glück",
      mehr_xp: "XP-Sammler",
      mehr_kampfstaub: "Staubsammler",
      mehr_coins: "Coins-Sammler"
    };


  return (
    <div>
    <div className="w-full max-w-5xl mx-auto p-6 text-white h-140 overflow-y-auto">
      <h2 className="text-2xl font-bold">Ausrüstung</h2>

      <div className="bg-gray-800/50 p-6 rounded-xl mb-8 text-center ">
        <button
          onClick={startCraftingWithAnimation}
          disabled={crafting || (spieler && spieler.kampfstaub < 500)}
          className={`px-6 py-2 rounded text-lg font-bold shadow ${
            crafting || (spieler && spieler.kampfstaub < 500)
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer"
          }`}
        >
          {crafting ? "Crafting..." : "zufälliges Item craften"}
        </button>
        <div className="mt-2 text-sm text-gray-400">
          Kosten: 500 Kampfstaub
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Alle Items</h3>

      {loading ? (
        <Loader />
      ) : (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 h-120">
  {showCraftAnimation && craftAnimationData && (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center relative">
      <Lottie 
        animationData={craftAnimationData} 
        loop={false} 
        className="w-50 h-50"
      />
    </div>
  )}
  {items.map((item) => {
    const style = rarityStyles(item.seltenheit);
    return (
      <div key={item.id} className="flex flex-col items-center">
       <div
          className={`w-40 md:w-46 h-56 md:h-60 rounded-2xl p-5 text-center 
            shadow-xl ${item ? `${style.bg} ${style.border} ${style.shadow}` : ""}`
          }
        >
          <div className="relative w-full flex flex-col items-center text-center">
            {(item.angelegt == 1 || item.angelegt === "1") && (
              <div className="absolute top-2 -right-8 bg-green-600 text-xs px-6 py-1 w-28 rounded shadow transform rotate-24 origin-top-right z-10">
                Angelegt
              </div>
            )}
            {(item.im_shop == 1 || item.im_shop === "1") && (
              <div className="absolute -top-10 -right-12 bg-red-600 text-xs px-6 py-1 w-30 rounded shadow transform rotate-24 origin-top-left z-10">
                Im Shop
              </div>
            )}

            <div className="mb-2 font-semibold text-white">{item.bezeichnung}</div>
            <img
              src={`/${item.bild}`}
              alt={item.typ}
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
          </div>

          <div className="text-xs space-y-1 mb-2 text-gray-300">
            {item.bonus1was && <div>+{item.bonus1wert} {itemEigenschaftLabels[item.bonus1was] || item.bonus1was}</div>}
            {item.bonus2was && <div>+{item.bonus2wert} {itemEigenschaftLabels[item.bonus2was] || item.bonus2was}</div>}
            {item.bonus3was && <div>+{item.bonus3wert} {itemEigenschaftLabels[item.bonus3was] || item.bonus3was}</div>}
          </div>
            </div>
            <div className="m-2">
          {item.im_shop == 1 || item.im_shop === "1" ? (
            <div className="flex flex-wrap gap-2 mt-auto">
              <button 
                onClick={() => handleUnsell(item.id)} 
                className="px-2 py-1 bg-yellow-700 rounded text-xs cursor-pointer transform transition hover:scale-90"
              >
                Vom Shop nehmen
              </button>
            </div>
          ) : item.typ === "trank" ? (
            <div className="flex flex-wrap gap-2 mt-auto">
              <button 
                onClick={() => handleUsePotion(item.id)} 
                className="px-2 py-1 bg-green-600 rounded text-xs cursor-pointer transform transition hover:scale-90"
              >
                Benutzen
              </button>
            </div>
          ) : !item.angelegt && (
            <div className="flex flex-wrap gap-2 mt-auto">
              <button 
                onClick={() => handleDestroy(item.id)} 
                className="px-1 py-1 bg-red-600 rounded text-xs cursor-pointer transform transition hover:scale-90"
              >
                Vernichten
              </button>
              <button 
                onClick={() => handleSell(item.id)} 
                className="px-1 py-1 bg-yellow-600 rounded text-xs cursor-pointer transform transition hover:scale-90"
              >
                Verkaufen
              </button>
            </div>
          )}

                  </div>
                  
                </div>
              );
            })}
          </div>

                
      )}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={async () => {
            await fetchItems();
            onClose();
            fetchPoernomon();
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
        >
          Schließen
        </button>
      </div>

      {showSellModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Preis festlegen</h3>
            <input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 rounded"
              min="1"
            />
            <div className="flex justify-between">
              <button onClick={() => setShowSellModal(false)} className="bg-gray-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90">Abbrechen</button>
              <button onClick={handleSellConfirm} className="bg-green-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90">Verkaufen</button>
            </div>
          </div>
        </div>
      )}
      {showDestroyModal && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm text-center">
          <h3 className="text-xl font-bold mb-4">endgültig vernichten?</h3>
          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setShowDestroyModal(false)} 
              className="bg-gray-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
            >
              Nein, behalten
            </button>
            <button 
              onClick={handleDestroyConfirm} 
              className="bg-red-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
            >
              Ja, vernichten
            </button>
          </div>
        </div>
      </div>
    )}
    {showUnsellModal && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm text-center">
          <h3 className="text-xl font-bold mb-4">Vom Shop nehmen?</h3>
          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setShowUnsellModal(false)} 
              className="bg-gray-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
            >
              Nein, lassen
            </button>
            <button 
              onClick={handleUnsellConfirm} 
              className="bg-yellow-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
            >
              Ja, rausnehmen
            </button>
          </div>
        </div>
      </div>
    )}
    {showUsePotionModal && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm text-center">
          <h3 className="text-xl font-bold mb-4">Trank benutzen?</h3>
          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setShowUsePotionModal(false)} 
              className="bg-gray-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
            >
              Nein, abbrechen
            </button>
            <button 
              onClick={handleUsePotionConfirm} 
              className="bg-green-600 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
            >
              Ja, benutzen
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
