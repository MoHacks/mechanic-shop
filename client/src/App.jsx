import { useState, useEffect } from 'react'
import carlbadautoLogo from '/logo-carl.png'
import './App.css'
import ItemChart from '../inventory/components/itemChart'
import { getCategories, createCategory, deleteCategory } from '../inventory/api/categoriesApi'

const randomRgb = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
};

function App() {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [previewColors, setPreviewColors] = useState({ start: randomRgb(), end: randomRgb() });

  useEffect(() => {
    getCategories().then(setCategories);

    const wsBase = import.meta.env.VITE_WS_URL
      || `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
    const ws = new WebSocket(`${wsBase}/ws`);
    ws.onmessage = (event) => {
      if (event.data === "category_created") {
        getCategories().then(setCategories);
      }
    };
    return () => ws.close();
  }, []);

  const regenerateColors = () => {
    setPreviewColors({ start: randomRgb(), end: randomRgb() });
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim().toLowerCase();
    if (!name) return;
    const created = await createCategory({
      name,
      color_start: previewColors.start,
      color_end: previewColors.end,
    });
    setCategories(prev => [...prev, created]);
    setShowAddModal(false);
    setNewCategoryName("");
    setPreviewColors({ start: randomRgb(), end: randomRgb() });
  };

  const handleDeleteCategory = async (name) => {
    await deleteCategory(name);
    setCategories(prev => prev.filter(c => c.name !== name));
  };

  return (
    <>
      <div>
        <a target="_blank">
          <img src={carlbadautoLogo} className="logo" alt="carlbadauto logo" />
        </a>
        <h1 style={{ marginTop: 0, fontFamily: "Times New Roman", color: "orange" }}>
          Inventory Management System
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: "orange",
            color: "black",
            border: "none",
            padding: "10px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "2rem",
          }}
        >
          + Add Chart
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "7rem" }}>
        {categories.map(cat => (
          <ItemChart
            key={cat.name}
            category={cat.name}
            colorStart={cat.color_start}
            colorEnd={cat.color_end}
            onDelete={() => handleDeleteCategory(cat.name)}
          />
        ))}
      </div>

      {showAddModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.75)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#1a1a1a", padding: "30px", borderRadius: "10px",
            width: "360px", border: "1px solid #555",
          }}>
            <h3 style={{ color: "white", marginTop: 0 }}>Add New Chart</h3>

            <label style={{ color: "#ccc", display: "block", marginBottom: "6px" }}>
              Category name
            </label>
            <input
              placeholder="e.g. filters"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value.toLowerCase())}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "none", marginBottom: "16px", boxSizing: "border-box" }}
            />

            <label style={{ color: "#ccc", display: "block", marginBottom: "8px" }}>
              Gradient preview
            </label>
            <div style={{
              height: "40px", borderRadius: "6px", marginBottom: "10px",
              background: `linear-gradient(to right, ${previewColors.start}, ${previewColors.end})`,
            }} />
            <button
              onClick={regenerateColors}
              style={{
                background: "#333", color: "white", border: "1px solid #555",
                padding: "6px 14px", borderRadius: "4px", cursor: "pointer",
                marginBottom: "20px", width: "100%",
              }}
            >
              Randomize Colors
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <button
                onClick={() => { setShowAddModal(false); setNewCategoryName(""); }}
                style={{
                  flex: 1, background: "#555", color: "white", border: "none",
                  padding: "10px", borderRadius: "6px", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                style={{
                  flex: 1, background: newCategoryName.trim() ? "orange" : "#666",
                  color: "black", border: "none", padding: "10px",
                  borderRadius: "6px", cursor: newCategoryName.trim() ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                }}
              >
                Add Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App
